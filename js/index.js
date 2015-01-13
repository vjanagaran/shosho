var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"},
        "#catalog": {handler: "catalogPage", events: "bs"},
        "#catalogitems(?:[?/](.*))?": {handler: "catalogitemsPage", events: "bs"},
        "#cart": {handler: "cartPage", events: "bs"},
        "#orders": {handler: "ordersPage", events: "bs"},
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
            ordersPage: function (type, match, ui) {
                log("Orders page", 3);
                //showOrders();
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
    },
    itemTaxId: function (value, options) {
        return "item_tax_" + value;
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
        $(":mobile-pagecontainer").pagecontainer("change", "#me");
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
    if (name != "" && mobile != "") {
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=create&name=" + name + "&mobile=" + mobile, //id shoul be pass here........
            cache: false,
            success: function (html) {
                setVal(config.user_name, name);
                setVal(config.user_mobile, mobile);
                $("#err_msg").empty();
                $("#err_msg").append(html.message);
            },
            error: function (request, status, error) {
                $("#err_msg").empty();
                $("#err_msg").append("Process fail please try again......");
            }
        });
    }
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
    var tax = $("#item_tax_" + id).val();
    var item = {
        id: id,
        name: name,
        qty: qty,
        rate: rate,
        tax: tax
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
    $("#success_msg").empty();
    var out = "";
    var tax_row = "";
    var total = 0;
    var _12_percent_row = false;
    var _4_percent_row = false;
    var _3_percent_row = false;
    var _12_percent_tax = 0;
    var _4_percent_tax = 0;
    var _3_percent_tax = 0;
    var grand_total = 0;
    out = out + '<table data-role="table" data-mode="none"><thead><tr><th class="align-left">Your Order</th><th class="align-right">Qty</th><th class="align-right">Amount</th></tr></thead><tbody>';
    $.each(cart.items, function (index, row) {
        if (row.tax == 12.00) {
            _12_percent_tax = _12_percent_tax + ((parseInt(row.rate) * parseInt(row.qty) * row.tax) / 100);
            _12_percent_row = true;
        } else if (row.tax == 4.00) {
            _4_percent_tax = _4_percent_tax + ((parseInt(row.rate) * parseInt(row.qty) * row.tax) / 100);
            _4_percent_row = true;
        } else if (row.tax == 3.00) {
            _3_percent_tax = _3_percent_tax + ((parseInt(row.rate) * parseInt(row.qty) * row.tax) / 100);
            _3_percent_row = true;
        }
        out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right">' + row.qty + '</td><td class="align-right">Rs. ' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</td></tr>';
        total = total + parseInt(row.rate) * parseInt(row.qty);
    });
    if (_12_percent_row == true) {
        tax_row = tax_row + '<tr><td colspan="2" class="align-left">12% TAX</td><td class="align-right">Rs.' + _12_percent_tax.toFixed(2) + '</td></tr>';
    }
    if (_4_percent_row == true) {
        tax_row = tax_row + '<tr><td colspan="2" class="align-left">4% TAX</td><td class="align-right">Rs.' + _4_percent_tax.toFixed(2) + '</td></tr>';
    }
    if (_3_percent_row == true) {
        tax_row = tax_row + '<tr><td colspan="2" class="align-left">3% TAX</td><td class="align-right">Rs.' + _3_percent_tax.toFixed(2) + '</td></tr>';
    }
    grand_total = grand_total + (total + _12_percent_tax + _4_percent_tax + _3_percent_tax);
    out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
    out = out + '<tr><td class="align-left">Total</td><td class="align-right" colspan="2">Rs.' + total.toFixed(2) + '</td></tr>';
    out = out + tax_row;
    out = out + '<tr><td colspan="2" class="align-left">Grand Total</td><td class="align-right">Rs.' + grand_total.toFixed(2) + '</td></tr>';
    out = out + '<tr><td colspan="3"><textarea name="orderdecs" id="orderdecs" placeholder="Order description (optional)...."></textarea></td></tr>';
    out = out + '<tr><td colspan="3"><button class="ui-btn ui-btn-corner-all ui-btn-b" type="submit" onclick="processOrder();">Confirm Order</button></td></tr></tbody></table>';
    $(out).appendTo("#my_cart_items").enhanceWithin();
}

function removeFromCart(id) {
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    $("#menu_item_" + id).removeClass("selected");
    calcCart();
}

function processOrder() {
    var decs = $("#orderdecs").val();
    var name = getVal(config.user_name);
    var mobile = getVal(config.user_mobile);
    if (name != "" && mobile != "") {
        var data = {items: []};
        $.each(cart.items, function (index, row) {
            var item = {
                item_id: row.id,
                quantity: row.qty
            };
            data.items.push(item);
        });
        $.ajax({
            type: "POST",
            url: config.api_url + "module=order&action=create&id=2&notes=" + decs, //id shoul be pass here........
            data: data,
            cache: false,
            success: function (html) {
                $("#success_msg").empty();
                $("#success_msg").append(html.message);
            },
            error: function (request, status, error) {
                $("#success_msg").empty();
                $("#success_msg").append("Process not successfull try again later......");
            }
        });
    } else {
        $(":mobile-pagecontainer").pagecontainer("change", "#me");
    }
}

function showOrders() {
    $("#ordered_items").empty();
    var out = "";
    out = out + '<table data-role="table" data-mode="none"><thead><tr><th class="align-left">No</th><th class="align-left">Date</th><th class="align-right">Amount</th><th class="align-center">Status</th></tr></thead><tbody>';
    $.ajax({
        type: "GET",
        url: config.api_url + "module=order&action=create&id=2&notes=", //user id should be here......
        dataType: 'json',
        cache: false,
        success: function (data) {
            $.each(data.data, function (index, row) {
                out = out + '<tr><td class="align-left">' + (index + 1) + '</td><td class="align-left">' + row.date + '</td><td class="align-right">' + row.amt + '</td><td class="align-center">' + row.status + '</td></tr>';
            });
            out = out + '</tbody></table>';
            $(out).appendTo("#ordered_items").enhanceWithin();
        },
        error: function (request, status, error) {
            $("#ordered_items").append("Loading failed please retry......");
        }
    });
}