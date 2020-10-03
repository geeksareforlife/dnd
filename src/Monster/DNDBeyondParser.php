<?php

namespace GeeksAreForLife\DND\Monster;

class DNDBeyondParser extends Parser
{

    protected function cleanHTML($html)
    {
        $html = preg_replace('/\<img[^\>]+\>+/', "", $_POST['monsterHTML']);

        return parent::cleanHTML($html);
    }

    protected function parseMonster()
    {
        $this->findAbilityScores();

        $this->processParas();
    }

    protected function findAbilityScores()
    {
        $statNodes = $this->xpath->query('//div[@class="stat-block-ability-scores-stat"]');

        foreach ($statNodes as $node) {
            $name = $this->xpath->query('div[@class="stat-block-ability-scores-heading"]', $node);
            $name = $name[0]->nodeValue;

            $score = $this->xpath->query('.//span[@class="stat-block-ability-scores-score"]', $node);
            $score = $score[0]->nodeValue;

            $modifier = $this->xpath->query('.//span[@class="stat-block-ability-scores-modifier"]', $node);
            $modifier = str_replace(['(', ')'], '', $modifier[0]->nodeValue);

            $this->monster->addAbilityScore($name, $score, $modifier);
        }
    }

    protected function processParas()
    {
        $paras = $this->xpath->query('//p');


        foreach ($paras as $para) {
            $class = $para->attributes->getNamedItem("class");

            if (!$class) {
                continue;
            }

            $class = $class->value;

            if ($class == "Stat-Block-Styles_Stat-Block-Title") {
                $this->monster->setName($para->nodeValue);
            } elseif ($class == "Stat-Block-Styles_Stat-Block-Metadata") {
                $this->processMetadata($para->nodeValue);
            } elseif ($class == "Stat-Block-Styles_Stat-Block-Data") {
                $this->processDataBlock($para);
            } else {
                dump($class);
            }

            
        }
    }

    protected function processMetadata($meta)
    {
        if (preg_match('/(?<size>[\w]*) ((?<type>[\w]*)( \((?<tags>.*)\))?), (?<align>[\w\s]*)/', $meta, $matches)) {
            $this->monster->setSize(strtolower($matches['size']));
            $this->monster->setType(strtolower($matches['type']));
            $this->monster->setAlignment(strtolower($matches['align']));
            if (isset($matches['tags']) and strlen($matches['tags']) > 0) {
                $tags = explode(", ", $matches['tags']);
                foreach ($tags as $tag) {
                    $this->monster->addTag($tag);
                }
            }
        }
    }

    protected function processDataBlock($node) {
        $heading = $this->xpath->query('span[@class="Sans-Serif-Character-Styles_Bold-Sans-Serif"]', $node);
        // some headings are helpfully spread across multiple spans!
        if (count($heading) == 1) {
            $heading = $heading[0]->nodeValue;
        } elseif (count($heading) > 1) {
            $text = "";
            foreach ($heading as $headingNode) {
                $text .= $headingNode->nodeValue;
            }
            $heading = $text;
        } else {
            // no heading?
            return;
        }

        $fullText = $node->nodeValue;
        $fullText = str_replace($heading . " ", "", $fullText);

        $heading = strtolower($heading);
        
        // time for a big conditional!
        if ($heading == "armor class") {
            $values = $this->parseValueWithParenthesis($fullText);
            $this->monster->setArmorClass($values['value'], $values['parenthesis']);
        } elseif ($heading == "hit points") {
            $values = $this->parseValueWithParenthesis($fullText);
            $this->monster->setHP($values['value'], $values['parenthesis']);
        } elseif ($heading == "speed") {
            $speeds = $this->parseSpeedString($fullText);
            foreach ($speeds as $speed) {
                $this->monster->addSpeed($speed['type'], $speed['distance']);
            }
        } else {
            dump($heading);
        }
    }

    protected function parseSpeedString($text)
    {
        $return = [];

        $text = strtolower($text);

        $speeds = explode(', ', $text);
        
        foreach ($speeds as $speed) {
            $details = [];
            if (preg_match('/(?<type>[a-z]+ )?(?<distance>.*)/', $speed, $matches)) {
                if ($matches['type'] == '') {
                    $details['type'] = 'walk';
                } else {
                    $details['type'] = trim($matches['type']);
                }
                $details['distance'] = $matches['distance'];

                $return[] = $details;
            }
        }

        return $return;
    }
}
