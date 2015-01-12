var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"},
        "#catalog": {handler: "catalogPage", events: "bs"},
        "#catalogitems(?:[?/](.*))?": {handler: "catalogitemsPage", events: "bs"},
        "#cart": {handler: "cartPage", events: "bs"},
        "#me": {handler: "mePage", events: "bs"}
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
            cartPage: function (type, match, ui) {
                log("Cart Items page", 3);
                showMyCart();
            },
            mePage: function (type, match, ui) {
                log("Me Page", 3);
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
    menuHref: function (value, options) {
        return "#catalogitems?cat=" + value;
    },
    menuItemClass: function (value, options) {
        var cls = "menu-items";
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                cls = cls + " selected";
            }
        });
        return cls;
    },
    menuItemId: function (value, options) {
        return "menu_item_" + value;
    },
    itemQtyId: function (value, options) {
        return "item_qty_" + value;
    },
    itemQtyVal: function (value, options) {
        var val = 1;
        $.each(cart.items, function (index, item) {
            if (value == item.id) {
                val = item.qty;
            }
        });
        return val;
    },
    itemPriceId: function (value, options) {
        return "item_price_" + value;
    },
    itemNameId: function (value, options) {
        return "item_name_" + value;
    },
    itemOnclick: function (value, options) {
        return "addToCart(" + value + ")";
    },
    itemRemoveclick: function (value, options) {
        return "removeFromCart(" + value + ")";
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
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: config.api_url + "module=cat&action=list",
        cache: false,
        success: function (data) {
            $("#categories").empty();
            $.each(data.data, function (k, v) {
                $("#categories").loadTemplate($('#category_list_tpl'), v, {append: true});
            });
        },
        error: function (request, status, error) {
            $("#categories").empty();
            $("#categories").append('Error in loading data');
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
                $("#menus").empty();
                $.each(data.data, function (k, v) {
                    $("#menus").loadTemplate($('#menus_list_tpl'), v, {append: true});
                });
            },
            error: function (request, status, error) {
                $("#menus").append('Error in loading data');
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

var cart = {items: []};

function addToCart(id) {
    var qty = $("#item_qty_" + id).val();
    var rate = $("#item_price_" + id).html();
    var name = $("#item_name_" + id).html();
    var item = {
        id: id,
        name: name,
        qty: qty,
        rate: rate,
        tax: 2.4
    };
    $("#menu_item_" + id).addClass("selected");
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    cart.items.push(item);
    calcCart();
}

function calcCart() {
    var cart_qty = 0;
    $.each(cart.items, function (index, row) {
        cart_qty = cart_qty + parseInt(row.qty);
    });
    $("#cart_items").html(cart_qty);
}

function showMyCart() {
    $("#my_cart_items").empty();
    var out = "";
    var total = 0;
    var tax_amt = 0;
    var grand_total = 0;
    out = out + '<div><table data-role="table" class="ui-table" data-mode="none">';
    out = '<thead><tr><th class="align-left">Your Order</th><th class="align-right">Qty</th><th class="align-right">Amount</th></tr></thead><tbody>';
    $.each(cart.items, function (index, row) {
        out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right">' + row.qty + '</td><td class="align-right">Rs. ' + parseInt(row.rate) * parseInt(row.qty) + '</td></tr>';
        total = total + parseInt(row.rate) * parseInt(row.qty);
    });
    tax_amt = tax_amt + (2.4 * total) / 100;
    grand_total = grand_total + (total + tax_amt);
    out = out + '<tr><td colspan="3">&nbsp;</td></tr>'
    out = out + '<tr><td class="align-left">Total</td><td class="align-right" colspan="2">Rs.' + total + '</td></tr>';
    out = out + '<tr><td colspan="2" class="align-left">TAX 2.4%</td><td class="align-right">Rs.' + tax_amt + '</td></tr>';
    out = out + '<tr><td colspan="2" class="align-left">Grand Total</td><td class="align-right">Rs.' + grand_total + '</td></tr></tbody></table></div>';
    $(out).appendTo("#my_cart_items").enhanceWithin();
}

function removeFromCart(id) {
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
        calcCart();
        $("#menu_item_" + id).removeClass("selected");
    });
}