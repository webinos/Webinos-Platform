(function(exports) {

    var http = require('http');
    var url = require('url');
    var fs = require('fs');
    var path = require('path');
    var wm = require('../../../index.js');
    
    var webinos = require("find-dependencies")(__dirname);
    var pzp = webinos.global.require(webinos.global.pzp.location, "lib/pzp");
    
    var signedOnly = false;
    var useWGTProtocol = false;
    var sessions = {};
    var nextSessionId = 0;
    
    // ToDo - is there a 3rd party library we can use for this?
    var mimeTypes = {
        "html": "text/html",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "png": "image/png",
        "js": "text/javascript",
        "css": "text/css"
    };

    function downloadFile(fileURL, callback) {
      console.log('Downloading file: ' + fileURL);

      var host = url.parse(fileURL).hostname;
      var port = url.parse(fileURL).port;
      var path = url.parse(fileURL).path;
      var filename = url.parse(fileURL).pathname.split('/').pop()

      var options = {
        host: host,
        port: port,
        path: path
      };

      // Create and execute request for the file.
      var clientReq = http.get(options, function (clientResponse) {
          // Download to temporary folder.
        var targetFilePath = path.join(pzp.session.getWebinosPath(), 'widgetDownloads');

          try {
            // Create the target path if it doesn't already exist.
            fs.statSync(targetFilePath);
          }  catch (e) {
            fs.mkdirSync(targetFilePath)
          }

          targetFilePath = targetFilePath + "/" + filename;
          var downloadfile = fs.createWriteStream(targetFilePath, {'flags': 'w'});
          downloadfile.on('close',function() { callback(true, targetFilePath); });

          clientResponse.setEncoding('binary');
          clientResponse.addListener('data', function (chunk) {
            downloadfile.write(chunk, encoding='binary');
          });

          clientResponse.addListener('end', function() {
            downloadfile.end();
            console.log('Finished downloading ' + fileURL);                
          });
      });

      clientReq.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        callback(false);
      });        
    }

    function installWidget(wgt, callback) {
      console.log("installing " + wgt);

      // Callback for widget manager
      function handlePendingInstall(processingResult) {
        var installId = processingResult.getInstallId();

        if (processingResult.status) {
          // An error occurred.
          console.log('wm: pendingInstall error: install: ' + processingResult.status);
          if (installId) {
            wm.widgetmanager.abortInstall(installId);
          }
          callback({ title: "widget installation", status: processingResult.status, text: processingResult.error.getReasonText() });
        } else {
          // Pending install OK => complete the install.
          if (signedOnly && processingResult.validationResult.status != wm.WidgetConfig.STATUS_VALID) {
            console.log("failing installation of unsigned widget");
            callback({ title: "widget installation", status: processingResult.validationResult.status, text: "widget not signed - installation failed"});        
          } else {
            console.log("******** completing install: " + installId);
            
            var result = wm.widgetmanager.completeInstall(installId, true);
            if (result) {
              console.log('wm: completeInstall error: install: ' + result);
              callback({ title: "widget installation", status: result, text: "completing installation failed"});
            } else {
              console.log('wm: install complete');
              callback(null, installId);
            }
          }
        }
      }

      wm.widgetmanager.prepareInstall(wgt, {}, handlePendingInstall);
    }

    function uninstallWidget(id, callback) {
      if (wm.widgetmanager.uninstall(id))
        callback(false);
      else
        callback(true);
    }

    // Get the list of installed widgets.
    exports.installed = function (req, res) {
      var cfgs = [];

      var lst = wm.widgetmanager.getInstalledWidgets();
      for (var idx in lst) {
        var cfg = wm.widgetmanager.getWidgetConfig(lst[idx]);
        if (cfg) {
          cfgs.push(cfg);
        }
      }

      res.render('apps', { pageTitle: 'installed apps', list: cfgs, feedback: req.param('feedback', '') });
    };

    // Un-install a widget.
    exports.uninstall = function (req, res) {
      uninstallWidget(req.param('id', 'missing id!'), function (ok) {
        res.redirect('/apps?feedback=widget uninstalled successfully');
      });
    };
    
    // Side-load a widget.
    exports.sideLoad = function (req, res) {
      var wgt = decodeURIComponent(req.param('id', 'missing id!'));
      console.log("side-loading: " + wgt);
      installWidget(wgt, function (err, installId) {
        if (installId) {        
          // We need to use this trick so that the renderer re-loads the browser instance
          // and sets the new widget attributes up (width, height, widget interface etc).
          var redirect = 'webinos://sideLoadComplete/' + installId;
          console.log("sideload redirecting to " + redirect);
          res.redirect(redirect);
        } else {      
          var reason = encodeURIComponent(err.text);
          res.redirect("webinos://sideLoadFailed/" + reason);
        }        
      });      
    };

  // Write session file to disk.
  function writeSessionFile(sesh) {
    var seshFile = path.join(pzp.session.getWebinosPath(),'wrt/sessions',sesh.id + ".json");
    var seshData = JSON.stringify(sesh);
    fs.writeFileSync(seshFile,seshData,'utf8');
  }

  // Start running a widget => create session and redirect to widget start file.
    exports.boot = function (req, res) {
      console.log("apps.boot - " + req.url);

    // Extract install id of widget to be launched.
    var installId = req.param('id', '');

    // Extract any arguments to be passed to the widget on launch.
    var query = url.parse(req.url,true);

    // Attempt to get the configuration of the widget.
    var cfg;
    if (installId.length > 0) {
      cfg = wm.widgetmanager.getWidgetConfig(installId);
    }
      if (typeof(cfg) === "undefined") {
      // Widget not installed.
        console.log("bad widget id: " + installId);
      } else {
        // Validate the widget signature (if present).
        var storePath1 = path.join(wm.Config.get().wrtHome, installId);
        var storePath2 = path.join(storePath1, "wgt");
        var wgtResource = new wm.DirectoryWidgetResource(storePath2);
        var validator = new wm.WidgetValidator(wgtResource);
        var result = validator.validate();
        
        if (signedOnly && result.status != wm.WidgetConfig.STATUS_VALID) {
          res.render("error", { title: "signature validation", status: result.status, text: "widget signature missing or invalid"});
        } else if (result.status >= wm.WidgetConfig.STATUS_UNSIGNED) {
          var startFile = cfg.startFile.path;
          // Support remote start locations
          var startFileProtocol = url.parse(startFile).protocol;
          if (typeof startFileProtocol === "undefined") {
            // Normal widget with local start file.
          // Create new session.
          nextSessionId++;

          // Store installId, sessionId and arguments in session file.
          sessions[nextSessionId] = { id: nextSessionId, installId: installId, params: query.search };
          writeSessionFile(sessions[nextSessionId]);

          // Redirect to widget start file.
            if (useWGTProtocol) {
              res.redirect('wgt://' + installId);
            } else {
            res.redirect("/widget/" + installId + "/" + nextSessionId + "/" + startFile);
            }
          } else {
            // Redirect to remote start location.
            res.redirect(startFile);
          }
        } else {
          res.render("error", { title: "signature validation", status: result.status, text: result.errorArtifact.getReasonText()});
        }
      }
    };

    // Run a widget - essentially serves content from the widget root.
    exports.run = function (req, res) {
    // Get the path portion of the url.
      var pathName = url.parse(req.url).pathname.substr("widget/".length);
      
    // Get the widget install Id.
    var widgetId = req.param('id', '');

    // Get the session id.
    var sessionId = req.param('sessionId',-1);

    // Check that the session exists.
    if (sessions.hasOwnProperty(sessionId)) {
      // Determine the path relative to the widget root.
      var relPath = pathName.replace(widgetId + "/" + sessionId + "/","");
      if (relPath === "/")
        relPath = "index.html";
      
      // Build the path to the widget content.
      var filename = path.join(wm.Config.get().wrtHome, widgetId, "wgt", relPath);
      
      path.exists(filename, function(exists) {
        if(!exists) {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.write('404 Not Found\n');
          res.end();
        } else {        
          var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
          res.setHeader('Content-Type', mimeType);

          var fileStream = fs.createReadStream(filename);
          fileStream.pipe(res);
        }
      }); 
    } else {
      console.log("unknown widget session: " + sessionId);
    }
    };
    
  // Fetch widget preferred icon.
  exports.icon = function (req, res) {
    var installId = req.param('id', '');

    var cfg = wm.widgetmanager.getWidgetConfig(installId);
    if (typeof(cfg) === "undefined") {
      console.log("bad widget id: " + installId);
    } else {
      var filename = path.join(wm.Config.get().wrtHome, installId, "wgt", cfg.prefIcon);

      path.exists(filename, function(exists) {
        if(!exists) {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.write('404 Not Found\n');
          res.end();
        } else {
          var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
          res.setHeader('Content-Type', mimeType);

          var fileStream = fs.createReadStream(filename);
          fileStream.pipe(res);
        }
      });
    }
  }

    // Show page detailing widget config
    exports.about = function (req, res) {
      console.log("apps.about");
    var installId = req.param('id', '');
      var cfg = wm.widgetmanager.getWidgetConfig(installId);
      if (typeof(cfg) === "undefined") {
        console.log("bad widget id: " + installId);
      } else {
        res.render("aboutWidget", { pageTitle: "about widget", cfg: cfg });
      }
    };
  
  exports.setSignedOnly = function(signedOnlyFlag) {
    signedOnly = typeof signedOnlyFlag === "undefined" ? false : signedOnlyFlag;
  }
  
  exports.setUseWGTProtocol = function(useWGTProtocolFlag) {
    useWGTProtocol = typeof useWGTProtocolFlag === "undefined" ? false : useWGTProtocolFlag;    
  }
}(module.exports));
