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
}

function registerPushwooshAndroid() {
    document.addEventListener('push-notification',
            function (event) {
                var title = event.notification.title;
                var userData = event.notification.userdata;
                //dump custom data to the console if it exists
                if (typeof (userData) != "undefined") {
                    console.warn('user data: ' + JSON.stringify(userData));
                }
                //and show alert
                alert(title);
                //stopping geopushes
                //pushNotification.stopGeoPushes();
            });

    push.pushNotification.onDeviceReady({projectid: "1069059125213", appid: "AC4D4-E4A45"});

    push.pushNotification.registerDevice(
            function (token) {
                alert("set token: " + token);
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
    document.addEventListener('push-notification',
            function (event)
            {
                var notification = event.notification;
                alert(notification.aps.alert);
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