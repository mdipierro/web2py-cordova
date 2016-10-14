var BASE = 'http://127.0.0.1:8000/cordova/';

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
