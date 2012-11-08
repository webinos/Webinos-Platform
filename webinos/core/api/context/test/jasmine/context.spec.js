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

describe("test context api", function() {
    var webinos = require("find-dependencies")(__dirname);

    var RPCHandler = webinos.global.require(webinos.global.rpc.location).RPCHandler;
    var service = webinos.global.require(webinos.global.api.context.location).Service;
    var contextAPI = new service(RPCHandler);
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

    it("context api has registerAppContextObject function", function() {
        expect(contextAPI.registerAppContextObject).toBeFunction();
    });

    it("context api has executeQuery function", function() {
        expect(contextAPI.executeQuery).toBeFunction();
    });

    it('context api equals http://webinos.org/api/context', function() {
        expect(contextAPI.api).toEqual('http://webinos.org/api/context');
    });

    it('context displayName is string', function() {
        expect(contextAPI.displayName).toBeString();
    });

    it('context description is string', function() {
        expect(contextAPI.description).toBeString();
    });

});

