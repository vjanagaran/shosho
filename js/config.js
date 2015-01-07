/**
 * Global config file to load server / application settings and constants 
 */
config = function() {
    'use strict';
    return {
        language: "periyava_language",
        showlog: 3 // 0: "Disabled", 1: "Error", 2: "Warning", 3: "Info"
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