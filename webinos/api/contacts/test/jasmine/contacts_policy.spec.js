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
* Copyright 2011 ISMB
*******************************************************************************/

var contactsModule = require("../../lib/contacts_module.js");
var param = [];
param[0] = {};


describe("test policy manager deny", function() {    
   
    param[0]['type'] = 'local';	
    param[0]['addressBookName'] = "../thunderbird_contacts_test/testAddressBook/abook.mab";	 	 	         
    
    it("attempt to generate ContactError by denying access", function() {
      
      setPolicyToDeny();
      
      waits(1000);	
      
      runs(function(){
	contactsModule.authenticate(param, function(authenticated){	 	
	    expect(authenticated).toEqual(false);
	});

      });
    });
    
    afterEach(function(){setPolicyBack();});
});


function setPolicyToDeny(){  
  
  var path = require('path'),
      policyXmlPath = (path.resolve(__dirname)) + "/policy.xml",
      fs = require('fs');
      
  fs.readFile(policyXmlPath, function(err, data) {
      if(err)
	console.log("unable to read " + err);
      
      var newPolicy = data.toString().replace('http://www.w3.org/ns/api-perms/contacts.read','testingPolicyManager');
      
      fs.writeFile(policyXmlPath, newPolicy, function(err) {
	  if(err)
	    console.log("unable to write " + err);
	  else
	    console.log("setPolicyToDeny: DONE!");
      }); 
  });  
}


function setPolicyBack(){  
  
  var path = require('path'),
      policyXmlPath = (path.resolve(__dirname)) + "/policy.xml",
      fs = require('fs');
      
  fs.readFile(policyXmlPath, function(err, data) {  
      if(err)
	console.log("unable to read " + err);
      
      var newPolicy = data.toString().replace('testingPolicyManager', 'http://www.w3.org/ns/api-perms/contacts.read');
      
      fs.writeFile(policyXmlPath, newPolicy, function(err) {
	  if(err)
	    console.log("unable to write " + err);
	  else
	    console.log("setPolicyBack: DONE!");
      }); 
  });  
}