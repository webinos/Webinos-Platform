/*******************************************************************************
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
 ******************************************************************************/

if (typeof webinos === "undefined") webinos = {};
if (typeof webinos.util === "undefined") webinos.util = {};

(function (exports) {
  exports.inherits = inherits;

  // webinos <3 inherits
  function inherits(c, p, proto) {
    proto = proto || {};
    var e = {};
    [c.prototype, proto].forEach(function (s) {
      Object.getOwnPropertyNames(s).forEach(function (k) {
        e[k] = Object.getOwnPropertyDescriptor(s, k);
      });
    });
    c.prototype = Object.create(p.prototype, e);
    c.super_ = p;
  }

  exports.CustomError = CustomError;

  inherits(CustomError, Error);
  function CustomError(name, message) {
    CustomError.super_.call(this, message || name);

    this.name = name;
  }

  exports.EventTarget = EventTarget;

  function EventTarget() {}

  EventTarget.prototype.addEventListener = function (type, listener) {
    if (typeof this.events === "undefined") this.events = {};
    if (typeof this.events[type] === "undefined") this.events[type] = [];

    this.events[type].push(listener);
  };

  EventTarget.prototype.removeEventListener = function (type, listener) {
    if (typeof this.events === "undefined" ||
        typeof this.events[type] === "undefined") {
      return;
    }

    var position = this.events[type].indexOf(listener);
    if (position >= 0) {
      this.events[type].splice(position, 1);
    }
  };

  EventTarget.prototype.removeAllListeners = function (type) {
    if (arguments.length === 0) {
      this.events = {};
    } else if (typeof this.events !== "undefined" &&
               typeof this.events[type] !== "undefined") {
      this.events[type] = [];
    }
  };

  EventTarget.prototype.dispatchEvent = function (event) {
    if (typeof this.events === "undefined" ||
        typeof this.events[event.type] === "undefined") {
      return false;
    }

    var listeners = this.events[event.type].slice();
    if (!listeners.length) return false;

    for (var i = 0, length = listeners.length; i < length; i++) {
      listeners[i].call(this, event);
    }

    return true;
  };

  exports.Event = Event;

  function Event(type) {
    this.type = type;
    this.timeStamp = Date.now();
  }

  exports.ProgressEvent = ProgressEvent;

  inherits(ProgressEvent, Event);
  function ProgressEvent(type, eventInitDict) {
    ProgressEvent.super_.call(this, type);

    eventInitDict = eventInitDict || {};

    this.lengthComputable = eventInitDict.lengthComputable || false;
    this.loaded = eventInitDict.loaded || 0;
    this.total = eventInitDict.total || 0;
  }

  exports.callback = function (maybeCallback) {
    if (typeof maybeCallback !== "function") {
      return function () {};
    }
    return maybeCallback;
  };

  exports.async = function (callback) {
    if (typeof callback !== "function") {
      return callback;
    }
    return function () {
      var argsArray = arguments;
      window.setTimeout(function () {
        callback.apply(null, argsArray);
      }, 0);
    };
  };

  exports.ab2hex = function (buf) {
    var hex = "";
    var view = new Uint8Array(buf);
    for (var i = 0; i < view.length; i++) {
      var repr = view[i].toString(16);
      hex += (repr.length < 2 ? "0" : "") + repr;
    }
    return hex;
  };

  exports.hex2ab = function (hex) {
    var buf = new ArrayBuffer(hex.length / 2);
    var view = new Uint8Array(buf);
    for (var i = 0; i < view.length; i++) {
      view[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return buf;
  }
})(webinos.util);
