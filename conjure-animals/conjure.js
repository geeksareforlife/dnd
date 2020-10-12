var monstersByEnvAndCR = {
    'arctic': {
        0.25: ['Elk', 'Giant Owl', 'Wolf'],
        0.5: ['Giant Goat'],
        1: ['Brown Bear', 'Dire Wolf'],
        2: ['Cave Bear', 'Giant Elk', 'Polar Bear', 'Saber-Toothed Tiger']
    },
    'coastal': {
        0.25: ['Giant Lizard', 'Giant Poisonous Snake', 'Giant Wolf Spider'],
        0.5: ['Crocodile'],
        1: ['Giant Octopus', 'Giant Toad'],
        2: []
    },
    'desert': {
        0.25: ['Constrictor Snake', 'Giant Lizard', 'Giant Poisonous Snake', 'Giant Wolf Spider'],
        0.5: ['Giant Wasp'],
        1: ['Giant Hyena', 'Giant Vulture', 'Lion'],
        2: ['Giant Constrictor Snake', 'Rhinoceros']
    },
    'forest': {
        0.25: ['Boar', 'Constrictor Snake', 'Elk', 'Giant Badger', 'Giant Bat', 'Giant Centipede', 'Giant Frog', 'Giant Lizard', 'Giant Owl', 'Giant Poisonous Snake', 'Giant Wolf Spider', 'Panther'],
        0.5: ['Ape', 'Black Bear', 'Giant Wasp'],
        1: ['Brown Bear', 'Dire Wolf', 'Giant Spider', 'Giant Toad', 'Giant Vulture', 'Tiger'],
        2: ['Cave Bear', 'Giant Boar', 'Giant Constrictor Snake', 'Giant Elk']
    },
    'grassland': {
        0.25: ['Axe Beak', 'Boar', 'Elk', 'Giant Badger', 'Giant Lizard', 'Giant Owl', 'Giant Poisonous Snake', 'Giant Wolf Spider', 'Panther', 'Riding Horse', 'Wolf'],
        0.5: ['Black Bear', 'Giant Goat', 'Giant Wasp', 'Warhorse'],
        1: ['Brown Bear', 'Dire Wolf', 'Giant Eagle', 'Giant Hyena', 'Giant Vulture', 'Lion'],
        2: ['Giant Boar', 'Giant Elk', 'Rhinoceros']
    },
    'mountain': {
        0.25: ['Giant Bat', 'Giant Lizard', 'Giant Owl', 'Panther', 'Wolf'],
        0.5: ['Giant Goat'],
        1: ['Brown Bear', 'Dire Wolf', 'Giant Eagle'],
        2: ['Cave Bear', 'Giant Elk', 'Saber-Toothed Tiger']
    },
    'swamp': {
        0.25: ['Constrictor Snake', 'Giant Bat', 'Giant Centipede', 'Giant Frog', 'Giant Lizard', 'Giant Poisonous Snake'],
        0.5: ['Crocodile', 'Giant Dragonfly', 'Giant Vulture'],
        1: ['Giant Spider', 'Giant Toad'],
        2: ['Giant Constrictor Snake']
    },
    'underdark': {
        0.25: ['Giant Bat', 'Giant Centipede', 'Giant Frog', 'Giant Lizard', 'Giant Wolf Spider'],
        0.5: [],
        1: ['Giant Spider', 'Giant Toad'],
        2: ['Cave Bear', 'Giant Constrictor Snake']
    },
    'underwater': {
        0.25: ['Constrictor Snake', 'Giant Frog', 'Giant Poisonous Snake'],
        0.5: ['Crocodile', 'Giant Sea Horse', 'Reef Shark'],
        1: ['Giant Octopus', 'Giant Toad'],
        2: ['Giant Constrictor Snake', 'Hunter Shark']
    },
    'dungeon': {
        0.25: ['Constrictor Snake', 'Giant Badger', 'Giant Bat', 'Giant Centipede', 'Giant Frog', 'Giant Lizard', 'Giant Poisonous Snake', 'Giant Wolf Spider'],
        0.5: ['Black Bear', 'Crocodile', 'Giant Wasp'],
        1: ['Brown Bear', 'Giant Spider', 'Giant Toad'],
        2: ['Cave Bear', 'Giant Constrictor Snake']
    },
    'cave': {
        0.25: ['Constrictor Snake', 'Giant Badger', 'Giant Bat', 'Giant Centipede', 'Giant Frog', 'Giant Lizard', 'Giant Poisonous Snake', 'Giant Wolf Spider'],
        0.5: ['Black Bear', 'Crocodile', 'Giant Wasp'],
        1: ['Brown Bear', 'Giant Spider', 'Giant Toad'],
        2: ['Cave Bear', 'Giant Constrictor Snake']
    },
    'prehistoric': {
        0.25: ['Axe Beak', 'Giant Bat', 'Giant Centipede', 'Giant Frog', 'Giant Lizard', 'Giant Poisonous Snake', 'Giant Wolf Spider'],
        0.5: ['Crocodile', 'Meganeura'],
        1: ['Dire Wolf', 'Giant Eagle', 'Giant Hyena', 'Giant Octopus', 'Giant Spider', 'Giant Toad'],
        2: ['Cave Bear', 'Giant Constrictor Snake', 'Giant Elk', 'Hunter Shark', 'Rhinoceros', 'Saber-Toothed Tiger']
    },
    'sewer': {
        0.25: ['Constrictor Snake', 'Giant Bat', 'Giant Centipede', 'Giant Frog', 'Giant Poisonous Snake', 'Giant Wolf Spider'],
        0.5: ['Crocodile'],
        1: ['Giant Octopus', 'Giant Spider', 'Giant Toad'],
        2: ['Giant Constrictor Snake']
    }
}

var possibleRatings = {
    0.25: [0.25],
    0.5:  [0.25, 0.5],
    1:    [0.25, 0.5, 1],
    2:    [0.25, 0.5, 1, 2]
};

var numConjuredMonsters = {
    0.25: 8,
    0.5:  4,
    1:    2,
    2:    1,
};

var multiplier = {
    3: 1,
    5: 2,
    7: 3,
    9: 4
};

$(document).ready(function() {
    setEnvironmentOptions();

    $('#submit').click(conjure);
});


function setEnvironmentOptions()
{
    var environments = Object.keys(monstersByEnvAndCR);
    var menu = $('#environment');

    for (var i=0; i < environments.length; i++) {
        var option = '<option value="' + environments[i] + '">' + environments[i] + '</option>';
        menu.append(option);
    }
}

function conjure()
{
    console.log("conjuring");

    // check we have got everything
    $('input').removeClass('is-invalid');
    $('select').removeClass('is-invalid');

    var environments = $('#environment').val();
    var cr = $('input[name="challenge"]:checked').val();
    var level = $('#level').val();
    var lower = $('#lower').prop('checked');
    var same = $('#same').prop('checked');

    var error = false;
    if (environments.length == 0) {
        $('#environment').addClass('is-invalid');
        error = true;
    }
    if (typeof cr == "undefined") {
        $('input[name="challenge"]').addClass('is-invalid');
        error = true;
    }

    if (error) {
        return false;
    }

    // how many monsters do we need?
    var numMonsters = numConjuredMonsters[cr] * multiplier[level];

    var monsters = Array(numMonsters);

    // are they all the same?
    if (same) {
        monsters.fill(getMonster(environments, cr, lower), 0);
    } else {
        for (var i=0; i<numMonsters; i++) {
            monsters[i] = getMonster(environments, cr, lower);
        }
    }
    
    // show them on screen
    display(monsters);
    
    return false;
}

function display(monsters)
{
    // collect any monsters that are the same
    monsterCount = {};

    for (var i=0; i<monsters.length; i++) {
        if (!monsterCount.hasOwnProperty(monsters[i])) {
            monsterCount[monsters[i]] = 0;
        }
        monsterCount[monsters[i]]++;
    }

    var output = "<p>Wild animals appear!</p>";

    for (monster in monsterCount) {
        //output += '<p>' + monsterCount[monster] + ' x <a target="_blank" href="' + allMonsters[monster] + '">' + monster + '</a></p>';
        output += '<p>' + monsterCount[monster] + ' x ' + monster;
        if (monsterCount[monster] > 1) {
            output += ', give them names:</p>';
        } else {
            output += ', give it a name:</p>';
        }
        for (var i = 0; i < monsterCount[monster]; i++) {
            output += '<div class="form-group row">'
            output += '<label for="' + monster + i + '" class="col-sm-2 col-form-label">' + monster + ' ' + (i+1) + '</label>';
            output += '<div class="col-sm-10">'
            output += '<input type="text" class="form-control monster-name" id="' + monster + i + '" data-monster="' + monster + '">';
            output += '</div></div>';
        }
    }

    output += '<a tabindex="0" class="btn btn-primary mb-1" id="getmessage" data-toggle="popover" data-trigger="manual" data-content="Copied!">Get Messages</a>';

    output += '<textarea id="monster-out" class="form-control"></textarea>';

    $('#output').html("").html(output);
    $('#getmessage').click(getMessage).popover();
}

function getMessage()
{
    // get monster types and names
    var monsters = [];

    $('.monster-name').each(function() {
        monsters[monsters.length] = {
            'type': $(this).attr('data-monster'),
            'name': $(this).val()
        }
    });

    message = '';

    for (var i = 0; i < monsters.length; i++) {
        message += allMonsters[monsters[i].type];
        if (monsters[i].name != '') {
            message += '&name=' + monsters[i].name;
        }
        message += "\n";
    }

    $('#monster-out').val(message);
    $('#monster-out').select();
    document.execCommand('copy');

    $('#getmessage').popover('show');
    setTimeout(function() {
        $('#getmessage').popover('hide');
    }, 1500)
}

function getMonster(environments, cr, lower)
{
    var monster = pickMonster(environments, cr, lower);

    stop = 100;
    while (monster == "" && (environments.length > 1 || lower)) {
        monster = pickMonster(environments, cr, lower);
        stop--;
        if (stop <=0) {
            break;
        }
    }
    // still haven't found one!
    if (monster == "") {
        monster = "No monster available with these settings";
    }

    return monster;
}

function pickMonster(environments, cr, lower)
{
    // pick an environment
    if (environments.length > 1) {
        var environment = pickRandomItem(environments);
    } else {
        var environment = environments[0];
    }

    if (lower) {
        cr = pickRandomItem(possibleRatings[cr]);
    }

    return pickRandomItem(monstersByEnvAndCR[environment][cr]);
}

function pickRandomItem(list)
{
    if (list.length > 0) {
        return list[Math.floor(Math.random() * list.length)];
    } else {
        return "";
    }
}
