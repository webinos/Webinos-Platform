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
 * Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
 ******************************************************************************/

describe('common.RPC', function() {
	var webinos = require('webinos')(__dirname);

	var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
	var rpcHandler;

	beforeEach(function() {
		rpcHandler = new RPCHandler();
	});

	it('RPCHandler is exported from node module', function() {
		expect(RPCHandler).toEqual(jasmine.any(Function));
	});

	it('RPCHandler object instantiated', function() {
		expect(rpcHandler).toBeDefined();
	});

	it('has createRPC function', function() {
		expect(rpcHandler.createRPC).toEqual(jasmine.any(Function));
	});

	it('has executeRPC function', function() {
		expect(rpcHandler.executeRPC).toEqual(jasmine.any(Function));
	});

	it('has registerObject function', function() {
		expect(rpcHandler.registerObject).toEqual(jasmine.any(Function));
	});

	it('has unregisterObject function', function() {
		expect(rpcHandler.unregisterObject).toEqual(jasmine.any(Function));
	});

	it('has registerCallbackObject function', function() {
		expect(rpcHandler.registerCallbackObject).toEqual(jasmine.any(Function));
	});

	it('createRPC with service as string type', function() {
		var rpc = rpcHandler.createRPC('Service', 'functionName', [1]);
		expect(rpc).toEqual(jasmine.any(Object));

		expect(rpc.jsonrpc).toBeDefined();
		expect(rpc.jsonrpc).toEqual('2.0');

		expect(rpc.id).toBeDefined();
		expect(rpc.id).toEqual(jasmine.any(String));

		expect(rpc.method).toBeDefined();
		expect(rpc.method).toEqual(jasmine.any(String));

		expect(rpc.params).toBeDefined();
		expect(rpc.params).toEqual(jasmine.any(Object));
	});

	it('createRPC with service as RPCWebinosService', function() {
		var service = new RPCWebinosService();
		var rpc = rpcHandler.createRPC(service, 'functionName', [1]);
		expect(rpc).toEqual(jasmine.any(Object));

		expect(rpc.jsonrpc).toBeDefined();
		expect(rpc.jsonrpc).toEqual('2.0');

		expect(rpc.id).toBeDefined();
		expect(rpc.id).toEqual(jasmine.any(String));

		expect(rpc.method).toBeDefined();
		expect(rpc.method).toEqual(jasmine.any(String));

		expect(rpc.serviceAddress).toBeDefined();

		expect(rpc.params).toBeDefined();
		expect(rpc.params).toEqual(jasmine.any(Object));
	});

	describe('RPC service registration', function() {
		var service;
		var rpc;

		this.beforeEach(function() {
			service = new RPCWebinosService();
			service.api = 'prop-api';
			service.displayName = 'prop-displayName';
			service.description = 'prop-description';
			rpc = rpcHandler.createRPC(service, 'functionName', [1]);
		});

		it('has no registered services initially', function() {
			expect(Object.keys(rpcHandler.objects).length).toEqual(0);
		});

		it('has exactly one registered service after registering', function() {
			rpcHandler.registerObject(service);
			expect(Object.keys(rpcHandler.objects).length).toEqual(1);
		});

		it('has no registered services after unregistering', function() {
			rpcHandler.registerObject(service);
			rpcHandler.unregisterObject(service);
			expect(Object.keys(rpcHandler.objects).length).toEqual(0);
		});
	});

	it('can execute and handle RPC', function() {
		var service = new RPCWebinosService();
		service.api = 'prop-api';
		service.displayName = 'prop-displayName';
		service.description = 'prop-description';
		var rpc = rpcHandler.createRPC(service, 'functionName', [1]);
		rpcHandler.registerObject(service);

		var msgHandler = {
				write: function() {
					rpcHandler.handleMessage(rpc);
				}
		};
		rpcHandler.setMessageHandler(msgHandler);
		spyOn(rpcHandler, 'handleMessage')

		rpcHandler.executeRPC(rpc);
		expect(rpcHandler.handleMessage).toHaveBeenCalled();
		expect(rpcHandler.handleMessage.mostRecentCall.args.length).toEqual(1);
		expect(rpcHandler.handleMessage.mostRecentCall.args[0].method).toBeDefined();
		expect(rpcHandler.handleMessage.mostRecentCall.args[0].id).toBeDefined();
		expect(rpcHandler.handleMessage.mostRecentCall.args[0].params).toBeDefined();
	});

});