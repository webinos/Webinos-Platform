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

this.LocalisedFileMapping = (function() {

  /* private static functions */
  var localePrefix = 'locales/';
  var localePrefixLen = localePrefix.length;
  var isLocaleFile = function(file) {
    return file.substr(0, localePrefixLen) == localePrefix;
  };
  
  /* public constructor */
  function LocalisedFileMapping(resource, userAgentLocales) {
    this.resource = resource;
    this.mapping = {};
    
    var userAgentLocaleSet = {};
    for(var i in userAgentLocales) userAgentLocaleSet[userAgentLocales[i]] = undefined;

    /* first enumerate all files in the widget, indexing them by locale */
    var resFiles = this.resource.list();
    var localeIndex = {};
    for(var resEntry in resFiles) {
      if(!isLocaleFile(resEntry)) continue;
      var localeEnd = resEntry.indexOf('/', localePrefixLen);
      if(localeEnd == -1) continue;
      var localeName = resEntry.substring(localePrefixLen, localeEnd);
      if(!(localeName in userAgentLocales)) continue;
      var localeEntries = localeIndex[localeName];
      if(!localeEntries) {
        localeEntries = [];
		localeIndex[localeName] = localeEntries;
	  }
      localeEntries.push(resEntry.substring(localeEnd + 1));
    }

    /* now enumerate the mapped files, in userAgentLocales order
     * to build the mapping */
    if(localeIndex.length) {
      for(var i in userAgentLocales) {
        var localeName = userAgentLocales[i];
        var localeEntries = localeIndex[localeName];
        if(localeEntries) {
          for(var j in localeEntries) {
            var file = localeEntries[j];
            if(!(file in mapping)) {
              mapping[file] = localePrefix + localeName + '/' + file;
            }
          }
        }
      }
    }
  }

  /* public static methods */
  LocalisedFileMapping.isLocaleFile = isLocaleFile;

  /* public instance methods */
  LocalisedFileMapping.prototype.contains = function(file) {
    return (file in this.mapping) || this.resource.contains(file);
  };

  LocalisedFileMapping.prototype.isLocalised = function(file) {
    return (file in this.mapping);
  };

  LocalisedFileMapping.prototype.map = function(file) {
    return this.mapping[file] || file;
  };

  LocalisedFileMapping.prototype.show = function() {
    for(var file in mapping)
      console.log(file + ' --> ' + mapping[file]);
  };

  return LocalisedFileMapping;
})();
