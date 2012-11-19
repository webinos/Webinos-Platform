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
* Copyright 2011 Istituto Superiore Mario Boella (ISMB)
******************************************************************************/

var https = require('https');
var EventEmitter = require('events').EventEmitter;
var querystring_ = require('querystring');

var serviceName = 'GoogleContact-nodeJS_Demo';

exports.getToken = function(data, callback) {
	"use strict";
//	switch (data.accountType) { -- lint lint does not this to be a switch
//		case "GOOGLE":
//			if (data.service === "cp" || data.service === "contacts") {
//				getGoogleContactsToken(data, function(token) {
//					callback(token);
//				});
//			}
//			else {
//				console.log(data.accountType + " " + data.service + " service type not handled");
//			}
//			break;
//		default:
//			console.log(data.accountType + " account type not handled");
//	}
	if (data.accountType==="GOOGLE") {
			if (data.service === "cp" || data.service === "contacts") {
				this.getGoogleContactsToken(data, function(token) {
					callback(token);
				});
			}
			else {
				console.log(data.accountType + " " + data.service + " service type not handled");
			}
		}
	else{
			console.log(data.accountType + " account type not handled");
	}


};


this.getGoogleContactsToken = function(data, callback) {
	"use strict";
	//Google authentication token
	var authToken = "";
	var USERNAME = data.credentials.username;
	var password = data.credentials.password;
	var objSeq = require('seq');
	objSeq([ USERNAME, password, authToken ]).seq(function(usr, passw, authToken) { //Login
		var loginPostData =
		{
			accountType : "GOOGLE",
			Email : encodeURI(USERNAME.substr(0, USERNAME.search('@gmail.com'))),
			Passwd : encodeURI(password),
			service : "cp",
			source : serviceName
		};

		var content = querystring_.stringify(loginPostData);

		var loginRequest =
		{
			host : "www.google.com",
			path : '/accounts/ClientLogin',
			port : 443,
			method : "POST",
			headers :
			{
				'Content-Length' : content.length,
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		};

		var auth_request = https.request(loginRequest, this.ok);
		auth_request.write(content);
		auth_request.end();

	}).seq(function(res) {
		var authResponse = "";
		var emitter = new EventEmitter();

		res.on("data", function(chunk) {
			authResponse += chunk;
		});

		res.on("end", function() {
			var searchFor = "\\n" + "Auth=";
			var rex = new RegExp(searchFor, "m");
			var auth_found = rex.test(authResponse);
			//console.log("AUTHENTICATION TOKEN " + (auth_found ? "FOUND!" : "Not Found"));
			if (auth_found) {
				var matchStr = authResponse.match(rex);
				authToken = matchStr.input.substr(matchStr.index + 6);
				authToken = authToken.substr(0, authToken.length - 1);
				//TOKEN = authToken;
				emitter.emit('done', authToken);
			}
			//TODO else emit error

		});
		emitter.on('done', this.ok);
	}).seq(function(tk) {
		authToken = tk;
		callback(authToken);
	});
};

