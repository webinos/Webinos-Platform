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
* Copyright 2012 Martin Lasak, Fraunhofer FOKUS
******************************************************************************/

// Implementation of the tv module API for the Coolstream STB (REST bindings)

var http = require('http');

//Coolstream STB specific settings
var STB_DEVICE_IP = "192.168.1.118";
var STB_DEVICE_PORT = 80;
var username = 'webinos';
var password = 'webinos';
var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
var PZP_STB_POLL_INTVERVAL = 1000;

var nameToCidMap = {};
var cidToNameMap = {};

var poller = null;

//http helper method
var getHttp = function(path,cb,ecb){
	var options = {
			host : STB_DEVICE_IP,
			port : STB_DEVICE_PORT,
			path : path,
			headers : {
				'Authorization': auth
			}
		};
		var body = "";
		var req = http.get(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				body += chunk;
			});
			res.on('end', function(chunk) {
				if(typeof cb === "function") 
					cb(body);
				else
					console.log('HTTP error.',err);				
			});			
		});	
		req.on('error',function(err){
			if(typeof ecb === "function") 
				ecb('HTTP error');
			else
				console.log('HTTP error.',err);
		});
};

exports.coolstream = {
	getname : function(){
		return "DVB-S Coolstream STB";
	},
	channellist : function(cb, ecb) {
		getHttp('/control/channellist',function(body){
			var channelList = [];
			if(body.length>0){
				var channelidandname = body.split('\n'); 
				console.log("#Many Channels: "+channelidandname.length);
				for(var cix=0; cix<channelidandname.length; cix++){
					var cid = channelidandname[cix].substr(0,16);
					var cname = channelidandname[cix].substr(16);
					channelList.push({"name":cname, "longName":cname, "_id":cid});
					nameToCidMap['name-'+cname]=cid;
					cidToNameMap[cid]=cname;
				}
			}
			cb(channelList);			
		},ecb);
	},
	zapto : function(cname, cb, ecb) {
		getHttp('/control/zapto?'+nameToCidMap['name-'+cname],function(body){
			if(body=="ok"){
//				getHttp("/control/rcem?KEY_INFO",function(body){
					if(typeof cb === "function")
					cb();
//				},ecb);
				
			}else
				if(typeof ecb === "function") 
					ecb('Change error');			
		},ecb);

	},
	setchannelchangehandler : function(cb){
		var currentCid=null;
		if(poller){
			clearInterval(poller);
		}
		poller = setInterval(function(){
			
			getHttp('/control/zapto',function(body){
				if(body.length>=16){
					body=body.substr(0, 16);
				if(body && body!=currentCid && cidToNameMap[body]){
					currentCid=body;
					console.log('>channel changed to: '+body);
					
					getHttp('/control/build_live_url',function(body){
						console.log('>live: '+body);	
						cb({"stream":body,"name":cidToNameMap[currentCid], "longName":cidToNameMap[currentCid], "_id":currentCid});
					});
					
					
				}
				}		
			});			
		},PZP_STB_POLL_INTVERVAL);
	}

};