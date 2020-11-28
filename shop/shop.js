var page = "shop";

var type = "";
var locale = "";
var shopValue = "";
var theme = "";

$(document).ready(function() {
    $('#type').change(toggleTheme);

    $('#submit').click(buildShop);

    $('#buy').click(buyGoods);

    $('#searchForm').submit(function() {
        return false;
    });

    $("#search").autocomplete({
        maximumItems: 8,
        source: itemSearchIndex,
        treshold: 1,
        onSelectItem: foundItem
    });

    $('#linkForm').submit(function() {
        return false;
    });

    $('#getLink').click(copyLink);
    $('#includeCosts').click(updateLink);
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

function buildShop()
{
    type = $('#type').val();
    locale = $('#locale').val();
    shopValue = $('#value').val()
    theme = "-";

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
    $('#store-title').html(shops[type].name);


    // copy the array!
    items = getShopItems(type, locale, theme);
    
    displayItems(items);

    // sort out gold
    var daily = shops[type].funds.daily[shopValue];
    var cap = shops[type].funds.cap[shopValue];

    $('#goldDaily').attr('data-coppers', daily).html(displayMoney(daily));
    $('#goldCap').attr('data-coppers', cap).html(displayMoney(cap));

    $('#goldDaily').removeClass('text-danger');

    updateLink();

    $('table').removeClass('invisible');
    $('#sidebar').removeClass('invisible');
    return false;
}

function buyGoods()
{
    var daily = $('#goldDaily').attr('data-coppers');
    var cap = $('#goldCap').attr('data-coppers');

    var gp = parseInt(0 + $('#buyGP').val(), 10);
    var sp = parseInt(0 + $('#buySP').val(), 10);
    var cp = parseInt(0 + $('#buyCP').val(), 10);

    coppers = (gp*100) + (sp*10) + cp;

    daily = daily - coppers;
    if (daily <= 0) {
        daily = 0;
        $('#goldDaily').addClass('text-danger');
    }

    cap = cap - coppers;

    $('#goldDaily').attr('data-coppers', daily).html(displayMoney(daily));
    $('#goldCap').attr('data-coppers', cap).html(displayMoney(cap));

    // clear form
    $('#buyGP').val('');
    $('#buySP').val('');
    $('#buyCP').val('');

    return false;
}

function copyLink()
{
    $('#playerLink').select();
    document.execCommand('copy');

    $('#playerLink').popover('show');
    setTimeout(function() {
        $('#playerLink').popover('hide');
    }, 1500)

    return false;
}

function updateLink()
{
    var includeCosts = $('#includeCosts').prop("checked");

    var signature = btoa(type + "|" + locale + "|" + shopValue + "|" + theme + "|" + includeCosts);
    
    var link = document.location.href.substr(0, document.location.href.lastIndexOf('/'));
    link += "/player.html?shop=" + signature;

    $('#playerLink').val(link);
}

function foundItem(selected, element)
{
    itemDetails(selected.value);

    $('#search').val('');
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
