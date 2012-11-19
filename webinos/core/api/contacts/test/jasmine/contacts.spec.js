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

var timeout = 1000;


describe("test contacts_module, local", function() {
  
    beforeEach(function(){
	 param[0]['type'] = 'local';	
	 param[0]['addressBookName'] = "../thunderbird_contacts_test/testAddressBook/abook.mab";
    });
    
    it("contacts_module<local>,test if W3C Contacts Module asks for path to a valid mab file if addressed platform it's not Android", function() {
	if(process.plarform !== "android"){
	  param[0]['addressBookName'] = "";
	
	  contactsModule.isAlreadyAuthenticated(param, function(isOpen){
	    expect(isOpen).toEqual(false);
	  });
	  
	  contactsModule.authenticate(param, function(authenticated){
	    expect(authenticated).toEqual(false);
	  });	
	}
	//else TODO: howTo check on android?
    });    
    
    it("contacts_module<local>, check if local contacts address book is loaded", function() {               	
	contactsModule.isAlreadyAuthenticated(param, function(isOpen){
	  expect(isOpen).toEqual(false);
	});
	  
	contactsModule.authenticate(param, function(authenticated){
	  expect(authenticated).toEqual(true);
	});
	
	contactsModule.isAlreadyAuthenticated(param, function(isOpen){
	  expect(isOpen).toEqual(true);
	});
    });
    
    it("contacts_module<local>, test if fields of the contacts structure are filled in", function() {       		 	
        contactsModule.getAllContacts(param, function(contacts){ 
	    expect(contacts).not.toBeNull();
 	    expect(contacts.length).toEqual(3);
	    //TODO: check fields != undefined
	});
    });
    
    describe("check if retrieved contacts is formed as expected", function() {
      
	it("check if returned contact fields are W3C compliant", function() {       		 	
	    contactsModule.getAllContacts(param, function(contacts){ 
		expect(contacts).not.toBeNull();	    
	    
		if(contacts !== undefined){
		    for(var i=0;i<contacts.length;i++){
			expect(contacts[i].id).not.toBeUndefined();
			expect(contacts[i].displayName).not.toBeUndefined();
			expect(contacts[i].name).not.toBeUndefined();
			expect(contacts[i].nickname).not.toBeUndefined();
			expect(contacts[i].phoneNumbers).not.toBeUndefined();
			expect(contacts[i].emails).not.toBeUndefined();
			expect(contacts[i].addresses).not.toBeUndefined();
			expect(contacts[i].ims).not.toBeUndefined();
			expect(contacts[i].organizations).not.toBeUndefined();
			expect(contacts[i].revision).not.toBeUndefined();
			expect(contacts[i].birthday).not.toBeUndefined();
			expect(contacts[i].gender).not.toBeUndefined();
			expect(contacts[i].note).not.toBeUndefined();
			expect(contacts[i].photos).not.toBeUndefined();
			expect(contacts[i].categories).not.toBeUndefined();
			expect(contacts[i].urls).not.toBeUndefined();
			expect(contacts[i].timezone).not.toBeUndefined();						
		    }
		}	    
	    });
	});      
    });                        
});



describe("test contacts_module, remote", function() {   
  
    var fakeAuth, contactsObj;
  
    beforeEach(function(){
	param[0]['type'] = 'remote';       
	param[0]['usr']  = '';
	param[0]['pwd']  = '';  
	fakeAuth = "";
	contactsObj = "";
    });
    
    it("contacts_module<remote>, check if W3C Contacts Module fails to authenticate against Google if username and password are missing or wrong", function() {             
	param[0]['type'] = 'remote';  
      	param[0]['usr'] = "";
	param[0]['pwd'] = "";  		
              	
	contactsModule.isAlreadyAuthenticated(param, function(isOpen){
 	  expect(isOpen).toEqual(false);
	});

	contactsModule.authenticate(param, function(authenticated){	  	  	  
	  fakeAuth = authenticated;	//expected to never be called: Google won't answer
	});	
    
	waits(timeout);
	
	runs(function(){ 
	  expect(fakeAuth).toEqual("");	  	  
	});
    });
    
    
    
    //if google_contacts.js isn't new version
    it("contacts_module<remote>, check if policy manager is invoked before authenticating", function() {		
      
	runs(function(){
	    contactsModule.isAlreadyAuthenticated(param, function(isOpen){
		expect(isOpen).toBeFalsy();
	    });		 
	    
	    contactsModule.getAllContacts(param, function(contacts){		    
	      contactsObj = contacts;
	    });
	  
	    waits(timeout);
	  
	    runs(function(){	      
	      expect(contactsObj).toEqual(false);	      
	    });	    
	    
	    function waitsForContacts() {
	      return contactsObj != "";
	    }
	});
    });

  
    
    
    
    it("contacts_module<remote>, check if W3C Contacts Module authenticates against Google", function() {                     	
	contactsModule.isAlreadyAuthenticated(param, function(isOpen){
 	  expect(isOpen).toEqual(false);
	});		

	contactsModule.authenticate(param, function(authenticated){
	  fakeAuth = authenticated;	//expected to never be called: Google won't answer
	});
	
	waits(timeout);
	
	runs(function(){ 
	  expect(fakeAuth).not.toEqual("");
	  expect(fakeAuth).toBeTruthy();
	})
    });
	
    it("contacts_module<remote>, test if fields of the contacts structure are filled in", function() {		
	
	runs(function(){
	    contactsModule.isAlreadyAuthenticated(param, function(isOpen){
		expect(isOpen).toBeTruthy();
	    });		 
	    
	    contactsModule.getAllContacts(param, function(contacts){		    
	      contactsObj = contacts;
	    });
	  
	    waitsFor(waitsForContacts, "getAllContacts timeout expired",timeout);
	  
	    runs(function(){ 
		expect(contactsObj).not.toEqual("");		  		  		  
		expect(contactsObj[0].displayName).toContain('Paolo Vergori');
		expect(contactsObj[1].displayName).toContain('Andreas Botsikas');
		expect(contactsObj[2].displayName).toContain('Marco Gavelli');
		expect(contactsObj[0].photos).not.toEqual(undefined);
		expect(contactsObj[1].photos).not.toEqual(undefined);
		expect(contactsObj[2].photos).not.toEqual(undefined);		  
	    });
	    
	    runs(function(){      
	      for(var i=0;i<contactsObj.length;i++){
		  expect(contactsObj[i].id).not.toBeUndefined();
		  expect(contactsObj[i].displayName).not.toBeUndefined();
		  expect(contactsObj[i].name).not.toBeUndefined();
		  expect(contactsObj[i].nickname).not.toBeUndefined();
		  expect(contactsObj[i].phoneNumbers).not.toBeUndefined();
		  expect(contactsObj[i].emails).not.toBeUndefined();
		  expect(contactsObj[i].addresses).not.toBeUndefined();
		  expect(contactsObj[i].ims).not.toBeUndefined();
		  expect(contactsObj[i].organizations).not.toBeUndefined();
		  expect(contactsObj[i].revision).not.toBeUndefined();
		  expect(contactsObj[i].birthday).not.toBeUndefined();
		  expect(contactsObj[i].gender).not.toBeUndefined();
		  expect(contactsObj[i].note).not.toBeUndefined();
		  expect(contactsObj[i].photos).not.toBeUndefined();
		  expect(contactsObj[i].categories).not.toBeUndefined();
		  expect(contactsObj[i].urls).not.toBeUndefined();
		  expect(contactsObj[i].timezone).not.toBeUndefined();
	      }
	    });
	    
	    function waitsForContacts() {
	      return contactsObj != "";
	    }
	});
    });	                                                
});



describe("test contacts_module, remote. Check if W3C Contacts Module accepts filters", function() {   
    
    var contactsObj;
    var searchedContacts = {};
    
    beforeEach(function(){
      contactsObj = "";
      searchedContacts.type = 'remote';
      searchedContacts.fields = {};
      searchedContacts.fields["displayName"] = 'Paolo Vergori';
    });    
  
    it("contacts_module<remote>, check if contacts are filtered coherently with specified filters", function() {                     		
	
	contactsModule.isAlreadyAuthenticated(param, function(isOpen){
	    expect(isOpen).toEqual(true);
	});
	
	contactsModule.find(searchedContacts.type, searchedContacts.fields, function(contacts){ 	  
	      contactsObj = contacts;
	}, function(){}, new Array());
	
	waitsFor(waitsForContacts, "getAllContacts timeout expired",timeout);
	
	runs(function(){ 
	    var found = false;
	    for(var i=0;i<contactsObj.length;i++){
	      if(contactsObj[0].displayName.indexOf('Paolo Vergori') != -1)
		found = true;	      
	    }
	    expect(found).toBeTruthy();
	});
	
	function waitsForContacts() {
	    return contactsObj != "";
	}
    });
    
});



describe("test contacts_module, remote. Attempt to retrieve a not existing contact", function() {   
    
    var contactsObj;
    var searchedContacts = {};
    
    beforeEach(function(){
      contactsObj = "";
      searchedContacts.type = 'remote';
      searchedContacts.fields = {};
      searchedContacts.fields["displayName"] = 'Michele Morello';
    });    
  
    it("contacts_module<remote>, attempt to retrieve a not existing contact", function() {                     		
	
	contactsModule.isAlreadyAuthenticated(param, function(isOpen){
	    expect(isOpen).toEqual(true);
	});
	
	contactsModule.find(searchedContacts.type, searchedContacts.fields, function(contacts){ 	  
	      contactsObj = contacts;
	}, function(){}, new Array());	//expected to never be called: Google won't answer
	
	waits(timeout);
	
	runs(function(){ 
	    expect(contactsObj.length).toBeLessThan(1);
	});
    });
    
});



describe("test contacts_module, remote. Check if W3C Contacts Module accepts filters", function() {   
    
    var contactsObj;
    var searchedContacts = {};
    
    beforeEach(function(){
      contactsObj = "";
      searchedContacts.type = 'remote';
      searchedContacts.fields = {};
      searchedContacts.fields["webinos"] = 'Webinos Foundation';
    });    
  
    it("contacts_module<remote>, check if contacts are filtered coherently with specified filters", function() {                     		
	
	contactsModule.isAlreadyAuthenticated(param, function(isOpen){
	    expect(isOpen).toEqual(true);
	});
	
	contactsModule.find(searchedContacts.type, searchedContacts.fields, function(contacts){ 	  
	      contactsObj = contacts;	     
	}, function(){console.log("Error Callback");}, new Array());	//expected to never be called: Google won't answer
	
	waits(timeout);
	
	runs(function(){ 
	    expect(contactsObj.length).toBeLessThan(1);
	});
    });
    
});



describe("test localcontacts.js", function() {
    var localcontacts = require("../../src/build/Release/localcontacts");
    var addressbookName= "../thunderbird_contacts_test/testAddressBook/abook.mab";
    var myContacts = new localcontacts.contacts();        
    
    it("localcontacts, fails to open", function() {
        expect(myContacts.isOpen()).toEqual(false);
	var r = myContacts.open("");
	expect(r).toEqual(false);
	expect(myContacts.isOpen()).toEqual(false);
    });
    
    it("localcontacts, open", function() {
        expect(myContacts.isOpen()).toEqual(false);
	var r = myContacts.open(addressbookName);
	expect(r).not.toBeNull();
	expect(r).not.toEqual(false);
	expect(myContacts.isOpen()).toEqual(true);	
    });
    
    it("localcontacts, getAddressBook", function() {
	expect(myContacts.isOpen()).toEqual(true);
	var ab = myContacts.getAB();
	expect(ab).not.toBeNull();
	expect(ab.length).toEqual(3);
	
    });
});



describe("test google-contacts.js", function() {           
  
    var fakeAuth = "";
    var contactsObj = "";
    var remoteContacts = require("../../lib/google_contacts.js");	      
    param[0]['usr'] = 'gregg01';
    param[0]['pwd'] = 'lazio001';
    
    it("google_contacts, fails to authenticate", function() {      	
	remoteContacts.logIn("", "", function(authenticate){	  
	    expect(authenticate).toEqual(false);	  
	});
    });       
    
    it("google_contacts, authenticate", function() {      	
	remoteContacts.logIn(param[0]['usr'], param[0]['pwd'], function(authenticated){	  
	    fakeAuth = authenticated;
	});
    });       
    
    waitsFor(waitsForAuthentication, "getAllContacts timeout expired",timeout);
    
    runs(function(){expect(fakeAuth).toEqual(true)});
    
    it("google_contacts, getContacts", function() {      
	remoteContacts.getContacts(function(contacts){
	    contactsObj = contacts;
	});
    });
    
    waitsFor(waitsForContacts, "getAllContacts timeout expired",timeout);
    
    
    runs(function(){
	expect(contactsObj).not.toBeUndefined();
	expect(contactsObj[0].displayName).toContain('Paolo Vergori');
	expect(contactsObj[1].displayName).toContain('Andreas Botsikas');
	expect(contactsObj[2].displayName).toContain('Marco Gavelli');
	expect(contactsObj[0].photos).not.toEqual(undefined);
	expect(contactsObj[1].photos).not.toEqual(undefined);
	expect(contactsObj[2].photos).not.toEqual(undefined);
    });	 
    
    function waitsForContacts() {
	return contactsObj != "";
    }
	
    function waitsForAuthentication() {
	return fakeAuth != "";
    }
});



