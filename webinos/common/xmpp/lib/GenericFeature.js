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
var logger = require('nlogger').logger('GenericFeature.js');

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
function GenericFeature(rpcHandler) {
	EventEmitter.call(this);
	
    this.id = ++uniqueId;                                       // (app level) unique id, e.g. for use in html user interface
    this.owner = null;                                          // person that owns the device the service is running on
    this.device = null;                                         // (addressable) id of device the service is running on
    this.name = "(you shouldn't see this!)";                    // friendly name, to be overridden
    this.ns = null;                                             // name space that (globally) uniquely defines the service type
	this.local = false;
	this.shared = false; // only used for local features
	this.rpcHandler = rpcHandler;
	
    this.remove = function() {                                  // call this when this feature is removed.
		this.emit('remove', this);
	}
	
    this.isLocal = function() {                                 // returns true is the feature is running on the local device
	    return (this.device == webinos.device);
	}
	
    this.isMine = function() {                                  // returns true if the feature runs on a device of same owner
	    return (this.owner == webinos.owner);
	}

    /* called when a shared service is invoked from remote */
	this.invoked = function(params, successCB, errorCB, objectRef) {
		logger.trace('invoked(...)');
		
		logger.trace('calling emit(invoked-from-remote)');
		this.emit('invoked-from-remote', this, params);
		
		logger.trace('ending invoked()');
	}

	/* called to invoke a remote shared service */
    this.invoke = function(params, successCB, errorCB, objectRef) {
		logger.trace('invoke(...)');

		if (this.local) {
			logger.trace('calling emit(invoked-from-local)');
			this.emit('invoked-from-local', this, params, successCB, errorCB, objectRef);
		} else {
			logger.trace('calling emit(invoke)');
			this.emit('invoke', this, function(type, query) {
				var params = query.getText();

				if (params == null || params == '') {
					params = "{}";
				}

				var payload = JSON.parse(params);

				successCB(payload);
			}, params);
		}
		
		logger.trace('ending invoke()');
	};  

    /* called when the result of a remote service invocation is received */
    this.result = function(params) {
		this.emit('result', this, params);
    };

	/* called when a remote service invocation resulted in an error */
    this.error = function(err) {
        this.emit('error', this, err);
    };
}

sys.inherits(GenericFeature, RPCWebinosService);
sys.inherits(GenericFeature, EventEmitter);
exports.GenericFeature = GenericFeature;
