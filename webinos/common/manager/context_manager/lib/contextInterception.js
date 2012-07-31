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
if (typeof webinos === 'undefined') {
  webinos = {};
  console.log("webinos not found");
}
if (typeof webinos.context === 'undefined')
  webinos.context = {};

//console.log("CONTEXT MANAGER LOADED");
var webinos_ = require('webinos')(__dirname);

var path = require('path');
var moduleRoot = path.resolve(__dirname, '../') + '/';

require(moduleRoot +'/lib/AsciiArt.js')

var commonPaths = require(moduleRoot + '/lib/commonPaths.js');
if (commonPaths.storage === null){
  console.log('[ERROR] User Storage Path not found.\nContext Manager disabled.', 'yellow+black_bg');
}
else
{
  require(moduleRoot + '/lib/storageCheck.js')(commonPaths, require(moduleRoot + '/data/storage.json'));

  if (!require(commonPaths.storage + '/settings.json').contextEnabled){
    console.log("CONTEXT MANAGER DISABLED");
  }else{
    console.log("CONTEXT MANAGER ENABLED");

//    var  sessionPzp =  webinos_.global.require(webinos_.global.pzp.location, 'lib/pzp').session;


//  This class represents the context objects that will be logged
    webinos.context.ContextData = function(method, params, results) {
      this.timestamp = new Date();
      var methodItm ={};

      methodItm.api = method.substring(0,method.indexOf("@"));
      methodItm.hash = method.substring(method.indexOf("@")+1,method.substring(method.indexOf("@")).indexOf(".")+ method.indexOf("@"));
      methodItm.method = method.substring(method.lastIndexOf(".")+1);
      this.call = methodItm;
      this.params = params;
      this.results = results;
    };

    var listeners = {};
    listeners.id = {};
    listeners.fromObjectRef = {};

    _RPCHandler.prototype.context_handleMessage = _RPCHandler.prototype.handleMessage;
    /*
     * handleMessage = function (message, from, msgid)
     */
    _RPCHandler.prototype.handleMessage = function(){
      if (arguments[0].jsonrpc) {
        var message = arguments[0];
        if (message.fromObjectRef){
          if (typeof listeners.fromObjectRef[message.fromObjectRef] == "object") 
            console.log("######## fromObjectRef: " + message.fromObjectRef + " already inuse. Replacing existing one.");
          listeners.fromObjectRef[message.fromObjectRef] = message;
        }else{
          if (typeof listeners.id[message.id] == "object") 
            console.log("######## id: " + message.id + " already inuse. Replacing existing one.");
          listeners.id[message.id] = message;
        }
      }
      this.context_handleMessage.apply(this, arguments)
    }
    _RPCHandler.prototype.context_executeRPC = _RPCHandler.prototype.executeRPC;
    /*
     * executeRPC = function (rpc, callback, errorCB, from, msgid)
     */
    _RPCHandler.prototype.executeRPC = function(){
      if (arguments[0].jsonrpc) {
        var message;
        var res = arguments[0];
        var patt = /^(\d+)\.[\S]+$/i;
        var fromObjectRef = patt.exec(res.method);
        if (fromObjectRef !== null){
          fromObjectRef = fromObjectRef[1];
          message = listeners.fromObjectRef[fromObjectRef];
          if (!res.result) res.result = res.params;
        }else{
          message = listeners.id[res.id];
          delete listeners.id[res.id];
        }
        if (message == undefined){
          console.log("WARNING: Check rpc response. Not in expected format.", 'yellow+black_bg');
        }else{
          webinos.context.logContext(message, res);
        }
      }
      this.context_executeRPC.apply(this, arguments)
    }

//  Require the database class
    var databasehelper = require('JSORMDB');

//  Initialize helper classes
    var dbpath = path.resolve(commonPaths.storage + '/pzp/log.json');
    require(moduleRoot + '/lib/contextExtraction.js');

    var registeredListeners = [];

      var current = null;

//  Open the database

    webinos.context.database = new databasehelper.JSONDatabase({path : dbpath,transactional : false});
    console.log("Log DB Initialized");

    function saveContextData(_dataInLog, _dataIn)
    {
      
      var pmlib = webinos_.global.require(webinos_.global.manager.policy_manager.location, 'lib/policymanager.js'), policyManager, exec = require('child_process').exec;
      policyManager = new pmlib.policyManager();

      var res, request = {}, subjectInfo = {}, resourceInfo = {};

      subjectInfo.userId = "user1";
      request.subjectInfo = subjectInfo;

      resourceInfo.apiFeature = "http://webinos.org/api/context.store";
      request.resourceInfo = resourceInfo;

      res = policyManager.enforceRequest(request);

      switch (res)
      {
        case 0:
          webinos.context.database.insert([_dataInLog]);
          console.log(" Context Data Saved");
          webinos.context.saveContext(_dataIn);
          break;

        case 1:
          console.log(" ACCESS DENIED: Context Data not saved");
          break;

        case 2:
        case 3:
        case 4:
          exec("xmessage -buttons allow,deny -print 'Access request to " + resourceInfo.apiFeature + "'",
              function(error, stdout, stderr)
              {
            if (stdout == "allow\n")
            {
              webinos.context.database.insert([_dataInLog]);
              console.log(" Context Data Saved");
              webinos.context.saveContext(_dataIn);
            }
            else
            {
              console.log(" ACCESS DENIED: Context Data not saved");
            }
              });
          break;

        default:
          console.log(" ACCESS DENIED: Context Data not saved");
      }
    }

    webinos.context.logContext = function(myObj, res) {
      if (!res['result']) res['result']={};
         if (current==null){
             current = {};
             current.Pzp = getPzp();
             current.PzpId = getPzpId();
             current.PzhId = getPzhId();
         }
//        if (sessionPzp == undefined) sessionPzp =  webinos_.global.require(webinos_.global.pzp.location, 'lib/pzp').session;
//
//        var t1 = getPzp();
//        var t2 = getPzpId();
//        var t3 = getPzhId();

      // Create the data object to log
      var myData = new webinos.context.ContextData(myObj['method'],myObj['params'], res['result']);

      var dataIn = {timestamp:myData.timestamp, api: myData.call.api, hash: myData.call.hash, method: myData.call.method, params:myData.params, result:myData.results};
      var dataInLog = {timestamp:myData.timestamp, api: myData.call.api, hash: myData.call.hash, method: myData.call.method, session: current.PzpId};


      //Don't log Context API calls
      if (!(myData.call.api =='http://webinos.org/api/context'))
      {
        saveContextData(dataInLog, dataIn);
//      webinos.context.database.insert([dataInLog]);
//      console.log(" Context Data Saved");
//      webinos.context.saveContext(dataIn);
      }
    };

    webinos.context.logListener = function(myObj){
      // Create the data object to log
      var myData = new webinos.context.ContextData(myObj['method'],myObj['params'], '');

      var dataIn = {timestamp:myData.timestamp, api: myData.call.api, hash: myData.call.hash, method: myData.call.method, params:myData.params, result:myData.results};


      if (myData.call.api && !(myData.call.api =='http://webinos.org/api/context'))
      {
        regListener = {};
        regListener.dataIn = dataIn;
        regListener.ObjectRef = myObj.fromObjectRef;

        registeredListeners[registeredListeners.length] = regListener;

        //Don't log Context API calls
        saveContextData(dataIn, dataIn);
//      webinos.context.database.insert([dataIn]);
//      console.log(" Context Data Saved");
//      webinos.context.saveContext(dataIn);
      }
    }


    /*
webinos.context.find = function(findwhat, success,fail){
  var where = {field: "method", compare: "equals", value: "onchannelchangeeventhandler"};
  var fields = {params: true};
  var query = {where: where, fields: fields};
  var results =  webinos.context.database.query(query);
  var output ={};
  results.forEach(function(element, index, array){
    console.log(element);
    if (output[element.params.name] == null) output[element.params.name] = 1;
    else output[element.params.name] +=1;
  });
  success(output);
  console.log("closing up");

};
     */
  }
}
