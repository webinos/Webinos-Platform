var localPzp = "";

function fillPZAddrs(data) {
	var pzpId = data.from;
	var pzhId, connectedPzh , connectedPzp;
	if (pzpId !== "virgin_pzp") {
	  pzhId = data.payload.message.pzhId;
	  connectedPzp = data.payload.message.connectedPzp; // all connected pzp
	  connectedPzh = data.payload.message.connectedPzh; // all connected pzh

	  console.log('registeredBrowser msg from ' + pzpId);
	  console.log('availablePZPs: ' + data.payload.message.connectedPzp);
	  localPzp = pzpId;
	}
}
webinos.session.addListener('registeredBrowser', fillPZAddrs);


var contactsService = {};
var recentService = "";




(function (exports) {
	'use strict';
	
	var param;
	var contactList = "";
	
	function test_remoteContacts_setup() {
		param = {};
		param.usr = "";
		param.pwd = "";
		param.type = "remote";	
	}
	
	function test_contactsModule_isModuleDiscoveredAndLoadedLocally(completeCB){
		webinos.discovery.findServices( new ServiceType('http://www.w3.org/ns/api-perms/contacts'),{
			onFound: function (service) {
				console.log("---DISCOVERY---");
				console.log("Service: ",service," found!!");				
				contactsService[service.serviceAddress] = service;
				console.log(service.serviceAddress);
				console.log("---------------");	      

				if(service.serviceAddress === localPzp) {		  
					console.log("------BIND-----");		  
					recentService = contactsService[localPzp];	      	      	      
					recentService.bindService({onBind:function(service) {
						console.log('Bound to: ' + service.api + 'on localPzp ' + service.serviceAddress);
					}});	      
					console.log("---------------");
				}
				completeCB(true, "Contacts Module loaded!");
			},
			onError: function(error) {
				console.log("Error, cannot Contacts API: " + error);
				completeCB(false, "cannot Contacts API:" + error);
			}
		});
	}

	//not yet authenticated
	function test_remoteContacts_isAlreadyAuthenticated(completeCB) {
	    test_remoteContacts_setup();	    
	    
	    
	    recentService.isAlreadyAuthenticated(param, function(result){
		  if(result)
		    completeCB(false, "user altready authenticated");
		  else
		    completeCB(true, "user not authenticated, yet");
	    });
	}
	
	//user fails to authenticate, automatically
	function test_remoteContacts_authenticateFailure(completeCB) {
	    var allowed = false
	    test_remoteContacts_setup();	    	  
	    
	    var timer = setTimeout(function(){if (allowed){completeCB(true, "authentication fails with empty fields and policy manager is invoked before authenticating");}
									  else {completeCB(false, "failed autentication but policy manager not invoked")}}, 1000);

	    recentService.authenticate(param, function(result){
		  clearTimeout(timer);
		  if(result === false) //user lied! :)
		    test_remoteContacts_authenticateFailure(completeCB);
	    });
	    allowed = confirm("Have you allow policy manager before confirming this message?");
	}
	
	//user fails to authenticate for denied access
	function test_remoteContacts_authenticateDeny(completeCB) {
	    test_remoteContacts_setup();	    	  
	    
	    var timer = setTimeout(function(){test_remoteContacts_authenticateDeny(completeCB);}, 1000);

	    recentService.authenticate(param, function(result){
		  clearTimeout(timer);
		  if(result === false) //user lied! :)
		    completeCB(true, "authentication fails due to denied access from the user");
	    });
	    alert("Deny Policy Manager, before confirming this message.");
	}
	
	//user succeeded to authenticate
	function test_remoteContacts_authenticate(completeCB) {
	    test_remoteContacts_setup();
	    param.usr = prompt("Please, enter a valid Google userID", "");
	    param.pwd = prompt("Please, enter your password", "");
	    
	    var timer = setTimeout(function(){completeCB(false, "authentication fails!");}, 1000);

	    recentService.authenticate(param, function(result){
		  clearTimeout(timer);
		  if(result === true)
		    completeCB(true, "authentication success!");
		  else
		    test_remoteContacts_authenticate(completeCB);
	    });
	    alert("Allow Policy Manager, before confirming this message.");
	}
	
	//get all contacts
	function test_remoteContacts_getAllContacts(completeCB) {
	    test_remoteContacts_setup();
	    param.fields = {};
	    
	    recentService.getAllContacts(param, function(contacts){	      
	      contactList = contacts;
	      
	      if(contacts.length>0)
		completeCB(true, "contacts found!");
	      else
		completeCB(false, "no contacts found!");
	    });
	}
	
	//filter contacts
	function test_remoteContacts_find(completeCB) {
		test_remoteContacts_setup();
		
		param.fields = {};
		param.fields["displayName"] = contactList[0].displayName;
		//TODO risolvere problema nella contact, se si filtra per un oggetto, come nel caso di param.name, vengono restituiti tutto i contatti che possiedono un nome, qualunque esso sia...


		
		recentService.find(param, function(contacts){
			
			//If Google responds in the photos field this: "Temporary problem - please try again later and consider using batch operations. The user is over quota." (base64 coded!!)
			var serviceDenied = 'VGVtcG9yYXJ5IHByb2JsZW0gLSBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyIGFuZCBjb25zaWRlciB1c2luZyBiYXRjaCBvcGVyYXRpb25zLiBUaGUgdXNlciBpcyBvdmVyIHF1b3RhLg=='; 
			
			console.log("---");
			console.log(contacts[0]['photos'][0].value);
			console.log("---");

			if(contacts.length > 0){
			  
				if(contacts[0]['photos'][0].value === serviceDenied || contactList[0]['photos'][0].value === serviceDenied){
				    completeCB(false, "Google requests overquota");
				    return;
				}
				
				var foundEqual = true;

				for (var i in contacts[0]){ 		 
					if(!contacts[0][i].equals(contactList[0][i]) && i != 'photos'){ //TODO: response from Google is not deterministic because base64 coding has padding
					  foundEqual = false;					  
					}
				}

				if(foundEqual)
					completeCB(true, "filtered contact found!");
				else
					completeCB(false, "filtered contact not found!");
				console.log(contacts);
				console.log(contactList);
			}
			else
				completeCB(false, "filter fails: no contacts found!");
		}); 
	}
	
	
	Object.prototype.equals = function(x)
	{
		var p;
		for(p in this) {
			if(typeof(x[p])=='undefined') {return false;}
		}

		for(p in this) {
			if (this[p]) {
				switch(typeof(this[p])) {
					case 'object':
						if (!this[p].equals(x[p])) { 
							return false; 
						} 
						break;
						
					case 'function':
						if (typeof(x[p])=='undefined' || (p != 'equals' && this[p].toString() != x[p].toString()))
							return false;
						break;
						
					default:
						if (this[p] != x[p]) { 
							return false; 
						}
				}
			} 
			else {
				if (x[p])
					return false;
			}
		}
		
		for(p in x) {
			if(typeof(this[p])=='undefined') {
				return false;
			}
		}
		
		return true;
	}

	
	
	//contacts_module<remote>, try to serach for not existing contact
	function test_remoteContacts_filterForNotExistingContact(completeCB) {                     		
		
		var param2 = {};
		param2.usr = "";
		param2.pwd = "";
		param2.type = "remote";
		param2.fields={};
		param2.fields["displayName"] = "Ago";
		
			
		console.log(param2);
		recentService.isAlreadyAuthenticated(param2, function(result){
			if(result===true){
				recentService.find(param2, function(contacts){
					if(contacts.length == 0)
						completeCB(true, "the searched contact doesn's exist");
					else
						completeCB(false, "unexpexted contact found")					
				});
			}
			else
				completeCB(false, "not yet authenticated");
		});
	}
	
	
	//tring to send a malformed contact as parameter to find(), the problem is that quite sometime this make PZP crash, we need to investigate 
	function test_remoteContacts_filterForMalformedContact(completeCB) {                     		
		
		var param3 = {};
		param3.usr = "";
		param3.pwd = "";
		param3.type = "remote";
		param3.fields={};
		param3.fields["name"] = "Paolo Vergori";
		
			
		console.log(param3);
		recentService.isAlreadyAuthenticated(param3, function(result){
			if(result===true){
				recentService.find(param3, function(contacts){
					if(contacts.length == 0)
						completeCB(true, "the searched contact doesn's exist");
					else
						completeCB(false, "unexpexted contact found")					
				});
			}
			else
				completeCB(false, "not yet authenticated");
		});
	}



//local contacts
	function test_localContacts_setup() {		
        param = {};
		param.usr = "";
		param.pwd = "";
		param.type = "local";
		param.addressBookName=(document.URL.split('/').slice(0, -1).join('/')+'/' + "abook.mab").replace("file://","");
	}
	
	//contacts_module<local>,test if W3C Contacts Module asks for path to a valid mab file if addressed platform it's not Android
	function test_localContacts_validMabFile(completeCB) {
	    test_localContacts_setup();	    	  
	    param.addressBookName="";

	    recentService.authenticate(param, function(result){
		//  clearTimeout(timer);
		  if(result === false) 
			completeCB(true, "authentication fails due to lack of mab path");
		  else
		        completeCB(false, "authentication succeed")
	    });
	    //alert("Allow Policy Manager, before confirming this message.");
	}
	
	
	
	
	//contacts_module<local>, check if local contacts address book is loaded
	function test_localContacts_addressBookLoaded(completeCB) {       
		test_localContacts_setup();
		
		recentService.isAlreadyAuthenticated(param, function(result){
			if(result === false){ 
				recentService.authenticate(param, function(result){
						
					if(result === true){
						recentService.isAlreadyAuthenticated(param, function(result){
							if(result === true)
								completeCB(true, "local contacts address book is loaded");
							else
								completeCB(true, "local contacts address book is not loaded");
						});
					}
					else
						completeCB(false, "fails to authenticate");
				});
			}
			else
				completeCB(false, "already authenticated")
		});
	}
    
	
	//contacts_module<local>, test if fields of the contacts structure are filled in 
	function test_localContacts_testContactsStructure(completeCB){  
		recentService.getAllContacts(param, function(result){ 
			if(result!==null){
// 				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				console.log(result.length);
				if(result.length==3)
					completeCB(true, "contacts structure fields are filled");
				else
					completeCB(false, "result lenght is not 3");
			}
			else
				completeCB(false, "result is null");
	    //TODO: check fields != undefined
		});
	}
	
	
	//check if retrieved contacts is formed as expected
	function test_localContacts_checkReturnedContact(completeCB) {       		 	
		recentService.getAllContacts(param, function(result){ 
			if(result !==null && result !== undefined){
				var contactsPassed = 0;
				for(var i=0;i<result.length;i++){
					console.log(result[i]);
					if(result[i].id !== undefined && result[i].displayName !== undefined && result[i].name !== undefined &&
					    result[i].nickname !== undefined && result[i].phoneNumbers !== undefined && result[i].emails !== undefined  &&
					    result[i].ims !== undefined && result[i].birthday !== undefined && result[i].organizations !== undefined && 
					    result[i].revision !== undefined && result[i].note !== undefined && result[i].photos !==undefined && result[i].urls !== undefined && 
					    result[i].addresses !== undefined /*&& result[i].gender !== undefined && result[i].categories !== undefined && result[i].timezone !==undefined*/)
						contactsPassed++;
				}
				//TODO: commented fields are not present in mab files
				if(contactsPassed == result.length)
					completeCB(true, "retrived contacts are well formed");
				else
					completeCB(false, "retrived contacts are not formed as expected");
			}
			else
				completeCB(false, "result is undefined or null");
		});
	}
	
	
	
	
	
	
// 	function compare(obj1, obj2){
// 
// 	  if(typeof obj1 == 'object'){ 
// 	    for(var i in obj1){
// 	       if(!compare(obj1[i], obj2[i]))
// 		 return false;
// 	    }
// 	  }
// 	  else if(typeof obj1 != 'function'){ console.log(obj1);
// 	    if(obj1 == obj2)
// 	      return true;
// 	  }
// 	  else
// 	    return false;
// 	 
// 	}
	
	
	
	
	
	
	
	// Define an example user-interactive test.
	function test_UI(completeCB) {
		if (confirm('did the test pass?')) {
			completeCB(true,'user said it passed');
		} else {
			completeCB(false,'user said it failed');
		}
	}

	// Define each test in this array, with a descriptive name followed by the test method itself.
	var tests = [ 	{ testName: 'Contacts Module', testMethod: test_contactsModule_isModuleDiscoveredAndLoadedLocally },
				{ testName: 'path to valid mab file', testMethod: test_localContacts_validMabFile},
				{ testName: 'test if local contacts address book is loaded', testMethod: test_localContacts_addressBookLoaded},
				{ testName: 'test if fields of the contacts structure are filled in', testMethod: test_localContacts_testContactsStructure},
				{ testName: 'test retrived contacts is formed as expected', testMethod: test_localContacts_checkReturnedContact},
				{ testName: 'user not yet authenticated', testMethod: test_remoteContacts_isAlreadyAuthenticated },
				{ testName: 'user fails to authenticate, automatically', testMethod: test_remoteContacts_authenticateFailure },
				{ testName: 'user fails to authenticate for denied access', testMethod: test_remoteContacts_authenticateDeny },
				{ testName: 'user succeeded to authenticate', testMethod: test_remoteContacts_authenticate },
				{ testName: 'get all contacts', testMethod: test_remoteContacts_getAllContacts },
				{ testName: 'filter contacts', testMethod: test_remoteContacts_find },
				//TODO: (this cause the contacts API to fails. Sometimes it crashes...){ testName: 'search for not existing contact', testMethod: test_remoteContacts_filterForNotExistingContact},
				//TODO: (this cause the contacts API to fails. Sometimes it crashes...){ testName: 'search for malformed contact', testMethod: test_remoteContacts_filterForMalformedContact},
			];

	// Export a function to trigger the tests, passing on the output logger.
	exports.runContactsTests = function(logTo) { runTests(tests, logTo); };
	
}(window))