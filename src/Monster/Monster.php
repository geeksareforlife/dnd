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

    private $savingThrows = [];

    private $skillThrows = [];

    private $damageVulnerabilities = [];

    private $damageResistances = [];

    private $damageImmunities = [];

    private $conditionImmunities = [];

    private $senses;

    private $languages;

    private $challenge = [
        'rating' => 0,
        'xp'     => 0
    ];

    private $traits = [];

    private $actions = [];

    private $legendary = [
        'intro'   => '',
        'actions' => [],
    ];

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

    public function addSavingThrow($type, $modifier)
    {
        $this->savingThrows[$type] = $modifier;
    }

    public function addSkillThrow($type, $modifier)
    {
        $this->skillThrows[$type] = $modifier;
    }

    public function addConditionImmunity($condition)
    {
        $this->conditionImmunities[] = $condition;
    }

    public function setDamageVulnerabilities($groups)
    {
        $this->damageVulnerabilities = $groups;
    }

    public function setDamageResistances($groups)
    {
        $this->damageResistances = $groups;
    }

    public function setDamageImmunities($groups)
    {
        $this->damageImmunities = $groups;
    }

    public function addSense($sense, $range)
    {
        $this->senses[] = [
            'sense' => $sense,
            'range' => $range
        ];
    }

    public function setLangauges($languages)
    {
        $this->languages = $languages;
    }

    public function setChallenge($rating, $xp)
    {
        $this->challenge['rating'] = $rating;
        $this->challenge['xp'] = $xp;
    }

    public function addTrait($name, $description, $extra)
    {
        $this->traits[] = [
            'name'        => $name,
            'description' => $description,
            'extra'       => $extra
        ];
    }

    public function addAction($name, $description, $extra)
    {
        $action = [
            'name'        => $name,
            'description' => $description,
            'extra'       => $extra
        ];

        // see if we can process the $description for a "to hit" and/or "hit"
        
        // first, to hit.  This will just be a modifier for a d20
        if (preg_match('/(?<mod>(\+|\-)\d+) to hit/', $description, $matches)) {
            $action['tohit'] = '1d20' . $matches['mod'];
        }

        // now hit. This will look something like: Hit: 8 (2d4 + 3) slashing damage
        if (preg_match('/Hit: (?<average>\d+) \((?<dice>\d?d\d? (\+|\-) \d?)\) (?<type>[a-zA-Z ]*) damage/', $description, $matches)) {
            $action['damage'] = [
                'type'    => $matches['type'],
                'average' => $matches['average'],
                'dice'    => $matches['dice'],
            ];
        }

        $this->actions[] = $action;
    }

    public function addLegendaryIntro($intro)
    {
        $this->legendary['intro'] = $intro;
    }

    public function addLegendaryAction($name, $description)
    {
        $this->legendary['actions'][] = [
            'name' => $name,
            'description' => $description,
        ];
    }
}
