<?php

use GeeksAreForLife\DND\Monster\DNDBeyondParser;


require('../common.php');

// work out what sort of parser we need

if ($_POST['parser'] == 'DNDBeyond') {
    $parser = new DNDBeyondParser();
} else {
    die("no parser found");
}

$parser->loadHTML($_POST['monsterHTML']);

$monster = $parser->getMonster();

$monster->setSource($_POST['sourcebook']);

dump($monster);

