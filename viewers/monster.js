var baseUrl = getBaseUrl();

var monsterPromise = getMonster();

var monster = [];

var currentHP = 0;

// this will either be on the Query String, or we will default to the monster type
var monsterName = "";

$(document).ready(function() {
    monsterPromise.done(function(data) {
        monster = data;
        displayMonster();

        sizeOutput();

        $('#hp-form .btn').click(changeHP);
    })
});

function sizeOutput()
{
    column = $('#output').parent();
    infobar = $('#info', column);
    height = column.height() - infobar.height() - 20;
    $('#output').height(height);
}

function changeHP()
{
    var mod = 1;
    var textColour = '#28a745';
    if ($(this).attr('id') == 'hp-reduce') {
        mod = -1;
        textColour = '#dc3545';
    }

    defaultText = '#212529';

    var amount = $('#hp-change').val();

    currentHP = currentHP + (mod * amount);

    $('#hp').html(currentHP);

    $('#hp').parent().animate({color: textColour}, 200, function() {
        $('#hp').parent().animate({color: defaultText}, 1000);
    });

    $('#hp-change').val('');

    return false;
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

function createSingleRollLink(rolling, linkText, diceText)
{
    var link = '<a href="javascript:singleDiceRoll(\'Rolling ' + rolling + '\', \'' + diceText + '\')">';
    link += linkText;
    link += '</a>';

    return link;
}

function singleDiceRoll(message, diceText)
{
    var roll = DiceRoller.roll(diceText);
    outputSingleDiceRoll(message, roll);
}

function outputSingleDiceRoll(message, roll)
{
    if (message == '') {
        var output = roll.diceText + ': ';
    } else {
        var output = message + ' (' + roll.diceText + '): ';
    }
    output += roll.result;

    $('#output').prepend('<p class="single-roll">' + output + '</p>');
}

function createActionRollLink(action, index)
{
    var link = '<a href="javascript:actionRoll(' + index + ')">';
    link += action;
    link += '</a>';

    return link;
}

function actionRoll(index)
{
    var action = monster.actions[index];

    var result = {};

    result.hit = DiceRoller.roll(action.tohit);
    // hit will always be one dice, is it a crit?
    result.crit = false;
    if (result.hit.parts[0].dice[0] == 20) {
        result.crit = true; 
    }

    result.damage = [];

    // just roll the first option for now. need to find an elegant way to offer the choice
    result.damage[0] = {
        damage: DiceRoller.roll(action.damages.or[0].dice),
        type: action.damages.or[0].type
    };

    if (action.damages.hasOwnProperty('plus')) {
        result.damage[1] = {
            damage: DiceRoller.roll(action.damages.plus.dice),
            type: action.damages.plus.type
        };
    }

    if (result.crit) {
        result.critDamage = [];

        // do it all again, but this time without the modifiers
        var regex = /\s?[\-+]\s?\d+/;
        var diceText = action.damages.or[0].dice.replace(regex, '');
        result.critDamage[0] = {
            damage: DiceRoller.roll(diceText),
            type: action.damages.or[0].type
        };

        if (action.damages.hasOwnProperty('plus')) {
            diceText = action.damages.plus.dice.replace(regex, '');
            result.critDamage[1] = {
                damage: DiceRoller.roll(diceText),
                type: action.damages.plus.type
            };
        }
    }

    outputActionRoll(action.name, result);
}

function outputActionRoll(name, result)
{
    console.log(result);

    var output = '<p class="action-roll"><strong>' + capitalise(name) + '</strong><br>';
    output += 'To Hit: ' + result.hit.result + '<br>';
    for (var i = 0; i < result.damage.length; i++) {
        output += capitalise(result.damage[i].type) + ': ' + result.damage[i].damage.result + '<br>';
    }
    if (result.crit) {
        output += 'CRITICAL HIT!' + '<br>'
        for (var i = 0; i < result.critDamage.length; i++) {
            output += capitalise(result.critDamage[i].type) + ': ' + result.critDamage[i].damage.result + '<br>';
        }
    }

    $('#output').prepend(output);
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
    currentHP = hp.result;
    $('#hp').html(currentHP);

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
        var diceText = '1d20' + plus + monster.abilities[ability].modifier;
        $('.modifier', abilityNode).html(createSingleRollLink(ability, plus + monster.abilities[ability].modifier, diceText));
    }

    // saving, skill throws
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

    // senses
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
        var html = '<p><strong>';
        if (monster.actions[i].hasOwnProperty('tohit')) {
            html += createActionRollLink(toTitleCase(monster.actions[i].name), i);
        } else {
            html += toTitleCase(monster.actions[i].name);
        }
        html += '</strong> ' + processTextForRolls(monster.actions[i].description) + '</p>'

        $('#actions').append(html);
    }

    // Legendary Actions
    if (monster.legendary.intro == '') {
        $('#legendary').remove();
    } else {
        $('#legendary').append('<p>' + monster.legendary.intro + '</p>');
        for (var i = 0; i < monster.legendary.actions.length; i++) {
            $('#legendary').append('<p><strong>' + toTitleCase(monster.legendary.actions[i].name) + '</strong> ' + processTextForRolls(monster.legendary.actions[i].description) + '</p>');
        }
    }
}

function simpleListWithData(list, throws) {
    var output = [];
    if (isSimpleObject(list)) {
        for (key in list) {
            var entry = capitalise(key) + ' ';
            var diceText = '1d20';
            if (throws && list[key] >= 0) {
                entry += '+';
                diceText += '+';
            }
            entry += list[key];
            diceText += list[key];

            if (throws) {
                entry = createSingleRollLink(capitalise(key), entry, diceText);
            }

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

function processTextForRolls(text)
{
    returnText = '';

    var regex = /(\d+[dD]\d+(\s?[\-+]\s?\d+)?)/g;

    returnText = text.replaceAll(regex, '<a href="javascript:singleDiceRoll(\'\', \'$1\')">$1</a>');

    return returnText;
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
