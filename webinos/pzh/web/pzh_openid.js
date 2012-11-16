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
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
********************************************************************************/
var openid   = require('openid');
var url      = require('url');
var querystr = require('querystring');

var webinos = require("find-dependencies")(__dirname);
var logger      = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;

var rely   = "";
var OpenId = exports;

OpenId.authenticate = function(hostname, port, url, returnPath, callback) {
  "use strict";
  var exts= [];
  var attr = new openid.AttributeExchange({
    "http://axschema.org/contact/country/home":     "required",
    "http://axschema.org/namePerson/first":         "required",
    "http://axschema.org/pref/language":            "required",
    "http://axschema.org/namePerson/last":          "required",
    "http://axschema.org/contact/email":            "required",
    "http://axschema.org/namePerson/friendly":      "required",
    "http://axschema.org/namePerson":               "required",
    "http://axschema.org/media/image/default":      "required",
    "http://axschema.org/person/gender/":           "required"
  });
  exts.push(attr);

  rely = new openid.RelyingParty('https://'+hostname+':'+port +'/main.html?cmd=verify&returnPath='+returnPath,
        null,
        false,
        false,
        exts);

  rely.authenticate(url, false, function(error, authUrl) {
    if(error){
      logger.error(error);
      return callback(false, error);
    } else if (!authUrl) {
      logger.error('redirection url is missing');
      return callback(false,'redirection url is missing');
    } else {
      return callback(true, authUrl);
    }
  });
};

/**
 *
 * @param req
 * @param callback
 * @return {*}
 */
OpenId.fetchOpenIdDetails = function(req, callback){
  "use strict";
  if (rely) {
    rely.verifyAssertion(req, function(err, userDetails){
      if (err){
        logger.error("unable to fetch open id details " + err.message);
        return callback(false, err.message);
      } else if (userDetails.authenticated) {
        var host, details = {country: '', username: '', email: '', image: ''};
        if(req.headers.host.split(':')){
          host = req.headers.host.split(':')[0];
        } else {
          host = req.headers.host;
        }

        if(userDetails.claimedIdentifier){
          var parsed = url.parse(userDetails.claimedIdentifier);
          var query = querystr.parse(parsed.query);
          if (query) { // google
            details.from = query["id"];
            details.provider = 'google';
          } else {
            details.from =  parsed.path.split('/')[2];
            details.provider = 'yahoo';
          }
        }
        if(userDetails.country){
          details.country = userDetails.country;
        }
        if(userDetails.firstname){
          details.username += userDetails.firstname;
        }
        if(userDetails.lastname){
          details.username += userDetails.lastname;
        }
        if(userDetails.fullname){
          details.username = userDetails.fullname.replace(/ /g, '');
        }
        if(userDetails.email){
          details.email = userDetails.email;
        }
        if(userDetails.image){
          details.image = userDetails.image;
        }
        return callback(true, details);
      }
    });
  } else {
    return callback(false, "not authenticated");
  }
};
