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
 * Copyright 2012 Ivan Glautier, Nquiring Minds
 ******************************************************************************/

describe("Sensor API", function() {
    var sensorService;

    webinos.discovery.findServices(new ServiceType("http://webinos.org/api/sensors.temperature"), {
        onFound: function (service) {
            sensorService = service;
        }
    });

    beforeEach(function() {
        waitsFor(function() {
            return !!sensorService;
        }, "found service", 5000);
    });

    it("should be available from the discovery", function() {
        expect(sensorService).toBeDefined();
    });

    it("has the necessary properties as service object", function() {
        expect(sensorService.state).toBeDefined();
        expect(sensorService.api).toEqual(jasmine.any(String));
        expect(sensorService.id).toEqual(jasmine.any(String));
        expect(sensorService.displayName).toEqual(jasmine.any(String));
        expect(sensorService.description).toEqual(jasmine.any(String));
        expect(sensorService.icon).toEqual(jasmine.any(String));
        expect(sensorService.bindService).toEqual(jasmine.any(Function));
    });

    describe("with bound service", function() {
        var sensorServiceBound;

        beforeEach(function() {
            if (!sensorService) {
                waitsFor(function() {
                    return !!sensorService;
                }, "found service", 5000);
            }
            if (!sensorServiceBound) {
                sensorService.bindService({onBind: function(service) {
                    sensorServiceBound = service;
                }});
                waitsFor(function() {
                    return !!sensorServiceBound;
                }, "the service to be bound", 500);
            }
        });

        it("can be bound", function() {
            expect(sensorServiceBound).toBeDefined();
        });

        it("has the necessary properties and functions as bound API service", function() {
            expect(sensorServiceBound.api).toEqual("http://webinos.org/api/sensors.temperature");
            expect(sensorServiceBound.configureSensor).toEqual(jasmine.any(Function));
        });

    });
});

/* 
describe ( "Test ability to successfuly detect an increase or decrease in sensor value", function () {
    it('Test that we can detect an increase',  function () {
        var initial = event.sensorValues[0];
        alert('Please create an increase in sensor value');
        expect(event.sensorValues[0]).toBeGreaterThan(initial);
    });
    it('Test that we can detect a decrease',  function () {
        var initial = event.sensorValues[0];
        alert('Please create a decrease in sensor value');
        expect(event.sensorValues[0]).toBeLessThan(initial);
    });
    it('Test that we don\'t get random changes',  function () {
        var previous = event.sensorValues[0];
        var variance = previous/1000; // How sensitive are the different sensors? Perhaps this needs to look at the resolution?
        var count = 0;
        while (count < 10) {
            setTimeout(function(){
                expect(event.sensorValues[0]).toBeCloseTo(previous, variance);
                previous = event.sensorValues[0];
            },3000);
        }
    });
});
*/
