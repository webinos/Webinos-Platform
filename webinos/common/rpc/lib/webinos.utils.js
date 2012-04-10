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

if (typeof module === "undefined") {
	if (typeof webinos === "undefined")
		webinos = {};

	if (typeof webinos.utils === "undefined")
		webinos.utils = {};
}

(function (exports) {
	"use strict";

	// MDN {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind}
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (oThis) {
			if (typeof this !== "function") // closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

			var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
			}, fBound = function () {
				return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();

			return fBound;
		};
	}

	exports.bind = function (fun, thisArg) {
		return fun.bind(thisArg);
	};

	exports.callback = function (fun, thisArg) {
		if (typeof fun !== "function")
			return function () {
			};

		return exports.bind(fun, thisArg);
	};

	// Node.js {@link https://github.com/joyent/node/blob/master/lib/util.js#L498}
	// TODO Replace (nUtil = require("util")).inherits calls with webinos.utils.inherits.
	exports.inherits = function (constructor, superConstructor) {
		constructor.prototype = Object.create(superConstructor.prototype, {
			constructor: {
				value: constructor,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
	};

	// TODO Kill.
	exports.DoublyLinkedList = function (compare) {
		this.compare = compare;
	};

	exports.DoublyLinkedList.prototype.head = null;
	exports.DoublyLinkedList.prototype.tail = null;

	exports.DoublyLinkedList.prototype.append = function (data) {
		var node = new exports.DoublyLinkedNode(data, this.tail, null);

		if (this.head === null)
			this.head = node;

		if (this.tail !== null)
			this.tail.next = node;

		this.tail = node;

		return node;
	};

	exports.DoublyLinkedList.prototype.insert = function (data) {
		var current = this.head;

		while (current !== null && this.compare(data, current.data) > 0)
			current = current.next;

		if (current === null)
			return this.append(data);

		var node = new exports.DoublyLinkedNode(data, current.prev, current);

		if (current.prev === null)
			this.head = node;
		else
			current.prev.next = node;

		current.prev = node;

		return node;
	};

	exports.DoublyLinkedList.prototype.find = function (data) {
		var current = this.head;

		while (current !== null && this.compare(data, current.data) != 0)
			current = current.next;

		return current;
	};

	exports.DoublyLinkedList.prototype.remove = function (node) {
		if (node.prev === null)
			this.head = node.next;
		else
			node.prev.next = node.next;

		if (node.next === null)
			this.tail = node.prev;
		else
			node.next.prev = node.prev;
	};

	exports.DoublyLinkedList.prototype.empty = function () {
		this.head = null;
		this.tail = null;
	};

	exports.DoublyLinkedNode = function (data, prev, next) {
		this.data = data;
		this.prev = prev;
		this.next = next;
	};
})(typeof module === "undefined" ? webinos.utils : module.exports);

