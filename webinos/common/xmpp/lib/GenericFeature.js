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
 * Author: Eelco Cramer, TNO
 */

(function() {
 	"use strict";

    // save unanswered calls to remote features globally
    global.unansweredGenericFeatureCalls = {};

    var sys =require('util');
    var timers = require('timers');
    var EventEmitter = require('events').EventEmitter;
    var uniqueId = Math.round(Math.random() * 10000);
    var logger = require('./Logger').getLogger('GenericFeature', 'verbose');

    var path = require('path');
    var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
    var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
    var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

    var rpc = require(path.join(webinosRoot, dependencies.rpc.location));

    /**
     * The base class for webinos features.
     * @name GenericFeature
     * @constructor
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

	    /**
	     * Determine if the feature is local or not
	     * @name GenericFeature#isLocal
	     * @function
	     * @returns {boolean} result
	     * @public
	     */
        this.isLocal = function() {                                 // returns true is the feature is running on the local device
    	    return (this.device == webinos.device);
    	}
	
	    /**
	     * Determine if the feature is owned by the user or not
	     * @name GenericFeature#isMine
	     * @function
	     * @returns {boolean} result
	     * @public
	     */
        this.isMine = function() {                                  // returns true if the feature runs on a device of same owner
    	    return (this.owner == webinos.owner);
    	}

	    /**
	     * Sets the connection with the PZH that is used to communicate with foreign users.
	     * @name GenericFeature#setConnection
	     * @function
	     * @param connection The connection instance used
	     * @public
	     */
        this.setConnection = function(connection) {
        	this.device = connection.getJID();
            this.owner = this.device.split("/")[0];
        	this.uplink = connection;
        	this.service.serviceAddress = this.device;
        }
    
	    /**
	     * Embeds a local API implementation instance into the feature. Adds the methods of the embeded service object to the current object.
	     * @name GenericFeature#embedService
	     * @function
	     * @param service RPCWebinosService} The service instance
	     * @private
	     */
        this.embedService = function(service) {
            this.service = service;
            this.api = service.api;
            this.ns = service.api;
            this.displayName = service.displayName;
            this.description = service.description;
        
            logger.verbose('service api: ' + service.api);
            logger.verbose('this.api: ' + this.api);
        
            for (var i in this.service) {
                if (typeof this.service[i] === 'function') {
                    if (!this[i]) { // add to proxy object if the method does not exist yet
                        logger.debug('Adding to proxy object: ' + i);
                        this[i] = new Function("this.invoke('" + i + "', arguments);");            
                        //TODO it would be better to only add RPC methods 
                    }
                } else if (i == 'listenAttr') {
                    //TODO check if this is an actual pattern?
                    for (var j in this.service[i]) {
                        if (typeof this.service[i][j] === 'function') {
                            if (!this[j]) {
                                logger.debug('Adding to proxy object: ' + j);
                                this[j] = new Function("this.invoke('" + j + "', arguments);");            
                                //TODO it would be better to only add RPC methods 
                            }
                        }
                    }
                }
            }
        }
    
	    /**
	     * Gets an information object describing this service.
	     * @see RPCWebinosService#getInformation
	     * @name GenericFeature#getInformation
	     * @function
	     * @public
	     * @returns the result
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
	
	    /**
	     * Invokes a method on this feature.
	     * @name GenericFeature#invoke
	     * @function
	     * @public
	     * @param method {string} The method to invoke.
	     * @param parameters List with all the parameters to invoke. Can have as much parameters as needed, these are all put into this list.
	     */
    	this.invoke = function(method, parameters) {
    		logger.verbose('invoked');
    		logger.trace('calling emit(invoked-from-remote)');
    		this.emit('invoked-from-remote', this, parameters);
		
    		if (this.local) {
                if (this.service[method]) {
            		this.service[method].apply(this.service, parameters);
                } else if (this.service.listenAttr[method]) {
            		this.service.listenAttr[method].apply(this.service, parameters);
                }
    		} else {
    		    logger.verbose('invoking remove service');
		    
    		    var callback = function(type, payload) {
    		        if (type != 'error') {
    		            parameters[1](payload.result);
    		        } else {
    		            parameters[2](payload.error);
    		        }
    		    }
		    
		        var objectRef = parameters[3];
    		    this.emit('invoke-via-xmpp', this, objectRef, callback, method, parameters[0]);
    		}
		
    		logger.verbose('ending (invoke');
        }
    
	    /**
	     * Is called when a feature is invoked remotely.
	     * @name GenericFeature#invokedFromRemote
	     * @function
	     * @public
	     * @param stanza The XMPP stanza object that triggerd the invocation.
	     * @param call Object instance describing the remote procedure call.
	     */
        this.invokedFromRemote = function(stanza, call) {
    		logger.verbose('on(invoked-from-remote)');
    		logger.debug('Received the following XMPP stanza: ' + stanza);
		
		    //TODO extract the needed values from the XMPP stanza in the calling code and pass these so there is no dependency of XMPP here.
		
    		var conn = this.uplink;
            var success, error;
            
            //TODO dirty hack for answering iq messages that call a method that does not call the callback
            // this is needed because on runtime it is not known if a RPC calls expects a callback or not. 
            // for now we are assuming that a callback will occur within 5 seconds (meh).
            global.unansweredGenericFeatureCalls[call.id] = stanza;
            
            timers.setTimeout(function (id) {
                if (global.unansweredGenericFeatureCalls[call.id]) {
                    logger.info('Assuming a call to a function without a callback. Clearing the info query message.');
                    conn.answer(global.unansweredGenericFeatureCalls[call.id], call.id);
                    delete global.unansweredGenericFeatureCalls[call.id];
                }
            }, 5000, call.id);
            
            success = function(result) {
    			logger.debug("The answer is: " + JSON.stringify(result));
    			logger.debug("Sending it back via XMPP...");
                delete global.unansweredGenericFeatureCalls[call.id];
    			conn.answer(stanza, call.id, result);
            }

            error = function(error) {
                delete global.unansweredGenericFeatureCalls[call.id];
                conn.error(stanza, call.id, result);
            }

            var objectRef = {
                "api": call.callbackId,
                "id": call.id,
                "from": stanza.attrs.from
            };

            if (this.service[call.method]) {
        		this.service[call.method].apply(this.service, [call.params, success, error, objectRef]);
            } else if (this.service.listenAttr[call.method]) {
        		this.service.listenAttr[call.method].apply(this.service, [call.params, success, error, objectRef]);
            }

    		logger.verbose('ending on(invoked-from-remote)');
        }
    }

    sys.inherits(GenericFeature, RPCWebinosService);
    sys.inherits(GenericFeature, EventEmitter);
    exports.GenericFeature = GenericFeature;
})();