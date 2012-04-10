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
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 *****************************************************************************/

// TODO Kill.
(function (exports) {
	"use strict";

	exports.DOMException = {};
	exports.DOMException.serialize = function (exception) {
		return {
			name: exception.name,
			message: exception.message,
			code: exception.code
		};
	};

	exports.DOMError = {};
	exports.DOMError.serialize = function (error) {
		return {
			name: error.name
		};
	};

	exports.Event = {};
	exports.Event.serialize = function (event) {
		return {
			type: event.type,
			// eventPhase: event.eventPhase,
			// stopPropagation: event.stopPropagation,
			// stopImmediatePropagation: event.stopImmediatePropagation,
			// canceled: event.canceled,
			// initialized: event.initialized,
			// dispatch: event.dispatch,
			bubbles: event.bubbles,
			cancelable: event.cancelable
			// defaultPrevented: event.defaultPrevented,
			// isTrusted: event.isTrusted,
			// timeStamp: event.timeStamp
		};
	};

	exports.ProgressEvent = {};
	exports.ProgressEvent.serialize = function (event) {
		var object = exports.Event.serialize(event);

		object.lengthComputable = event.lengthComputable;
		object.loaded = event.loaded;
		object.total = event.total;

		return object;
	};
})(module.exports);
