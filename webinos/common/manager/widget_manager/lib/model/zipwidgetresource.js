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
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

this.ZipWidgetResource = (function() {
  var zipfile = require('zipfile');

  /* public constructor */
  function ZipWidgetResource(path) {

    /* public instance variables */
    this.resource = path;
    this.zipfile = new zipfile.ZipFile(path);
    this.contents = {};
    for(var i in this.zipfile.names) this.contents[this.zipfile.names[i]] = undefined;
  }

  /* public instance methods */
  ZipWidgetResource.prototype.contains = function(name) {
    return (name in this.contents);
  };

  ZipWidgetResource.prototype.list = function() {
    return this.contents;
  };

  ZipWidgetResource.prototype.readFileSync = function(name) {
    var result;
    if (name in this.contents) {
		// Avoid 'archive error' exceptions due to resource being encrypted.
		try {
			result = this.zipfile.readFileSync(name);
		} catch (e) {
			result = null;
		}
	}
    return result;
  };

  ZipWidgetResource.prototype.readFile = function(name, callback) {
    var result;
    if(name in this.contents)
      result = this.zipfile.readFile(name, callback);
    return result;
  };

  ZipWidgetResource.prototype.getResource = function() {
    return this.resource;
  };

  ZipWidgetResource.prototype.dispose = function() {
    this.zipfile.destroy();
  };

  return ZipWidgetResource;
})();
