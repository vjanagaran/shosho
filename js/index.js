var router = new $.mobile.Router([{
        "#home": {handler: "homePage", events: "bs"}}], {
    homePage: function (type, match, ui) {
        
    }
}, {
    ajaxApp: true,
    defaultHandler: function (type, ui, page) {
        //log("Default handler called due to unknown route (" + type + ", " + ui + ", " + page + ")", 1);
    },
    defaultHandlerEvents: "s",
    defaultArgsRe: true
});
//document.addEventListener("deviceready", onDeviceReady, false);
//document.addEventListener("pause", onAppClose, false);
function onDeviceReady() {

}

function showHome() {

}