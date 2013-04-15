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
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

this.Dimension = (function() {
  function Dimension(width, height) {
    this.width = width;
    this.height = height;
  }
  return Dimension;
})();

this.Config = (function() {

  /* private static variables */
  var currentConfig;

  var supported = {
    encodings: [
      'utf-8',
      'iso-8859-1'
    ],
    startfileTypes: [
      'text/html',
      'text/plain',
      'application/xhtml+xml'
    ],
    iconTypes: [
      'image/png',
      'image/gif',
      'image/jpeg'
    ],
    viewModes: [
      WidgetConfig.MODE_MAXIMIZED,
      WidgetConfig.MODE_FLOATING,
      WidgetConfig.MODE_MINIMIZED,
      WidgetConfig.MODE_FULL_SCREEN
    ]
  };
  
  /* FIXME: remove nasty hack */
  var wrtHome;
	if(process.platform == 'android')
	  wrtHome = '/data/data/org.webinos.app/node_modules/webinos/wp4/webinos/web_root/apps/wrt';
  else if (process.platform == 'win32' || process.platform == 'linux' || process.platform == 'darwin') {
		var path = require('path');
		var webinos = require("find-dependencies")(__dirname);
        var pzp_sessionHandling = webinos.global.require(webinos.global.pzp.location, "lib/pzp_sessionHandling.js");
		wrtHome = path.join(pzp_sessionHandling.getWebinosPath(),'wrt/widgetStore');
	} else {
    wrtHome = process.env.WRT_HOME;
    if (!wrtHome)
		  throw new Error('widgetmanager.Config: FATAL ERROR: WRT_HOME not configured');
  }

  /* public constructor */
  function Config(args) {
    
    /* public instance variables */
    this.capabilities        = supported;
    this.iconSize            = new Dimension(128, 128);
    this.w3cTestMode         = false;
    this.locales             = ['en'];
    this.certificateMgr      = CertificateManager.get();
    this.processSignatures   = true;
    this.processPolicy       = true;
    this.processOCSP         = true;
    this.authorIdentityCheck = true;
    this.wrtHome             = wrtHome;
  }

  /* public static variables */
  Config.defaultConfig = new Config();

  /* public static functions */
  Config.set = function(config) {
    currentConfig = config;
  };

  Config.get = function() {
    if(!currentConfig)
      currentConfig = Config.defaultConfig;
    return currentConfig;
  };

  return Config;
})();
