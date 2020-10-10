var baseUrl = getBaseUrl();

var monsterPromise = getMonster();

var monster = [];

// this will either be on the Query String, or we will default to the monster type
var monsterName = "";

$(document).ready(function() {
    monsterPromise.done(function(data) {
        monster = data;
        displayMonster();

        sizeOutput();
    })
});

function sizeOutput()
{
    column = $('#output').parent();
    infobar = $('#info', column);
    height = column.height() - infobar.height() - 20;
    $('#output').height(height);
}

function getMonster()
{
    var monster = $.Deferred();

    var slug = getSlug();

    var url = baseUrl + '/data/monsters/' + slug + '.json';

    console.log(url);

    $.get(url)
    .done(function(data) {
        monster.resolve(data);
    }).fail(function() {
        monster.reject();
    })

    return monster;
}

function outputSingleDiceRoll(message, roll)
{
    var output = message + ' (' + roll.diceText + '): ' + roll.result;

    $('#output').prepend('<p class="single-roll">' + output + '</p>');
}

function displayMonster()
{
    console.log(monster);

    // Name
    monsterName = getUrlParameter('name');
    var extra = ' <span class="small">(' + monster.name + ')</span>';
    if (monsterName == '') {
        monsterName = monster.name
        extra = '';
    }
    $('title').prepend(monsterName + ' | ');
    $('#name').html(monsterName + extra);

    // Type and alignment
    var type = monster.size + ' ' + monster.type;
    if (monster.tags.length > 0) {
        type += ' (' + monster.tags.join(', ') + ')';
    }
    type += ', ' + monster.alignment;
    $('#type').html(capitalise(type));

    // AC & HP
    $('#ac').html(monster.ac.value);

    var hp = DiceRoller.roll(monster.hp['hit dice']);
    $('#hp').html(hp.result);

    outputSingleDiceRoll("Rolling HP", hp);

    // Speeds
    var speedString = "<strong>Speed</strong> " + monster.speeds.core.walk;

    for (type in monster.speeds.core) {
        if (type != 'walk') {
            speedString += ', ' + type + ' ' + monster.speeds.core[type];
        }
    }

    if (isSimpleObject(monster.speeds.forms)) {
        formStrings = [];
        for (form in monster.speeds.forms) {
            formString = monster.speeds.forms[form].walk;
            for (type in monster.speeds.forms[form]) {
                if (type != 'walk') {
                    formString += ', ' + type + ' ' + monster.speeds.forms[form][type];
                }
            }
            formString += ' in ' + form;
            formStrings[formStrings.length] = formString;
        }
        speedString += ' (' + formStrings.join('; ') + ')';
    }
    $('#speeds').html(speedString);

    // Ability Scores
    for (ability in monster.abilities) {
        abilityNode = $('#' + ability.toLowerCase());
        $('.score', abilityNode).html(monster.abilities[ability].score);
        var plus = '';
        if (monster.abilities[ability].modifier >= 0) {
            plus = '+'
        }
        $('.modifier', abilityNode).html(plus + monster.abilities[ability].modifier);
    }

    // saving, skill throws and senses
    var saving = simpleListWithData(monster.savingThrows, true);
    if (saving === false) {
        $('#saving').remove();
    } else {
        $('#saving').html('<strong>Saving Throws</strong> ' + saving);
    }
    var skills = simpleListWithData(monster.skillThrows, true);
    if (skills === false) {
        $('#skills').remove();
    } else {
        $('#skills').html('<strong>Skills</strong> ' + skills);
    }
    var senses = simpleListWithData(monster.senses, false);
    if (senses === false) {
        $('#senses').remove();
    } else {
        $('#senses').html('<strong>Ssenses</strong> ' + senses);
    }

    // languages
    $('#languages').html('<strong>Languages</strong> ' + monster.languages);

    // CR
    $('#challenge').html('<strong>Challenge</strong> ' + monster.challenge.rating + ' (' + monster.challenge.xp + ')');

    // damage Resistances, Immunities and Vulnerabilities
    var resistances = groupedListWithCondition(monster.damageResistances);
    if (resistances === false) {
        $('#resistances').remove();
    } else {
        $('#resistances').html('<strong>Damage Resistances</strong> ' + resistances);
    }
    var dImmunities = groupedListWithCondition(monster.damageImmunities);
    if (dImmunities === false) {
        $('#d-immunities').remove();
    } else {
        $('#d-immunities').html('<strong>Damage Immunities</strong> ' + dImmunities);
    }
    var vulnerabilities = groupedListWithCondition(monster.damageVulnerabilities);
    if (vulnerabilities === false) {
        $('#vulnerabilities').remove();
    } else {
        $('#vulnerabilities').html('<strong>Damage Resistances</strong> ' + vulnerabilities);
    }
    var cImmunities = simpleList(monster.conditionImmunities);
    if (cImmunities === false) {
        $('#c-immunities').remove();
    } else {
        $('#c-immunities').html('<strong>Condition Immunities</strong> ' + cImmunities);
    }

    // traits
    if (monster.traits.length > 0) {
        for (var i = 0; i < monster.traits.length; i++) {
            var para = '<strong>' + toTitleCase(monster.traits[i].name) + '</strong> ' + monster.traits[i].description;
            if (monster.traits[i].extra.length > 0) {
                para += '<ul><li>' + monster.traits[i].extra.join('</li><li>') + '</li></ul>';
            }
            $('#traits').append('<p>' + para + '</p>');    
        }
    } else {
        $('#traits').remove();
    }

    // Actions
    for (var i = 0; i < monster.actions.length; i++) {
        $('#actions').append('<p><strong>' + toTitleCase(monster.actions[i].name) + '</strong> ' + monster.actions[i].description + '</p>');
    }

    // Legendary Actions
    if (monster.legendary.intro == '') {
        $('#legendary').remove();
    } else {
        $('#legendary').append('<p>' + monster.legendary.intro + '</p>');
        for (var i = 0; i < monster.legendary.actions.length; i++) {
            $('#legendary').append('<p><strong>' + toTitleCase(monster.legendary.actions[i].name) + '</strong> ' + monster.legendary.actions[i].description + '</p>');
        }
    }
}

function simpleListWithData(list, throws) {
    var output = [];
    if (isSimpleObject(list)) {
        for (key in list) {
            var entry = capitalise(key) + ' ';
            if (throws && list[key] >= 0) {
                entry += '+';
            }
            entry += list[key];
            output[output.length] = entry;
        }
        return output.join(', ');
    } else {
        return false;
    }
}

function groupedListWithCondition(list) {
    var output = [];

    if (list.length > 0) {
        for (var i = 0; i < list.length; i++) {
            listString = simpleList(list[i].items);
            if (list[i].condition != '') {
                listString = listString.replace(/,([^,]*)$/, ', and $1')
                listString += ' from ' + list[i].condition;
            }
            output[output.length] = listString
        }
        return output.join('; ');
    } else {
        return false;
    }
}

function simpleList(list) {
    return list.join(', ');
}

function getSlug()
{
    var type = getUrlParameter('type');
    return type.replaceAll(' ', '-').toLowerCase();
}

function getBaseUrl()
{
    var hostname = window.location.hostname;

    if (hostname == 'localhost') {
        return window.location.origin;
    } else {
        return window.location.origin + '/dnd';
    }
}

function getUrlParameter(name)
{
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// this does not cover all cases, but fine for our JSON derived data (I think!)
function isSimpleObject(variable)
{
    return (typeof variable == 'object' && !(variable instanceof Array));
}

// from: https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
const capitalise = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// from: https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return capitalise(txt);
    }
  );
}
