<?php

namespace GeeksAreForLife\DND\Monster;

use GeeksAreForLife\DND\Monster\Monster;
use GeeksAreForLife\DND\Exceptions\ParserException;


abstract class Parser
{
    protected $monster;

    protected $dom;

    protected $xpath;

    public function __construct()
    {
        $this->monster = new Monster();
    }

    public function loadHTML($html)
    {
        $html = $this->cleanHTML($html);

        $this->dom = new \DOMDocument();
        if (!$this->dom->loadXML($html)) {
            throw new ParserException("unable to parse HTML");
        }

        $this->xpath = new \DOMXpath($this->dom);

        $this->parseMonster();
    }

    public function getMonster()
    {
        return $this->monster;
    }

    protected function cleanHTML($html)
    {
        $html = str_replace("&nbsp;", " ", $html);
        return $html;
    }

    abstract protected function parseMonster();

    protected function parseSpeedString($text)
    {
        $speeds = [];

        $list = $this->parseList($text);
        
        foreach ($list as $item) {
            $speed = [];
            if (preg_match('/(?<type>[a-z]+ )?(?<distance>.*)/', $item, $matches)) {
                if ($matches['type'] == '') {
                    $speed['type'] = 'walk';
                } else {
                    $speed['type'] = trim($matches['type']);
                }
                $speed['distance'] = $matches['distance'];

                $speeds[] = $speed;
            }
        }

        return $speeds;
    }

    protected function parseThrows($text)
    {
        $throws = [];

        $list = $this->parseList($text);

        foreach ($list as $item) {
            $parts = explode(" ", $item);

            $throws[] = [
                'type'      => $parts[0],
                'modifier' => $parts[1]
            ];
        }

        return $throws;
    }

    protected function parseValueWithParenthesis($text)
    {
        $return = [
            'value' => '',
            'parenthesis' => null,
        ];
        if (strpos($text, '(') !== false) {
            if (preg_match('/([^()]*)\s+(\((.*)\))?/', $text, $matches)) {
                $return['value'] = $matches[1];
                $return['parenthesis'] = $matches[3];
            }
        } else {
            $return['value'] = $text;
        }
        

        return $return;
    }

    protected function parseList($text)
    {
        $text = strtolower($text);

        return explode(', ', $text);
    }

    protected function parseGroupedList($text)
    {
        if (strpos($text, ';') !== false) {
            $groups = explode('; ', $text);
        } else {
            $groups = [$text];
        }

        $list = [];

        foreach ($groups as $group) {
            $items = $this->parseList($group);
            $lastItemIndex = count($items) - 1;

            // if the last item starts with "and", get rid of it
            $items[$lastItemIndex] = str_replace('and ', '', $items[$lastItemIndex]);

            // if the last item has "from" in it, then we have a condition
            if (strpos($items[$lastItemIndex], 'from') !== false) {
                $parts = explode(' from ', $items[$lastItemIndex]);
                $items[$lastItemIndex] = $parts[0];
                $condition = $parts[1];
            } else {
                $condition = '';
            }

            $list[] = [
                'condition' => $condition,
                'items' => $items,
            ];
        }

        return $list;
    }

    protected function parseSenses($text)
    {
        $list = $this->parseList($text);

        $senses = [];

        foreach ($list as $item) {
            if (strpos($item, 'passive perception') !== false) {
                $range = str_replace('passive perception ', '', $item);
                $senses[] = [
                    'sense' => 'passive Perception',
                    'range' => $range
                ];
            } else {
                $parts = explode(' ', $item, 2);
                $senses[] = [
                    'sense' => $parts[0],
                    'range' => $parts[1]
                ];
            }
        }

        return $senses;
    }
}
