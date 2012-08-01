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

//console.log("CONTEXT contextDBpzhManager.js LOADED");

  var path = require('path');
  var moduleRoot = path.resolve(__dirname, '../') + '/';
  var webinos_ = require('webinos')(__dirname);

  require('./AsciiArt')

  var commonPaths = require('./commonPaths');
  if (commonPaths.storage === null){
    console.log('[ERROR] User Storage Path not found.\nContext Manager disabled.', 'yellow+black_bg');
    return;
  }
  require('./storageCheck.js')(commonPaths, require(moduleRoot + '/data/storage.json'));


  var ServiceDiscovery = webinos_.global.require(webinos_.global.api.service_discovery.location).ServiceDiscovery;;

  var webinosServiceDiscovery = null;

  var sqlite3 = require('sqlite3').verbose();

  var dbpath = path.resolve(commonPaths.storage + '/pzh/contextDB.db');

  var db =  new sqlite3.Database(dbpath);


  ////////////////////////////////////////////////////////////////////////////////////////
  //Running on the PZH
  //////////////////////////////////////////////////////////////////////////////////////
  exports.insert = function(contextData, success, fail) {
    saveToDB(contextData, function(){
      console.log("Successfully commited " + contextData.length + " Context Objects to the context DB on the PZH");
      //success();
    },function(){
      console.log("Error commiting Context Objects to the PZH");
      //fail();
    });
  }
  saveToDB = function(contextData, success, fail) {
    var inContextRAW = db.prepare("INSERT INTO tblcontextraw (fldAPI, fldDevice, fldApplication, fldSession, fldContextObject, fldMethod, fldTimestamp) VALUES (?,?,?,?,?,?,?)");
    var contextItem = {};
    for (contextItemID=0; contextItemID < contextData.length; contextItemID++) {
      var that=this;
      var contextItem = contextData[contextItemID];
      inContextRAW.run(contextItem.API, contextItem.device, contextItem.application, contextItem.session, contextItem.contextObject, contextItem.method, contextItem.timestamp, function(err1) {
        if (err1){ 
          throw err1;
          fail();  
        }

        var fldcontextrawID = this.lastID;
        var incontextrawvalues = db.prepare("INSERT INTO tblcontextrawvalues (fldContextRAWID,fldObjectRef,fldIsObject,fldValueTypeID, fldValueName, fldValueType, fldValue) VALUES (?,?,?,?,?,?,?)");
        for (inputID=0; inputID < contextItem.paramstolog.length; inputID++) {
          var input = contextItem.paramstolog[inputID];
          incontextrawvalues.run(fldcontextrawID, input.ObjectRef, input.IsObject, 1, input.objectName, input.type, input.value, function(err) {
            if (err) {
              throw err;
              fail(); 
            }
          });
        }
        for (outputID=0; outputID < contextItem.resultstolog.length; outputID++) {
          var output = contextItem.resultstolog[outputID];
          incontextrawvalues.run(fldcontextrawID, output.ObjectRef, output.IsObject, 2, output.objectName, output.type, output.value, function(err) {
            if (err) {
              throw err;
              fail();
            }
          });
        }
      });
    }
    success();
  }
  exports.getrawview = function(success,fail){
    var result = {msg:null,data:[]};
    db.each(
        "SELECT fldcontextrawID AS ContextRawID,  " +
        "fldcontextrawvalueID AS ContextRawValueID,  fldAPI AS API, fldDevice AS Device, fldApplication AS Application, " +
        "fldSession AS Session, fldContextObject AS ContextObject, fldMethod AS Method, fldTimestamp AS Timestamp, " +
        "fldDescription AS ValueType, fldValueName AS ValueName, fldValueType AS ValueType, fldValue AS Value FROM vwcontextraw", 
        function (err,row){
          result.data[result.data.length] = row;
        },
        function(err){
          if (err !== null) {
            result.msg = {code:err.code,msg:err.message};
          }
          success(result);
        }
    );
  }
  exports.query = function(data, callback){
    require('./contextQueryDB')(db, data, callback);
  }
})();
