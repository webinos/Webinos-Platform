(function (exports) {

  exports.start = function (signedWidgetOnly, enforceWidgetCSP, pzpWebSocketPort, callback) {
    var express = require('express');
    var http = require('http');
    var fs = require('fs');
    var path = require('path');
    var logger = require('../../../../util/lib/logging.js')(__filename);


    // Default port
    var runtimeServerPort = 53510;

    // Create the express app
    var app = express();
    app.set('view engine', 'jade');
    app.set('views', path.join(__dirname,'/views'));
    app.use(express.static(path.join(__dirname,'/static')));
    app.use(express.static(path.join(__dirname,'../../../../../web_root')));
    app.use(express.bodyParser());

    app.configure(function () {
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
      // Un-comment this line to switch on request logging.
      //app.use(express.logger());
    });

    app.use(app.router);

    // Load routing
    var stores = require('./routes/stores');
    var apps = require('./routes/apps');
    var settings = require('./routes/settings');
    var widgetTests = require('./routes/widgetTests');
    var widgetDigSigTests = require('./routes/widgetDigSigTests');

    apps.setSignedOnly(signedWidgetOnly);

    /**
     * Expose the current communication channel websocket port using this virtual file.
     * This code must have the same result with the handleRequest on the pzp_websocket.js
     * webinos\pzp\lib\pzp_websocket.js
     */
    app.get('/webinosConfig.json', settings.getWebinosConfig);

    // apps routing
    app.get('/', apps.installed);
    app.get('/apps', apps.installed);
    app.get('/uninstall/:id', apps.uninstall);
    app.get('/widget/about/:id', apps.about);

    if (typeof enforceWidgetCSP != "undefined" && enforceWidgetCSP) {
      // Enforce CSP for all widget requests.
      app.get('/widget/*', function(req,res,next){
        // Add CSP header - TODO make CSP string configurable/dynamic?
        res.header("X-WebKit-CSP","default-src 'none'; script-src 'self'; object-src 'self'; style-src 'self'; frame-src 'self'; font-src 'self'; img-src '*'; media-src '*'; connect-src 'self' ws://localhost:" + pzpWebSocketPort + ";");
        // Continue routing.
        next(); 
      });
    }    

    app.get('/widget/:id', apps.boot);
    app.get('/widget/:id/*', apps.run);
    app.get('/sideLoad/:id', apps.sideLoad);
    
    // widget testing
    app.get('/widget-tests', widgetTests.listTestWidgets);
    app.get('/widget-dig-sig-tests', widgetDigSigTests.listTestWidgets);

    // stores routing
    app.get('/stores', stores.stores);
 
    // settings routing
    app.get('/settings/:saved?', settings.getSettings);
    app.post('/settings', settings.saveSettings);
    app.get('/about', settings.about);

    // tests routing
    app.get('/tests', function (req, res) {
      res.render('tests', { pageTitle: 'tests' });
    });

    var server = http.createServer(app);
    
    // Write port to config file on successful connection
    server.on('listening', function () {
      logger.log('server started on port ' + runtimeServerPort);
      settings.setWRTPort(runtimeServerPort);
      callback("startedWRT",runtimeServerPort);
    });

    // Intercept port-in-use errors and try connecting on different port
    server.on('error', function (err) {
      logger.log(err);
      if (err.code === "EADDRINUSE") {
        runtimeServerPort++;
        logger.log("runtimeWebServer address in use, now trying port " + runtimeServerPort);
        app.listen(runtimeServerPort, "localhost");
      }
    });
    
    server.listen(runtimeServerPort, "localhost");
  };

} (module.exports));
