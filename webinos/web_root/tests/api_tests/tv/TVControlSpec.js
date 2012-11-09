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
 * Copyright 2012 Martin Lasak, Fraunhofer FOKUS
 ******************************************************************************/

//Test suite for tv module API according to spec at http://dev.webinos.org/specifications/draft/tv.html
//Potential changes/diffs especially regarding the phase two of the project are marked as such.

describe("tv module API", function() {
	var tvService;

	beforeEach(function() {
		this.addMatchers({
			toHaveProp: function(expected) {
				return typeof this.actual[expected] !== "undefined";
			},
			toBeEither: function() {
				for (var j=0;j<arguments.length;j++){
					if (arguments[j]===this.actual)	return true;
				}
				return false;
			},
			toBePrintableString: function(){
				return !(/[\x00-\x08\x0E-\x1F]/.test(this.actual)) && 
					 typeof this.actual === "string" && this.actual.length>0;
			},
			toBeValidAsSourceForVideoElement: function(){
				return typeof this.actual === "string" || 
				(typeof this.actual !== "undefined" && 
				 typeof this.actual.audioTracks !== "undefined" && 
				 typeof this.actual.ended !== "undefined" && 
				 typeof this.actual.label !== "undefined" &&
				 typeof this.actual.videoTracks !== "undefined"  )
			}
		});

		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/tv"), {
			onFound: function (service) {
				tvService = service;
			}
		});

		waitsFor(function() {
			return !!tvService;
		}, "the discovery to find an TV Control service", 10000);
	});

	it("should be available from the discovery", function() {
		expect(tvService).toBeDefined();
	});

	it("has the necessary properties as service object", function() {
		expect(tvService).toHaveProp("state");
		expect(tvService.api).toEqual(jasmine.any(String));
		expect(tvService.id).toEqual(jasmine.any(String));
		expect(tvService.displayName).toEqual(jasmine.any(String));
		expect(tvService.description).toEqual(jasmine.any(String));
		expect(tvService.icon).toEqual(jasmine.any(String));
		expect(tvService.bindService).toEqual(jasmine.any(Function));
	});

	it("can be bound", function() {
		var bound = false;

		tvService.bindService({onBind: function(service) {
			tvService = service;
			bound = true;
		}});

		waitsFor(function() {
			return bound;
		}, "the service to be bound", 1000);

		runs(function() {
			expect(bound).toEqual(true);
		});
	});

	//general interface availability tests
	it("has the necessary properties as TV Control API service interface", function() {
		expect(tvService.tuner).toEqual(jasmine.any(Object));
		expect(tvService.display).toEqual(jasmine.any(Object));
	});
	
	it("has a property tuner with necessary sub properties as specified for TV Tuner Manager", function() {
		expect(tvService.tuner.getTVSources).toEqual(jasmine.any(Function));
	});
	
	it("has a property display with necessary sub properties as specified for TV Display Manager interface", function() {
		expect(tvService.display.setChannel).toEqual(jasmine.any(Function));
		expect(tvService.display.addEventListener).toEqual(jasmine.any(Function));
		//for phase two: 
		//expect(tvService.display.currentChannel).toEqual(jasmine.any(Object));
		//expect(tvService.display.removeEventListener).toEqual(jasmine.any(Function));
	});

	//data retrival tests: TVSources
	it("can provide a list of all available sources and each source has properties as specified for TV Source", function(){
		var tuners = null, atLeastOneTunerFound = false;
		
		tvService.tuner.getTVSources(function(foundTuners){
			if(!atLeastOneTunerFound){
				if(foundTuners instanceof Array && foundTuners.length>0){
				tuners = foundTuners;
				atLeastOneTunerFound = true;
				}
			}
		},function(error){});
		
		waitsFor(function() {
			return atLeastOneTunerFound;
		}, "getting proper TV source.", 2000);
		
		runs(function() {
			expect(tuners).not.toBeNull();
			expect(atLeastOneTunerFound).toEqual(true);
			if(atLeastOneTunerFound){
				//go through all received tuners
				for(var index=0; index<tuners.length; index++){
					//check if name is 'human readable', there maybe is a better one
					expect(tuners[index].name).toBePrintableString();
					expect(tuners[index].channelList).toEqual(jasmine.any(Array));			
				}
			}
		});
	});

	//data retrival tests: Channel
	it("can provide channel information with appropriate properties as specified for Channel interface", function(){
		var tuners = null, atLeastOneTunerFound = false;
		
		tvService.tuner.getTVSources(function(foundTuners){
			if(!atLeastOneTunerFound){
				if(foundTuners instanceof Array && foundTuners.length>0){
				tuners = foundTuners;
				atLeastOneTunerFound = true;
				}
			}
		},function(error){});
		
		waitsFor(function() {
			return atLeastOneTunerFound;
		}, "getting proper TV source.", 2000);
		
		runs(function() {
				//go through all received tuners
				for(var tunerIndex=0; tunerIndex<tuners.length; tunerIndex++){	
					for(var channelIndex=0; channelIndex<tuners[tunerIndex].channelList.length; channelIndex++){
						//for phase two: 
						//expect(tuners[tunerIndex].channelList[channelIndex].channelType).toBeEither('tv', 'radio');
						expect(tuners[tunerIndex].channelList[channelIndex].channelType).toBeEither(0, 1);	
						expect(tuners[tunerIndex].channelList[channelIndex].name).toBePrintableString();
						expect(tuners[tunerIndex].channelList[channelIndex].longName).toBePrintableString();
						expect(tuners[tunerIndex].channelList[channelIndex].stream).toBeValidAsSourceForVideoElement();	
					}
				}
		});
	});
	
	//change channel test
	it("can be used to change channels",function(){
		var tuners = null, appropriateTunerIndex=-1, channelChanged = false;
		
		tvService.tuner.getTVSources(function(foundTuners){
			if(appropriateTunerIndex===-1){
				if(foundTuners instanceof Array && foundTuners.length>0){
				for(var tunerIndex=0; tunerIndex<foundTuners.length; tunerIndex++){	
					if(foundTuners[tunerIndex].channelList.length>=2){
						appropriateTunerIndex = tunerIndex;
						tuners = foundTuners;
					}
				}
				}
			}
		},function(error){});
		
		waitsFor(function() {
			if(appropriateTunerIndex>=0){
				//change to second channel in a list
				tvService.display.setChannel(tuners[appropriateTunerIndex].channelList[1],function(){
					//change to first channel in a list
					tvService.display.setChannel(tuners[appropriateTunerIndex].channelList[0],function(){channelChanged=true;},function(){});
				},function(){});
				return true;			
			}else{
			return false;
			}
		}, "getting proper TV source with at least two channels to switch between them.", 2000);

		waitsFor(function() {
			return channelChanged;
		}, "success callbacks to be called after channel changes.", 10000);
		
		runs(function() {
			expect(channelChanged).toBe(true);
		});	
	});

	//for phase two: negative test, requesting channel change to a non existing channel
	xit("is robust to handle invalid data when channel change is requested",function(){
		var tuners = null, appropriateTunerIndex=-1, channelChanged = false, errored = false;
		
		tvService.tuner.getTVSources(function(foundTuners){
			if(appropriateTunerIndex===-1){
				if(foundTuners instanceof Array && foundTuners.length>0){
				for(var tunerIndex=0; tunerIndex<foundTuners.length; tunerIndex++){	
					if(foundTuners[tunerIndex].channelList.length>=1){
						appropriateTunerIndex = tunerIndex;
						tuners = foundTuners;
					}
				}
				}
			}
		},function(error){});
		
		waitsFor(function() {
			if(appropriateTunerIndex>=0){
				//change to second channel in a list
				tvService.display.setChannel(tuners[appropriateTunerIndex].channelList[0],function(){
					//change to a invalid channel, e.g. empty object
					tvService.display.setChannel({},function(){channelChanged=true;},function(e){errored=true;});
				},function(e){});
				return true;			
			}else{
			return false;
			}
		}, "getting proper TV source with at least one channel.", 2000);

		waitsFor(function() {
			return errored;
		}, "error callback to be called after invalid channel change request.", 10000);
		
		runs(function() {
			expect(channelChanged).toBe(false);
			expect(errored).toBe(true);
		});	
	});

	//for phase two: current tuned channel test
	xit("can provide information which channel is currently tuned", function(){
		var tuners = null, appropriateTunerIndex=-1, currentChannelPropertyCorrect=false;
		
		tvService.tuner.getTVSources(function(foundTuners){
			if(appropriateTunerIndex===-1){
				if(foundTuners instanceof Array && foundTuners.length>0){
				for(var tunerIndex=0; tunerIndex<foundTuners.length; tunerIndex++){	
					if(foundTuners[tunerIndex].channelList.length>=2){
						appropriateTunerIndex = tunerIndex;
						tuners = foundTuners;
					}
				}
				}
			}
		},function(error){});
		
		waitsFor(function() {
			if(appropriateTunerIndex>=0){
				//change to a channel from list
				tvService.display.setChannel(tuners[appropriateTunerIndex].channelList[1],function(channel){
					currentChannelPropertyCorrect = (tvService.display.currentChannel.channelType === channel.channelType) && (tvService.display.currentChannel.name === channel.name) && (tvService.display.currentChannel.longName === channel.longName);
					//change to first channel in a list
					tvService.display.setChannel(tuners[appropriateTunerIndex].channelList[0],function(channel){currentChannelPropertyCorrect=currentChannelPropertyCorrect && (tvService.display.currentChannel.channelType === channel.channelType) && (tvService.display.currentChannel.name === channel.name) && (tvService.display.currentChannel.longName === channel.longName);},function(){});
				},function(){});
				return true;			
			}else{
			return false;
			}
		}, "getting proper TV source with at least two channels to switch between them.", 2000);

		waitsFor(function() {
			return currentChannelPropertyCorrect;
		}, "success callbacks to be called after channel changes.", 10000);
		
		runs(function() {
			expect(currentChannelPropertyCorrect).toBe(true);
		});			
	});	

	//stream test
	it("can provide channel stream information that can be played/rendered in Web runtime in video or audio tag", function(){
		var playedCorrectlyAutomatedConfirmation=false, playedCorrectlyUserConfirmation=true, streamWasPlayedAWhile=false, streamedChannel=null;

		var tuners = null, appropriateTunerIndex=-1;
		
		tvService.tuner.getTVSources(function(foundTuners){
			if(appropriateTunerIndex===-1){
				if(foundTuners instanceof Array && foundTuners.length>0){
				for(var tunerIndex=0; tunerIndex<foundTuners.length; tunerIndex++){	
					if(foundTuners[tunerIndex].channelList.length>=1){
						appropriateTunerIndex = tunerIndex;
						tuners = foundTuners;
					}
				}
				}
			}
		},function(error){});
		
		waitsFor(function() {
			if(appropriateTunerIndex>=0){
				//change to second channel in a list
				tvService.display.setChannel(tuners[appropriateTunerIndex].channelList[0],function(channel){
					streamedChannel = channel;
					//render temporary ui to display stream
					var tempui = document.createElement('div');
 					tempui.style.width = 320;
 					tempui.style.height = 240;
					tempui.style.zIndex = 9999;
					var videoObject = document.createElement('video');
					videoObject.addEventListener('playing',function(e){playedCorrectlyAutomatedConfirmation=true;});
					videoObject.width = 320;
					videoObject.src = streamedChannel.stream;
					tempui.appendChild(videoObject);
					var buttonObject = document.createElement('button');
					buttonObject.innerHTML = "click if NOT played correctly!";
					buttonObject.addEventListener('click',function(e){playedCorrectlyUserConfirmation=false;buttonObject.disabled=true;});
					tempui.appendChild(buttonObject);
					document.body.appendChild(tempui);
					videoObject.play();
					setTimeout(function(){
						videoObject.pause();
						videoObject.src="";
						document.body.removeChild(tempui);
						streamWasPlayedAWhile=true;
					},8000);
				},function(){});
				return true;			
			}else{
			return false;
			}
		}, "getting proper TV source to play a stream.", 2000);

		waitsFor(function() {
			return streamWasPlayedAWhile;
		}, "a stream to be played for a while.", 20000);
		
		runs(function() {
			expect(streamedChannel).not.toBeNull();
			expect(streamWasPlayedAWhile).toBe(true);
			expect(playedCorrectlyAutomatedConfirmation).toBe(true);
			expect(playedCorrectlyUserConfirmation).toBe(true);
		});		
	});
	
	//for phase two: negative test, tv service gets unavailable
	xit("can not receive a list of all available TV tuners if all TV services get unavailable (plugged off)", function(){
		var tuners = null, errored = false, successed = false, atLeastOneTunerFound = false;
		
		tvService.tuner.getTVSources(function(foundTuners){
			tuners = foundTuners;
			atLeastOneTunerFound = tuners instanceof Array && tuners.length>0;
			successed = true;
		},function(error){
			errored = true;
		});
		
		waitsFor(function() {
			return errored || successed;
		}, "some callback (success or error) for getting TV source to be called.", 1000);
		
		runs(function() {
			expect(errored).toEqual(true);
			expect(successed).toEqual(false);
			expect(tuners).toBeNull();
			expect(atLeastOneTunerFound).toEqual(false);
		});
	});
	
	//events tests
	it("will notify all registered listeners about occured channel change events",function(){
		var tuners = null, appropriateTunerIndex=-1, firstNotificationReceived = false, secondNotificationReceived = false, firstChannelTunedTo=null, secondChannelTunedTo=null, firstChannelNotifiedAbout=null, secondChannelNotifiedAbout=null ;
		
		tvService.tuner.getTVSources(function(foundTuners){
			if(appropriateTunerIndex===-1){
				if(foundTuners instanceof Array && foundTuners.length>0){
				for(var tunerIndex=0; tunerIndex<foundTuners.length; tunerIndex++){	
					if(foundTuners[tunerIndex].channelList.length>=2){
						appropriateTunerIndex = tunerIndex;
						tuners = foundTuners;
					}
				}
				}
			}
		},function(error){});
		
		//for phase two: EventTarget will be implemented
		//notice: in phase one registration to channel change events is wrongly specified. Instead adding EventTarget at the window object the current implementation adds the EventTarget to the webinos.tv.display object allready.  
		tvService.display.addEventListener("channelchange",function(channel){
			if(!firstNotificationReceived){
				firstNotificationReceived=true;
				firstChannelNotifiedAbout=channel;
			}else if(!secondNotificationReceived){
				secondNotificationReceived=true;
				secondChannelNotifiedAbout=channel;
			}
		});

		waitsFor(function() {
			if(appropriateTunerIndex>=0){
				//change to second channel in a list
				firstChannelTunedTo=tuners[appropriateTunerIndex].channelList[1];
				tvService.display.setChannel(firstChannelTunedTo,function(){
					//change to first channel in a list
					secondChannelTunedTo=tuners[appropriateTunerIndex].channelList[0];
					tvService.display.setChannel(secondChannelTunedTo,function(){},function(){});
				},function(){});
				return true;			
			}else{
			return false;
			}
		}, "getting proper TV source with at least two channels to switch between them.", 2000);

		waitsFor(function() {
			return firstNotificationReceived && secondNotificationReceived;
		}, "success callbacks to be called after channel changes and all notification received.", 15000);
		
		runs(function() {
			expect(firstNotificationReceived).toBe(true);
			expect(secondNotificationReceived).toBe(true);
			expect(firstChannelTunedTo).toEqual(firstChannelNotifiedAbout);
			expect(secondChannelTunedTo).toEqual(secondChannelNotifiedAbout);
		});	
	});

});
