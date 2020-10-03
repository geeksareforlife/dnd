$(document).ready(function() {
    var sourcebook = Cookies.get('sourcebook');

    if (typeof sourcebook != "undefined") {
        setSourcebook(sourcebook)
    }

    $('#addform').submit(function() {
        // intercept the submit and set the sourcebook
        var sourcebook = $('#sourcebook').val();
        Cookies.set('sourcebook', sourcebook, {expires: 7});

        // could do some validation here...
        return true;
    });
});

function setSourcebook(sourcebook)
{
    $('#sourcebook').val(sourcebook);
}
