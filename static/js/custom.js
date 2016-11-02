var BASE_URL = 'http://yourdomain.com/appname/';

// Plaid parameters
var PLAID_ENVIRONMENT = 'tartan'; // Change to 'production' in production.
var PLAID_CLIENT_NAME = 'Stripe / Plaid Test';
var PLAID_PUBLIC_KEY = '<Plaid public key>';

// OneSignal parameters
var ONESIGNAL_APP_ID = '<OneSignal app ID>';
var GOOGLE_API_PROJECT_NUMBER = '<Google APIs project number>';

var Widget = function() {
    self = Core({
            data: {
                keywords: '',
                docs: [],
                page: 'search',
                bankAccount: {name: '', institution: ''},
                transactionToken: '',
                paymentAmount: '',
                paymentStatus: ''
            },
            methods: {
                openPlaidLink: function() {
                    linkHandler.open();
                },
                submitPayment: function() {
                    submitButton = document.getElementById('paymentSubmit');
                    submitButton.disabled = true;
                    WIDGET.vue.paymentStatus = 'Processing...';
                    $.ajax({
                        url: BASE_URL + 'default/payment',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({
                            description: 'Test payment',
                            amount: WIDGET.vue.paymentAmount,
                            transaction_token: WIDGET.vue.transactionToken
                        }),
                        dataType: 'json',
                        complete: function(xhr) {
                          document.getElementById('paymentForm').reset();
                          submitButton.disabled = false;
                          WIDGET.vue.paymentStatus = JSON.parse(xhr.responseText).status;
                          setTimeout(function() {
                              WIDGET.vue.paymentStatus = '';
                              WIDGET.vue.page = 'plaid';
                            }, 3000);
                        }
                    });
                }
            }
        });
    self.retrieve_docs = function() {
        self.get(BASE_URL+'default/search',{q: self.vue.keywords})
        .done(function(docs){self.vue.docs=docs;});
    };
    self.vue.$watch('keywords', self.retrieve_docs.debounce(250));
    return self;
};

var WIDGET = null;
jQuery(function(){WIDGET = Widget();});

// Plaid Setup (for Stripe ACH payments)

var linkHandler = Plaid.create({
    env: PLAID_ENVIRONMENT,
    clientName: PLAID_CLIENT_NAME,
    key: PLAID_PUBLIC_KEY,
    product: 'auth',
    selectAccount: true,
    onSuccess: function(public_token, metadata) {
      console.log(JSON.stringify(metadata));
      // Send the public_token and account ID to the server.
      $.ajax({
        url: BASE_URL + 'default/plaid_exchange',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(metadata),
        dataType: 'json',
        success: function(data) {
          console.log(JSON.stringify(data));
          WIDGET.vue.bankAccount = {name: data.name, institution: data.institution};
          WIDGET.vue.transactionToken = data.transaction_token
          WIDGET.vue.page = 'payment';
        }
      });
    },
});

// OneSignal Setup

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
    .startInit(ONESIGNAL_APP_ID, GOOGLE_API_PROJECT_NUMBER)
    .handleNotificationReceived(notificationReceived)
    .inFocusDisplaying(OneSignal.OSInFocusDisplayOption.None)
    .endInit();
}

document.addEventListener('deviceready', onDeviceReady, false);
