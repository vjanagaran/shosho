var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"},
        "#catalog": {handler: "catalogPage", events: "bs"},
        "#catalogitems(?:[?/](.*))?": {handler: "catalogitemsPage", events: "bs"},
        "#me": {handler: "mePage", events: "bs"}
    }],
        {
            homePage: function (type, match, ui) {
                log("Home Page", 3)
                showHome();
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

function showHome() {
    var name = getVal(config.user_name);
    var mobile = getVal(config.user_mobile);
    if (name == "" && mobile == "") {
        $(":mobile-pagecontainer").pagecontainer("change", "#me");
    }
}

function loadCatalog() {
    $.ajax({
        type: "POST",
        url: config.api_url + "module=cat&action=list",
        dataType: 'json',
        cache: false,
        success: function (data) {
            $("#menu").empty();
            $.each(data, function (k, v) {
                $("#menu").loadTemplate($('#menu_list_tpl'), v, {append: true});
            });
        }
    });
}

function loadCatalogItems(cat) {
    if (cat !== "") {
        $.ajax({
            type: "POST",
            url: config.api_url + "module=cat&action=view&id=" + cat,
            dataType: 'json',
            cache: false,
            success: function (data) {
                $("#starters").empty();
                $.each(data, function (k, v) {
                    $("#starters").loadTemplate($('#starters_list_tpl'), v, {append: true});
                });
            }
        });
    }
}

function setUserSession() {
    var name = $('#uname').val();
    var mobile = $('#umobile').val();
    setVal(config.user_name, name);
    setVal(config.user_mobile, mobile);
}

function showMe() {
    $('#uname').val(getVal(config.user_name));
    $('#umobile').val(getVal(config.user_mobile));
}