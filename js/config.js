/**
 * Global config file to load server / application settings and constants 
 */
config = function () {
    'use strict';
    return {
        showlog: 3, // 0: "Disabled", 1: "Error", 2: "Warning", 3: "Info"
        api_url: "http://jayam.co.uk/shosho_admin/ajax.php?",
        user_name: "sho_sho_user_name",
        user_mobile: "sho_sho_user_mobile"

    };
}();

function setVal(key, value) {
    window.localStorage.setItem(key, value);
}

function getVal(key) {
    var value;
    value = window.localStorage.getItem(key);
    return  value;
}

function removeVal(key) {
    window.localStorage.removeItem(key);
}

function clearAll() {
    window.localStorage.clear();
}