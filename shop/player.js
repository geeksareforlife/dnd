var page = "player";

var shopValue;
var includeCosts;

$(document).ready(function() {
    var signature = getUrlParameter('shop');
    signature = atob(signature);
    
    if (signature.indexOf("|") == -1) {
        // not a real signature :(
        console.log("failed to find signature");
        console.log(signature);
        return false;
    }

    var shopDetails = signature.split("|");

    // we have a real signature, build the shop!
    if (validate(shopDetails)) {
        buildShop(shopDetails);
    } else {
        console.log("failed to validate shop details");
        console.log(shopDetails);
        return false;
    }
});

function validate(shopDetails)
{
    // if any test fails, the whole thing fails
    
    if (shopDetails.length != 5) {
        // not a real signature :(
        return false;
    }

    // type
    if (!shops.hasOwnProperty(shopDetails[0])) {
        console.log("invalid shop type");
        return false;
    }

    var locales = ["limited", "rural", "urban", "premium"];
    if (locales.indexOf(shopDetails[1]) == -1) {
        console.log("invalid shop locale");
        return false;
    }

    var values = ["normal", "cheap", "expensive"];
    if (values.indexOf(shopDetails[2]) == -1) {
        console.log("invalid shop value");
        return false;
    }

    var themes = ["-", "art and games", "shady dealer", "magical", "water-side"];
    if (themes.indexOf(shopDetails[3]) == -1) {
        console.log("invalid shop theme");
        return false;
    }  

    // include costs
    if (shopDetails[4] !== "true" && shopDetails[4] !== "false") {
        console.log("invalid include costs");
        return false;
    }

    console.log("validated");

    return true;
}

function buildShop(shopDetails)
{
    // name
    $('#shopname').html(toTitleCase(shopDetails[0]))

    // store global vars
    shopValue = shopDetails[2];
    includeCosts = (shopDetails[4] === "true");

    var items = getShopItems(shopDetails[0], shopDetails[1], shopDetails[3]);

    displayItems(items);
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

    output += '<td class="text-center">';
    if (includeCosts) {
        output += displayMoney(details.cost[shopValue]);
    } else {
        output += '?';
    }
    output += '</td>'
    output += '</tr>';

    $('#items').append(output);
}
