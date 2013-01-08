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
 * This class handles all XMPP related stuff
 * 
 * Author: Eelco Cramer, TNO
 */

(function() {
 	"use strict";

    var ltx = require('ltx');
    var util = require('util');
    var EventEmitter = require('events').EventEmitter;
    
    var path = require('path');
    var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
    var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
    var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

    var webinos = require("find-dependencies")(__dirname);

    var logger =  webinos.global.require(webinos.global.xmpppzp.location, "lib/Logger").getLogger('XMPPConnector', 'trace');

    var xmpp;
    var self;
    var nodeType = 'http://webinos.org/pzh';

    /**
     * Creates an instance of the connection object.
     * @constructor
     * @name Connection
     * @param rpcHandler The RPC handler.
     */
    function XMPPConnector() {
    	EventEmitter.call(this);
	
    	self = this;

    	this._uniqueId = Math.round(Math.random() * 10000);

    	this.basicFeatures = ["http://jabber.org/protocol/caps", 
    				 	 	  "http://jabber.org/protocol/disco#info",
                       	 	  "http://jabber.org/protocol/commands"];
    
        this.pendingRequests = {};   // hash to store <stanza id, geo service> so results can be handled
        this.featureMap = {};        // holds features, see initPresence() for explanation
    }

    util.inherits(XMPPConnector, EventEmitter);
    exports.XMPPConnector = XMPPConnector;

    /**
     * Connect to the XMPP server.
     * 
     * The connection parameters are:
     * 'jid': The JID for the connection.
     * 'password': The password to authenticate the connection with.
     * 'bosh': The URL of the bosh server to use (optional) for example: http://xmpp.servicelab.org:80/jabber
     * @function
     * @name XMPPConnection#connect
     * @param params Map containing the connection parameters for the connection.
     */
    XMPPConnector.prototype.connect = function(params) {
    	logger.trace("Entering connect()");
    	this.remoteFeatures = new Array;
    	this.pendingRequests = new Array;
	
    	this.jid = params['jid'];

    	if (params['bosh'] === undefined) {
    		xmpp = require('node-xmpp');
    		this.client = new xmpp.Component(params);
    	} else {
            // xmpp = require('node-bosh-xmpp');
            // this.client = new xmpp.Component(params['jid'], params['password'], params['bosh']);
    	}

    	this.client.on('online',
    		function() {
    			logger.debug("XMPP connector is online.");
                // self.updatePresence();
                self.emit('online');
    		}
    	);
	
    	this.client.on('end', function() {
    		logger.debug("XMPP connection has been terminated.");
    		this.emit('end');
    	});

    	this.client.on('stanza', this.onStanza);

    	this.client.on('error', this.onError);
    }

    /**
     * Gets the JID of the connection.
     * @function
     * @name XMPPConnection#getJID
     * @returns The JID.
     */
    XMPPConnector.prototype.getJID = function() {
        return this.jid;
    }

    /**
     * Handles incomming message stanza's
     * @function
     * @private
     * @name XMPPConnector#onStanza
     * @param stanza The XMPP message stanza.
     */
     XMPPConnector.prototype.onStanza = function(stanza) {
     	logger.trace('Stanza received = ' + stanza);

        if (stanza.is('iq')) { //&& stanza.attrs.type !== 'error') {
     		if (stanza.attrs.type == 'get' && stanza.getChild('query', 'http://jabber.org/protocol/disco#info') != null) {
     			self.onDiscoInfo(stanza);
     		} else if (stanza.attrs.type === 'result' || stanza.attrs.type === 'error') {
 		    	logger.info("Received a result for an unknown request id: " + stanza.attrs.id + ". Maybe it has no callback?");
     		} else if (stanza.attrs.type == 'get' || stanza.attrs.type == 'set') {
 		    	logger.info("Received a info query request. Will respond with service unavailable");
 				this.send(new xmpp.Element('iq', { 'id': stanza.attrs.id, 'type': 'error', 'to': stanza.attrs.from }).c('service-unavailable'));
     		}
     	} else if (stanza.is('message')) {
	    	logger.info("Received a message. Will ignore it for now.");
     	}
     }

    /**
     * When an error occurs
     * @function
     * @name XMPPConnector#onError
     * @returns The JID.
     */
    XMPPConnector.prototype.onError = function(stanza) {
        logger.error(stanza);
    }

    /**
     * Closes the connection
     * @function
     * @name XMPPConnector#disconnect
     */
    XMPPConnector.prototype.disconnect = function() {
    	this.client.end();
    }

    /**
     * Called when a disco info stanza is received.
     * @name XMPPConnector#onDiscoInfo
     * @function
     * @private
     * @param stanza The disco info stanza.
     */
    XMPPConnector.prototype.onDiscoInfo = function(stanza) {
    	var currentFeatures;
    	var query = stanza.getChild('query', 'http://jabber.org/protocol/disco#info');

    	if (stanza.attrs.from == null) {
    		return;
    	}

    	if (query.attrs.node != null) {
    		var node = query.attrs.node;
    		var ver = node.substring(nodeType.length + 1);
		
    		logger.debug("Received service discovery information request: " + stanza);
		
    		logger.trace("Received feature request for version: " + ver);
    		logger.trace("Returning the features for this version: " + this.featureMap[ver]);
		
    		currentFeatures = this.featureMap[ver];
    	} else {
    		// return current features
    		currentFeatures = this.basicFeatures.slice(0);
    		currentFeatures = currentFeatures.sort();
    	}

    	var resultQuery = new ltx.Element('query', {xmlns: query.attrs.xmlns});
	
    	resultQuery.c('identity', {'category': 'client', 'type': 'webinos'});
	
    	for (var i in currentFeatures) {
    	    logger.trace('key found: ' + currentFeatures[i]);
    	    var splitted = currentFeatures[i].split('#');
    	    var id = splitted[splitted.length - 1];
	    
    	    logger.trace('Feature id found: ' + id);
	    
	        var feature = currentFeatures[i];

            var featureNode = new ltx.Element('feature', {'var': feature});
    		resultQuery.cnode(featureNode);
    	}
	
    	var result = new xmpp.Element('iq', { 'to': stanza.attrs.from, 'type': 'result', 'id': stanza.attrs.id });
    	result.cnode(resultQuery);
	
    	logger.debug("Anwering service discovery information request: " + result.tree());
	
    	this.client.send(result);
    }

    /**
     * Helper function to return a 'clean' id string based on a jid.
     * @function
     * @private
     * @name jid2Id
     * @param {string} jid The jid.
     */
    var jid2Id = function (jid) {
        return jid.split(/@|\/|\./).join("_");
    }

    /** 
     * Get the bare JID from a JID String.
     * @function
     * @private
     * @name getBareJidFromJid
     * @param {string} jid A JID
     * @returns A string containing the bare JID.
     */
    var getBareJidFromJid = function (jid) {
        return jid.split("/")[0];
    }

    /** 
     *  Generate a unique ID for use in <iq/> elements.
     *
     *  All <iq/> stanzas are required to have unique id attributes.  This
     *  function makes creating these easy.  Each connection instance has
     *  a counter which starts from zero, and the value of this counter
     *  plus a colon followed by the suffix becomes the unique id. If no
     *  suffix is supplied, the counter is used as the unique id.
     *
     *  Suffixes are used to make debugging easier when reading the stream
     *  data, and their use is recommended.  The counter resets to 0 for
     *  every new connection for the same reason.  For connections to the
     *  same server that authenticate the same way, all the ids should be
     *  the same, which makes it easy to see changes.  This is useful for
     *  automated testing as well.
     * @function
     * @private
     * @name getUniqueId
     * @param {string} [suffix] An optional suffix to append to the id.
     * @returns A unique string to be used for the id attribute.
     */
    var getUniqueId = function (suffix) {
        if (typeof(suffix) == "string" || typeof(suffix) == "number") {
            return ++this._uniqueId + ":" + suffix;
        } else {
            return ++this._uniqueId + "";
        }
    }
})();