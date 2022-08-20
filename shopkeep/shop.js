var directus = new DirectusSdk.Directus('https://directus.geeksareforlife.com/', {auth:{mode:'cookie'}});

$(document).ready(function() {
    directus.auth.token.then(function(token) {
        console.log("here");
        console.log(token);
    });
});
