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

describe ( "Test ability to add a sensor", function () {
	it('Test ability to define a sensor',  function () {  
        	expect(sensorToUse.api).toEqual(jasmine.any(object)); 
  	  }); 
	it('Test ability to define a sensor\'s type',  function () {  
        	expect(sensorToUse.api).toEqual("http://webinos.org/api/sensors.temperature"); 
  	  }); 
	it('Test ability to add maximum range to sensor',  function () {  
        	expect(sensorToUse.maximumRange).toEqual(jasmine.any(Number));
		expect(sensorToUse.maximumRange).toBeGreaterThan(0);
  	  });
	it('Test ability to add min delay to sensor',  function () {  
        	expect(sensorToUse.minDelay).toEqual(jasmine.any(Number));
		expect(sensorToUse.mindDelay).toBeGreaterThan(0);
  	  });
	it('Test ability to add power to sensor',  function () {  
        	expect(sensorToUse.power).toEqual(jasmine.any(Number));
		expect(sensorToUse.power).toBeGreaterThan(0);
  	  });
	it('Test ability to add resolution to sensor',  function () {  
        	expect(sensorToUse.resolution).toEqual(jasmine.any(Number));
		expect(sensorToUse.resolution).toBeGreaterThan(0);
  	  });
	it('Test ability to add vendor to sensor',  function () {  
        	expect(sensorToUse.resolution).toEqual(jasmine.any(string)); // Do we have a list of valid vendors? If not we need to check that we don't have an empty or garbage value for vendor.
  	  });
	it('Test ability to add version to sensor',  function () {  
        	expect(sensorToUse.resolution).toEqual(jasmine.any(Number)); // What format does version number take? Is there a standard?
		expect(sensorToUse.resolution).toBeGreaterThan(0);
  	  });
}); 

describe ( "Test ability to register an event", function () {
	it('Test that correct sensor is being monitored',  function () {  
        	expect(sensorToUse.api).toEqual(event.sensorType); 
  	  }); 
	it('Test that Id is set',  function () {  
        	expect(event.sensorId).toBeDefined(); 
  	  }); 
	it('Test that accuracy is set and make sense',  function () {  
		expect(event.accuracy).toEqual(jasmine.any(Number)); 
		// Will accuracy always be positive?
  	  }); 
	it('Test that rate is set and make sense',  function () {  
		expect(event.rate).toEqual(jasmine.any(Number)); 
		expect(event.rate).toBeGreaterThan(0); 
  	  }); 
	it('Test that interrupt is set',  function () {  
		expect(event.rate).toBeDefined(); // What format so interrupt have?
  	  }); 
	it('Test that reading took place',  function () {  
		expect(event.sensorValues[0]).toBeDefined(); 
  	  }); 
});

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
		while (var count < 10) {
			setTimeout(function(){
				expect(event.sensorValues[0]).toBeCloseTo(previous, variance);
				previous = event.sensorValues[0];
			},3000);
		}
  	  });
});
