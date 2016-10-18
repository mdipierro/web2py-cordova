var BASE = window.location.href.split('/').splice(0,4).join('/')+'/';

var Widget = function() {
    self = Core({
            data: {
                keywords: '',
                docs: []
            }
        });
    self.retrieve_docs = function() {
        self.get(BASE+'default/search',{q: self.vue.keywords})
        .done(function(docs){self.vue.docs=docs;});
    };
    self.vue.$watch('keywords', self.retrieve_docs.debounce(250));
    return self;
};

var WIDGET = null;
jQuery(function(){WIDGET = Widget();});


// OneSignal Setup

var ONESIGNAL_APP_ID = '250cb80a-8aea-4b21-b750-76b1cfc97a9f';
var GOOGLE_PROJECT_ID = '434328661839';

function onDeviceReady() {
    console.log('Device ready.');

    var OneSignal = window.plugins.OneSignal;

    // Run whenever a new notification is received (whether or not the App is in focus).
    var notificationReceived = function(jsonData) {
        var payload = jsonData.payload;
        delete payload.rawPayload;
        // To identify channel messages, send {'channel': 'channel name'} as additional data.
        var channel = 'additionalData' in payload ? payload.additionalData.channel + ' channel: ' : '';
        console.log('notificationReceived: ' + JSON.stringify(payload));
        alert('OneSignal Notification\n\nTitle: ' + payload.title + '\nContent: ' + payload.body);
    };

    // Set inFocusDisplaying to None to prevent device or app notifications when in focus.
    OneSignal
    .startInit(ONESIGNAL_APP_ID, GOOGLE_PROJECT_ID)
    .handleNotificationReceived(notificationReceived)
    .inFocusDisplaying(OneSignal.OSInFocusDisplayOption.None)
    .endInit();
}

document.addEventListener('deviceready', onDeviceReady, false);
