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

var deps = require("find-dependencies")(__dirname);
var logger = require("./logging.js")(__filename);

exports.loadServiceModules = function(modules, registry, rpcHandler) {
	var mmm = modules.map(function(m) {
		return deps.global.require(deps.global.api[m.name].location);
	});
	for (var i=0; i<mmm.length; i++) {
		try {
			if (mmm[i].Module) {
				var ApiModule = mmm[i].Module;
				var m = new ApiModule(rpcHandler, modules[i].params);
				if (!m.init) {
					throw new Error("api module has no init function");
				}

				m.init(function register(o) {
					registry.registerObject(o);
				}, function unregister(o) {
					registry.unregisterObject(o);
				});
			} else if (mmm[i].Service) {
				var Service = mmm[i].Service;
				var s = new Service(rpcHandler, modules[i].params);
				registry.registerObject(s);
			}
		} catch (error) {
			logger.error("Could not load module " + modules[i].name + " with message: " + error);
		}
	}
};

exports.loadServiceModule = function(m, registry, rpcHandler) {
	try {
		var Service = deps.global.require(deps.global.api[m.name].location).Service;
		registry.registerObject(new Service(rpcHandler, modules[i].params));
	} catch (error) {
		logger.error("Could not load module " + m.name + " with message: " + error);
	}
};
