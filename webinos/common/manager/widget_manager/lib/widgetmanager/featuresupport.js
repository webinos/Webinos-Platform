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

this.FeatureSupport = (function() {

  /* private static variables */
  var W3C_TEST_FEATURE = "feature:a9bb79c1";
  
  var knownFeatures = {
    'http://api.webinos.org/contacts': {
      'http://api.webinos.org/contacts.read': undefined,
      'http://api.webinos.org/contacts.write': undefined
    }
  };

  /* public constructor */
  function FeatureSupport() {}

  /* public static functions */
  FeatureSupport.isSupported = function(feature) {
    if(Config.get().w3cTestMode && feature == W3C_TEST_FEATURE)
      return {W3C_TEST_FEATURE: undefined};
    
    if(feature in knownFeatures)
      return knownFeatures[feature];

    /*
     * if the feature is http://<host>/path.with.dot.separator then
     * see if there is a match with "super features"
     */
    var url = require('url').parse(feature);
    var idx;
    var stem = url.protocol + '//' + url.host;
    if(url && (feature == (stem + url.pathname))) {
      var path = url.pathname;
      while((idx = path.lastIndexOf('.')) != -1) {
        path = path.substring(0, idx);
        var superFeature = stem + path;
        if((superFeature in knownFeatures) && (feature in knownFeatures[superFeature]))
          return {feature: undefined};
      } 
    }
    return {};
  };

  return FeatureSupport;
})();
