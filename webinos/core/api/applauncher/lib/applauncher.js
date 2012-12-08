/*******************************************************************************
*  Code contributed to the webinos project
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*  
*     http://www.apache.org/licenses/LICENSE-2.0
*  
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* 
* Copyright 2012 Andre Paul, Fraunhofer FOKUS
******************************************************************************/
(function() {
  var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;
  var androidLauncher = null;
  var widgetLibrary; 
  try { widgetLibrary = require('../../../manager/widget_manager/index.js'); } catch(e) { widgetLibrary = null; }
    
  if (process.platform == 'android') {
    androidLauncher = require('bridge').load('org.webinos.impl.AppLauncherManagerImpl', this);
  }

  var dependencies = require("find-dependencies")(__dirname);
  var pzp = dependencies.global.require(dependencies.global.pzp.location, "lib/pzp.js");
  var uuid = require('node-uuid');
  var fs = require('fs');
  var path = require('path');
  var existsSync = fs.existsSync || path.existsSync;

  function findInstalledApp(appURI) {
    var requestedApp;
    if (widgetLibrary) {
      var installedApps = widgetLibrary.widgetmanager.getInstalledWidgets();
      
      for (var idx in installedApps) {
        var cfg = widgetLibrary.widgetmanager.getWidgetConfig(installedApps[idx]);
        if (cfg && cfg.id == appURI) {
            console.log("found app id " + cfg.id);
            requestedApp = cfg;
            break;
        }
      }
    }
      
    return requestedApp;
  }
  
  function writeLaunchRequest(appId,widget) {
    var fname = uuid.v1() + ".launch";
    var launchFile = path.join(pzp.session.getWebinosPath(),'../wrt/' + fname);
    if (widget) {
      fs.writeFileSync(launchFile,'wgt:' + appId);
    } else {
      fs.writeFileSync(launchFile,'web:' + appId);
    }
    
    return launchFile;
  }
  
  function checkLaunchRequest(launchFile, successCB, errorCB) {
    var failedFile = launchFile + ".failed";
    if (existsSync(failedFile)) {
      errorCB("error while launching application");
    } else if (existsSync(launchFile)){
      errorCB("runtime failed to launch application - check runtime is running");
    } else {
      successCB(true);
    }
  }
  
  /**
   * Webinos AppLauncher service constructor (server side).
   * @constructor
   * @alias WebinosAppLauncherModule
   * @param rpcHandler A handler for functions that use RPC to deliver their result.  
   */
  var WebinosAppLauncherModule = function(rpcHandler, params) {
    // inherit from RPCWebinosService
    this.base = RPCWebinosService;
    this.base({
      api:'http://webinos.org/api/applauncher',
      displayName:'AppLauncher API',
      description:'The AppLauncher API for starting applications.'
    });
  };

  WebinosAppLauncherModule.prototype = new RPCWebinosService;

  /**
   * Launch an application.
   * @param successCB Success callback.
   * @param errorCB Error callback.
   * @param appURI URI of application to be launched
   */
  WebinosAppLauncherModule.prototype.launchApplication = function (appURI, successCB, errorCB){
    console.log("launchApplication was invoked. AppID: " +  appURI);
    
    if (process.platform == 'android'){
        androidLauncher.launchApplication(
          function (res) {
            successCB();
          }, 
          function (err) {
          errorCB(err)
          },
          appURI
        );
        return;
    }
    
    var installedApp = findInstalledApp(appURI);   
    if (typeof installedApp !== "undefined") {
      // Run the installed widget...
      console.log("applauncher: launching widget " + installedApp.installId);
      var req = writeLaunchRequest(installedApp.installId,true);
      setTimeout(checkLaunchRequest, 2000, req, successCB, errorCB);
    } else if (/^http[s]?:\/{2}/.test(appURI)) {
      console.log("applauncher: launching " + appURI);
      var req = writeLaunchRequest(appURI,false);
      setTimeout(checkLaunchRequest, 2000, req, successCB, errorCB);
    } else {
      console.log("applauncher: invalid/unknown appURI " + appURI);
      if (typeof errorCB === "function") {
        errorCB("Unknown appURI - " + appURI);
      }
    }
  };
  
  /**
   * Determine whether an app is available.
   * 
   * [not yet implemented.]
   */
  WebinosAppLauncherModule.prototype.appInstalled = function (appURI, successCB, errorCB){
    console.log("appInstalled was invoked. AppID: " + appURI);

    if (typeof appURI === "undefined" || !appURI) {
      errorCB("invalid appURI parameter");
    } else {    
      var foundApp = findInstalledApp(appURI);      
      successCB(typeof foundApp != "undefined");
    }
  };
  
  exports.Service = WebinosAppLauncherModule;
})();
