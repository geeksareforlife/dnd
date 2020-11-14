<?php

$itemFolder = '../data/items/';
$outputFile = '../items.js';

$itemIndex = [];

$shopLists = [];

$dir = new DirectoryIterator($itemFolder);

foreach ($dir as $fileinfo) {
    if (!$fileinfo->isDot()) {
        $item = getItemInfo($fileinfo->getPathname());

        // store the stores :)
        foreach (['stores', 'themes'] as $type) {
            foreach (array_keys($item[$type]) as $store) {
                if (!isset($shopLists[$store])) {
                    $shopLists[$store] = [];
                }
                foreach ($item[$type][$store] as $locale) {
                    if (!isset($shopLists[$store][$locale])) {
                        $shopLists[$store][$locale] = [];
                    }
                    $shopLists[$store][$locale][] = $item['id'];
                }
            }
        }

        $itemIndex[$item['id']] = $item;
    }
}

$js = "var itemIndex = " . json_encode($itemIndex, JSON_NUMERIC_CHECK) . ";\n";
$js .= "var shopLists = " . json_encode($shopLists, JSON_NUMERIC_CHECK) . ";\n";

file_put_contents($outputFile, $js);


function getItemInfo($file)
{
    $json = file_get_contents($file);

    return json_decode($json, true);
}
