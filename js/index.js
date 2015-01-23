var is_mobile = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
if (is_mobile) {
    document.addEventListener("deviceready", onDeviceReady, false);
    document.addEventListener("touchstart", function () {
    }, false);
} else {
    onDeviceReady();
}

function onDeviceReady() {
    $.mobile.defaultPageTransition = 'none';
    $.mobile.defaultDialogTransition = 'none';
    if (is_mobile) {
        push.initPushwoosh();
    }
}

var after_reg = "";
var redirect_me = false;
var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"},
        "#catalog": {handler: "catalogPage", events: "bs"},
        "#catalogitems(?:[?/](.*))?": {handler: "catalogitemsPage", events: "bs"},
        "#view_ordered_items(?:[?/](.*))?": {handler: "viewordereditemsPage", events: "bs"},
        "#cart": {handler: "cartPage", events: "bs"},
        "#delivery": {handler: "deliveryPage", events: "bs"},
        "#payment": {handler: "paymentPage", events: "bs"},
        "#me": {handler: "mePage", events: "bs"},
        "#registration": {handler: "registrationPage", events: "bs"},
        "#orders": {handler: "ordersPage", events: "bs"},
        "#more": {handler: "morePage", events: "bs"},
        "#verify": {handler: "verifyPage", events: "bs"},
        "#getdirection": {handler: "getdirectionPage", events: "bs"},
        "#feedback": {handler: "feedbackPage", events: "bs"},
        "#details": {handler: "detailsPage", events: "bs"}
    }],
        {
            homePage: function (type, match, ui) {
                log("Home Page", 3);
            },
            catalogPage: function (type, match, ui) {
                log("Catalog Page", 3)
                loadCatalog();
            },
            catalogitemsPage: function (type, match, ui) {
                log("Catalog Items page", 3);
                var params = router.getParams(match[1]);
                loadCatalogItems(params.cat);
                calcCart();
            },
            viewordereditemsPage: function (type, match, ui) {
                log("View Ordered Items page", 3);
                var params = router.getParams(match[1]);
                loadOrderedItems(params.cat);
            },
            cartPage: function (type, match, ui) {
                log("Cart Items page", 3);
                showMyCart();
                $("#cart_items_total").html(grand_total);
                $("#success_msg").empty();
                calcCart();
            },
            paymentPage: function (type, match, ui) {
                log("Payment Items page", 3);
                $("#payment_items_total").html(grand_total);
                $("#cash_pay").attr("checked", true);
            },
            registrationPage: function (type, match, ui) {
                log("Registration page", 3);
                $("#err_msg").empty();
            },
            morePage: function (type, match, ui) {
                log("More page", 3);
                calcCart();
            },
            deliveryPage: function (type, match, ui) {
                log("Delivery Items page", 3);
                $("#delivery_items_total").html(grand_total);
                setDetails();
            },
            ordersPage: function (type, match, ui) {
                log("Orders page", 3);
                showOrders();
                calcCart();
            },
            mePage: function (type, match, ui) {
                log("Me Page", 3);
                showMe();
                calcCart();
            },
            verifyPage: function (type, match, ui) {
                log("Verification Page", 3);
                clearInterval();
                startTimer();
            },
            getdirectionPage: function (type, match, ui) {
                log("GetDirection Page", 3);
                getDirection();
            },
            feedbackPage: function (type, match, ui) {
                log("Feedback Page", 3);
                showFeedbackForm();
            },
            detailsPage: function (type, match, ui) {
                log("Details Page", 3);
                $("#deltails_items_total").html(grand_total);
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
    itemPriceSpl: function (value, options) {
        if (value == 1) {
            return "rateSpl";
        } else {
            return "rateNormal";
        }
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
    },
    qtyIncreaseOnclick: function (value, options) {
        return "increaseQty(" + value + ")";
    },
    qtyDecreaseOnclick: function (value, options) {
        return "decreaseQty(" + value + ")";
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

var loading = '<div class="align-center"><br/><br/><img src="img/loading.gif" width="60" /></div>';
function loadCatalog() {
    $("#categories").empty();
    $("#categories").append(loading);
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
    $("#menus").empty();
    $("#menus").append(loading);
    var heading = "";
    var cat_name = "";
    if (cat !== "") {
        $.ajax({
            type: "GET",
            url: config.api_url + "module=menu&action=list&id=" + cat,
            dataType: 'json',
            cache: false,
            success: function (data) {
                $("#menus").empty();
                $("#cat_name").empty();
                $.each(data.data, function (k, v) {
                    $("#menus").loadTemplate($('#menus_list_tpl'), v, {append: true});
                    cat_name = v.cat_name;
                });
                heading = heading + '<h1 class="ui-title" role="heading">' + cat_name + '</h1>';
                $("#cat_name").append(heading);
            },
            error: function (request, status, error) {
                $("#menus").empty();
                $("#menus").append('Error in loading data');
            }
        });
    }
}

function createCode() {
    $("#err_msg").empty();
    $("#err_msg").append(loading);
    if (validateRegistration()) {
        var name = $.trim($('#name').val());
        var mobile = $.trim($('#mobile').val());
        var email = $.trim($('#email').val());
        var details = {
            name: name,
            mobile: mobile,
            email: email,
            device_token: getVal(config.device_token)
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=create",
            data: details,
            cache: false,
            success: function (html) {
                $("#err_msg").empty();
                if (html.error == false) {
                    $("#reg_err .ui-content a").removeAttr("data-rel");
                    $("#reg_err .ui-content a").attr("onclick", "redirectToRespectivePages()");
                    setVal(config.user_name, name);
                    setVal(config.user_mobile, mobile);
                    setVal(config.user_email, email);
                    setVal(config.user_id, html.id);
                    setVal(config.user_status, html.status);
                    after_reg = "verify";
                    $("#reg_err_text").html("<b>" + html.message + "</b>");
                    $("#reg_err").popup("open");
                } else {
                    $("#reg_err .ui-content a").removeAttr("data-rel");
                    $("#reg_err .ui-content a").attr("onclick", "redirectToRespectivePages()");
                    setVal(config.user_name, name);
                    setVal(config.user_mobile, mobile);
                    setVal(config.user_email, email);
                    setVal(config.user_id, html.id);
                    after_reg = "verify";
                    $("#reg_err_text").html("<b>" + html.message + "</b>");
                    $("#reg_err").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#err_msg").empty();
                $("#err_msg").append("Process fail please try again......");
            }
        });
    }
}

function redirectToRespectivePages() {
    $(":mobile-pagecontainer").pagecontainer("change", "#" + after_reg);
}

function verifyCode() {
    var code = $("#code").val();
    if (code != "") {
        var details = {
            user: getVal(config.user_id),
            code: code
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=verify",
            data: details,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    $("#verify_err .ui-content a").removeAttr("data-rel");
                    $("#verify_err .ui-content a").attr("onclick", "redirectToRespectivePages()");
                    setVal(config.user_status, html.status);
                    if (getVal(config.user_status) != 0) {
                        if (redirect_me != true) {
                            after_reg = "delivery";
                        } else {
                            after_reg = "me";
                        }
                        $("#verify_err_text").html("<b>" + html.message + "</b>");
                    }
                    $("#verify_err").popup("open");
                } else {
                    $("#verify_err_text").html("<b>" + html.message + "</b>");
                    $("#verify_err").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#err_msg").empty();
                $("#err_msg").append("Process fail please try again......");
            }
        });
    }
}

function showMe() {
    $("#my_details").empty();
    $("#update_success").empty();
    var id = getVal(config.user_id);
    var name = getVal(config.user_name);
    var mobile = getVal(config.user_mobile);
    var email = getVal(config.user_email);
    if (id != null) {
        $("#me_name").val(name);
        $("#me_mobile").val(mobile);
        $("#me_email").val(email);
    } else {
        redirect_me = true;
        $(":mobile-pagecontainer").pagecontainer("change", "#registration");
    }
}

function validateUpdation() {
    if ($.trim($("#me_name").val()).length < 3) {
        $("#update_success").empty();
        $("#update_success").append("<b>Name should be 3 char</b>");
        return false;
    }
    if (!validateEmail($.trim(jQuery("#me_email").val()))) {
        $("#update_success").empty();
        $("#update_success").append("<b>Please enter valid email</b>");
        return false;
    }
    return true;
}

function updateUser() {
    $("#update_success").empty();
    $("#update_success").append(loading);
    if (validateUpdation()) {
        var name = $("#me_name").val();
        var email = $("#me_email").val();
        var data = {
            name: name,
            email: email,
            id: getVal(config.user_id)
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=update",
            data: data,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    setVal(config.user_name, name);
                    setVal(config.user_email, email);
                    $("#update_success").empty();
                    $("#update_success").append(html.message);
                } else {
                    $("#update_success").empty();
                    $("#update_success").append(html.message);
                }
            },
            error: function (request, status, error) {
                $("#update_success").empty();
                $("#update_success").append("Process failed please try again after some times.....");
            }
        });
    }
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
        tax: tax,
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
    $("#catalog_cart").html(cart_qty);
    $("#order_cart").html(cart_qty);
    $("#more_cart").html(cart_qty);
    $("#me_cart").html(cart_qty);
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
        $("#cart div[data-role=footer]").removeClass("remove-item");
        out = out + '<table data-role="table"><thead><tr><th class="align-left">Your Order</th><th class="align-right">Qty</th><th class="align-right">Amount</th><th>Manipulate</th></tr></thead><tbody>';
        $.each(cart.items, function (index, row) {
            out = out + '<tr><td class = "align-left">' + row.name + '</td><td class="align-right"><div class="select-qty"><a onclick="decreaseCartQty(' + row.id + ')">-</a> <input data-role="none" name="qty" type="text" readonly="true" id="cart_item_' + row.id + '" value="' + row.qty + '"> <a onclick="increaseCartQty(' + row.id + ')">+</a></div></td><td class="align-right">' + (parseInt(row.rate) * parseInt(row.qty)).toFixed(2) + '</td><td class="align-center"><a class="symbol" onclick="updateCart(' + row.id + ')">&#10004;</a> <a class="symbol" onclick="removeItem(' + row.id + ');">&#10008;</a></td></tr>';
            total = total + parseFloat(row.rate) * parseInt(row.qty);
            if (isNaN(cart_tax[row.tax])) {
                cart_tax[row.tax] = 0;
            }
            cart_tax[row.tax] = parseFloat(cart_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.qty) * parseFloat(row.tax) / 100);
        });
        g_total = total;
        $.each(cart_tax, function (index, val) {
            tax_row = tax_row + '<tr><td class="align-left" colspan="2">TAX ' + index + '%</td><td class="align-right">' + val.toFixed(2) + '</td><td>&nbsp;</td></tr>';
            g_total = g_total + val;
        });
        out = out + '<tr><td>&nbsp;</td></tr>';
        out = out + '<tr><td colspan="2" class="align-left">Total</td><td class="align-right">' + total.toFixed(2) + '</td><td>&nbsp;</td></tr>';
        out = out + tax_row;
        out = out + '<tr><td class="align-left" colspan="2">Grand Total</td><td class="align-right">' + g_total.toFixed(2) + '</td><td>&nbsp;</td></tr>';
        out = out + '<tr><td colspan="4"><textarea name="orderdecs" id="orderdecs" placeholder="Order description (optional)...."></textarea></td></tr></tbody></table>';
    } else {
        out = "<p>No items found in your cart</p>";
        $("#cart div[data-role=footer]").addClass("remove-item");
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
    var id = getVal(config.user_id);
    var delivery = cart.delivery;
    var decs = cart.decs;
    if (id != null && $("#cash_pay").prop('checked') == true) {
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
            user: id,
            notes: decs,
            delivery: delivery,
            total: grand_total,
            address1: getVal(config.user_address1),
            address2: getVal(config.user_address2),
            area: getVal(config.user_area),
            city: getVal(config.user_city),
            pincode: getVal(config.user_pincode),
            alternetno: getVal(config.user_alternet_number)
        };
        $.ajax({
            type: "POST",
            url: config.api_url + "module=order&action=create",
            data: data,
            cache: false,
            success: function (html) {
                if (html.error == false) {
                    cart.items = [];
                    grand_total = 0;
                    $("#order_success .ui-content a").removeAttr("data-rel");
                    $("#order_success .ui-content a").attr("onclick", "redirectOrdersPage()");
                    $("#order_success_text").html("<b>" + html.message + "</b>");
                    $("#order_success").popup("open");
                } else {
                    $("#order_success_text").html("<b>" + html.message + "</b>");
                    $("#order_success .ui-content a").removeAttr("onclick");
                    $("#order_success").popup("open");
                }
            },
            error: function (request, status, error) {
                $("#success_msg").empty();
                $("#success_msg").append("Process not successfull try again later......");
            }
        });
    } else {
        $("#success_msg").append("<b>Please select the payment mode</b>");
    }
}

function redirectOrdersPage() {
    $(":mobile-pagecontainer").pagecontainer("change", "#orders");
}

function showOrders() {
    var id = getVal(config.user_id);
    if (id != null) {
        $("#ordered_items").empty();
        $("#ordered_items").append(loading);
        var out = "";
        out = out + '<table data-role="none"><thead><tr><th class="align-left">Or.Id</th><th class="align-left">Date</th><th class="align-right">Amount</th><th class="align-center">Status</th><th>&nbsp;</th></tr></thead><tbody>';
        $.ajax({
            type: "GET",
            url: config.api_url + "module=order&action=list&id=" + id,
            dataType: 'json',
            cache: false,
            success: function (data) {
                if (data.error == true) {
                    $("#ordered_items").empty();
                    $("#ordered_items").append("No items found");
                } else {
                    $("#ordered_items").empty();
                    $.each(data.data, function (index, row) {
                        out = out + '<tr><td class="align-left">' + row.id + '</td><td class="align-left">' + $.format.date(row.date, "dd-MMM-yy") + '</td><td class="align-right">' + parseFloat(row.amount).toFixed(2) + '</td><td class="align-center">' + row.status + '</td><td><a href="#view_ordered_items?cat=' + row.id + '"><i class="fa fa-eye"></i></a></td></tr>';
                    });
                    out = out + '</tbody></table>';
                    $(out).appendTo("#ordered_items").enhanceWithin();
                }
            },
            error: function (request, status, error) {
                $("#ordered_items").empty();
                $("#ordered_items").append("Loading failed please retry......");
            }
        });
    } else {
        $("#ordered_items").empty();
        $("#ordered_items").html("<p>Your information is not found...</p>");
    }
}

var reorder = [];

function loadOrderedItems(oid) {
    var out = "";
    var items = {};
    var ordered_tax = {};
    var total = 0;
    var tax_row = "";
    var g_total = 0;
    $("#ordered_items_list").empty();
    $("#ordered_items_list").append(loading);
    $.ajax({
        type: "GET",
        url: config.api_url + "module=order&action=orderlist&id=" + oid,
        dataType: 'json',
        cache: false,
        success: function (data) {
            if (data.error == false) {
                out = out + '<table><thead><tr><th class="align-left">Items</th><th class="align-right">Qty</th><th class="align-right">Amount</th></tr></thead><tbody>';
                $.each(data.item, function (index, row) {
                    out = out + '<tr><td class="align-left">' + row.name + '</td><td class="align-right">' + row.quantity + '</td><td class="align-right">' + row.rate + '</td></tr>';
                    total = total + parseFloat(row.rate) * parseInt(row.quantity);
                    if (isNaN(ordered_tax[row.tax])) {
                        ordered_tax[row.tax] = 0;
                    }
                    ordered_tax[row.tax] = parseFloat(ordered_tax[row.tax]) + (parseFloat(row.rate) * parseInt(row.quantity) * parseFloat(row.tax) / 100);
                    items = {
                        id: row.id,
                        qty: row.quantity
                    };
                    reorder.push(items);
                });
                g_total = g_total + total;
                $.each(ordered_tax, function (index, val) {
                    tax_row = tax_row + '<tr><td class="align-left" colspan="2">TAX ' + index + '%</td><td class="align-right">' + val.toFixed(2) + '</td></tr>';
                    g_total = g_total + val;
                });
                out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
                out = out + '<tr><td colspan="2" class="align-left">Total</td><td class="align-right">' + total.toFixed(2) + '</td></tr>';
                out = out + tax_row;
                out = out + '<tr><td class="align-left" colspan="2">Grand Total</td><td class="align-right">' + g_total.toFixed(2) + '</td></tr>';
                out = out + '<tr><td colspan="3">&nbsp;</td></tr>';
                out = out + '<tr><td colspan="2">Delivery Type</td><td>' + data.delivery_type + '</td></tr>'
                out = out + '<tr><td colspan="2">Order Status</td><td>' + data.status + '</td></tr>'
                out = out + '<tr><td colspan="2">Order Date</td><td>' + $.format.date(data.date, "dd-MMM-yy hh:mm") + '</td></tr></tbody></table>';
                $("#ordered_items_list").empty();
                $("#ordered_items_list").append(out);
            } else {
                $("#ordered_items_list").empty();
                $("#ordered_items_list").append(data.message);
            }
        },
        error: function (request, status, error) {
            $("#ordered_items_list").empty();
            $("#ordered_items_list").append("Loading failed please retry......");
        }
    });
}

function reorderItems() {
    console.log(reorder);
}

function updateCart(id) {
    var new_qty = $("#cart_item_" + id).val();
    $.each(cart.items, function (index, row) {
        if (row.id == id) {
            row.qty = new_qty;
            return false;
        }
    });
    showMyCart();
    calcCart();
    $("#cart_items_total").html(grand_total);
}

function processStep1() {
    var decs = $("#orderdecs").val();
    cart.decs = decs;
    if (getVal(config.user_id) != null && getVal(config.user_id) !== "undefined") {
        $(":mobile-pagecontainer").pagecontainer("change", "#delivery");
    } else {
        $(":mobile-pagecontainer").pagecontainer("change", "#registration");
    }
}

function processStep2() {
    $("#delivery_err").empty();
    if ((getVal(config.user_id) != null)) {
        var address1 = $("#address1").val();
        var che = $("input[name='delivery']:checked");
        var obj = che.val();
        if (obj == 1 && address1 < 3) {
            $("#delivery_err").append("<b>Address line 1 mandatory</b>");
            $("#address1").focus();
        } else {
            cart.delivery = obj;
            var address2 = $("#address2").val();
            var city = $("#city").val();
            var area = $("#area").val();
            var pincode = $("#pincode").val();
            var alternet = $("#alt_num").val();
            setVal(config.user_address1, address1);
            setVal(config.user_address2, address2);
            setVal(config.user_city, city);
            setVal(config.user_area, area);
            setVal(config.user_pincode, pincode);
            setVal(config.user_alternet_number, alternet);
            $(":mobile-pagecontainer").pagecontainer("change", "#payment");
        }
    } else {
        $("#delivery_err").append("<b>Please select a delivery type..</b>");
    }
}

function setDetails() {
    $("#takeaway").attr("checked", true)
    $("#delivery_err").empty();
    var che = $("input[type='radio']:checked");
    var obj = che.val();
    if (obj == 0) {
        $("#shosho_address").removeClass("remove_form");
        $("#address_form").addClass("remove_form");
    } else {
        $("#address_form").removeClass("remove_form");
        $("#shosho_address").addClass("remove_form");
        $("#address1").val(getVal(config.user_address1));
        $("#address2").val(getVal(config.user_address2));
        $("#city").val(getVal(config.user_city));
        $("#area").val(getVal(config.user_area));
        $("#pincode").val(getVal(config.user_pincode));
        $("#alt_num").val(getVal(config.user_alternet_number));
    }
}

function showDetails() {
    $("#delivery_err").empty();
    var che = $("input[type='radio']:checked");
    var obj = che.val();
    if (obj == 0) {
        $("#shosho_address").removeClass("remove_form");
        $("#address_form").addClass("remove_form");
    } else {
        $("#address_form").removeClass("remove_form");
        $("#shosho_address").addClass("remove_form");
    }
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateRegistration() {
    $("#reg_err .ui-content a").attr("data-rel", "back");
    $("#reg_err .ui-content a").removeAttr("onclick");
    if ($.trim($("#name").val()).length < 3) {
        $("#reg_err_text").html("<b>Name should be 3 char</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if (!validateEmail($.trim(jQuery("#email").val()))) {
        $("#reg_err_text").html("<b>Please enter valid email</b>");
        $("#reg_err").popup("open");
        return false;
    }
    if ($.trim($("#mobile").val()).length < 10) {
        $("#reg_err_text").html("<b>Enter your 10 digit mobile number</b>");
        $("#reg_err").popup("open");
        return false;
    }
    return true;
}

function validForm() {
    if ($.trim($("#contact_name").val()).length < 3) {
        $("#feedback_err_text").html("<b>Name must be 3 char</b>");
        $("#feedback_err").popup("open");
        $("#contact_name").focus();
        return false;
    }
    if (!validateEmail($.trim(jQuery("#contact_email").val()))) {
        $("#feedback_err_text").html("<b>Please enter valid email</b>");
        $("#feedback_err").popup("open");
        $("#contact_email").focus();
        return false;
    }
    if ($.trim($("#contact_message").val()).length < 20) {
        $("#feedback_err_text").html("<b>Message at least 20 char</b>");
        $("#feedback_err").popup("open");
        $("#contact_message").focus();
        return false;
    }
    return true;
}

function increaseQty(id) {
    var qty = parseInt($("#item_qty_" + id).val());
    if (qty > 0 && qty < 99) {
        qty = qty + 1;
    }
    $("#item_qty_" + id).val(qty);
}

function increaseCartQty(id) {
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty > 0 && new_qty < 99) {
        new_qty = new_qty + 1;
    }
    $("#cart_item_" + id).val(new_qty);
}

function decreaseQty(id) {
    var qty = parseInt($("#item_qty_" + id).val());
    if (qty > 1 && qty < 99) {
        qty = qty - 1;
    }
    $("#item_qty_" + id).val(qty);
}

function decreaseCartQty(id) {
    var new_qty = parseInt($("#cart_item_" + id).val());
    if (new_qty > 1 && new_qty < 99) {
        new_qty = new_qty - 1;
    }
    $("#cart_item_" + id).val(new_qty);
}

function gplusShare() {
    /*var url = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     var fullurl = "https://plus.google.com/share?url=" + url;
     window.open(fullurl, '', "toolbar=0,location=0,height=450,width=550");*/
}

function fbShare() {
    /*var url = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     var fullurl = "http://www.facebook.com/sharer/sharer.php?u=" + url;
     window.open(fullurl, '', "toolbar=0,location=0,height=450,width=650");*/
}

function twitterShare() {
    /*var url = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     var ttl = "Dedicated mobile app about Sri Sri Kanji Maha Periyava. Download now for free!";
     var fullurl = "https://twitter.com/share?original_referer=http://www.charing.com/&source=tweetbutton&text=" + ttl + "&url=" + url;
     window.open(fullurl, '', "menubar=1,resizable=1,width=450,height=350");*/
}

function rateUs() {
    /*var fullurl = "https://play.google.com/store/apps/details?id=com.coolappz.periyava";
     window.open(fullurl, '', "menubar=1,resizable=1,width=450,height=350");*/
}

function receiveForm() {
    var message = $("#contact_message").val();
    var data = {};
    var name = getVal(config.user_name);
    var email = getVal(config.user_email);
    var mobile = getVal(config.user_mobile);
    if (message != "") {
        if (name != null && email != null && mobile != null) {
            data = {
                name: name,
                email: email,
                phone: mobile,
                message: message
            };
        } else {
            if (validForm()) {
                name = $("#contact_name").val();
                email = $("#contact_email").val();
                mobile = $("#contact_num").val();
                data = {
                    name: name,
                    email: email,
                    phone: mobile,
                    message: message
                };
            }
        }
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=feedback",
            data: data,
            cache: false,
            success: function (data) {
                if (data.error == false) {
                    $("#feedback_err_text").html("<b>" + data.message + "</b>");
                    $("#feedback_err").popup("open");
                } else {
                    $("#feedback_err_text").html("<b>" + data.message + "</b>");
                    $("#feedback_err").popup("open");
                }
            }
        });
    }
    return false;
}

function redirectToOrders() {
    $("#order_success").popup("close");
    $(":mobile-pagecontainer").pagecontainer("change", "#orders");
}

function referFriend() {
    var email = $("#friend_email").val();
    var msg = $("#friend_message").val();
    var data = {
        email: email,
        message: msg
    };
    if (!validateEmail($.trim(email))) {
        $("#refer_err_text").html("<b>Please enter valid email</b>");
        $("#refer_err").popup("open");
    } else {
        $.ajax({
            type: "POST",
            url: config.api_url + "module=user&action=invitefriend",
            data: data,
            cache: false,
            success: function (data) {
                if (data.error == false) {
                    $("#refer_err_text").html("<b>" + data.message + "</b>");
                    $("#refer_err").popup("open");
                } else {
                    $("#refer_err_text").html("<b>" + data.message + "</b>");
                    $("#refer_err").popup("open");
                }
            }
        });
    }
}

function startTimer() {
    $("#resend").empty();
    var resend = '<a href="#" class="ui-btn ui-btn-corner-all" onclick="resend();"> Resend Code</a>';
    var sec = 90;
    var timer = setInterval(function () {
        $("#timer").text(sec--);
        if (sec == -1) {
            clearInterval(timer);
            $("#timer").empty();
            $("#resend").append(resend);
        }
    }, 1000);
}

function showFeedbackForm() {
    var name = getVal(config.user_name);
    var email = getVal(config.user_email);
    var mobile = getVal(config.user_mobile);
    if (name != null && email != null && mobile != null) {
        $("#contact_submit").addClass("remove_form");
    } else {
        $("#contact_submit").removeClass("remove_form");
    }
}

function resend() {
    var mobile = getVal(config.user_mobile);
    var email = getVal(config.user_email);
    var id = getVal(config.user_id);
    var details = {
        mobile: mobile,
        email: email,
        id: id,
        device_token: getVal(config.device_token)
    };
    startTimer();
    $.ajax({
        type: "POST",
        url: config.api_url + "module=user&action=resend",
        data: details,
        cache: false,
        success: function (html) {
            if (html.error == false) {
                $("#verify_err_text").html("<b>" + html.message + "</b>");
                $("#verify_err").popup("open");
            }
        },
        error: function (request, status, error) {
            $("#verify_err_text").html("<b>Process fail please try again......</b>");
            $("#verify_err").popup("open");
        }
    });
}

var map,
        currentPosition,
        directionsDisplay,
        directionsService,
        destinationLatitude = 12.966383,
        destinationLongitude = 80.148874;
function getDirection() {
    if (typeof (google) !== "undefined") {
        $("#map_canvas").append(navigator.geolocation.getCurrentPosition(routeMap, locError, {enableHighAccuracy: true, timeout: 5000, maximumAge: 0}));
    } else {
        $("#map_canvas").empty();
        $("#map_canvas").append("<p>Please connect your device with internet to share your location</p>");
    }
}

function routeMap(position) {
    $("#map_canvas").empty();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    map = new google.maps.Map(document.getElementById('map_canvas'), {
        zoom: 15,
        center: currentPosition,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    directionsDisplay.setMap(map);
    var currentPositionMarker = new google.maps.Marker({
        position: currentPosition,
        map: map,
        title: "Current position"
    });
    calculateRoute();
}

function locError(error) {
    // the current position could not be located
}

function calculateRoute() {
    var targetDestination = new google.maps.LatLng(destinationLatitude, destinationLongitude);
    if (currentPosition != '' && targetDestination != '') {
        var request = {
            origin: currentPosition,
            destination: targetDestination,
            travelMode: google.maps.DirectionsTravelMode["DRIVING"]
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setPanel(document.getElementById("directions"));
                directionsDisplay.setDirections(response);
                $("#results").show();
            }
            else {
                $("#results").hide();
            }
        });
    }
    else {
        $("#results").hide();
    }
}