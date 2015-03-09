var push = {};
var PWAppID = "AC4D4-E4A45";
var GoogleAppID = "1069059125213";

push.pushNotification = null;
push.initPushwoosh = function () {
    push.pushNotification = window.plugins.pushNotification;
    if (device.platform == "Android") {
        registerPushwooshAndroid();
    }
    if (device.platform == "iPhone" || device.platform == "iOS") {
        registerPushwooshIOS();
    }
    if (device.platform == "WinCE" || device.platform == "Win32NT") {
        alert("Device is Windows");
        registerPushwooshWindows();
    }
}

function registerPushwooshAndroid() {
    push.pushNotification = window.plugins.pushNotification;
    document.addEventListener('push-notification',
            function (event) {
                var title = event.notification.title;
                var userData = event.notification.userdata;
                //dump custom data to the console if it exists
                if (typeof (userData) != "undefined") {
                    console.warn('user data: ' + JSON.stringify(userData));
                }
                $("#externalpopup_text").html(title);
                $("#externalpopup").popup("open");
                //and show alert
                //alert(title);
                //stopping geopushes
                //pushNotification.stopGeoPushes();
            });

    push.pushNotification.onDeviceReady({projectid: "1069059125213", appid: "AC4D4-E4A45"});

    push.pushNotification.registerDevice(
            function (token) {
                onPushwooshAndroidInitialized(token);
            },
            function (status) {
                alert("failed to register: " + status);
                console.warn(JSON.stringify(['failed to register ', status]));
            });
}

function onPushwooshAndroidInitialized(pushToken) {
    //if you need push token at a later time you can always get it from Pushwoosh plugin
    push.pushNotification.getPushToken(
            function (token) {
                setVal(config.device_token, token);
                console.warn('push token: ' + token);
            });

    //and HWID if you want to communicate with Pushwoosh API
    push.pushNotification.getPushwooshHWID(
            function (token) {
                console.warn('Pushwoosh HWID: ' + token);
            });

    push.pushNotification.getTags(
            function (tags) {
                console.warn('tags for the device: ' + JSON.stringify(tags));
            },
            function (error) {
                console.warn('get tags error: ' + JSON.stringify(error));
            });
    push.pushNotification.setLightScreenOnNotification(false);
    push.pushNotification.setTags({deviceName: "hello", deviceId: 10},
    function (status) {
        console.warn('setTags success');
    },
            function (status) {
                console.warn('setTags failed');
            });
}

function registerPushwooshIOS() {
    push.pushNotification = window.plugins.pushNotification;
    document.addEventListener('push-notification',
            function (event)
            {
                var notification = event.notification;
                $("#externalpopup_text").html(notification.aps.alert);
                $("#externalpopup").popup("open");
                push.pushNotification.setApplicationIconBadgeNumber(0);
            });

    //initialize the plugin
    push.pushNotification.onDeviceReady({pw_appid: "AC4D4-E4A45"});

    //register for pushes
    push.pushNotification.registerDevice(
            function (status) {
                var deviceToken = status['deviceToken'];
                console.warn('registerDevice: ' + deviceToken);
                onPushwooshiOSInitialized(deviceToken);
            },
            function (status) {
                console.warn('failed to register : ' + JSON.stringify(status));
            });
    push.pushNotification.setApplicationIconBadgeNumber(0);
}

function onPushwooshiOSInitialized(pushToken) {
    push.pushNotification = window.plugins.pushNotification;
    //retrieve the tags for the device
    push.pushNotification.getTags(
            function (tags) {
                console.warn('tags for the device: ' + JSON.stringify(tags));
            },
            function (error) {
                console.warn('get tags error: ' + JSON.stringify(error));
            });

    //example how to get push token at a later time
    push.pushNotification.getPushToken(function (token) {
        setVal(config.device_token, token);
        console.warn('push token device: ' + token);
    });

    //example how to get Pushwoosh HWID to communicate with Pushwoosh API
    push.pushNotification.getPushwooshHWID(
            function (token) {
                console.warn('Pushwoosh HWID: ' + token);
            }
    );
}

function registerPushwooshWindows() {
    push.pushNotification = window.plugins.pushNotification;
    //set push notifications handler
    document.addEventListener('push-notification', function (event) {
        //get the notification payload
        var notification = event.notification;
        $("#externalpopup_text").html(JSON.stringify(notification));
        $("#externalpopup").popup("open");
        //display alert to the user for example
        //alert(JSON.stringify(notification));
    });

    //initialize the plugin
    push.pushNotification.onDeviceReady({appid: "AC4D4-E4A45", serviceName: ""});

    //register for pushes
    push.pushNotification.registerDevice(
            function (status) {
                var pushToken = status;
                console.warn('push token: ' + pushToken);
                setVal(config.device_token, pushToken);
                onPushwooshWindowsInitialized();
            },
            function (status) {
                console.warn(JSON.stringify(['failed to register ', status]));
            }
    );
}

function onPushwooshWindowsInitialized() {
    //retrieve the tags for the device
    push.pushNotification.setTags({tagName: "tagValue", intTagName: 10},
    function (status) {
        alert('setTags success: ' + JSON.stringify(status));
    },
            function (status) {
                console.warn('setTags failed');
            });
}