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

function load(mod, modDesc, registry, rpcHandler) {
	try {
		if (mod.Module) {
			var ApiModule = mod.Module;
			var m = new ApiModule(rpcHandler, modDesc.params);
			if (!m.init) {
				throw new Error("api module has no init function");
			}

			m.init(function register(o) {
				registry.registerObject(o);
			}, function unregister(o) {
				registry.unregisterObject(o);
			});
		} else if (mod.Service) {
			var Service = mod.Service;
			var s = new Service(rpcHandler, modDesc.params);
			registry.registerObject(s);
		}
	} catch (error) {
		logger.error("Could not load module " + modDesc.name + " with message: " + error);
	}
}

exports.loadServiceModules = function(modulesDesc, registry, rpcHandler) {
	var mods = modulesDesc.map(function(m) {
		return deps.global.require(deps.global.api[m.name].location);
	});
	for (var i=0; i<mods.length; i++) {
		load(mods[i], modulesDesc[i], registry, rpcHandler);
	}
};

exports.loadServiceModule = function(modDesc, registry, rpcHandler) {
	var mod = deps.global.require(deps.global.api[modDesc.name].location);
	load(mod, modDesc, registry, rpcHandler);
};
