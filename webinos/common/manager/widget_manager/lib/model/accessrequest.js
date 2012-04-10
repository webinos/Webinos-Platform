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

this.AccessRequest = (function() {
	var url = require('url');
	var util = require('util');

	/* public constructor */
	function AccessRequest(scheme, host, port) {
		Origin.call(this, scheme, host, port);
		this.subdomains = false;
	}
	util.inherits(AccessRequest, Origin);

	/* public static functions */
	AccessRequest.create = function(urlString) {
		var urlOb = url.parse(urlString);
		if(urlOb.path || urlOb.auth || urlOb.search || urlOb.query || urlOb.hash)
			return;
		if(!urlOb.host || !urlOb.protocol)
			return;
		var scheme = Origin.isSupported(urlOb.protocol);
		if(!scheme)
			return;
		return new AccessRequest(scheme, urlOb.host, parseInt(urlOb.port));
	};

	AccessRequest.createWildcard = function() {
		return new AccessRequest(undefined, '*');
	};

	AccessRequest.serialize = ManagerUtils.prototypicalClone(Origin.serialize, {subdomains: 'boolean'});

	return AccessRequest;
})();
