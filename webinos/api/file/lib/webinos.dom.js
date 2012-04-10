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

/**
 * TODO Kill.
 */
(function (exports) {
	"use strict";

	var nEvents = require("events"),
		nUtil = require("util");

	var webinos = require("webinos")(__dirname);
		webinos.utils = webinos.global.require(webinos.global.rpc.location, "lib/webinos.utils.js");

	exports.DOMException = function (type, message) {
		this.name = type;
		this.message = message;

		if (typeof exports.DOMException.typeToCodeMap[type] === "number")
			this.code = exports.DOMException.typeToCodeMap[type];
	};

	exports.DOMException.INDEX_SIZE_ERR = 1;
	exports.DOMException.DOMSTRING_SIZE_ERR = 2;
	exports.DOMException.HIERARCHY_REQUEST_ERR = 3;
	exports.DOMException.WRONG_DOCUMENT_ERR = 4;
	exports.DOMException.INVALID_CHARACTER_ERR = 5;
	exports.DOMException.NO_DATA_ALLOWED_ERR = 6;
	exports.DOMException.NO_MODIFICATION_ALLOWED_ERR = 7;
	exports.DOMException.NOT_FOUND_ERR = 8;
	exports.DOMException.NOT_SUPPORTED_ERR = 9;
	exports.DOMException.INUSE_ATTRIBUTE_ERR = 10;
	exports.DOMException.INVALID_STATE_ERR = 11;
	exports.DOMException.SYNTAX_ERR = 12;
	exports.DOMException.INVALID_MODIFICATION_ERR = 13;
	exports.DOMException.NAMESPACE_ERR = 14;
	exports.DOMException.INVALID_ACCESS_ERR = 15;
	exports.DOMException.VALIDATION_ERR = 16;
	exports.DOMException.TYPE_MISMATCH_ERR = 17;
	exports.DOMException.SECURITY_ERR = 18;
	exports.DOMException.NETWORK_ERR = 19;
	exports.DOMException.ABORT_ERR = 20;
	exports.DOMException.URL_MISMATCH_ERR = 21;
	exports.DOMException.QUOTA_EXCEEDED_ERR = 22;
	exports.DOMException.TIMEOUT_ERR = 23;
	exports.DOMException.INVALID_NODE_TYPE_ERR = 24;
	exports.DOMException.DATA_CLONE_ERR = 25;

	exports.DOMException.typeToCodeMap = {
		"IndexSizeError": exports.DOMException.INDEX_SIZE_ERR,
		"HierarchyRequestError": exports.DOMException.HIERARCHY_REQUEST_ERR,
		"WrongDocumentError": exports.DOMException.WRONG_DOCUMENT_ERR,
		"InvalidCharacterError": exports.DOMException.INVALID_CHARACTER_ERR,
		"NoModificationAllowedError": exports.DOMException.NO_MODIFICATION_ALLOWED_ERR,
		"NotFoundError": exports.DOMException.NOT_FOUND_ERR,
		"NotSupportedError": exports.DOMException.NOT_SUPPORTED_ERR,
		"InvalidStateError": exports.DOMException.INVALID_STATE_ERR,
		"SyntaxError": exports.DOMException.SYNTAX_ERR,
		"InvalidModificationError": exports.DOMException.INVALID_MODIFICATION_ERR,
		"NamespaceError": exports.DOMException.NAMESPACE_ERR,
		"InvalidAccessError": exports.DOMException.INVALID_ACCESS_ERR,
		"TypeMismatchError": exports.DOMException.TYPE_MISMATCH_ERR,
		"SecurityError": exports.DOMException.SECURITY_ERR,
		"NetworkError": exports.DOMException.NETWORK_ERR,
		"AbortError": exports.DOMException.ABORT_ERR,
		"URLMismatchError": exports.DOMException.URL_MISMATCH_ERR,
		"QuotaExceededError": exports.DOMException.QUOTA_EXCEEDED_ERR,
		"TimeoutError": exports.DOMException.TIMEOUT_ERR,
		"InvalidNodeTypeError": exports.DOMException.INVALID_NODE_TYPE_ERR,
		"DataCloneError": exports.DOMException.DATA_CLONE_ERR
	};

	exports.DOMException.prototype.code = 0;

	exports.DOMError = function (type) {
		this.name = type;
	};

	exports.EventTarget = function () {
		this._eventEmitter = new nEvents.EventEmitter();
	};

	exports.EventTarget.prototype.addEventListener = function (type, listener, capture /* ignored */) {
		if (listener === null)
			return;

		this._eventEmitter.addListener(type, webinos.utils.bind(listener, this) /* bind to event's currentTarget */);
	};

	exports.EventTarget.prototype.removeEventListener = function (type, listener, capture /* ignored */) {
		if (listener === null)
			return;

		this._eventEmitter.removeListener(type, webinos.utils.bind(listener, this) /* bind to event's currentTarget */);
	};

	exports.EventTarget.prototype.dispatchEvent = function (event) {
		if (event.dispatch || !event.initialized)
			throw new exports.DOMException("InvalidStateError",
					"event either already dispatched or not yet initialized");

		event.isTrusted = false;

		event.dispatch = true;

		event.target = this;
		event.currentTarget = this;

		this._eventEmitter.emit(event.type, event);

		event.dispatch = false;

		event.eventPhase = exports.Event.AT_TARGET;

		event.currentTarget = null;

		return true /* !event.canceled */;
	};

	exports.Event = function (type, eventInitDict) {
		this.initialized = true;

		this.type = type;

		if (typeof eventInitDict === "object") {
			if (typeof eventInitDict.bubbles === "boolean")
				this.bubbles = eventInitDict.bubbles;

			if (typeof eventInitDict.cancelable === "boolean")
				this.cancelable = eventInitDict.cancelable;

			// TODO Set other event attributes defined in the dictionary. How to validate attribute types?
		}
	};

	exports.Event.CAPTURING_PHASE = 1;
	exports.Event.AT_TARGET = 2;
	exports.Event.BUBBLING_PHASE = 3;

	exports.Event.prototype.type = "";
	exports.Event.prototype.target = null;
	exports.Event.prototype.currentTarget = null;

	exports.Event.prototype.eventPhase = exports.Event.AT_TARGET;

	// exports.Event.prototype.stopPropagation = false;
	// exports.Event.prototype.stopImmediatePropagation = false;
	// exports.Event.prototype.canceled = false;
	exports.Event.prototype.initialized = false;
	exports.Event.prototype.dispatch = false;

	exports.Event.prototype.bubbles = false;
	exports.Event.prototype.cancelable = false;

	exports.Event.prototype.defaultPrevented = false;

	exports.Event.prototype.isTrusted = false;
	exports.Event.prototype.timeStamp = 0; // TODO Initialize to Unix time on event creation.

	exports.Event.prototype.stopPropagation = function () {
		throw new exports.DOMException("NotSupportedError", "stopping event propagation is not supported");
	};

	exports.Event.prototype.stopImmediatePropagation = function () {
		throw new exports.DOMException("NotSupportedError", "immediately stopping event propagation is not supported");
	};

	exports.Event.prototype.preventDefault = function () {
		throw new exports.DOMException("NotSupportedError", "event canceling is not supported");
	};

	exports.Event.prototype.initEvent = function (type, bubbles, cancelable) {
		this.initialized = true;

		if (this.dispatch)
			return;

		// this.stopPropagation = false;
		// this.stopImmediatePropagation = false;
		// this.canceled = false;

		this.isTrusted = false;

		this.target = null;

		this.type = type;
		this.bubbles = bubbles;
		this.cancelable = cancelable;
	};

	exports.ProgressEvent = function (type, eventInitDict) {
		exports.Event.call(this, type, eventInitDict);

		if (typeof eventInitDict === "object") {
			if (typeof eventInitDict.lengthComputable === "boolean")
				this.lengthComputable = eventInitDict.lengthComputable;

			if (typeof eventInitDict.loaded === "number")
				this.loaded = eventInitDict.loaded;

			if (typeof eventInitDict.total === "number")
				this.total = eventInitDict.total;
		}
	};

	nUtil.inherits(exports.ProgressEvent, exports.Event);

	exports.ProgressEvent.prototype.lengthComputable = false;
	exports.ProgressEvent.prototype.loaded = 0;
	exports.ProgressEvent.prototype.total = 0;
})(module.exports);
