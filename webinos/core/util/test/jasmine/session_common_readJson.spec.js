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


var session_common = require ('../../lib/messageProcessing.js');

describe ("test readJson", function () {
    var o;
    var oStr;

    beforeEach (function () {
        o = {
            bla :"blá",
            bool:true,
            num :42,
            ar  :[1, 2, "str"],
            ob  :{bar:"baz"}
        }

        oStr = JSON.stringify (o);
    });

    it ("must read a single json object from a single buffer", function (done) {
        var buf = session_common.jsonStr2Buffer (oStr)

        session_common.readJson ("instanceMock", buf, function (obj) {
            expect (JSON.stringify (obj)).toEqual (oStr);
            done ();
        });
    });

    it ("must read a single json object split into two buffers", function (done) {
        var part1 = oStr.substr (0, 30);
        var strByteLen = Buffer.byteLength (oStr, 'utf8');
        var buf1 = new Buffer (4 + Buffer.byteLength (part1), 'utf8');
        buf1.writeUInt32LE (strByteLen, 0);
        buf1.write (part1, 4);

        var buf2 = new Buffer (oStr.substr (30));

        session_common.readJson ("instanceMock", buf1);
        session_common.readJson ("instanceMock", buf2, function (obj) {
            expect (JSON.stringify (obj)).toEqual (oStr);
            done ();
        });
    });

    it ("must read a single json object split into three buffers, large last buffer", function (done) {
        var part1 = oStr.substr (0, 3);
        var strByteLen = Buffer.byteLength (oStr, 'utf8');
        var buf1 = new Buffer (4 + Buffer.byteLength (part1), 'utf8');
        buf1.writeUInt32LE (strByteLen, 0);
        buf1.write (part1, 4);

        var buf2 = new Buffer (oStr.substr (3, 2));
        var buf3 = new Buffer (oStr.substr (5));

        session_common.readJson ("instanceMock", buf1);
        session_common.readJson ("instanceMock", buf2);
        session_common.readJson ("instanceMock", buf3, function (obj) {
            expect (JSON.stringify (obj)).toEqual (oStr);
            done ();
        });
    });

    it ("must read a single json object split into three buffers, large first buffer", function (done) {
        var part1 = oStr.substr (0, 66);
        var strByteLen = Buffer.byteLength (oStr, 'utf8');
        var buf1 = new Buffer (4 + Buffer.byteLength (part1), 'utf8');
        buf1.writeUInt32LE (strByteLen, 0);
        buf1.write (part1, 4);

        var buf2 = new Buffer (oStr.substr (66, 3));
        var buf3 = new Buffer (oStr.substr (69));

        session_common.readJson ("instanceMock", buf1);
        session_common.readJson ("instanceMock", buf2);
        session_common.readJson ("instanceMock", buf3, function (obj) {
            expect (JSON.stringify (obj)).toEqual (oStr);
            done ();
        });
    });

    it ("must read two json objects from a single buffer", function (done) {
        var buf1 = session_common.jsonStr2Buffer (oStr)
        var buf2 = session_common.jsonStr2Buffer (oStr);
        var buf = new Buffer (buf1.length + buf2.length);
        buf1.copy (buf);
        buf2.copy (buf, buf1.length);

        var ref = 0;
        session_common.readJson ("instanceMock", buf, function (obj) {
            expect (JSON.stringify (obj)).toEqual (oStr);

            ref++;
            if (ref === 2) {
            	done ();
            }
        });
    });

    it("must read two json objects, each split into two buffers, from different instances", function(done) {
        var part = oStr.substr(0, 30);
        var strByteLen = Buffer.byteLength(oStr, 'utf8');

        var buf1a = new Buffer(4 + Buffer.byteLength(part), 'utf8');
        buf1a.writeUInt32LE(strByteLen, 0);
        buf1a.write(part, 4);
        var buf1b = new Buffer(oStr.substr(30));

        var buf2a = new Buffer(4 + Buffer.byteLength(part), 'utf8');
        buf2a.writeUInt32LE(strByteLen, 0);
        buf2a.write(part, 4);
        var buf2b = new Buffer(oStr.substr(30));

        session_common.readJson("instanceMock", buf1a);
        session_common.readJson("instanceMock2", buf2a);
        session_common.readJson("instanceMock", buf1b, function(obj) {
            expect(JSON.stringify(obj)).toEqual(oStr);
            done();
        });
        session_common.readJson("instanceMock2", buf2b, function(obj) {
            expect(JSON.stringify(obj)).toEqual(oStr);
            done();
        });
    });
});
