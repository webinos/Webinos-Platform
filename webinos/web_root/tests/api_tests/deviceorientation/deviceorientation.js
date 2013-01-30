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
var testService;

// Specs tests
describe('deviceorientation follows specs', function(){
	webinos.discovery.findServices(new ServiceType("http://webinos.org/api/deviceorientation"), {
		onFound: function (service) {
			testService = service;
		}
	});

	beforeEach(function() {
		waitsFor(function() {
			return !!testService;
		}, "The discovery didn't find an Device Orientation API", 5000);
	});
	
	it('has funtion bindService', function() {
		expect(testService.bindService).toEqual(jasmine.any(Function));
	});
	
	it("can be bound", function() {
		var bound = false;

		testService.bindService({onBind: function(service) {
			testService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "The service couldn't be bound", 500);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});
	
	it('has funtion addEventListener', function() {
		expect(testService.addEventListener).toEqual(jasmine.any(Function));
	});
	
	it('has funtion removeEventListener', function() {
		expect(testService.removeEventListener).toEqual(jasmine.any(Function));
	});
	
	it('api equals to "http://webinos.org/api/deviceorientation"', function() {
		expect(testService.api).toEqual('http://webinos.org/api/deviceorientation');
	});
	
	it('displayName is string', function() {
		expect(testService.displayName).toEqual(jasmine.any(String));
	});
	
	it('description is string', function() {
		expect(testService.description).toEqual(jasmine.any(String));
	});
		
});

var eventListenerFunction = function(){
};

// Test if adding an event listener calls the successCB
var testAddEventListener = function (eventName, expected){
	it('should ' + (expected ? '' : 'not ') + 'add "' + eventName + '" event Listener', function(done){
		testService.addEventListener(eventName, eventListenerFunction, false);
	});
};

// Test if removing an event listener calls the successCB
var testRemoveEventListener = function (eventName, expected){
	it('should ' + (expected ? '' : 'not ') + 'remove "' + eventName + '" event Listener', function(done){
		testService.removeEventListener(eventName, eventListenerFunction, false);
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
