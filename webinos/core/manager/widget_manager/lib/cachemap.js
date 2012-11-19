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

this.CacheMap = (function() {

  /* public constructor */
  function CacheMap(args) {
  }

  /* public instance methods */
  CacheMap.prototype.put = function(key, value) {
    this[key] = value;
    value.__cachemap_put = (new Date()).getTime();
  };

  CacheMap.prototype.get = function(key) {
    var value = this[key];
    if(value)
      value.__cachemap_get = (new Date()).getTime();
  };

  CacheMap.prototype.remove = function(key) {
    delete this[key];
  };
  
  /* FIXME: implement some kind of LRU pruning */

  return CacheMap;
})();
