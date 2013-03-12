describe('manager.messaging', function() {

	var mockRpcHandler = jasmine.createSpyObj('rpcHandler', ['setMessageHandler', 'handleMessage']);
	var MessageHandler = require('../../lib/messagehandler.js').MessageHandler;
	var messageHandler = new MessageHandler(mockRpcHandler);

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
	it('has setOwnSessionId function', function() {
		expect(messageHandler.setOwnSessionId).toBeFunction();
	});
	it('has getOwnSessionId function', function() {
		var id = messageHandler.getOwnSessionId();
		expect(id).toBeNull();
	});
	it('has setSeparator function', function() {
		expect(messageHandler.setSeparator).toBeFunction();
	});
	it('has createRegisterMessage function', function() {
		var from="sender";
		var to="receiver";
		var message={};
		message=messageHandler.createRegisterMessage(from,to);
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
