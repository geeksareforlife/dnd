<?php

namespace GeeksAreForLife\DND\Monster;

class Monster
{
    private $abilityScores = [
        'STR' => [
            'name'     => 'Strength',
            'score'    => 0,
            'modifier' => '+0',
        ],
        'DEX' => [
            'name'     => 'Dexterity',
            'score'    => 0,
            'modifier' => '+0',
        ],
        'CON' => [
            'name'     => 'Constitution',
            'score'    => 0,
            'modifier' => '+0',
        ],
        'INT' => [
            'name'     => 'Intelligence',
            'score'    => 0,
            'modifier' => '+0',
        ],
        'WIS' => [
            'name'     => 'Wisdom',
            'score'    => 0,
            'modifier' => '+0',
        ],
        'CHA' => [
            'name'     => 'Charisma',
            'score'    => 0,
            'modifier' => '+0',
        ],
    ];

    private $source;

    private $name;

    private $size;

    private $type;

    private $alignment;

    private $tags = [];

    private $ac = [
        'value' => 0,
        'info'  => null
    ];

    private $hp = [
        'hit points' => 0,
        'hit dice'   => ''
    ];

    private $speeds = [];

    public function setSource($source)
    {
        $this->source = $source;
    }

    public function setName($name)
    {
        $this->name = $name;
    }

    public function setSize($size)
    {
        $this->size = $size;
    }

    public function setType($type)
    {
        $this->type = $type;
    }

    public function setAlignment($alignment)
    {
        $this->alignment = $alignment;
    }

    public function addTag($tag)
    {
        if (!in_array($tag, $this->tags)) {
            $this->tags[] = $tag;
        }
    }

    public function addAbilityScore($name, $score, $modifier)
    {
        if (isset($this->abilityScores[$name])) {
            $this->abilityScores[$name]['score'] = $score;
            $this->abilityScores[$name]['modifier'] = $modifier;
        }
    }

    public function setArmorClass($value, $info)
    {
        $this->ac['value'] = $value;
        if (!is_null($info)) {
            $this->ac['info'] = $info;
        }
    }

    public function setHP($points, $dice)
    {
        $this->hp['hit points'] = $points;
        $this->hp['hit dice'] = $dice;
    }

    public function addSpeed($type, $distance)
    {
        $this->speeds[$type] = $distance;
    }
}
