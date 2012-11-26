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
 * Copyright 2012 Eelco Cramer, TNO
 ******************************************************************************/

describe('webinos.common.xmpp', function() {
    var webinos = require("find-dependencies")(__dirname);
    
    var Registry = webinos.global.require(webinos.global.rpc.location, "lib/registry").Registry;
    var registry;
    var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
    var rpcHandler;
    var xmpp = webinos.global.require(webinos.global.xmpp.location, "lib/xmpp");
    var connection;

	beforeEach(function() {
		registry = new Registry({});
		rpcHandler = new RPCHandler(undefined, registry);
		connection = new xmpp.Connection(rpcHandler);
	});

	describe('Remote feature discovery', function() {
	    var Listener;
	    
	    beforeEach(function() {
	        Listener = function() {
	            
	        };
	        
	        Listener.newFeature = function(feature) {
	            
	        };
	    });

		it('XMPP is exported from node module', function() {
			expect(xmpp.Connection).toEqual(jasmine.any(Function));
		});

		it('XMPP Connection object instantiated', function() {
		    expect(xmpp.Connection).toBeDefined();
		});
		
		it('has createAndAddRemoteFeature function', function() {
		    expect(connection.createAndAddRemoteFeature).toEqual(jasmine.any(Function));
		});
		
		it('can add a remote feature', function() {
		    spyOn(Listener, 'newFeature');
		    connection.on('newFeature', Listener.newFeature);
		    connection.createAndAddRemoteFeature('http://webinos.org/api/test', 'pzp1', 'id', 'displayName', 'description');
		    expect(Listener.newFeature).toHaveBeenCalled();
		    connection.removeAllListeners();
		});
		
		it('can add create a different local id for each remote feature with the same id but from different pzp', function() {
		    var firstFeature;
		    var secondFeature;
		    
		    connection.on('newFeature', function(feature) {
		        firstFeature = feature;
		        console.log(feature.displayName);
                registry.registerObject(feature);
		    });
		    
		    connection.createAndAddRemoteFeature('http://webinos.org/api/test', 'pzp1', 'id', 'displayName', 'description');

		    connection.removeAllListeners();

		    connection.on('newFeature', function(feature) {
		        secondFeature = feature;
		        console.log(feature.displayName);
                registry.registerObject(feature);
		    });

			expect(Object.keys(registry.objects['http://webinos.org/api/test']).length).toEqual(1);

		    connection.createAndAddRemoteFeature('http://webinos.org/api/test', 'pzp2', 'id', 'displayName', 'description');
		    
		    expect(firstFeature.displayName).not.toEqual(secondFeature.displayName);
			expect(Object.keys(registry.objects['http://webinos.org/api/test']).length).toEqual(2);

            // clean up
            rpcHandler.registry.unregisterObject(firstFeature);
            rpcHandler.registry.unregisterObject(secondFeature);
		    connection.removeAllListeners();
		});
    });
});
