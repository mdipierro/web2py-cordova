### web2py Vue Scaffold App (compatible with Cordova)

This app provides an example of a scaffold app based on:

- web2py (for serverside logic, database abstraction, and auth)
- vue.js (for single page rsponsive app)
- whoosh (for full text search)
- stupid.css (for style)

It is based on https://github.com/web2py/scaffold but all the code is in static/index.html and static/js/custom.js

To use with cordova, simply edit static/js/custom.js and make statis point to the URL of your server, than mount static/ as cordova/www and process it with Cordova
