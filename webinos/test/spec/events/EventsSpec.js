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

describe("Events API", function() {
	var eventsService;

	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			}
		});

		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/events"), {
			onFound: function (service) {
				eventsService = service;
			}
		});

		waitsFor(function() {
			return !!eventsService;
		}, "The discovery didn't find an Events service", 5000);
	});

	it("should be available from the discovery", function() {
		expect(eventsService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(eventsService).toHaveProp("state");
		expect(eventsService.api).toEqual(jasmine.any(String));
		expect(eventsService.id).toEqual(jasmine.any(String));
		expect(eventsService.displayName).toEqual(jasmine.any(String));
		expect(eventsService.description).toEqual(jasmine.any(String));
		expect(eventsService.icon).toEqual(jasmine.any(String));
		expect(eventsService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		eventsService.bindService({onBind: function(service) {
			eventsService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "The service couldn't be bound", 500);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});

	it("has the necessary properties and functions as Events API service", function() {
		expect(eventsService.createWebinosEvent).toEqual(jasmine.any(Function));
		expect(eventsService.addWebinosEventListener).toEqual(jasmine.any(Function));
		expect(eventsService.removeWebinosEventListener).toEqual(jasmine.any(Function));
	});

	it("can create an event", function() {
		var ev = eventsService.createWebinosEvent("testtype", {to: [{id: "to"}], source: {id: "from"}});
		expect(ev).toHaveProp("type");
		expect(ev).toHaveProp("addressing");
		expect(ev).toHaveProp("id");
		expect(ev).toHaveProp("timeStamp");
		expect(ev.dispatchWebinosEvent).toEqual(jasmine.any(Function));
		expect(ev.forwardWebinosEvent).toEqual(jasmine.any(Function));
	});

	it("calls onError for dispatchWebinosEvent when no event listener registered", function() {
		var errored = false;

		var ev = eventsService.createWebinosEvent();
		ev.dispatchWebinosEvent({
			onError: function(event, recipient) {
				errored = true;
			}
		});

		waitsFor(function() {
			return errored;
		}, "onError callback to be called.", 200);

		runs(function() {
			expect(errored).toEqual(true);
		});
	});

	it("can send and deliver an event", function() {
		var sent = false;
		var delivered = false;
		var appId = eventsService.myAppID;

		var listenerId = eventsService.addWebinosEventListener(function() {});

		expect(listenerId).toEqual(jasmine.any(String));

		var ev = eventsService.createWebinosEvent(null, {to: [{id: appId}], source: {id: appId}});
		ev.dispatchWebinosEvent({
			onSending: function(event, recipient) {
				sent = true;
			},
			onDelivery: function(event, recipient) {
				delivered = true;
			}
		});

		waitsFor(function() {
			return sent;
		}, "onSending callback to be called.", 1000);

		waitsFor(function() {
			return delivered;
		}, "onDelivery callback to be called.", 3000);

		runs(function() {
			expect(sent).toEqual(true);
			expect(delivered).toEqual(true);
		});

		eventsService.removeWebinosEventListener(listenerId);
	});

	it("can receive an event", function() {
		var appId = eventsService.myAppID;
		var received = false;

		var listenerId = eventsService.addWebinosEventListener(function(rcvdEvt) {
			received = true;
		});

		expect(listenerId).toEqual(jasmine.any(String));

		var ev = eventsService.createWebinosEvent(null, {to: [{id: appId}], source: {id: appId}});
		ev.dispatchWebinosEvent();

		waitsFor(function() {
			return received;
		}, "event listener to be called.", 3000);

		runs(function() {
			expect(received).toEqual(true);
		});

		eventsService.removeWebinosEventListener(listenerId);
	});

});