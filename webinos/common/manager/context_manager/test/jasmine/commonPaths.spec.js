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
* Copyright 2012 EPU NTUA
*******************************************************************************/

describe('commonPaths', function() {

	var webinos = require("find-dependencies")(__dirname);

	var testObject = webinos.global.require(webinos.global.manager.context_manager.location  + '/lib/commonPaths.js');

	beforeEach(function() {
		this.addMatchers({
			toBeFunction: function() {
				return typeof this.actual === 'function';
			},
			toBeObject: function() {
				return typeof this.actual === 'object';
			},
			toBeString: function() {
				return typeof this.actual === 'string';
			},
			toBeNumber: function() {
				return typeof this.actual === 'number';
			}
		});
	});

	it('commonPaths has funtion getUserFolder', function() {
		expect(testObject.getUserFolder).toBeFunction();
	});

	it('commonPaths has string property storage', function() {
		expect(testObject.storage).toBeString();
	});

	it('commonPaths has string property local', function() {
		expect(testObject.local).toBeString();
	});

	it('commonPaths has string property global', function() {
		expect(testObject.global).toBeString();
	});

});
