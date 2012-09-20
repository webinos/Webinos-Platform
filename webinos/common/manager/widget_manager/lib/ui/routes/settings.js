(function (exports) {
    var fs = require('fs');
    var common = require('../../../../../../pzp/lib/session_common');
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

      fs.readFile((common.webinosConfigPath() + '/wrt/webinos_pzp.json'), function (err, data) {
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

      fs.readFile((common.webinosConfigPath() + '/wrt/webinos_runtime.json'), function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var cfgData = data.toString('utf8');
          cfg = JSON.parse(cfgData);
        }
        callback(cfg);
      });
    }

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

        fs.writeFile((common.webinosConfigPath() + '/wrt/webinos_pzp.json'), JSON.stringify(pzpConfig, null, ' '), function (err) {
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
