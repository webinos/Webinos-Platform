/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2011
 ******************************************************************************/

describe("Contacts API", function() {
	var contactsService;
	var contactList;

	// compares objects helper method
	// call like this: equals.call(obj1, obj2)
	var equals = function(x) {
		var p;
		for(p in this)
			if(typeof(x[p])=='undefined') return false;
		for(p in this) {
			if (this[p])
				switch(typeof(this[p])) {
				case 'object':
					if (!equals.call(this[p], x[p])) return false; 
					break;
				case 'function':
					if (typeof(x[p])=='undefined' || (p != 'equals' && this[p].toString() != x[p].toString()))
						return false;
					break;
				default:
					if (this[p] != x[p]) return false; 
				}
			else
				if (x[p]) return false;
		}
		for(p in x)
			if(typeof(this[p])=='undefined') return false;
		return true;
	};

	webinos.discovery.findServices(new ServiceType("http://www.w3.org/ns/api-perms/contacts"), {
		onFound: function (service) {
			contactsService = service;
		}
	});

	beforeEach(function() {
		waitsFor(function() {
			return !!contactsService;
		}, "finding a contacts service", 5000);
	});

	it("should be available from the discovery", function() {
		expect(contactsService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(contactsService.state).toBeDefined();
		expect(contactsService.api).toEqual(jasmine.any(String));
		expect(contactsService.id).toEqual(jasmine.any(String));
		expect(contactsService.displayName).toEqual(jasmine.any(String));
		expect(contactsService.description).toEqual(jasmine.any(String));
		expect(contactsService.icon).toEqual(jasmine.any(String));
		expect(contactsService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		contactsService.bindService({onBind: function(service) {
			contactsService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "service to be bound", 500);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});

	describe("remote contacts tests", function() {
		var param;

		beforeEach(function() {
			param = {};
			param.usr = "";
			param.pwd = "";
			param.type = "remote";	
		});

		it("is not yet authenticated", function() {
			var finished = false;
			var authResult;

			contactsService.isAlreadyAuthenticated(param, function(result) {
				finished = true;
				authResult = result;
			});

			waitsFor(function() {
				return finished;
			}, "isAlreadyAuthenticated callback.", 200);

			runs(function() {
				expect(authResult).toEqual(false);
			});
		});

		it("is not authenticated as policy was denied", function() {
			var finished = false;
			var authResult;

			contactsService.authenticate(param, function(result) {
				finished = true;
				authResult = result;
			});
			alert("Deny Policy Manager, before confirming this message.");

			waitsFor(function() {
				return finished;
			}, "authenticated callback.", 7000);

			runs(function() {
				expect(authResult).toEqual(false);
			});
		});

		it("is successfully authenticated", function() {
			var finished = false;
			var authResult;
			param.usr = prompt("Please, enter a valid Google userID", "");
			param.pwd = prompt("Please, enter your password", "");

			contactsService.authenticate(param, function(result) {
				finished = true;
				authResult = result;
			});
			alert("Allow Policy Manager, before confirming this message.");

			waitsFor(function() {
				return finished;
			}, "authenticated callback.", 7000);

			runs(function() {
				expect(authResult).toEqual(true);
			});
		});

		it("can get all contacts", function() {
			var finished = false;
			param.fields = {};

			contactsService.getAllContacts(param, function(contacts){
				finished = true;
				contactList = contacts;
			});

			waitsFor(function() {
				return finished;
			}, "getAllContacts callback.", 3000);

			runs(function() {
				expect(contactList.length).toBeGreaterThan(0);
			});
		});

		it("can find contact based on filter", function() {
			var finished = false;
			var overQuota;
			var filtered;
			param.fields = {};
			param.fields["displayName"] = contactList[0].displayName;
			//TODO risolvere problema nella contact, se si filtra per un oggetto, come nel caso di param.name, vengono restituiti tutto i contatti che possiedono un nome, qualunque esso sia...

			contactsService.find(param, function(contacts) {
				//If Google responds in the photos field this: "Temporary problem - please try again later and consider using batch operations. The user is over quota." (base64 coded!!)
				var serviceDenied = 'VGVtcG9yYXJ5IHByb2JsZW0gLSBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyIGFuZCBjb25zaWRlciB1c2luZyBiYXRjaCBvcGVyYXRpb25zLiBUaGUgdXNlciBpcyBvdmVyIHF1b3RhLg=='; 

				if (contacts.length > 0) {

					if(contacts[0]['photos'][0].value === serviceDenied || contactList[0]['photos'][0].value === serviceDenied){
						overQuota = true;
						finished = true;
						return;
					}

					var foundEqual = true;

					for (var i in contacts[0]){
						if(!equals.call(contacts[0][i], contactList[0][i]) && i != 'photos'){ //TODO: response from Google is not deterministic because base64 coding has padding
							foundEqual = false;
						}
					}
					filtered = foundEqual;
				}

				finished = true;
			});

			waitsFor(function() {
				return finished;
			}, "find contact with filter callback.", 3000);

			runs(function() {
				expect(overQuota).not.toEqual(true);
				if (overQuota) {
					// skip other expects if over quota
					return;
				}

				expect(filtered).toEqual(true);
			});
		});

		xit("cannot find contact based on filter for non-existing contact", function() {
			var finished = false;
			var contactsArray;
			param.fields = {};
			param.fields["displayName"] = "Ago"; // non-existing contact

			contactsService.find(param, function(contacts) {
				contactsArray = contacts;
				finished = true;
			});

			waitsFor(function() {
				return finished;
			}, "find contact with filter callback.", 3000);

			runs(function() {
				expect(contactsArray.length).toEqual(0);
			});
		});
	});

	describe("local contacts tests", function() {
		var param;

		beforeEach(function() {
			param = {};
			param.usr = "";
			param.pwd = "";
			param.type = "local";
			param.addressBookName = ""; // TODO path to .mab file
		});

		it("authenticate will fail if no valid mab file path", function() {
			var finished;
			var authenticated;
			param.addressBookName = "";

			contactsService.authenticate(param, function(result) {
				authenticated = result;
				finished = true;
			});

			waitsFor(function() {
				return finished;
			}, "authenticated callback.", 5000);

			runs(function() {
				expect(authenticated).toEqual(false);
			});
		});

		it("is still not authenticated", function() {
			var finished;
			var authenticated;

			contactsService.isAlreadyAuthenticated(param, function(result) {
				authenticated = result;
				finished = true;
			});

			waitsFor(function() {
				return finished;
			}, "isAlreadyAuthenticated callback.", 5000);

			runs(function() {
				expect(authenticated).toEqual(false);
			});
		});

		it("authenticate successfully", function() {
			var finished;
			var authenticated;

			contactsService.authenticate(param, function(result) {
				authenticated = result;
				finished = true;
			});

			waitsFor(function() {
				return finished;
			}, "authenticated callback.", 5000);

			runs(function() {
				expect(authenticated).toEqual(true);
				finished = false;

				contactsService.isAlreadyAuthenticated(param, function(result) {
					authenticated = result;
					finished = true;
				});

				waitsFor(function() {
					return finished;
				}, "isAlreadyAuthenticated callback.", 500);

				runs(function() {
					expect(authenticated).toEqual(true);
				});
			});
		});

		it("can get all contacts", function() {
			var finished = false;

			contactsService.getAllContacts(param, function(contacts){
				finished = true;
				contactList = contacts;
			});

			waitsFor(function() {
				return finished;
			}, "getAllContacts callback.", 1000);

			runs(function() {
				expect(contactList.length).toEqual(3);
			});
		});

		it("all contacts have the proper fields", function() {
			var finished = false;

			contactsService.getAllContacts(param, function(contacts){
				finished = true;
				contactList = contacts;
			});

			waitsFor(function() {
				return finished;
			}, "getAllContacts callback.", 1000);

			runs(function() {
				for (var i = 0; i < contactList.length; i++) {
					expect(contactList[i].id).toBeDefined();
					expect(contactList[i].displayName).toBeDefined(); 
					expect(contactList[i].name).toBeDefined();
					expect(contactList[i].nickname).toBeDefined(); 
					expect(contactList[i].phoneNumbers).toBeDefined();
					expect(contactList[i].emails).toBeDefined();
					expect(contactList[i].ims).toBeDefined();
					expect(contactList[i].birthday).toBeDefined();
					expect(contactList[i].organizations).toBeDefined(); 
					expect(contactList[i].revision).toBeDefined();
					expect(contactList[i].note).toBeDefined();
					expect(contactList[i].photos).toBeDefined(); 
					expect(contactList[i].urls).toBeDefined(); 
					expect(contactList[i].addresses).toBeDefined(); 
//					expect(contactList[i].gender).toBeDefined(); 
//					expect(contactList[i].categories).toBeDefined();
//					expect(contactList[i].timezone).toBeDefined();
				}
			});
		});

	});
});