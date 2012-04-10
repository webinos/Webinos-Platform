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

this.Origin = (function() {

  /* public constructor */
  function Origin(scheme, host, port) {
    this.scheme = scheme;
    this.host = host;
    if(!port) port = (scheme == 'http') ? 80 : 443;
    this.port = port;
  }

  /* public static methods */
  Origin.isSupported = function(scheme) {
	var result;
    if(scheme.charAt(scheme.length-1) == ':')
      scheme = scheme.substring(0, scheme.length - 2);
    if(scheme == 'HTTP' || scheme == 'http')
      result = 'http';
    else if(scheme == 'HTTPS' || scheme == 'https')
      result = 'https';
    return result;
  };

  /* public instance methods */
  Origin.prototype.toUriString = function() {
    if(scheme === undefined)
	  return 'unknown:';
	var result = scheme  + '://' + host;
	if("*" != host)
	  result += ':' + port;
	return result;
  };
  
  Origin.serialize = {
	scheme: 'string',
	host: 'string',
	port: 'number'
  };

  return Origin;
})();
