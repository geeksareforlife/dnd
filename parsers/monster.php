<?php

use GeeksAreForLife\DND\Monster\DNDBeyondParser;

require('../common.php');

if (!isset($_POST['parser'])) {
    showForm();
} else {
    // work out what sort of parser we need

    if ($_POST['parser'] == 'DNDBeyond') {
        $parser = new DNDBeyondParser();
    } else {
        die("no parser found");
    }

    $parser->loadHTML($_POST['monsterHTML']);

    $monster = $parser->getMonster();

    $monster->setSource($_POST['sourcebook']);

    if (file_put_contents('../data/monsters/' . $monster->getSlug() . '.json', $monster->getJson()) === false) {
        showForm('Failed to save monster: ' . $monster->getName(), 'error');
    } else {
        showForm("Saved Monster: " . $monster->getName());
    }
    
}

// Some traditional HTML-in-PHP, for old times' sake!
function showForm($message = '', $type = 'success')
{
?>
<!doctype html>

<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Add New Monster</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">

    <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossorigin="anonymous"></script>

    <script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>
    <script src="form-helper.js"></script>

</head>
<body>
<div class="container">

<h1>Add New Monster</h1>
<?php
    if ($message != '') {
        if ($type == 'error') {
            $class = 'alert-danger';
        } elseif ($type == 'success') {
            $class = 'alert-success';
        } else {
            $class = 'alert-primary';
        }
    ?>
        <div class="alert <?php echo($class); ?> alert-dismissible fade show" role="alert">
            <?php echo($message); ?>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    <?php
    }
?>
<form method="POST" action="monster.php" id="addform">
  <div class="form-group">
    <label for="monsterHTML">Monster HTML</label>
    <textarea class="form-control" id="monsterHTML" name="monsterHTML" rows="12"></textarea>
  </div>
  <div class="form-group">
    <label for="sourcebook">Sourcebook</label>
    <select class="form-control" id="sourcebook" name="sourcebook">
        <option value="BR">Basic Rules</option>
        <option value="PHB">Player's Handbook</option>
        <option value="MM">Monster Manual</option>
    </select>
  </div>
  <div class="form-group">
    <label for="parser">HTML Source</label>
    <select class="form-control" id="parser" name="parser">
        <option value="DNDBeyond">D&amp;D Beyond</option>
    </select>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>


</div>
</body>
</html>
<?php
}
