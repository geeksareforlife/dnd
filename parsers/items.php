<?php

use GuzzleHttp\Client;

/**
 * This takes the items.csv file from the data folder and parses it into 
 * individual json files.
 *
 * It will also try and get some basic details from DNDBeyond
 */

require('../vendor/autoload.php');

$itemsFile = '../data/items.csv';
$itemsFolder = '../data/items/';


$itemLines = file($itemsFile);

// the first line will be the headers
$headers = str_getcsv($itemLines[0]);

// get all items into an array for later
// there will be duplicate items in here, but with different
// availability for different shops
$items = [];
for ($i = 1; $i < count($itemLines); $i++) {
    $item = array_combine($headers, str_getcsv($itemLines[$i]));
    $item['id'] = generateItemID($item['Item Name']);
    $items[] = $item;
}

// now we need to process each item, combining repetions into one file
foreach ($items as $item) {
    $file = $itemsFolder . $item['id'] . '.json';
    if (file_exists($file)) {
        $details = json_decode(file_get_contents($file), true);
    } else {
        $details = [
            'id'            => $item['id'],
            'name'          => $item['Item Name'] . $item['Suffix'],
            'description'   => [],
            'weight'        => '',
            'category'      => strtolower($item['Category']),
            'subcategory'   => strtolower($item['Sub Category']),
            'cost'          => [
                'normal'    => getCoppers($item['Cost (Normal)']),
                'cheap'     => getCoppers($item['Cost (Cheap)']),
                'expensive' => getCoppers($item['Cost (Expensive)']),
            ],
            'stores'        => [],
            'themes'        => [],
            'url'           => '',
        ];

        // attempt to get the description and weight...
        $downloaded = getOnlineDetails($details['id']);
        if ($downloaded) {
            $details['weight'] = $downloaded['weight'];
            $details['description'] = $downloaded['description'];
            $details['url'] = $downloaded['url'];
        }
    }

    if ($item['Store'] != "" and !in_array($item['Store'], array_keys($details['stores']))) {
        $details['stores'][strtolower($item['Store'])] = getLocales($item);
    }

    if ($item['Theme'] != "" and !in_array($item['Theme'], array_keys($details['themes']))) {
        $details['themes'][strtolower($item['Theme'])] = getLocales($item);
    }

    file_put_contents($file, json_encode($details, JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT));
}


function generateItemID($name)
{
    // First, replace these characters with nothing: (),'
    $id = str_replace(['(', ')', ',', "'"], '', $name);

    // now, replace all spaces with -
    $id = str_replace(' ', '-', $id);

    // and lowercase the lot
    $id = strtolower($id);

    return $id;
}

function getLocales($item)
{
    $locales = [];

    $keys = ['Limited Locale', 'Rural Locale', 'Urban Locale', 'Premium Locale'];

    foreach ($keys as $key) {
        if ($item[$key] == 'X') {
            $locales[] = strtolower(str_replace(' Locale', '', $key));
        } elseif ($item[$key] == 'O') {
            $locales[] = strtolower(str_replace(' Locale', '', $key)) . '-restricted';
        }
    }

    return $locales;
}

function getOnlineDetails($id)
{
    $client = new Client();
    try {
        $response = $client->get('https://www.dndbeyond.com/equipment/' . $id);
        if ($response->getStatusCode() == 200) {
            $return = parseItemHTML((string) $response->getBody());
            $return['url'] = 'https://www.dndbeyond.com/equipment/' . $id;
            return $return;
        } else {
            echo("Error: " . $id . '(' . $response->getStatusCode() . ")\n");
            return false;
        }
    } catch (Exception $e) {
        echo("Not Found: " . $id . "\n");
    } 
}

function parseItemHTML($html)
{
    $return = [
        'description'   => '',
        'weight'        => '',
    ];

    $weightPos = strpos($html, "Weight:");
    $weightStart = strpos($html, '>', $weightPos) + 1;
    $weightEnd = strpos($html, '</span>', $weightStart);
    $weight = substr($html, $weightStart, $weightEnd - $weightStart);
    $return['weight'] = str_replace(' lbs', '', $weight);

    $descPos = strpos($html, 'class="line gear height2 marginBottom20"');
    $descStart = strpos($html, '<div class="details-container-content-description-text">', $descPos) + 56;
    $descEnd = strpos($html, '</div>', $descStart);
    $desc = substr($html, $descStart, $descEnd - $descStart);
    $return['description'] = getLines($desc);

    return $return;
}

function getLines($htmlString)
{
    if (preg_match_all('/<p>([^<]*)<\/p>/', $htmlString, $matches)) {
        return str_replace("&nbsp;", " ", $matches[1]);
    } else {
        return [];
    }
}

function getCoppers($costString)
{
    $multipliers = [
        'cp' => 1,
        'sp' => 10,
        'ep' => 50,
        'gp' => 100,
        'pp' => 1000,
    ];

    if (preg_match('/(\d*)\s*(cp|sp|ep|gp|pp)/', $costString, $matches)) {
        return $matches[1] * $multipliers[$matches[2]];
    } else {
        return 0;
    }

}
