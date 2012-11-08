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
* Copyright 2011 Istituto Superiore Mario Boella (ISMB)
******************************************************************************/

(function() {
	"use strict";
	var path = require('path');
	var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
	var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
	var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);
	
	var contacts_module = require(path.resolve(__dirname,'contacts_module.js'));
	
	/**
	 * Webinos Service constructor.
	 * @param rpcHandler A handler for functions that use RPC to deliver their result.  
	 */
	var Contacts = function(rpcHandler,params) {
		// inherit from RPCWebinosService
		this.base = RPCWebinosService;
		this.base({
			api: 'http://www.w3.org/ns/api-perms/contacts',
			displayName: 'Contacts',
			description: 'W3C Contacts Module'
		});

	};

	
	Contacts.prototype = new RPCWebinosService;

/**
 * returns true if contacts service is already authenticated with GMail or a
 * valid address book file is aready open TODO this method has to be removed
 * when user profile will handle this
 */
Contacts.prototype.authenticate = function (params, successCB, errorCB)
{
  "use strict";
  contacts_module.authenticate(params, successCB, errorCB);
}

/**
 * returns true if contacts service is already authenticated with GMail or a
 * valid address book file is aready open TODO this method has to be removed
 * when user profile will handle this
 */
Contacts.prototype.isAlreadyAuthenticated = function (params, successCB, errorCB)
{
  "use strict";
  contacts_module.isAlreadyAuthenticated(params, successCB, errorCB);
}

/**
 * returns a list of all contact TODO remove once debugging and testing are
 * successfull
 */
Contacts.prototype.getAllContacts = function (params, successCB, errorCB)
{
  "use strict";
  contacts_module.getAllContacts(params, successCB, errorCB);
}

/**
 * TODO full W3C Spec
 */
Contacts.prototype.find = function (params, successCB, errorCB)
{
  "use strict";
  //TODO should type be handled by this module?
  contacts_module.find(params[0]['type'], params[0]['fields'], successCB, errorCB);
  //contacts_module.findContacts(params,successCB);
  //contacts_module.find(params,successCB); //TODO use contacts_module.find() directly once switching remote/local contacts happens in a different way
}


// export our object
exports.Service = Contacts;
	

})()
