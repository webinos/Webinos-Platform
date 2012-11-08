(function (exports) {
    var fs = require('fs');
	var path = require('path');
    var pzp = require('../../../../../pzp/lib/pzp');
    var wrtPort = 0;

    function extractKey(line, key) {
      var val = '';
      if (typeof(line) !== 'undefined') {
        var idx = line.indexOf(key);
        if (idx >= 0) {
          val = line.substr(idx + key.length);
          idx = val.indexOf('"');
          val = val.substr(0, idx);
        }
      }

      return val;
    }

    function readPZPConfig(callback) {
      var pzpConfig;

      fs.readFile((path.join(pzp.session.getWebinosPath(),'../wrt/webinos_pzp.json')), function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var pzpConfigData = data.toString('utf8');
          pzpConfig = JSON.parse(pzpConfigData);
        }

        callback(pzpConfig);
      });
    }

    function readWRTConfig(callback) {
      var cfg = {};

      fs.readFile((path.join(pzp.session.getWebinosPath(), '../wrt/webinos_runtime.json')), function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var cfgData = data.toString('utf8');
          cfg = JSON.parse(cfgData);
        }
        callback(cfg);
      });
    }

    /**
     * Expose the current communication channel websocket port.
     * Check the usage in widgetServer.js for more info.
     *
     * @param req
     * @param res
     */
    exports.getWebinosConfig = function (req, res) {
        readWRTConfig(function(cnf){
            var jsonReply = {
                websocketPort : cnf.pzpWebSocketPort
            };
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify(jsonReply));
            res.end();
        });
    };

    exports.setWRTPort = function (port) {
        wrtPort = port;
    };

    exports.getSettings = function (req, res) {
      readPZPConfig(function (pzpConfig) {
        if (typeof(pzpConfig) === 'undefined') {
          res.render('settings', { pageTitle: 'settings', authCode: "unknown", pzhName: "unknown", nodePath: "", webinosPath: "", saved: req.param('saved', '') });
        } else {
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! " + pzpConfig.workingDirectoryPath);
          var authCode = extractKey(pzpConfig.nodeArgs, '--auth-code=\"');
          var pzhName = extractKey(pzpConfig.nodeArgs, '--pzh-name=\"');
          res.render('settings', { pageTitle: 'settings', authCode: authCode, pzhName: pzhName, nodePath: pzpConfig.nodePath, webinosPath: pzpConfig.workingDirectoryPath, saved: req.param('saved', '') });
        }
      });
    };

    exports.saveSettings = function (req, res) {        
      console.log("!!!!!!!!!!!!!!!!!! " + req.param("webinosPath"));
      
      readPZPConfig(function (pzpConfig) {
        if (typeof(pzpConfig) === 'undefined') {
          console.log("saveSettings - no pzpConfig");
          pzpConfig = {};
          pzpConfig.workingDirectoryPath = "";
        } else {
          console.log("saveSettings - got pzpConfig: ");
          pzpConfig.workingDirectoryPath = req.body && req.body.webinosPath ? req.body.webinosPath : "";
        }
        
        pzpConfig.nodePath =  pzpConfig.workingDirectoryPath + "/bin"; //req.body.nodePath;
        //pzpConfig.nodeArgs = 'webinos_pzp.js --auth-code=\"' + req.body.authCode + '\" --pzh-name=\"' + req.body.pzhName + '\"';
        pzpConfig.instance++;

        fs.writeFile((path.join(pzp.session.getWebinosPath(), '../wrt/webinos_pzp.json')), JSON.stringify(pzpConfig, null, ' '), function (err) {
          if (err) {
            console.log('error saving pzp configuration file');
            res.redirect('/settings/failure');
          } else {
            console.log('saved configuration file');
            res.redirect('/settings/success');
          }
        });
      });
    };

    exports.about = function (req, res) {
      readWRTConfig(function (cfg) {
        res.render('about', { pageTitle: 'about', os: process.platform, nodeVersion: process.versions.node, pzpPort: cfg.pzpWebSocketPort, runtimePort: cfg.runtimeWebServerPort });
      });
    };

} (module.exports));
