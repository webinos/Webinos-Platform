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
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/
/**
 * @description: returns root path of .webinos folder. In this folder all information is stored.
 */

var os = require('os');
var path = require('path');

exports.webinosPath = function() {
  "use strict";
  var webinosDemo;
  switch(os.type().toLowerCase()){
    case "windows_nt":
      webinosDemo = path.resolve(process.env.appdata + "/webinos/");
      break;
    case "linux":
      switch(os.platform().toLowerCase()){
        case "android":
          webinosDemo = path.resolve(process.env.EXTERNAL_STORAGE + "/.webinos/");
          break;
        case "linux":
          webinosDemo = path.resolve(process.env.HOME + "/.webinos/");
          break;
      }
      break;
    case "darwin":
      webinosDemo = path.resolve(process.env.HOME + "/.webinos/");
      break;
  }
  return webinosDemo;
};
