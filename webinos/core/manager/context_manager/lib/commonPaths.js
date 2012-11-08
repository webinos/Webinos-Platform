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
* Copyright 2012 EPU-National Technical University of Athens
******************************************************************************/
var path = require('path');
var os = require('os');

var moduleRoot = path.resolve(__dirname, '../') + '/';
var moduleDependencies = require(moduleRoot + '/dependencies.json');
var modulePackage = require(moduleRoot + '/package.json');
var webinosRoot = path.resolve(moduleRoot + moduleDependencies.root.location) + '/';

var modulePackageName = modulePackage.name;

function getUserFolder(){
	switch(os.type().toLowerCase()){
	case 'windows_nt':
		return path.resolve(process.env.appdata + '/webinos/');
		break;
	case 'linux':
	  switch(os.platform().toLowerCase()){
	    case 'android':
	      return path.resolve(process.env.EXTERNAL_STORAGE + '/.webinos/');
	      break;
	    case 'linux':
	      return path.resolve(process.env.HOME + '/.webinos/');
	      break;
	  }
	  break;
	case 'darwin':
		return path.resolve(process.env.HOME + '/.webinos/');
		break;
	default:
		console.log('[WARNING] Unknown OS.\nPlease send an email to cbot [at] epu [dot] ntua [dot] gr with:\nYour OS type, which is "' + os.type() + '"\nand the full user data path.', 'white+red_bg');
		return null;
		break;
	}
}


commonPaths = function (){
	var userFolder = getUserFolder(); 
	this.getUserFolder = getUserFolder;
	this.storage = (userFolder!==null) ? (path.resolve(userFolder + '/' + modulePackageName) + '/') : null;
	this.local = moduleRoot;
	this.global = webinosRoot;
}
module.exports = new commonPaths();
