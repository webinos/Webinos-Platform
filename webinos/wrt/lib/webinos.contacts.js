/*******************************************************************************
 * Copyright 2011 Istituto Superiore Mario Boella (ISMB)
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
 ******************************************************************************/

(function()
{
  Contacts = function(obj) {
		this.base = WebinosService;
		this.base(obj);
		
		this.authenticate = authenticate;
		this.isAlreadyAuthenticated = isAlreadyAuthenticated;
		this.getAllContacts = getAllContacts;
		this.find = find;
  };
  
  Contacts.prototype = new WebinosService;

  Contacts.prototype.bindService = function (bindCB, serviceId) {
	  // actually there should be an auth check here or whatever, but we just always bind
	  this.authenticate = authenticate;
	  this.isAlreadyAuthenticated = isAlreadyAuthenticated;
	  this.getAllContacts = getAllContacts;
	  this.find = find;

	  if (typeof bindCB.onBind === 'function') {
		  bindCB.onBind(this);
	  };
  }

  

  /**
   * returns true if contacts service is authenticated with GMail using username and password
   * or a valid address book file could be open
   * TODO this method has to be removed when user profile will handle this
   * */
  function authenticate(attr, successCB,errorCB)
  {
    var rpc = webinos.rpcHandler.createRPC(this, "authenticate", [ attr ]); // RPCservicename,
    // function
    webinos.rpcHandler.executeRPC(rpc, function(params)
    {
      successCB(params);
    }, function(error)
    {
      if (typeof(errorCB) !== 'undefined')
	errorCB(error);
    });
  };
  
  
  /**
   * returns true if contacts service is already authenticated with GMail
   * or a valid address book file is aready open
   * TODO this method has to be removed when user profile will handle this
   * */
  function isAlreadyAuthenticated(attr,successCB,errorCB)
  {
    var rpc = webinos.rpcHandler.createRPC(this, "isAlreadyAuthenticated", [ attr ]); // RPCservicename,
    // function
    webinos.rpcHandler.executeRPC(rpc, function(params)
    {
      successCB(params);
    }, function(error)
    {
      if (typeof(errorCB) !== 'undefined')
        errorCB(error);
    });
  };

  /**
   * returns a list of all contact
   * TODO remove once debugging and testing are successfull
   * */
   function getAllContacts(attr,successCB, errorCB)
   {
     var rpc = webinos.rpcHandler.createRPC(this, "getAllContacts", [ attr ]); 
   //RPCservicename,
   // function
     webinos.rpcHandler.executeRPC(rpc, function(params)
     {
     successCB(params);
     }, function(error)
     {
       if (typeof(errorCB) !== 'undefined')
         errorCB(error);
     });
   };

  


  /**
   * return a list of contacts matching some search criteria
   * 
   * TODO full W3C specs
   */
  function find(attr,successCB,errorCB)
  {
    var rpc =webinos.rpcHandler.createRPC(this, "find", [ attr ]); // RPCservicename,
    //RPCservicename,
    // function
    webinos.rpcHandler.executeRPC(rpc, function(params)
    {
    successCB(params);
    }, function(error)
    {
      if (typeof(errorCB) !== 'undefined')
        errorCB(error);
    });
  };

}());
