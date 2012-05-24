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
 * Copyright 2012 Alexander Futasz, Fraunhofer FOKUS
 *******************************************************************************/


var session_common = require('../../lib/session_common.js');

var o = {
		bla: "blá",
		bool: true,
		num: 42,
		ar: [1, 2, "str"],
		ob: {bar: "baz"}
}

var oStr = JSON.stringify(o);

describe("test readJson", function() {
	it("must read a single json object from a single buffer", function(done) {
		var buf = session_common.jsonStr2Buffer(oStr)

		session_common.readJson("instanceMock", buf, function(obj) {
			expect(JSON.stringify(obj)).toEqual(oStr);
			done();
		});
	});

	it("must read a single json object split into two buffers", function(done) {
		var part1 = oStr.substr(0, 30);
		var strByteLen = Buffer.byteLength(oStr, 'utf8');
		var buf1 = new Buffer(4 + Buffer.byteLength(part1), 'utf8');
		buf1.writeUInt32LE(strByteLen, 0);
		buf1.write(part1, 4);

		var buf2 = new Buffer(oStr.substr(30))

		session_common.readJson("instanceMock", buf1);
		session_common.readJson("instanceMock", buf2, function(obj) {
			expect(JSON.stringify(obj)).toEqual(oStr);
			done();
		});
	});

	it("must read two json objects from a single buffer", function(done) {
		var buf1 = session_common.jsonStr2Buffer(oStr)
		var buf2 = session_common.jsonStr2Buffer(oStr);
		var buf = new Buffer(buf1.length + buf2.length);
		buf1.copy(buf);
		buf2.copy(buf, buf1.length);

		var ref = 0;
		session_common.readJson("instanceMock", buf, function(obj) {
			expect(JSON.stringify(obj)).toEqual(oStr);

			ref++;
			if (ref === 2) {
				done();
			}
		});
	});
});
