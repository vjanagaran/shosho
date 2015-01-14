var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"},
        "#catalog": {handler: "catalogPage", events: "bs"},
        "#catalogitems(?:[?/](.*))?": {handler: "catalogitemsPage", events: "bs"},
        "#cart": {handler: "cartPage", events: "bs"},
        "#delivery": {handler: "deliveryPage", events: "bs"},
        "#payment": {handler: "paymentPage", events: "bs"},
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
                $("#cart_items_total").html(grand_total);
            },
            paymentPage: function (type, match, ui) {
                log("Payment Items page", 3);
                $("#payment_items_total").html(grand_total);
            },
            deliveryPage: function (type, match, ui) {
                log("Delivery Items page", 3);
                $("#delivery_items_total").html(grand_total);
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
    if (name == null && mobile == null) {
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
    if (validateRegistration()) {
        var name = $('#name').val();
        var mobile = $('#mobile').val();
        var email = $('#email').val();
        var address = $('#address').val();
        var area = $('#area').val();
        var pincode = $('#pincode').val();
        var city = $('#city').val();
        var password = $('#password').val();
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=create&name=" + name + "&mobile=" + mobile, //id shoul be pass here........
            cache: false,
            success: function (html) {
                setVal(config.user_name, name);
                setVal(config.user_mobile, mobile);
                setVal(config.user_email, email);
                setVal(config.user_address, address);
                setVal(config.user_area, area);
                setVal(config.user_pincode, pincode);
                setVal(config.user_city, city);
                setVal(config.user_password, password);
                setVal(config.user_id, html.id);
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

function updateUserSession() {
    if (validateUpdation()) {
        var id = getVal(config.user_id);
        var name = $('#name').val();
        var email = $('#email').val();
        var address = $('#address').val();
        var area = $('#area').val();
        var pincode = $('#pincode').val();
        var city = $('#city').val();
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=create&name=" + id, //id shoul be pass here........
            cache: false,
            success: function (html) {
                setVal(config.user_name, name);
                setVal(config.user_email, email);
                setVal(config.user_address, address);
                setVal(config.user_area, area);
                setVal(config.user_pincode, pincode);
                setVal(config.user_city, city);
                $("#sucs_msg").empty();
                $("#sucs_msg").append(html.message);
            },
            error: function (request, status, error) {
                $("#sucs_msg").empty();
                $("#sucs_msg").append("Process fail please try again......");
            }
        });
    }
}

function showMe() {
    var address = "";
    $('#myname').val(getVal(config.user_name));
    $('#mymobile').val(getVal(config.user_mobile));
    $('#myemail').val(getVal(config.user_email));
    address = address + "<p><strong>" + getVal(config.user_address) + "</strong></p>";
    address = address + "<p><strong>" + getVal(config.user_area) + "</strong></p>";
    address = address + "<p><strong>" + getVal(config.user_pincode) + "</strong></p>";

}

var cart = {items: [], decs: "", delivery: ""};
var confirm_id = 0;
var grand_total = 0;

function addToCart(id) {
    var qty = $("#item_qty_" + id).val();
    var name = $("#item_name_" + id).html();
    confirm_id = id;

    $("#confirm_text").html("You're adding <b>" + name + "</b> into cart <b>" + qty + " nos.</b>");

    $("#popupDialog").popup("open");

}

function addConfirmed() {
    $("#popupDialog").popup("close");
    var id = confirm_id;
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
    var cart_tax = {};
    var g_total = 0;
    if (cart.items.length > 0) {
        out = out + '<table data-role="table" data-mode="none"><thead><tr><th class="align-left">Your Order</th><th class="align-right">Qty</th><th class="align-right">Amount</th></tr></thead><tbody>';
        $.each(cart.items, function (index, row) {
            out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right"><input type="number" id="cart_item_' + row.id + '" value="' + row.qty + '"/></td><td class="align-right">Rs. ' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</td><td ><a onclick="updateCart(' + row.id + ')">Update</a> <a href="#" onclick="removeItem(' + row.id + ');">x</a></td></tr>';
            total = total + parseFloat(row.rate) * parseInt(row.qty);
            if (isNaN(cart_tax[row.tax])) {
                cart_tax[row.tax] = 0;
            }
            cart_tax[row.tax] = parseFloat(cart_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.qty) * parseFloat(row.tax) / 100);
        });
        g_total = total;

        $.each(cart_tax, function (index, val) {
            tax_row = tax_row + '<tr><td colspan="2" class="align-left">TAX ' + index + '%</td><td class="align-right">Rs. ' + val.toFixed(2) + '</td></tr>';
            g_total = g_total + val;
        });
        out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
        out = out + '<tr><td class="align-left">Total</td><td class="align-right" colspan="2">Rs.' + total.toFixed(2) + '</td></tr>';
        out = out + tax_row;
        out = out + '<tr><td colspan="2" class="align-left">Grand Total</td><td class="align-right">Rs.' + g_total.toFixed(2) + '</td></tr>';
        out = out + '<tr><td colspan="3"><textarea name="orderdecs" id="orderdecs" placeholder="Order description (optional)...."></textarea></td></tr></tbody></table>';
    } else {
        out = "<p>No items found in your cart</p>";
    }
    grand_total = g_total.toFixed(2);
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

function removeItem(id) {
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            cart.items.splice(index, 1);
            return false;
        }
    });
    $("#menu_item_" + id).removeClass("selected");
    showMyCart();
    $("#cart_items_total").html(grand_total);
}

function processOrder() {
    var name = getVal(config.user_name);
    var mobile = getVal(config.user_mobile);
    var delivery = cart.delivery;
    var decs = cart.decs;
    if (name != "" && mobile != "") {
        var data = {items: []};
        var items = [];
        $.each(cart.items, function (index, row) {
            var item = {
                item_id: row.id,
                quantity: row.qty
            };
            items.push(item);
        });
        data = {
            items: items,
            user: mobile,
            notes: decs,
            delivery: delivery
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=order&action=create", //id shoul be pass here........
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

function processStep1() {
    var decs = $("#orderdecs").val();
    cart.decs = decs;
    $(":mobile-pagecontainer").pagecontainer("change", "#delivery");
}

function processStep2() {
    if (getVal(config.user_id != null)) {
        $(":mobile-pagecontainer").pagecontainer("change", "#me");
    } else {
        $(":mobile-pagecontainer").pagecontainer("change", "#registration");
    }
}

function processStep3() {
    var che = $("input[name='delivery']:checked");
    var obj = che.val();
    cart.delivery = obj;
    $(":mobile-pagecontainer").pagecontainer("change", "#payment");
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateRegistration() {
    if ($.trim($("#name").val()).length < 3) {
        alert("Name must be 3 char");
        return false;
    }
    if (!validateEmail(jQuery("#email").val())) {
        alert("Please enter valid email");
        return false;
    }
    if ($.trim($("#password").val()).length < 6) {
        alert("Password must be 6 char");
        return false;
    }
    if ($.trim($("#password").val()) !== $.trim($("#conpass").val())) {
        alert("Re-entered password missmatched!");
        return false;
    }
    if ($.trim($("#mobile").val()).length < 10) {
        alert("Enter your 10 digit mobile number");
        return false;
    }
    return true;
}

function validateUpdation() {
    if ($.trim($("#uname").val()).length < 3) {
        alert("Name must be 3 char");
        return false;
    }
    if (!validateEmail(jQuery("#uemail").val())) {
        alert("Please enter valid email");
        return false;
    }
    return true;
}