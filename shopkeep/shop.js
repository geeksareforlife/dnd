var directus = new DirectusSdk.Directus('https://directus.geeksareforlife.com/', {auth:{mode:'cookie'}});

$(document).ready(function() {
    directus.auth.token.then(function(token) {
        console.log(token);
        if (token === null) {
            console.log("Not logged in");
        } else {
            console.log("Already logged in");
            showShopList();
            showProfile();
        }
    });
});

function showProfile()
{
    directus.users.me.read().then(function (me) {
        var name = me["first_name"] + " " + me["last_name"];
        $('#profile').attr("title", name).show();
    });
}

function showShopList()
{
    var shops = directus.items('shops');

    shops.readByQuery({limit:-1}).then(function(allShops) {
        console.log(allShops);
        var myShops = allShops["data"];

        for (var i = 0; i < myShops.length; i++) {
            var row = '<tr>';
            row += '<th scope="row">' + myShops[i]['name'] + '</th>';
            row += '<td>' + myShops[i]['date_created'] + '</td>';
            row += '<td><ul class="nav justify-content-end">';
            row += '<li class="nav-item"><a class="nav-link py-0 edit" href="#" data-id="' + myShops[i]["id"] + '"><i title="edit ' + myShops[i]["name"] + '" class="far fa-pencil"></i></a></li>';
            row += '<li class="nav-item"><a class="nav-link py-0 open" href="#" data-id="' + myShops[i]["id"] + '"><i title="open ' + myShops[i]["name"] + '" class="far fa-door-open"></i></a></li>';
            row += '<li class="nav-item"><a class="nav-link py-0 delete" href="#" data-id="' + myShops[i]["id"] + '"><i title="delete ' + myShops[i]["name"] + '" class="far fa-trash-alt"></i></a></li>';
            row += '</td>';
            row += '</tr>';
            $('#myshops tbody').append(row);
        }

        // sort out the actions
        $(".edit").click(startEditShop);
        $(".open").click(openShop);
        $(".delete").click(deleteShop);

        $('#loading').hide();
        $('#shoplist').show();
    });
}

function startCreateShop()
{
    console.log("create");

}

function openShop()
{
    var id = $(this).attr('data-id');
    console.log("open " + id);
}

function startEditShop()
{
    console.log("edit");
}

function deleteShop()
{
    console.log("delete");
}
