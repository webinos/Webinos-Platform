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
* Copyright 2012 Torsec -Computer and network security group-
* Politecnico di Torino
*******************************************************************************/


var validation = require('../../lib/session_schema.js');


// prop message example
// 'type', 'from', 'to' and 'payload' are required fields
// no other fileds allowed

var prop_message = {
	type: 'prop',
	from: 'WebinosPzh/WebinosPzp',
	to: 'WebinosPzh',
	payload: {
		status: 'pzpDetails',
		message:8040
	} 
};

// JSONRPC message examples
// 'type', 'from', 'to' and 'payload' are required fields
// 'register', 'id' and 'resp_to' are optional fileds
// no other fileds allowed

var JSONRPC_message = [];

JSONRPC_message[0] = {
	type: 'JSONRPC',
	register: true,
	from: 'WebinosPzh/WebinosPzp',
	to: 'WebinosPzh',
	payload: null
};

JSONRPC_message[1] = {
	type: 'JSONRPC',
	id: 3,
	from: 'WebinosPzh/WebinosPzp/0',
	to: 'WebinosPzh',
	resp_to: 'WebinosPzh/WebinosPzp/0',
	payload: {
		jsonrpc:'2.0',
		id:68,
		method: 'http://webinos.org/api/test@6e6885b25a7ddb5f4658e7a599d1fc17.get42',
		serviceAddress: 'WebinosPzh',
		params: ['foo']
	}
};


// wrong messages examples


var wrong_message = [];

wrong_message[0] = {
	type: 'another type', // unrecognized type
	from: 'WebinosPzh/WebinosPzp',
	to: 'WebinosPzh',
	payload: {
		status: 'pzpDetails',
		message:8040
	} 
};

wrong_message[1] = {
	type: 'prop',
	id: 3, // forbidden field
	from: 'WebinosPzh/WebinosPzp',
	to: 'WebinosPzh',
	payload: {
		status: 'pzpDetails',
		message:8040
	} 
};

wrong_message[2] = {
	type: 'JSONRPC',
	id: 3,
	from: 'WebinosPzh/WebinosPzp/0',
	to: 'WebinosPzh',
	resp_to: null, // forbidden value
	payload: {
		jsonrpc:'2.0',
		id:68,
		method: 'http://webinos.org/api/test@6e6885b25a7ddb5f4658e7a599d1fc17.get42',
		serviceAddress: 'WebinosPzh',
		params: ['foo']
	}
};


describe("prop type message", function() {
	it("recognized message", function() {
		var result = validation.checkSchema(prop_message);
		expect(result).toEqual(false);
	});
});

describe("JSONRPC type message", function() {
	it("recognized message without optional fileds", function() {
		var result = validation.checkSchema(JSONRPC_message[0]);
		expect(result).toEqual(false);
	});
	it("recognized message with optional fields", function() {
		var result = validation.checkSchema(JSONRPC_message[1]);
		expect(result).toEqual(false);
	});
});

describe("wrong message", function() {
	it("unrecognized message, wrong type", function() {
		var result = validation.checkSchema(wrong_message[0]);
		expect(result).toEqual(true);
	});
	it("unrecognized message, forbidden field", function() {
		var result = validation.checkSchema(wrong_message[1]);
		expect(result).toEqual(true);
	});
	it("unrecognized message, forbidden value", function() {
		var result = validation.checkSchema(wrong_message[2]);
		expect(result).toEqual(true);
	});
});
