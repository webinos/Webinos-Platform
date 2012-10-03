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
*******************************************************************************/

/**
 * Base class for features / services.
 * 
 * Reused and updated the orginal XmppDemo code of Victor Klos
 * Author: Eelco Cramer, TNO
 */

var sys = require('util');
var EventEmitter = require('events').EventEmitter;
var uniqueId = Math.round(Math.random() * 10000);
var logger = require('./Logger').getLogger('GenericFeature', 'verbose');

var path = require('path');
var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

var rpc = require(path.join(webinosRoot, dependencies.rpc.location));

/*
 * 'Class' definition of generic webinos feature
 *
 * inspiration for subclassing methodology comes from http://www.webreference.com/js/column79/4.html
 */
function GenericFeature() {
	EventEmitter.call(this);

    //this.id = ++uniqueId;                                       // (app level) unique id, e.g. for use in html user interface
    this.owner = null;                                          // person that owns the device the service is running on
    this.device = null;                                         // (addressable) id of device the service is running on
    this.name = "(you shouldn't see this!)";                    // friendly name, to be overridden
    this.ns = null;                                             // name space that (globally) uniquely defines the service type
	this.local = true; // defaults to true
	this.shared = false; // only used for local features
	
    this.remove = function() {                                  // call this when this feature is removed.
		this.emit('remove', this);
	}
	
    this.isLocal = function() {                                 // returns true is the feature is running on the local device
	    return (this.device == webinos.device);
	}
	
    this.isMine = function() {                                  // returns true if the feature runs on a device of same owner
	    return (this.owner == webinos.owner);
	}

    this.setConnection = function(jid, connection) {
    	this.device = jid;
        this.owner = jid.split("/")[0];
    	this.uplink = connection;
    	this.service.serviceAddress = this.device;
    }
    
    this.embedService = function(service) {
        this.service = service;
        this.api = service.api;
        this.displayName = service.displayName;
        this.description = service.description;
        
        logger.verbose('service api: ' + service.api);
        logger.verbose('this.api: ' + this.api);
        
        for (i in this.service) {
            if (typeof this.service[i] === 'function') {
                if (!this[i]) { // add to proxy object if the method does not exist yet
                    logger.debug('Adding to proxy object: ' + i);
                    this[i] = new Function("this.invoke('" + i + "', arguments);");            
                    
                    //TODO it would be better to only add RPC methods 
                }
            }
        }
    }
    
    /**
	 * Get an information object from the service.
	 * @returns Object including id, api, displayName, serviceAddress.
	 */
	this.getInformation = function () {
		return {
			id: this.id,
			api: this.api,
			displayName: this.displayName,
			description: this.description,
			serviceAddress: this.device
		};
	};
	
	this.invoke = function(method, parameters) {
		logger.verbose('invoked');
		
		if (this.local) {
    		this.service[method].apply(this.service, parameters);
		} else {
		    logger.verbose('invoking remove service');
		    
		    var callback = function(type, payload) {
		        if (type != 'error') {
		            parameters[1](payload.result);
		        } else {
		            parameters[2](payload.error);
		        }
		    }
		    
		    // footprint is (params, successCB, errorCB, objectRef): only send params
		    this.emit('invoke-via-xmpp', this, callback, method, parameters[0])
		}
		
		logger.verbose('ending (invoke');
    }
    
    this.invokedFromRemote = function(stanza, method, params, id) {
		logger.verbose('on(invoked-from-remote)');
		logger.debug('Received the following XMPP stanza: ' + stanza);
		
		var conn = this.uplink;

        var success = function(result) {
			logger.debug("The answer is: " + JSON.stringify(result));
			logger.debug("Sending it back via XMPP...");
			conn.answer(stanza, id, result);
        }
        
        var error = function(error) {
            conn.error(stanza, id, result);
        }

		this.service[method].apply(this, params, success, error);

		logger.verbose('ending on(invoked-from-remote)');
    }
}

sys.inherits(GenericFeature, RPCWebinosService);
sys.inherits(GenericFeature, EventEmitter);
exports.GenericFeature = GenericFeature;
