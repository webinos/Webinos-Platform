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
if (typeof webinos.context.app === 'undefined')
  webinos.context.app = {};

var path = require('path');
var moduleRoot = path.resolve(__dirname, '../') + '/';

require('./AsciiArt');

var commonPaths = require('./commonPaths');
if (commonPaths.storage === null){
  console.log('[ERROR] User Storage Path not found.\nContext Manager disabled.', 'yellow+black_bg');
}
else
{

if (commonPaths.storage === null) {
   console.log('[ERROR] User Storage Path not found.\nContext Manager disabled.', 'yellow+black_bg');
}

require('./storageCheck')(commonPaths, require(moduleRoot + '/data/storage.json'));

var databasehelper = require('JSORMDB');
var appVocDBpath = path.resolve(commonPaths.storage + '/pzp/appContextVocabulary.json');

webinos.context.app.appVocDB = new databasehelper.JSONDatabase({path : appVocDBpath,transactional : false});
console.log("Log DB Initialized in AppContext");

//Method to insert a new field and/or Application Context Object
//Example:
/*
"NameOfObjectToSave" : {
  type: "object",
  values:{
         "NameOfFieldToSave1" : {type:"number"},
         "NameOfFieldToSave2" : {type:"number"},
         "NameOfFieldToSave3" : {type:"number"},
         "NameOfFieldToSave4" : {type:"number"},
         "NameOfFieldToSave5" : {type:"number"},
      }
}
 */

//Example for Heart Demo
/*
 "pulse" : {
  type: "object",
  values:{
         "distance" : {type:"number"},
         "heartBeatNumber" : {type:"number"},
         "heartbeat" : {type:"number"},
         "speed" : {type:"number"},
         "strides" : {type:"number"}
      }
}
 */
webinos.context.app.registerContextObject = function(APPName, ContextObjectName, ContextFields, callback) {
  //Check if Object Exists

  var addFields = function (fields){
    var values =[];
    var fieldCount = 0;
    for (fieldName in fields){
      field = fields[fieldName];
      if (field.type =="object"){ //Case if Object
        values.push ({"objectName": fieldName, "type": fields[fieldName].type,"values":addFields(fields[fieldName].values), "logged": "true"});
      }
      else{ //Case if single value
        values.push ({"objectName": fieldName, "type": fields[fieldName].type, "logged": "true"});
      }
    }
    return values;
  };

  var cObject =[];
  cObject.APPname = APPName;
  cObject.ContextObjectName = ContextObjectName;
  cObject.outputs = addFields(ContextFields);


  webinos.context.app.getContextObjectVoc(APPName, ContextObjectName, function(retObject){    
    if(retObject){
      webinos.context.app.replaceContextObject(cObject, function(success){
        console.log("Replaced Context Object " + cObject.ContextObjectName + " in application context vocabulary.");
        callback({success:true, msg:"Replaced Context Object " + cObject.ContextObjectName + " of Application " + APPName + "  in Application Context Vocabulary"});
      });      
    }
    else {
      webinos.context.app.addContextObject(cObject, function(success){
        console.log("New Application Context Object added!");
        callback({success:true, msg:"Created new Context Object " + cObject.ContextObjectName + " of Application " + APPName + "  in Application Context Vocabulary"});
      }); 
    }
  });
}

//Method to get an Application context Object 
webinos.context.app.getContextObjectVoc = function(appName, contextObjectName, callback) {
  //webinos.context.app.appVocDB 

  var where = {join: "and" , terms:[
                                    {field: "APPname", compare: "equals", value: appName},
                                    {field: "ContextObjectName", compare: "equals", value: contextObjectName}
                                    ]
  };
  var fields = {APPname:true,ContextObjectName: true, fields: true};
  var query = {where: where, fields: fields};
  callback(webinos.context.app.appVocDB.query(query)[0]);
}

webinos.context.app.addContextObject = function(contextObject, callback) {
  webinos.context.app.appVocDB.insert([contextObject]);
  callback(true);
}
webinos.context.app.replaceContextObject = function(contextObject, callback) {
  var where = {join: "and" , terms:[
                                    {field: "APPname", compare: "equals", value: contextObject.APPname},
                                    {field: "ContextObjectName", compare: "equals", value: contextObject.ContextObjectName}
                                    ]
  };
  var fields = {APPname:true,ContextObjectName: true, fields: true};
  var query = {where: where, fields: fields};
  webinos.context.app.appVocDB.remove(query)
  webinos.context.app.appVocDB.insert([contextObject]);

  callback(true);
}



//Format of dataIn
//dataIn = {timestamp:myData.timestamp, api: myData.call.api, hash: myData.call.hash, method: myData.call.method, params:myData.params, result:myData.results};
//DATA = {}

webinos.context.saveAppContext = function(APPName, ContextObjectName, data, callback) {
  
  var dataIn = {timestamp:new Date().getTime(), api: "ContextAPI", hash: "", method: "saveAppContext", params:"", result:data};


  var contextVocJSON = JSON.parse(Fs.readFileSync(appVocDBpath, 'utf-8'));
  var contextItem = {};
  contextItem.API = {};
  contextItem.device = {}; 
  contextItem.application = {};
  contextItem.session = {};
  contextItem.contextObject = {};
  contextItem.method = {};
  contextItem.timestamp = {};
  contextItem.paramstolog = [];
  contextItem.resultstolog = [];

  var myTypeOf = function(input){
    return (input instanceof Array)?"array":((input===null)?"null":(typeof input));
  }

  var findObjectsToStore = function(vocList, callList, arrayToFill,objRef){
    if(objRef == undefined){
      objRef = "0";
    }
    //Case if the result is a single unnamed value
    if (vocList.length && vocList.length == 1 && typeof(vocList[0].objectName) != "undefined" && vocList[0].objectName == "" && (typeof callList === vocList[0].type)){
      var data = {};
      data.objectName = "";
      data.ObjectRef=objRef;
      data.IsObject = false;
      data.value = callList;
      data.type = vocList[0].type;
      arrayToFill[arrayToFill.length] = data;
    }
    //Case if results is an unnamed array
    else if(callList.length  && vocList.length == 1 && vocList[0].type == "array" && vocList[0].objectName == ""){ //Is Array
      var data = {};
      data.objectName = "";//"array";
      data.ObjectRef = objRef;
      data.IsObject = true;
      data.value = objRef + ".";
      data.type = vocList[0].type;
      arrayToFill[arrayToFill.length] = data;
      for (var arID=0; arID < callList.length; arID++){        
        findObjectsToStore(vocList[0].values, callList[arID],arrayToFill, data.value + arID);
      }
    }
    else{
      for (var callItem in callList){
        if(callList.hasOwnProperty(callItem)){
          for (var vocItem in vocList){
            if(vocList.hasOwnProperty(vocItem)){
              if (callItem == vocList[vocItem].objectName && vocList[vocItem].logged == true){
                if(vocList[vocItem].type == "object"){
                  findObjectsToStore(vocList[vocItem].values, callList[callItem],arrayToFill);
                  break;
                }
                //Case if the Object is an array.
                else if(vocList[vocItem].type == "array" && vocList[vocItem].logged == true){
                  var tmpObjRef = "";
                  if(objRef == ""){
                    tmpObjRef = objRef + "." + arID;
                  }
                  else{
                    tmpObjRef = arID;
                  }
                  var data = {};
                  data.objectName = callItem;
                  data.ObjectRef = objRef;
                  data.IsObject = true;
                  data.value = objRef + ".";
                  data.type = vocList[vocItem].type;
                  arrayToFill[arrayToFill.length] = data;
                  for (var arID=0; arID < callList[callItem].length; arID++){
                    findObjectsToStore(vocList[vocItem].values, callList[callItem][arID],arrayToFill,data.value + arID);
                  }
                  break;            
                }
                else{
                  var data = {};
                  data.objectName = callItem;
                  data.ObjectRef=objRef;
                  data.IsObject = false;
                  data.value = callList[callItem];
                  data.type = vocList[vocItem].type;
                  arrayToFill[arrayToFill.length] = data;
                  break;
                }
              }
            }
          }
        }
      }
    }
  }
  //Find and return APP and ContextObject
  
  webinos.context.app.getContextObjectVoc(APPName, ContextObjectName, function(vocObject){  
    if(vocObject){
      contextItem.API = dataIn.api;
      contextItem.device = {}; 
      contextItem.application = APPName;
      contextItem.session = sessionPzp.getPzpId();
      contextItem.contextObject = ContextObjectName;
      contextItem.method = dataIn.method;
      contextItem.timestamp = dataIn.timestamp;
      contextItem.paramstolog = [];
      findObjectsToStore(vocObject.outputs,dataIn.result,contextItem.resultstolog);


      console.log("Context Object found!");
      console.log("API : " + contextItem.API );
      console.log("Method : " + contextItem.method);
      console.log("Session : " + contextItem.session);
      
      console.log("Timestamp : " + contextItem.timestamp);
      console.log("Context Object : " + contextItem.contextObject);


      console.log("Params to store in Context DB:");
      console.log(contextItem.paramstolog);
      console.log("Outputs to store in Context DB:");
      console.log(contextItem.resultstolog);
      contextData[0] = contextItem;
      webinos.context.DB.handleContextData(contextData)
    }
    else {
      console.log("Context Object " + ContextObjectName + " of Application " + APPName + " was NOT found on the Application Context Vocabulary.");
      callback({success:false, msg:"Context Object " + ContextObjectName + " of Application " + APPName + " was NOT found on the Application Context Vocabulary."});
    }
  }); 
  
}

}
