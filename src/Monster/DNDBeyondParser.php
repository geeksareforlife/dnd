<?php

namespace GeeksAreForLife\DND\Monster;

use GeeksAreForLife\Utilities\Strings;

class DNDBeyondParser extends Parser
{

    protected function cleanHTML($html)
    {
        $html = preg_replace('/\<img[^\>]+\>+/', "", $_POST['monsterHTML']);

        // that first one is an en-dash (\u2013) 
        $html = str_replace('–', '-', $html);
        // this is an em-dash (\u2014)
        $html = str_replace('—', '-', $html);
        // we don't want the fancy apostrophes (\u2019)
        $html = str_replace('’', "'", $html);        

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

        $section = false;
        $trait = [];
        $action = [];

        foreach ($paras as $para) {
            $class = $para->attributes->getNamedItem("class");

            if (!$class) {
                continue;
            }

            $class = $class->value;

            if (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Title')) {
                $this->monster->setName($para->nodeValue);
            } elseif (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Metadata')) {
                $this->processMetadata($para->nodeValue);
            } elseif (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Data')) {
                $this->processDataBlock($para);
            } elseif(Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Bar-Object-Space')) {
                // ignore this
                continue;
            } else {
                // we are into the Traits, Actions and Legendary Actions now
                // Unfortunately, we can't split these by classes
                // some traits (any maybe actions?) are split across multiple paras
                // so we need to collect until we hit another one and then process
                
                if (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Heading')) {
                    $section = strtolower(trim($para->nodeValue));

                    if ($section == "actions" and $trait != []) {
                        //SAVE
                        $this->monster->addTrait($trait['name'], $trait['description'], $trait['lines']);
                        $trait = [];
                    } elseif ($section == "legendary actions" and $action != []) {
                        // SAVE
                        $this->monster->addAction($action['name'], $action['description'], $action['lines']);
                        $action = [];
                    }

                    // these lines dont have anything else on them
                    continue;
                } elseif ($section === false) {
                    // we must be in Traits
                    $section = 'traits';
                }

                if ($section == 'traits') {
                    if (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Body')) {
                        // we are starting a new trait, save the last one
                        // (if we had one)
                        
                        //SAVE
                        if ($trait != []) {
                            $this->monster->addTrait($trait['name'], $trait['description'], $trait['lines']);
                        }
                        // split out the trait name and description
                        $name = $this->findHeading('Sans-Serif-Character-Styles_Inline-Subhead-Sans-Serif', $para);
                        $description = $para->nodeValue;
                        $description = trim(str_replace($name, "", $description));
                        $name = trim(strtolower($name));

                        $trait = [
                            'name' => $name,
                            'description' => $description,
                            'lines' => [],
                        ];
                    } elseif (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Hanging')) {
                        // extra lines for the current trait
                        $trait['lines'][] = $para->nodeValue;
                    } else {
                        dump("Error: " . $class);
                    }
                } elseif ($section == 'actions') {
                    if (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Body')) {
                        // we are starting a new action, save the last one
                        // (if we had one)
                        
                        //SAVE
                        if ($action != []) {
                            $this->monster->addAction($action['name'], $action['description'], $action['lines']);
                        }

                        // split out the action name and description
                        $name = $this->findHeading('Sans-Serif-Character-Styles_Inline-Subhead-Sans-Serif', $para);
                        if ($name === false) {
                            // nothing really here
                            $action = [];
                            continue;
                        }

                        $description = $para->nodeValue;
                        $description = trim(str_replace($name, "", $description));
                        $name = trim(strtolower($name));

                        $action = [
                            'name' => $name,
                            'description' => $description,
                            'lines' => [],
                        ];
                    } elseif (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Hanging')) {
                        // extra lines for the current action
                        $action['lines'][] = $para->nodeValue;
                    } else {
                        dump("Error: " . $class);
                    }
                } elseif ($section == 'legendary actions') {
                    // classes are different with legendary actions
                    // we have an intro and then the actions
                    
                    if (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Body')) {
                        $this->monster->addLegendaryIntro($para->nodeValue);
                    } elseif (Strings::startsWith($class, 'Stat-Block-Styles_Stat-Block-Hanging')) {
                        $name = $this->findHeading('Sans-Serif-Character-Styles_Bold-Sans-Serif', $para);
                        if ($name === false) {
                            // nothing really here
                            $action = [];
                            continue;
                        }

                        $description = $para->nodeValue;
                        $description = trim(str_replace($name, "", $description));
                        $name = trim(strtolower($name));

                        $this->monster->addLegendaryAction($name, $description);
                    } else {
                        dump("Error: " . $class);
                    }
                }
            }
        }

        // make sure we haven't got any traits or actions hanging around
        if ($trait != []) {
            $this->monster->addTrait($trait['name'], $trait['description'], $trait['lines']);
        }
        if ($action != []) {
            $this->monster->addAction($action['name'], $action['description'], $action['lines']);
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
        $heading = $this->findHeading('Sans-Serif-Character-Styles_Bold-Sans-Serif', $node);

        if ($heading === false) {
            return;
        }

        $fullText = $node->nodeValue;
        $fullText = trim(str_replace($heading, "", $fullText));

        $heading = trim(strtolower($heading));
        
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
        } elseif ($heading == "saving throws") {
            $throws = $this->parseThrows($fullText);
            foreach ($throws as $throw) {
                $this->monster->addSavingThrow($throw['type'], $throw['modifier']);
            }
        } elseif ($heading == "skills") {
            $throws = $this->parseThrows($fullText);
            foreach ($throws as $throw) {
                $this->monster->addSkillThrow($throw['type'], $throw['modifier']);
            }
        } elseif ($heading == "damage resistances") {
            $groups = $this->parseGroupedList($fullText);
            $this->monster->setDamageResistances($groups);
        } elseif ($heading == "damage immunities") {
            $groups = $this->parseGroupedList($fullText);
            $this->monster->setDamageImmunities($groups);
        } elseif ($heading == "damage vulnerabilities") {
            $groups = $this->parseGroupedList($fullText);
            $this->monster->setDamageVulnerabilities($groups);
        } elseif ($heading == "condition immunities") {
            $conditions = $this->parseList($fullText);
            foreach ($conditions as $condition) {
                $this->monster->addConditionImmunity($condition);
            }
        } elseif ($heading == "senses") {
            $senses = $this->parseSenses($fullText);
            foreach ($senses as $sense) {
                $this->monster->addSense($sense['sense'], $sense['range']);
            }
        } elseif ($heading == "languages") {
            $this->monster->setLangauges($fullText);
        } elseif ($heading == "challenge") {
            $values = $this->parseValueWithParenthesis($fullText);
            $this->monster->setChallenge($values['value'], $values['parenthesis']);
        } else {
            dump("Error: " . $heading);
        }
    }

    protected function findHeading($class, $node)
    {
        $heading = $this->xpath->query('span[@class="' . $class . '"]', $node);
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
            return false;
        }

        return $heading;
    }
}
