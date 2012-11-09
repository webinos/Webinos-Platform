/*******************************************************************************
*  Code contributed to the webinos project
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*  
*     http://www.apache.org/licenses/LICENSE-2.0
*  
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* 
* Copyright 2012 Martin Lasak, Fraunhofer FOKUS
******************************************************************************/

// Implementation of the tv module API that works without any specific STB hardware

var MOCK_CHANNELS_FILE = __dirname + '/../tools/mock-channels.json';
 
(function() {

	var WebinosTV, TVManager, TVDisplayManager, TVDisplaySuccessCB, TVTunerManager, TVSuccessCB, TVErrorCB, TVError, TVSource, Channel, ChannelChangeEvent;

	var channelChangeHandlers = [];

	/**
	 * Set the configuration parameters for the mock service.
	 */
	exports.tv_setConf = function(params) {
		if(params && params.path){
			MOCK_CHANNELS_FILE = params.path;
		}
	}

	/**
	 * Creates tv object.
	 * 
	 */
	WebinosTV = function() {
		this.tv = new TVManager();
	};
	WebinosTV.prototype.tv = null;

	/**
	 * Interface to manage what's currently displayed on TV screen.
	 * 
	 * 
	 * This interface is useful when an app doesn't want to show the broadcast
	 * itself, but let the TV natively handle playback, i.e. not in a web
	 * context. Useful to build an control interface that allows channel
	 * switching.
	 * 
	 */
	TVDisplayManager = function() {

	};

	/**
	 * Switches the channel natively on the TV (same as when a hardware remote
	 * control would be used).
	 * 
	 */
	TVDisplayManager.prototype.setChannel = function(channel, successCallback,
			errorCallback) {
		var i;
		// return the set channel immediatelly
		successCallback(channel);
		// send the channel change information to all registered handlers
		for (i = 0; channelChangeHandlers.length > i; i++) {
			channelChangeHandlers[i](channel);
		}
	};

	/**
	 * Callback function when current channel changed successfully.
	 * 
	 */
	TVDisplaySuccessCB = function() {

	};
	TVDisplaySuccessCB.prototype.onSuccess = function(channel) {

		return;
	};
    
    TVDisplayManager.prototype.getEPGPIC = function(channel, successCallback,
			errorCallback) {

		//TODO: do snapshot, send bese64 converted delayed

		successCallback({
			'programName':channel.name,
			'type':'News',
			'startTS':new Date().getTime()-1000*60*15,
			'endTS':new Date().getTime()+1000*60*15,
			'snapShot':'data:image/png;base64,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'
		});
	};


	/**
	 * Get a list of all available TV tuners.
	 * 
	 */
	TVTunerManager = function() {

	};

	/**
	 * Get a list of all available TV tuners.
	 * 
	 */
	TVTunerManager.prototype.getTVSources = function(successCallback,
			errorCallback) {

		var readChannels, tvTuners=[], channelList= [];

		try{
			readChannels = require(MOCK_CHANNELS_FILE);
		}catch(e){		
console.log(MOCK_CHANNELS_FILE+' '+readChannels);process.exit();
			if (typeof errorCallback === 'function') {
				errorCallback();
			}
			return;
		}


		if(readChannels && readChannels.sourceName && readChannels.channelList){
			for(var i=0; i<readChannels.channelList.length; i++){
				channelList.push(new Channel(
									0,
									readChannels.channelList[i].channelName,
									'Long name of '+readChannels.channelList[i].channelName,
									readChannels.channelList[i].channelURL,
									new TVSource(readChannels.sourceName)));
			}
			if(channelList.length){
				tvTuners.push({name:readChannels.sourceName,channelList:channelList});
			}
		}

		if (typeof successCallback === 'function') {
			successCallback(tvTuners);
			return;
		}

		if (typeof errorCallback === 'function') {
			errorCallback();
		}
	};

	/**
	 * Callback for found TV tuners.
	 * 
	 */
	TVSuccessCB = function() {

	};

	/**
	 * Callback that is called with the found TV sources.
	 * 
	 */
	TVSuccessCB.prototype.onSuccess = function(sources) {

		return;
	};

	/**
	 * Error callback for errors when trying to get TV tuners.
	 * 
	 */
	TVErrorCB = function() {

	};

	/**
	 * Callback that is called when an error occures while getting TV sources
	 * 
	 */
	TVErrorCB.prototype.onError = function(error) {

		return;
	};

	/**
	 * Error codes.
	 * 
	 */
	TVError = function() {

		this.code = Number;
	};

	/**
	 * An unknown error.
	 * 
	 */
	TVError.prototype.UNKNOWN_ERROR = 0;

	/**
	 * Invalid input channel.
	 * 
	 */
	TVError.prototype.ILLEGAL_CHANNEL_ERROR = 1;

	/**
	 * Code.
	 * 
	 */
	TVError.prototype.code = Number;

	/**
	 * TV source: a list of channels with a name.
	 * 
	 */
	TVSource = function(tvsourcename) {

		this.name = tvsourcename;
		// TODO: get the real channel list from device
		this.channelList = [];
	};

	/**
	 * The name of the source.
	 * 
	 * 
	 * The name should describe the kind of tuner this source represents, e.g.
	 * DVB-T, DVB-C.
	 * 
	 */
	TVSource.prototype.name = String;

	/**
	 * List of channels for this source.
	 * 
	 */
	TVSource.prototype.channelList = Number;

	/**
	 * The Channel Interface
	 * 
	 * 
	 * Channel objects provide access to the video stream.
	 * 
	 */
	Channel = function(channelType, name, longName, stream, tvsource) {

		if (typeof channelType === 'number') {
			this.channelType = channelType;
		}

		if (typeof name === 'string') {
			this.name = name;
		}

		if (typeof longName === 'string') {
			this.longName = longName;
		}

		this.stream = stream;

		this.tvsource = tvsource;
	};

	/**
	 * Indicates a TV channel.
	 * 
	 */
	Channel.prototype.TYPE_TV = 0;

	/**
	 * Indicates a radio channel.
	 * 
	 */
	Channel.prototype.TYPE_RADIO = 1;

	/**
	 * The type of channel.
	 * 
	 * 
	 * Type of channel is defined by one of the TYPE_* constants defined above.
	 * 
	 */
	Channel.prototype.channelType = Number;

	/**
	 * The name of the channel.
	 * 
	 * 
	 * The name of the channel will typically be the call sign of the station.
	 * 
	 */
	Channel.prototype.name = String;

	/**
	 * The long name of the channel.
	 * 
	 * 
	 * The long name of the channel if transmitted. Can be undefined if not
	 * available.
	 * 
	 */
	Channel.prototype.longName = String;

	/**
	 * The video stream.
	 * 
	 * 
	 * This stream is a represents a valid source for a HTMLVideoElement.
	 * 
	 */
	Channel.prototype.stream = null;

	/**
	 * The source this channels belongs too.
	 * 
	 */
	Channel.prototype.tvsource = null;

	/**
	 * Event that fires when the channel is changed.
	 * 
	 * 
	 * Changing channels could also be invoked by other parties, e.g. a hardware
	 * remote control. A ChannelChange event will be fire in these cases which
	 * provides the channel that was switched to.
	 * 
	 */
	ChannelChangeEvent = function() {

		this.channel = new Channel();
	};

	/**
	 * The new channel.
	 * 
	 */
	ChannelChangeEvent.prototype.channel = null;

	/**
	 * Initializes a new channel change event.
	 * 
	 */
	ChannelChangeEvent.prototype.initChannelChangeEvent = function(type,
			bubbles, cancelable, channel) {

		return;
	};

	/**
	 * Adding a handler for the channel change event.
	 * 
	 */
	// TODO: does not conform API Spec, but needs to be added!
	TVDisplayManager.prototype.addEventListener = function(eventname,
			channelchangeeventhandler, useCapture) {
		if (eventname === 'channelchange'
				&& typeof channelchangeeventhandler === 'function') {
			channelChangeHandlers.push(channelchangeeventhandler);
		}
		return;
	};

	/**
	 * Access to tuner and display managers.
	 * 
	 */
	TVManager = function() {

		this.display = new TVDisplayManager();
		this.tuner = new TVTunerManager();
	};

	exports.tv = new WebinosTV();
}());
