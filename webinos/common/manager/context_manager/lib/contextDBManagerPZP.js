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
* Copyright 2012 EPU-National Technical University of Athens
******************************************************************************/
(function() {
  if (typeof webinos === 'undefined') {
    webinos = {};
    console.log("webinos not found");
  }
  if (typeof webinos.context === 'undefined')
    webinos.context = {};

//console.log("CONTEXT contextDBManagerPZP.js LOADED");

  var path = require('path');
  var moduleRoot = path.resolve(__dirname, '../') + '/';
  var webinos_ = require('webinos')(__dirname);

  require('./AsciiArt')

  var commonPaths = require('./commonPaths');
  if (commonPaths.storage === null){
    console.log('[ERROR] User Storage Path not found.\nContext Manager disabled.', 'yellow+black_bg');
    return;
  }
  require('./storageCheck')(commonPaths, require(moduleRoot + '/data/storage.json'));


  var ServiceDiscovery =  webinos_.global.require(webinos_.global.wrt.location, 'lib/webinos.servicedisco').ServiceDiscovery;
  var webinosServiceDiscovery = null;


  var bufferpath = path.resolve(commonPaths.storage + '/pzp/contextDBbuffer.json');

  var databasehelper = require('JSORMDB');
  bufferDB = new databasehelper.JSONDatabase({path : bufferpath, transactional : false});

//  sessionPzp =   webinos_.global.require(webinos_.global.pzp.location, 'lib/pzp').session;

  var sessionInstance =null;

    var current = null;

  ////////////////////////////////////////////////////////////////////////////////////////
  //Running on the PZP
  //////////////////////////////////////////////////////////////////////////////////////
  exports.handleContextData = function(contextData){
      if (current==null){
          current = {};
          current.Pzp = getPzp();
          current.PzpId = getPzpId();
          current.PzhId = getPzhId();
      }

    var connectedPzh = current.PzhId;
    if (connectedPzh == "null" || connectedPzh == "undefined"){
      bufferDB.insert(contextData)
      console.log("Successfully commited Context Object to the context buffer");
    }else{
      if (sessionInstance === null){
        sessionInstance = current.Pzp;
        webinosServiceDiscovery = new ServiceDiscovery(sessionInstance.rpcHandler);
      }
      bufferDB.db.load();
      bufferDB.insert(contextData);
      var data = bufferDB.query();

      var contextService = [];
      var service = webinosServiceDiscovery.findServices(new ServiceType('http://webinos.org/api/context'), {onFound:function(service) {
        var pzhService = null;
        util= require('util');
        //console.log(util.inspect(service, false, null), 'white+red_bg');
        if (service.serviceAddress == connectedPzh){

          service.bindService({onBind:function(service) {
            console.log("Service Bound", 'white+red_bg');
            var query = {};
            query.type = "DB-insert";
            query.data = data;
            //message.write(query, connectedPzh, 0);
            var query = {};
            query.type = "DB-insert";
            query.data = data;

            service.executeQuery(query);
            bufferDB.db.clear();
            bufferDB.commit();

          }
          });
      }
      }});
    }
    //success(true);
  }


})();
