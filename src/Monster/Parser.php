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

    protected function parseValueWithParenthesis($text)
    {
        $return = [
            'value' => '',
            'parenthesis' => null,
        ];
        if (strpos($text, '(')) {
            if (preg_match('/([^()]*)\s+(\((.*)\))?/', $text, $matches)) {
                $return['value'] = $matches[1];
                $return['parenthesis'] = $matches[3];
            }
        } else {
            $return['value'] = $text;
        }
        

        return $return;
    }

    abstract protected function parseMonster();
}
