describe('common.RPC', function() {
	var webinos = require('webinos')(__dirname);
	
	var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
	
	beforeEach(function() {
		this.addMatchers({
			toBeFunction: function() {
				return typeof this.actual === 'function';
			},
			toBeObject: function() {
				return typeof this.actual === 'object';
			},
			toBeString: function() {
				return typeof this.actual === 'string';
			},
			toBeNumber: function() {
				return typeof this.actual === 'number';
			}
		});
	});

	it('RPCHandler is exported from node module', function() {
		expect(RPCHandler).toBeFunction();
	});
	
	var rpcHandler = new RPCHandler();

	it('RPCHandler object instantiated', function() {
		expect(rpcHandler).toBeDefined();
	});

	it('has createRPC function', function() {
		expect(rpcHandler.createRPC).toBeFunction();
	});

	it('has executeRPC function', function() {
		expect(rpcHandler.executeRPC).toBeFunction();
	});
	
	it('has registerObject function', function() {
		expect(rpcHandler.registerObject).toBeFunction();
	});
	
	it('has unregisterObject function', function() {
		expect(rpcHandler.unregisterObject).toBeFunction();
	});
	
	it('has registerCallbackObject function', function() {
		expect(rpcHandler.registerCallbackObject).toBeFunction();
	});
	
	it('createRPC with service as string type', function() {
		var rpc = rpcHandler.createRPC('Service', 'functionName', [1]);
		expect(rpc).toBeObject();
		
		expect(rpc.jsonrpc).toBeDefined();
		expect(rpc.jsonrpc).toEqual('2.0');
		
		expect(rpc.id).toBeDefined();
		expect(rpc.id).toBeNumber();
		
		expect(rpc.method).toBeDefined();
		expect(rpc.method).toBeString();
		
		expect(rpc.params).toBeDefined();
		expect(rpc.params).toBeObject();
	});
	
	it('createRPC with service as RPCWebinosService', function() {
		var service = new RPCWebinosService();
		var rpc = rpcHandler.createRPC(service, 'functionName', [1]);
		expect(rpc).toBeObject();
		
		expect(rpc.jsonrpc).toBeDefined();
		expect(rpc.jsonrpc).toEqual('2.0');
		
		expect(rpc.id).toBeDefined();
		expect(rpc.id).toBeNumber();
		
		expect(rpc.method).toBeDefined();
		expect(rpc.method).toBeString();
		
		expect(rpc.serviceAddress).toBeDefined();
		
		expect(rpc.params).toBeDefined();
		expect(rpc.params).toBeObject();
	});
	
});