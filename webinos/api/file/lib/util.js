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

var inherits = require("inherits")

exports.CustomError = CustomError

inherits(CustomError, Error)
function CustomError(name, message) {
  CustomError.super.call(this, message || name)

  Error.captureStackTrace(this, CustomError)

  this.name = name
}

CustomError.prototype.toJSON = function () {
  var json = { name    : this.name
             , message : this.message
             }
  return json
}

// Creates an anonymous wrapper function that, when called, schedules the given
// callback to be executed on the next loop around the event loop. Arguments
// given to the wrapper function are passed on to the callback.
exports.async = function (callback) {
  if (typeof callback !== "function") {
    return callback
  }
  return function () {
    var argsArray = arguments
    process.nextTick(function () {
      callback.apply(null, argsArray)
    })
  }
}

// Combines two separate callbacks for success and error into a single
// Node.js-style callback.
exports.combine = function (successCallback, errorCallback) {
  return function (error, result) {
    if (error) return errorCallback(error)
    successCallback(result)
  }
}
