(function(exports) {

    var http = require('http');
    var url = require('url');
    var fs = require('fs');
    var path = require('path');
    var wm = require('../../../index.js');
    var pzp = require('../../../../../pzp/lib/pzp');
    
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
        path: path,
      };

      // Create and execute request for the file.
      var clientReq = http.get(options, function (clientResponse) {
          // Download to temporary folder.
          var targetFilePath = path.join(pzp.session.getWebinosPath(), '../widgetDownloads');

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
            callback(false);
        } else {
            // Pending install OK => complete the install.
            console.log("******** completing install: " + installId);
        
            var result = wm.widgetmanager.completeInstall(installId, true);
            if (result) {
                console.log('wm: completeInstall error: install: ' + result);
                callback(false);
            } else {
                console.log('wm: install complete');
                callback(true, installId);
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

    // Install a widget (obsolete - see sideLoad)
    exports.install = function (req, res) {
      downloadFile('http://webinos.two268.com/apps/' + req.param('id', 'missing') + '/' + req.param('id', 'missing'), function (ok, wgt) {
        if (ok) {
          installWidget(wgt, function (ok, installId) {
            if (ok)
              res.render('install', { pageTitle: 'install', id: req.param('id', 'missing!'), success: ok, installId: installId });
            else
              res.render('install', { pageTitle: 'install failed', id: req.param('id', 'missing!'), success: ok });
          });
        }
        else
          res.render('install', { pageTitle: 'install download failed', id: req.param('id', 'missing!'), success: false });
      });
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
      installWidget(wgt, function (ok, installId) {
        if (ok) {        
          //var redirect = '/widget/' + installId;
          //var redirect = 'wgt://' + installId;
          var redirect = 'webinos://sideLoadComplete/' + installId;
          console.log("sideload redirecting to " + redirect);
          res.redirect(redirect);
        } else {      
          //res.render('install', { pageTitle: 'install failed', id: req.param('id', 'missing!'), success: ok });
          res.redirect("webinos://sideLoadFailed/");
        }        
      });      
    };

    // Start running a widget => redirect to widget start file.
    exports.boot = function (req, res) {
      console.log("apps.boot");
      var installId = req.param('id', '404');
      var cfg = wm.widgetmanager.getWidgetConfig(installId);
      if (typeof(cfg) === "undefined") {
        console.log("bad widget id: " + installId);
      } else {
        var startFile = cfg.startFile.path;
        // Support remote start locations
        var startFileProtocol = url.parse(startFile).protocol;
        if (typeof startFileProtocol === "undefined") {
          // Normal widget with local start file.
          res.redirect(req.url + "/" + startFile);
        } else {
          // Redirect to remote start location.
          res.redirect(startFile);
        }
      }
    };

    // Run a widget - essentially serves content from the widget root.
    exports.run = function (req, res) {
      var pathName = url.parse(req.url).pathname.substr("widget/".length);
      var widgetId = req.param('id', '404');
      
      var relPath = pathName.replace(widgetId,"");
      if (relPath === "/")
        relPath = "index.html";
      
      var storePath1 = path.join(wm.Config.get().wrtHome, widgetId);
      var storePath2 = path.join(storePath1, "wgt");
      var filename = path.join(storePath2, relPath);
      
      path.exists(filename, function(exists) {
        if(!exists) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.write('404 Not Found\n');
          res.end();
          return;
        } else {        
          var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
          res.writeHead(200, mimeType);

          var fileStream = fs.createReadStream(filename);
          fileStream.pipe(res);
        }
      }); 
    };
    
    // Show page detailing widget config
    exports.about = function (req, res) {
      console.log("apps.about");
      var installId = req.param('id', '404');
      var cfg = wm.widgetmanager.getWidgetConfig(installId);
      if (typeof(cfg) === "undefined") {
        console.log("bad widget id: " + installId);
      } else {
        res.render("aboutWidget", { pageTitle: "about widget", cfg: cfg });
      }
    };
  
}(module.exports));
