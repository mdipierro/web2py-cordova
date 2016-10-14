// core.js
// Author: Massimo Di Pierro<massimo.dipierro@gmail.com>
// License: BSD
var Core = function(extensions) {
    self = {};
    // IO FUNCTIONS
    self.start_io = function(){jQuery('.progress').slideDown();};
    self.stop_io = function(data){jQuery('.progress').slideUp();};
    self.on_error = function(){jQuery('.progress').slideUp();};
    self.get = function(url, data) {
        self.start_io();
        return jQuery.getJSON(url, data).fail(self.on_error).done(self.stop_io);
    };
    self.METHOD = function(method) {
        return function(url, data) {
            var d = {url:url, method:method, contentType: 'application/json', processData: false};
            if(data) d.data = JSON.stringify(data);
            self.start_io();
            return jQuery.ajax(d).fail(self.on_error).done(self.stop_io);
        };
    };
    self.post   = self.METHOD('POST');
    self.put    = self.METHOD('PUT');
    self.delete = self.METHOD('DELETE');
    self.upload = function(selector, name) {
        // function from http://jsfiddle.net/eliseosoto/JHQnk/
        var dfd = jQuery.Deferred();
        var element = jQuery(selector);
        if(element.length==1) {
            var files = element[0].files;
            var reader = new FileReader();
            if (files && files[0]) {
                reader.onload = function(event) {
                    var b64 = btoa(event.target.result);
                    self.vue.$set(name, b64);
                    dfd.resolve(b64);
                };
                reader.readAsBinaryString(files[0]);
            }
        }
    };
    
    // Configure Vuew
    Vue.config.delimiters = ['${', '}']
    Vue.config.unsafeDelimiters = ['!{', '}']
    Vue.config.silent = false; // show all warnings
    Vue.config.async = true; // for debugging only

    var config = {
        el: '#vue',
        data: {
            page: '',        /* page name */
            state: {}        /* global page state */
        },
        filters: {
            marked: marked,
        },
        methods: {
            goto: function(page, state) { self.vue.page=page; self.vue.state=state; },
            upload: self.upload // <input type="file" v-on:change="upload($event.target,'name')">
        }
    };
    if(extensions.data) jQuery.extend(config.data, extensions.data);
    if(extensions.filters) jQuery.extend(config.filters, extensions.filters);
    if(extensions.methods) jQuery.extend(config.methods, extensions.methods);

    self.vue = new Vue(config);
    return self;
};
