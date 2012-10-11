/******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 EPU NTUA
 *****************************************************************************/

// Setup
var webinos = require("find-dependencies")(__dirname);
var rpc = webinos.global.require(webinos.global.rpc.location).RPCHandler;

// A test PZP with a messageHandler in order to capture the events and log them for testing
var TestPZP = {
	messagesRecieved: {	},
	addRemoteServiceListener: function(){ /* This is required by RPC */},
	messageHandler: {
		write: function(rpc, respto, msgid) {
			TestPZP.messagesRecieved[rpc.params.type] = true;
			// We could also test that the events follow W3C specs (like the following example) but all field are optional!
			//describe('deviceorientation ' + rpc.params.type + ' event should follows W3C specs', function(){
			//	  switch(rpc.params.type){
			//		case "devicemotion":
			//			it('has acceleration attribute', function(){
			//				expect(rpc.params.acceleration).toBeDefined();
			//				expect(rpc.params.acceleration.x).toBeDefined();
			//				expect(rpc.params.acceleration.y).toBeDefined();
			//				expect(rpc.params.acceleration.z).toBeDefined();
			//			});
			//			break;
			//		}
			//});
		}
	}
};

var RPCHandler = new rpc(TestPZP);
RPCHandler.setMessageHandler(TestPZP.messageHandler);

var serviceImplementation = webinos.global.require(webinos.global.api.deviceorientation.location).Service;
var serviceParams =  {
		connector : "fake" // Other possible values are most,simulator,fake
	};
var testService = new serviceImplementation(RPCHandler, serviceParams);

// Specs tests
describe('deviceorientation follows specs', function(){
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

	it('has funtion addEventListener', function() {
		expect(testService.addEventListener).toBeFunction();
	});

	it('has funtion removeEventListener', function() {
		expect(testService.removeEventListener).toBeFunction();
	});

	it('api equals to "http://webinos.org/api/deviceorientation"', function() {
		expect(testService.api).toEqual('http://webinos.org/api/deviceorientation');
	});

	it('displayName is string', function() {
		expect(testService.displayName).toBeString();
	});

	it('description is string', function() {
		expect(testService.description).toBeString();
	});

});

// A fake object reference
var testObjectRef = { api : testService.api};

// Test if adding an event listener calls the successCB
var testAddEventListener = function (eventName, expected){
	it('should ' + (expected ? '' : 'not ') + 'add ' + eventName + ' event Listener', function(done){
		//The signature is the following testService.addEventListener(params, successCB, errorCB, objectRef)
		testService.addEventListener([eventName], function(){ if (expected) done();  else done("Event '" + eventName + "' exists although it shouldn't");}, function(){ if (!expected) done(); else done("Event '" + eventName + "' failed to add Handler");},testObjectRef);
	});
};

// Test if removing an event listener calls the successCB
var testRemoveEventListener = function (eventName, expected){
	it('should ' + (expected ? '' : 'not ') + 'remove ' + eventName + ' event Listener', function(done){
		//The signature is the following testService.removeEventListener(params, successCB, errorCB, objectRef)
		testService.removeEventListener([testObjectRef, eventName], function(){ if (expected) done();  else done("Event '" + eventName + "' removed although it shouldn't");}, function(){ if (!expected) done(); else done("Event '" + eventName + "' failed to remove Handler");},testObjectRef);
	});
};

// Functionality testing

// Add event listener
describe('deviceorientation add event listeners work', function(){
	testAddEventListener('devicemotion', true);
	testAddEventListener('deviceorientation', true);
	testAddEventListener('compassneedscalibration', true);
	testAddEventListener('something else', false);
});

// Remove event listener
describe('deviceorientation remove event listeners work', function(){
	testRemoveEventListener('devicemotion', true);
	testRemoveEventListener('deviceorientation', true);
	testRemoveEventListener('compassneedscalibration', true);
	testRemoveEventListener('something else', false);
});

// Only for the fake connector we can also test if it throws the events

var testEventThrown = function (eventName, expected){
	it('should have ' + (expected ? '' : 'not ') + 'throw event ' + eventName, function(){
		if (expected)
			expect(TestPZP.messagesRecieved[eventName]).toBeTruthy();
		else
			expect(TestPZP.messagesRecieved[eventName]).toBeUndefined();
	});
};

if (serviceParams.connector == "fake"){ // fake connector throws events directly when adding the eventHandler
	describe('deviceorientation throwed at least one event', function(){
		testEventThrown('devicemotion', true);
		testEventThrown('deviceorientation', true);
		testEventThrown('compassneedscalibration', true);
		testEventThrown('something else', false);
	});
}
