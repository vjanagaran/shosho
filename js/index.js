var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "i"},
        "#catalog": {handler: "catalogPage", events: "i"},
        "#catalogitems(?:[?/](.*))?": {handler: "catalogitemsPage", events: "i"},
        "#me": {handler: "mePage", events: "i"}
    }],
        {
            homePage: function (type, match, ui) {
                log("Home Page", 3)
                initialRegistration();
            },
            catalogPage: function (type, match, ui) {
                log("Catalog Page", 3)
                loadCatalog();
            },
            catalogitemsPage: function (type, match, ui) {
                log("Catalog Items page", 3);
                var params = router.getParams(match[1]);
                loadCatalogItems(params.cat);
            },
            mePage: function (type, match, ui) {
                log("Me Page", 3)
                showMe();
            }
        }, {
    ajaxApp: true,
    defaultHandler: function (type, ui, page) {
        log("Default handler called due to unknown route (" + type + ", " + ui + ", " + page + ")", 1);
    },
    defaultHandlerEvents: "s",
    defaultArgsRe: true
});

$.addTemplateFormatter({
    startersHref: function (value, options) {
        return "#catalogitems?cat=" + value;
    }
});


/**** Pre Defined Functions **/

function log(msg, level) {
    if (typeof (level) === "undefined") {
        level = 3;
    }
    var logname = {0: "Disabled", 1: "Error", 2: "Warning", 3: "Info"};
    if (level <= config.showlog) {
        console.log(logname[level] + ": " + msg);
    }
}




/********  General Functions **/

function initialRegistration() {
    var name = getVal(config.user_name);
    var mobile = getVal(config.user_mobile);
    if (name == "" && mobile == "") {
        $(":mobile-pagecontainer").pagecontainer("change", "#registration");
    }
}

function loadCatalog() {
    var url = "";
    $.ajax({
        type: "GET",
        url: config.api_url + "module=cat&action=list",
        dataType: 'json',
        cache: false,
        success: function (data) {
            $("#menu").empty();
            url = data.url;
            $.each(data.data, function (k, v) {
                $("#menu").loadTemplate($('#menu_list_tpl'),v , {append: true});
            });
        },
        error: function (request, status, error) {
            $("#menu").empty();
            $("#menu").append('Error in loading data');
        }
    });
}

function loadCatalogItems(cat) {
    if (cat !== "") {
        $.ajax({
            type: "GET",
            url: config.api_url + "module=menu&action=list&id=" + cat,
            dataType: 'json',
            cache: false,
            success: function (data) {
                $("#starters").empty();
                $.each(data.data, function (k, v) {
                    $("#starters").loadTemplate($('#starters_list_tpl'), v, {append: true});
                });
            },
            error: function (request, status, error) {
                $("#starters").empty();
                $("#starters").append('Error in loading data');
            }
        });
    }
}

function setUserSession() {
    var name = $('#uname').val();
    var mobile = $('#umobile').val();
    setVal(config.user_name, name);
    setVal(config.user_mobile, mobile);
    $(":mobile-pagecontainer").pagecontainer("change", "#home");
}

function showMe() {
    $('#name').val(getVal(config.user_name));
    $('#mobile').val(getVal(config.user_mobile));
}