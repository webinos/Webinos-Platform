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
	var webinos = require("find-dependencies")(__dirname);

	var Registry = webinos.global.require(webinos.global.rpc.location, "lib/registry").Registry;
	var registry;
	var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
	var rpcHandler;

	beforeEach(function() {
		registry = new Registry({});
		rpcHandler = new RPCHandler(undefined, registry);
	});

	describe('rpcHandler', function() {

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

		it('has registerCallbackObject function', function() {
			expect(rpcHandler.registerCallbackObject).toEqual(jasmine.any(Function));
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

			expect(rpc.params).toBeDefined();
			expect(rpc.params).toEqual(jasmine.any(Object));
		});

	});

	describe('RPC service registration', function() {
		var service;
		var rpc;

		beforeEach(function() {
			service = new RPCWebinosService({
				api: 'prop-api',
				displayName: 'prop-displayName',
				description: 'prop-description'
			});
			rpc = rpcHandler.createRPC(service, 'functionName', [1]);
		});

		it('Registry is exported from node module', function() {
			expect(Registry).toEqual(jasmine.any(Function));
		});

		it('has registerObject function', function() {
			expect(registry.registerObject).toEqual(jasmine.any(Function));
		});

		it('has unregisterObject function', function() {
			expect(registry.unregisterObject).toEqual(jasmine.any(Function));
		});

		it('has no registered services initially', function() {
			expect(Object.keys(registry.objects).length).toEqual(0);
		});

		it('has exactly one registered service after registering', function() {
			registry.registerObject(service);
			expect(Object.keys(registry.objects).length).toEqual(1);
		});
		
		it('has no registered services after unregistering', function() {
			registry.registerObject(service);
			registry.unregisterObject(service);
			expect(Object.keys(registry.objects).length).toEqual(0);
		});

	});

	describe('RPC service request and response', function() {
		var service;

		beforeEach(function() {
			// create and register mock service
			var MockService = function() {
				this.base = RPCWebinosService;
				this.base({
					api: 'prop-api',
					id: 'prop-id',
					displayName: 'prop-displayName',
					description: 'prop-description'
				});
				this.testListen = function(params, success, error, objRef) {
					objRef.from = "fake"; // from is expected, fake it

					var rpc = rpcHandler.createRPC(objRef, 'onEvent', {testProp: 42});
					rpcHandler.executeRPC(rpc);
				};
			};
			MockService.prototype = new RPCWebinosService();
			MockService.prototype.testSuccess = function(params, success, error, objRef) {
				// tests success callback provided by rpc.js
				success();
			};
			MockService.prototype.testError = function(params, success, error, objRef) {
				// tests error callback provided by rpc.js
				error();
			};
			service = new MockService();
			registry.registerObject(service);

			// use our own message handler write function, usually this would
			// write the request out to the remote peer
			var msgHandler = {
					write: function(rpc) {
						rpcHandler.handleMessage(rpc);
					}
			};
			rpcHandler.setMessageHandler(msgHandler);
		});

		it('with successfull response', function() {
			spyOn(rpcHandler, 'handleMessage').andCallThrough();
			spyOn(rpcHandler, 'executeRPC').andCallThrough();

			var rpc = rpcHandler.createRPC(service, 'testSuccess', [1]);
			rpcHandler.executeRPC(rpc);

			// request
			expect(rpcHandler.handleMessage).toHaveBeenCalled();
			expect(rpcHandler.handleMessage.calls[0].args.length).toEqual(1);
			expect(rpcHandler.handleMessage.calls[0].args[0].method).toBeDefined();
			expect(rpcHandler.handleMessage.calls[0].args[0].id).toBeDefined();
			expect(rpcHandler.handleMessage.calls[0].args[0].params).toBeDefined();

			// response
			expect(rpcHandler.handleMessage.calls[1].args.length).toEqual(1);
			expect(rpcHandler.handleMessage.calls[1].args[0].id).toBeDefined();
			expect(rpcHandler.handleMessage.calls[1].args[0].result).toBeDefined();

			// called once for request and once for response
			expect(rpcHandler.executeRPC.calls.length).toEqual(2);
		});

		it('with error response', function() {
			spyOn(rpcHandler, 'handleMessage').andCallThrough();
			spyOn(rpcHandler, 'executeRPC').andCallThrough();

			var rpc = rpcHandler.createRPC(service, 'testError', [1]);
			rpcHandler.executeRPC(rpc);

			// response
			expect(rpcHandler.handleMessage.calls[1].args.length).toEqual(1);
			expect(rpcHandler.handleMessage.calls[1].args[0].id).toBeDefined();
			expect(rpcHandler.handleMessage.calls[1].args[0].error).toBeDefined();
			expect(rpcHandler.handleMessage.calls[1].args[0].error.code).toEqual(-31000);

			// called once for request and once for response
			expect(rpcHandler.executeRPC.calls.length).toEqual(2);
		});

		it('with successful responce for client side listener pattern', function() {
			spyOn(rpcHandler, 'handleMessage').andCallThrough();
			spyOn(rpcHandler, 'executeRPC').andCallThrough();

			var rpc = rpcHandler.createRPC(service, 'testListen', [1]);

			// create a temporary webinos service for our callback onEvent
			rpc.onEvent = function (){}; // empty, using spyOn instead
			spyOn(rpc, 'onEvent');
			rpcHandler.registerCallbackObject(rpc);
			rpcHandler.executeRPC(rpc);

			// response
			expect(rpcHandler.handleMessage.calls[1].args.length).toEqual(1);
			expect(rpcHandler.handleMessage.calls[1].args[0].id).toBeDefined();

			// called once for request and once for response
			expect(rpcHandler.executeRPC.calls.length).toEqual(2);

			expect(rpc.onEvent).toHaveBeenCalled();
			expect(rpc.onEvent.calls[0].args[0].testProp).toEqual(42);
		});
	});
});
