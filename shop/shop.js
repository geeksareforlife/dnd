var shops = {
    'general': {
        'name': "General Store",
        'funds': {
            'daily': {
                'normal': 37500,
                'cheap': 28100,
                'expensive': 50000
            },
            'cap': {
                'normal': 75000,
                'cheap': 56200,
                'expensive': 100000
            }
        }
    },
    'adventuring supplies': {
        'name': "Adventuring Supplies",
        'funds': {
            'daily': {
                'normal': 75000,
                'cheap': 56200,
                'expensive': 112500
            },
            'cap': {
                'normal': 150000,
                'cheap': 112500,
                'expensive': 226000
            }
        }
    }
};

var shopValue = "";

$(document).ready(function() {
    $('#type').change(toggleTheme);

    $('#submit').click(buildShop);
});

function toggleTheme()
{
    var type = $('#type').val();

    if (type == 'general' || type == 'adventuring supplies') {
        $('#theme').prop('disabled', false);
    } else {
        $('#theme').prop('disabled', true);
    }
}

function itemDetails(itemID)
{
    var item = itemIndex[itemID];

    // all of these are complete replacements
    $('#itemDetailsLabel').html(toTitleCase(item.name));
    $('#itemWeight').html(item.weight + " lb");
    $('#itemCheap').html(displayMoney(item.cost.cheap));
    $('#itemNormal').html(displayMoney(item.cost.normal));
    $('#itemExpensive').html(displayMoney(item.cost.expensive));

    $('.itemCost').removeClass('text-success');

    $('#item' + toTitleCase(shopValue)).addClass('text-success');

    // these need clearing before adding the new content
    $('#itemDescription').html('');
    $('#itemCategories').html('');
    $('#itemStores').html('');

    for (var i = 0; i < item.description.length; i++) {
        $('#itemDescription').append('<p>' + item.description[i] + '</p>');
    }

    $('#itemCategories').append(displayBadge(item.category, 'primary'));
    if (item.subcategory != "") {
        $('#itemCategories').append(' / ' + displayBadge(item.subcategory, 'primary'));
    }

    for (store in item.stores) {
        for (var j = 0; j < item.stores[store].length; j++) {
            $('#itemStores').append(displayBadge(store + '-' + item.stores[store][j], 'primary'))
        }
    }

    for (theme in item.themes) {
        for (var j = 0; j < item.themes[theme].length; j++) {
            $('#itemStores').append(displayBadge(theme + '-' + item.themes[theme][j], 'info'))
        }
    }

    $('#itemDetails').modal({});
}

function buildShop()
{
    var type = $('#type').val();
    var locale = $('#locale').val();
    shopValue = $('#value').val()
    var theme = "-";

    if (type == 'general' || type == 'adventuring supplies') {
        theme = $('#theme').val();
    }

    var error = false;
    $('#type').removeClass('is-invalid');
    $('#locale').removeClass('is-invalid');
    if (type == '-') {
        $('#type').addClass('is-invalid');
        error = true;
    }
    if (locale == '-') {
        error = true;
        $('#locale').addClass('is-invalid');
    }

    if (error) {
        return false;
    }

    // set the name of the shop
    $('#store-title').html(toTitleCase(type));


    // copy the array!
    var items = deepishCopy(shopLists[type][locale]);

    if (theme != '-') {
        themeItems = deepishCopy(shopLists[theme][locale]);

        for (category in themeItems) {
            if (items.hasOwnProperty(category)) {
                for (subcategory in themeItems[category]) {
                    if (items[category].hasOwnProperty(subcategory)) {
                        if (items[category][subcategory] != "item") {
                            // array of items
                            var newList = items[category][subcategory].concat(themeItems[category][subcategory]);
                            newList = newList.filter((item, pos) => newList.indexOf(item) === pos);
                            items[category][subcategory] = newList;
                        } else {
                            // this is an item and we already have it!
                        }
                    } else {
                        items[category][subcategory] = themeItems[category][subcategory];
                    }
                }
            } else {
                items[category] = themeItems[category];
            }
        }
    }
    
    displayItems(items);

    return false;
}

function deepishCopy(object)
{
    return JSON.parse(JSON.stringify(object));
}

function clearItems()
{
    $('#items').html("");
}

function displayItems(items)
{
    clearItems();

    categories = getAlphaKeys(items);

    for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        $('#items').append('<tr><td colspan="6">' + toTitleCase(category) + '</td></tr>');
        var subcategories = getAlphaKeys(items[category])
        for (var j = 0; j < subcategories.length; j++) {
            var subcategory = subcategories[j];
            if (items[category][subcategory] == "item") {
                // this is actually an item!
                addItem(subcategory, 1);
            } else {
                $('#items').append('<tr><td></td><td colspan="5">' + toTitleCase(subcategory) + '</td></tr>');
                var subitems = items[category][subcategory].sort();
                for (k = 0; k < subitems.length; k++) {
                    addItem(subitems[k], 2);
                }
            }
        }
    }
}

function addItem(item, indent)
{
    var details = itemIndex[item];

    var output = '<tr>';
    for (var i = 0; i < indent; i++) {
        output += '<td></td>';
    }
    var colspan = 3 - indent;
    if (colspan > 1) {
        output += '<td colspan="' + colspan + '">';
    } else {
        output += '<td>';
    }
    output += '<a href="javascript:itemDetails(\'' + item + '\')">' + details.name + '</a></td>';

    values = ['cheap', 'normal', 'expensive'];

    for (var i = 0; i < values.length; i++) {
        var valueClass = "";
        if (shopValue == values[i]) {
            valueClass = ' table-success';
        }
        output += '<td class="text-center' + valueClass + '">' + displayMoney(details.cost[values[i]]) + '</td>';
    }

    output += '</tr>';

    $('#items').append(output);
}

function displayMoney(value)
{
    var gp = Math.floor(value / 100);
    var sp = Math.floor((value - (gp * 100)) / 10);
    var cp = value - (gp * 100) - (sp * 10);

    var coins = [];

    if (gp > 0) {
        coins[coins.length] = gp + " gp";
    }
    if (sp > 0) {
        coins[coins.length] = sp + " sp";
    }
    if (cp > 0) {
        coins[coins.length] = cp + " cp";
    }

    return coins.join(' ');
}

function displayBadge(text, type)
{
    if (type == 'primary') {
        badgeClass = 'badge-primary';
    } else if (type == 'info') {
        badgeClass = 'badge-info';
    }
    return '<span class="badge badge-pill ' + badgeClass + '">' + text + '</span> ';
}

function getAlphaKeys(object)
{
    var keys = [];

    for (key in object) {
        keys[keys.length] = key;
    }

    return keys.sort();
}

// from https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}
