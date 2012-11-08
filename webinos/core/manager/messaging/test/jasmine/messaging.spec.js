describe('common.manager.messaging', function() {

	var webinos = require("find-dependencies")(__dirname);

	var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
	var rpcHandler = new RPCHandler();

	var MessageHandler = webinos.global.require('common/manager/messaging').MessageHandler;
	var messageHandler = new MessageHandler(rpcHandler);

	beforeEach(function() {
		this.addMatchers({
			toBeFunction: function() {
				return typeof this.actual === 'function';
			},
			toBeNumber: function() {
				return typeof this.actual === 'number';
			}
		});
	});

	it('MessageHandler object instantiated', function() {
		expect(messageHandler).toBeDefined();
	});

	it('has setSendMessage function', function() {
		expect(messageHandler.setSendMessage).toBeFunction();
	});
	it('has sendMessage function', function() {
		expect(messageHandler.sendMessage).toBeFunction();
	});
	it('has setObjectRef function', function() {
		expect(messageHandler.setObjectRef).toBeFunction();
	});
	it('has setGetOwnId function', function() {
		expect(messageHandler.setGetOwnId).toBeFunction();
	});
	it('has getOwnId function', function() {
		var id = messageHandler.getOwnId();
		expect(id).toBeNull();
	});
	it('has setSeparator function', function() {
		expect(messageHandler.setSeparator).toBeFunction();
	});

	it('has createMessage function', function() {

		var options = {
		register: false
	 	,type: "JSONRPC"
	 	,id: 36
	 	,from: "sender"
	 	,to: "receiver"
	 	,resp_to:"sender"
	 	};

		var message = {};
		message = messageHandler.createMessage(options);
		expect(message.register).toEqual(false);
		expect(message.type).toEqual("JSONRPC");
		expect(message.id).toEqual(36);
		expect(message.from).toEqual("sender");
		expect(message.to).toEqual("receiver");
		expect(message.resp_to).toEqual("sender");
	});
	it('has createMessageId function', function() {
		var message={};
		messageHandler.createMessageId(message);
		expect(message.id).toBeNumber();
	});

	it('has registerSender function', function() {
		var from="sender";
		var to="receiver";
		var message={};
		message=messageHandler.registerSender(from,to);
		expect(message.register).toEqual(true);
		expect(message.from).toEqual("sender");
		expect(message.to).toEqual("receiver");
		expect(message.type).toEqual("JSONRPC");
		expect(message.payload).toEqual(null);

	});
	it('has removeRoute function', function() {
		expect(messageHandler.removeRoute).toBeFunction();
	});
	it('has write function', function() {
		expect(messageHandler.write).toBeFunction();
	});
	it('has onMessageReceived function', function() {
		expect(messageHandler.onMessageReceived).toBeFunction();
	});

});
