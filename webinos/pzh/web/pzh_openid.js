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

var webinos = require('webinos')(__dirname);
var session = webinos.global.require(webinos.global.pzp.location, 'lib/session');
var log     = new session.common.debug("pzh_openid");

var farm    = require('../lib/pzh_farm');
var ws      = require('./pzh_webserver.js');

var rely;

exports.authenticate = function(hostname, url, res, query) {
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
  rely = new openid.RelyingParty('https://'+hostname+':'+
      session.configuration.port.farm_webServerPort+'/main.html?cmd=verify&id='+query.id,
    null,
    false,
    false,
    exts);
  rely.authenticate(url, false, function(error, authUrl) {
    if(error){
      log.error(error);
    } else if (!authUrl) {
      log.error('authentication failed as url to redirect after authentication is missing');
    } else {
      res.writeHeader(200, 'application/x-javascript');
      res.write(JSON.stringify({type:"prop", payload: {status:'authenticate-google', url: authUrl}}));
      res.end();
    }
  });
}

exports.fetchOpenIdDetails = function(req, res, query, callback){
  if (typeof rely !== "undefined") {
    rely.verifyAssertion(req, function(err, userDetails){
      if (err){
        log.error("unable to login " + err.message);
        address = req.connection.socket.remoteAddress;
        res.writeHead(302, {Location: "http://"+query.returnPath+"?cmd=error&reason="+err.message});
        res.end();
      }
      else if (userDetails.authenticated) {
        var host;
        var details = {country: '', username: '', email: '', image: ''};
        if(req.headers.host.split(':')){
          host = req.headers.host.split(':')[0];
        } else {
          host = req.headers.host;
        }

        if(userDetails.claimedIdentifier){
          // google
          var parsed = url.parse(userDetails.claimedIdentifier);
          var query = querystr.parse(parsed.query);
          if (query && query.id) {
            details.id = query.id;
            details.provider = 'google';
          } else {
            details.id =  parsed.path.split('/')[2];
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
        callback(host, details);
      }
    });
  }
}
