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
 * Copyright 2012 Telecom Italia SpA
 * 
 ******************************************************************************/


(function () {
	"use strict";

	var promptManager;
	var os = require('os');

	promptManager = function() {
		if(os.platform() === 'linux' || os.platform() === 'darwin') {
			//this.promptMan = require('./build/Release/promptMan.node');
			this.promptMan = require('promptMan');
			this.promptCore = new this.promptMan.PromptManInt();
		}
		else if(os.platform() === 'win32') {
		}
		else if(os.platform() === 'android') {
		}
	};

	promptManager.prototype.display = function(message, choices, timeout) {
		if(os.platform() === 'linux' || os.platform() === 'darwin' ) {
			return(this.promptCore.display(message, choices, timeout));
		}
		else if(os.platform() === 'win32') {
		}
		else if(os.platform() === 'android') {
		}
	};

	exports.promptManager = promptManager;

}());

