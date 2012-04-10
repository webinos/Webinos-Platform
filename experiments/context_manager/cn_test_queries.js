var path = require('path');
var util = require('util');
var commonPaths = require(path.resolve(__dirname, '../../webinos/common/manager/context_manager/') + '/lib/commonPaths.js');
commonPaths.localTest = path.resolve(__dirname) + '/';
var sqlite3 = require(commonPaths.local + '/node_modules/node-sqlite3').verbose();

var dbpath = path.resolve(commonPaths.storage + '/pzh/contextDB.db');
var appvocpath = path.resolve(commonPaths.storage + '/pzp/appContextVocabulary.json');

var db =  new sqlite3.Database(dbpath);

var appContext = require(commonPaths.local + '/lib/appContext.js')
//var contextObject ={};
//webinos.context.app.getContextObjectVoc('HeartRate', 'biodata', function(contextObject){
  //console.log(JSON.stringify(contextObject));  
//});

var data = {
         "distance" : {type:"number"},
         "heartBeatNumber" : {type:"number"},
         "heartbeat" : {type:"number"},
         "speed" : {type:"number"},
         "strides" : {type:"number"}
};

webinos.context.app.registerContextObject('HeartRate', 'MyPulses', data);

//webinos.context.app.saveAppContext("HeartRate","MyPulse", pulse);