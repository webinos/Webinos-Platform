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

var databasehelper = require('JSORMDB');

//Initialize helper classes

var Fs = require('fs');
var path = require('path');
var moduleRoot = path.resolve(__dirname, '../') + '/';
var webinos_ = require('webinos')(__dirname);

var vocdbpath = path.resolve(moduleRoot +'/data/contextVocabulary.json');
webinos.context.DB = require('./contextDBManagerPZP')

//var sessionPzp =   webinos_.global.require(webinos_.global.pzp.location, 'lib/pzp').session;
    var current = null;
webinos.context.saveContext = function(dataIn, success, fail) {
    if (current==null){
        current = {};
        current.Pzp = getPzp();
        current.PzpId = getPzpId();
        current.PzhId = getPzhId();
    }
  var contextVocJSON = JSON.parse(Fs.readFileSync(vocdbpath, 'utf-8'));
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
      data.type = myTypeOf(callList);
      arrayToFill[arrayToFill.length] = data;
    }
    //Case if results is an unnamed array
    else if(callList.length  && vocList.length == 1 && vocList[0].type == "array" && vocList[0].objectName == ""){ //Is Array
      var data = {};
      data.objectName = "";//"array";
      data.ObjectRef = objRef;
      data.IsObject = true;
      data.value = objRef + ".";
      data.type = myTypeOf(callList);
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
                //Case
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
                  data.type = myTypeOf(callList[callItem]);
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
                  data.type = myTypeOf(callList[callItem]);
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
  //Find API
  for(APIIndex in contextVocJSON){
    if(contextVocJSON[APIIndex].URI == dataIn.api){
      API = contextVocJSON[APIIndex]      
      //API found

      //Look for Context Objects with the method
      for(cObjectIndex in API.ContextObjects){
        cObject = API.ContextObjects[cObjectIndex];
        methods = API.ContextObjects[cObjectIndex].methods;

        for(methodIndex in methods){
          if(methods[methodIndex].objectName == dataIn.method){
            method = methods[methodIndex];
            if (method.inputs){
              inputs = method.inputs;
              expectedInputsLength = inputs.length;
              inputsCount = 0;
              for (inputIndex in inputs){
                for(paramName in dataIn.params){

                  if (inputs[inputIndex].objectName == paramName){
                    inputsCount++;
                    break;
                  }
                  else if(inputs[inputIndex].required === false ){
                    inputsCount++;
                    break;
                  }
                }
              }
              //Found our method!
              if (expectedInputsLength == inputsCount){

                contextItem.API = API.APIname;
                contextItem.device = {}; 
                contextItem.application = {};
                contextItem.session = current.PzpId;
                contextItem.contextObject = cObject.objectName;
                contextItem.method = method.objectName;
                contextItem.timestamp = new Date().getTime();
                findObjectsToStore(method.inputs,dataIn.params, contextItem.paramstolog);
                findObjectsToStore(method.outputs,dataIn.result,contextItem.resultstolog);


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
                var contextData = [];
                contextData[0] = contextItem;
                webinos.context.DB.handleContextData(contextData)
                //console.log("Context data saved to Context DB");
                break;
              }

            }
            else{
              contextItem.API = API.APIname;
              contextItem.device = {}; 
              contextItem.application = {};
              contextItem.session = current.PzpId;
              contextItem.contextObject = cObject.objectName;
              contextItem.method = method.objectName;
              contextItem.timestamp = new Date().getTime();
              contextItem.paramstolog = [];
              findObjectsToStore(method.outputs,dataIn.result,contextItem.resultstolog);


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
              break;
            }
          }
        }
      }
    }
  }
}
