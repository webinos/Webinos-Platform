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

this.DirectoryWidgetResource = (function() {
  var fs = require('fs');
  var path = require('path');

  /* public constructor */
  function DirectoryWidgetResource(dir) {
    var that = this;

    /* public instance variables */
    this.resource = dir;
    this.contents = {};
    
    function scanDir(name) {
      var children = fs.readdirSync(path.resolve(that.resource, name));
      for(var i in children) {
        var childName = path.resolve(name, children[i]);
        var stats = fs.statSync(path.resolve(that.resource, childName));
        if(stats.isDirectory())
          scanDir(childName);
        else
          that.contents[childName] = undefined;
      }
    }
    
    /* init contents */
    scanDir('');
  }

  /* public instance methods */
  DirectoryWidgetResource.prototype.contains = function(name) {
    return (name in contents);
  };

  DirectoryWidgetResource.prototype.list = function() {
    return contents;
  };

  DirectoryWidgetResource.prototype.readFileSync = function(name) {
    var result = undefined;
    if(name in contents)
      result = fs.readFileSync(path.resolve(resource, name));
    return result;
  };

  DirectoryWidgetResource.prototype.readFile = function(name, callback) {
    var result = undefined;
    if(name in contents)
      result = fs.readFile(path.resolve(resource, name), callback);
    return result;
  };

  DirectoryWidgetResource.prototype.dispose = function() {};

  return DirectoryWidgetResource;
})();
