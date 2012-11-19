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
 * Copyright 2012 Fraunhofer
 *******************************************************************************/

var webinos = require("find-dependencies")(__dirname);
var logger = console;

exports.loadServiceModules = function(modules, registry, rpcHandler) {
	var services = modules.map(function(m) {
		return webinos.global.require(webinos.global.api[m.name].location).Service;
	});
	for (var i=0; i<services.length; i++) {
		try {
			var Service = services[i];
			registry.registerObject(new Service(rpcHandler, modules[i].params));
		} catch (error) {
			logger.error(error);
			logger.error("Could not load module " + modules[i].name + " with message: " + error);
		}
	}
};

exports.loadServiceModule = function(m, registry, rpcHandler) {
	try {
		var Service = webinos.global.require(webinos.global.api[m.name].location).Service;
		registry.registerObject(new Service(rpcHandler, modules[i].params));
	} catch (error) {
		logger.error(error);
		logger.error("Could not load module " + m.name + " with message: " + error);
	}
};
