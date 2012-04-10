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
*******************************************************************************/

/**
 * service_discovery.js
 * handles service discovery request from the browser.
 * author: Eelco Cramer (TNO)
 */

//TODO services in the browser and in node js have to be in sync.

var sys = require('util');
var logger = require('nlogger').logger('ServiceDiscovery.js');
var WebinosFeatures = require('./WebinosFeatures.js');
var fm = require('./LocalFeatureManager.js');

var connection;
var io;

function start(socketIO, pzhConnection, jid, rpcHandler) {
	logger.trace("Entering start()");

	fm.initialize(pzhConnection, jid, rpcHandler);

	connection = pzhConnection;
	io = socketIO;
	
	var publisher = function(socket, feature) {
		logger.trace("The feature " + feature.ns + " on " + feature.device + " became available.");

		socket.emit('resolved', {id: feature.id, ns: feature.ns, device: feature.device, owner: feature.owner, local: feature.local, shared: feature.shared});

		// keep track of the feature.
		feature.once('remove', function(feature) {
			// unpublish when the feature is removed.
			logger.trace("onRemove: the feature " + feature.ns + " on " + feature.device + " became unavailable. Id=" + feature.id);
			
			socket.emit(feature.id + '-removed', { id: feature.id });
			
			logger.trace('onRemove: and is removed: ' + feature.id + '-removed');
		});
	}
	
	// subscribe to disco requests from the browser
	io.of('/disco').on('connection', function(socket) {
		socket.on('request', function(data) {
			logger.trace("Received disco request: " + data.ns);
			connection.removeListener(data.ns, function(feature) {
				publisher(socket, feature);
			});

			//TODO not sure if this is thread safe

			// search in shared services first.
			var alreadyShared = connection.sharedServicesForNamespace(data.ns);
			logger.trace("Already have " + alreadyShared.length + " features of this type available.")
			for (var i=0; i<alreadyShared.length; i++) {
				publisher(socket, alreadyShared[i]);
			}

			// subscribe to future messages
			connection.on(data.ns, function(feature) {
				logger.trace('Publish feature on ' + feature.device + ' of type ' + feature.ns + ' to browser');
				publisher(socket, feature);
				logger.trace('Done publishing');
			});
			
			logger.trace("Subscribed the request.");
		});
		
		socket.on('local', function(data) {
			logger.trace("Getting all the local features: " + data.filter);

			//TODO only supports the 'all' filter at this moment.
			if (data.filter === 'all') {
				for (var key in fm.features) { // tell browser about local features
					var feature = fm.features[key];
					publisher(socket, feature);
				}
			}
		});
		
		socket.on('share', function(data) {
			logger.trace("Entering subscribe(feature " + data.id + " turned " + data.flag + ")");

			if (data.flag) {
				logger.trace('Sharing the feature.');

				fm.features[data.id].shared = true;

				try {
					connection.shareFeature(fm.features[data.id]);
				} catch (err) {
					logger.error(err);
				}
			} else {
				logger.trace('Unsharing the feature.');
				fm.features[data.id].shared = false;
				connection.unshareFeature(fm.features[data.id]);
			}

			logger.trace('Exit subscribe()');
		});
	});

	logger.trace("Leaving start()");
}

exports.start = start;
