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
 * Copyright 2013 Torsec -Computer and network security group-
 * Politecnico di Torino
 *******************************************************************************/


var path = require('path');
var validation = require(path.join(__dirname, '../../lib/schema.js'));

describe('Generic message check', function() {

    // wrong genric message example
    var wrong_generic_msg = {
        type : 'unknown', // wrong type
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        payload : {}
    };

    it('Unrecognized generic message', function() {
        expect(validation.checkSchema(wrong_generic_msg)).toEqual(true);
    });
});

describe('Prop message check', function() {

    // Prop message example
    var prop_msg = {
        type : 'Prop',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        payload : {}
    };

    it('Recognized Prop message', function() {
        expect(validation.checkSchema(prop_msg)).toEqual(false);
    });

    // wrong Prop message examples
    var wrong_prop_msg = [];
    wrong_prop_msg[0] = {
        type : 'Prop',
        from : 'fromString',
        to : 'toString',
        //id : 'idString', // required field is missing
        payload : {}
    };
    wrong_prop_msg[1] = {
        type : 'Prop',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        additional_field : 'fieldString', // not allowed field
        payload : {}
    };
    wrong_prop_msg[2] = {
        type : 'Prop',
        from : 'fromString',
        to : 'toString',
        id : 5, // wrong type
        payload : {}
    };

    it('Unrecognized Prop messages', function() {
        for (var i = 0; i < wrong_prop_msg.length; i++) {
            expect(validation.checkSchema(wrong_prop_msg[i])).toEqual(true);
        }
    });
});

describe('deliveryNotification message check', function() {

    // deliveryNotification message example
    var dn_msg = {
        type : 'deliveryNotification',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        deliveryReceipt: false,
        payload : 'ok'
    };

    it('Recognized deliveryNotification message', function() {
        expect(validation.checkSchema(dn_msg)).toEqual(false);
    });

    // wrong deliveryNotification message examples
    var wrong_dn_msg = [];
    wrong_dn_msg[0] = {
        type : 'deliveryNotification',
        from : 'fromString',
        to : 'toString',
        //id : 'idString', // required field is missing
        deliveryReceipt: false,
        payload : 'ok'
    };
    wrong_dn_msg[1] = {
        type : 'deliveryNotification',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        additional_field : 'fieldString', // not allowed field
        deliveryReceipt: false,
        payload : 'ok'
    };
    wrong_dn_msg[2] = {
        type : 'deliveryNotification',
        from : 'fromString',
        to : 'toString',
        id : 5, // wrong type
        deliveryReceipt: false,
        payload : 'ok'
    };
    wrong_dn_msg[3] = {
        type : 'deliveryNotification',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        deliveryReceipt: false,
        payload : 'unknown' // wrong payload
    };

    it('Unrecognized deliveryNotification messages', function() {
        for (var i = 0; i < wrong_dn_msg.length; i++) {
            expect(validation.checkSchema(wrong_dn_msg[i])).toEqual(true);
        }
    });
});

describe('JSONRPC20Request message check', function() {

    // JSONRPC20Request message example
    var req_msg = {
        type : 'JSONRPC20Request',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        payload : {}
    };

    it('Recognized JSONRPC20Request message', function() {
        expect(validation.checkSchema(req_msg)).toEqual(false);
    });

    // wrong JSONRPC20Request message examples
    var wrong_req_msg = [];
    wrong_req_msg[0] = {
        type : 'JSONRPC20Request',
        from : 'fromString',
        to : 'toString',
        //id : 'idString', // required field is missing
        payload : {}
    };
    wrong_req_msg[1] = {
        type : 'JSONRPC20Request',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        additional_field : 'fieldString', // not allowed field
        payload : {}
    };
    wrong_req_msg[2] = {
        type : 'JSONRPC20Request',
        from : 'fromString',
        to : 'toString',
        id : 5, // wrong type
        payload : {}
    };

    it('Unrecognized JSONRPC20Request messages', function() {
        for (var i = 0; i < wrong_req_msg.length; i++) {
            expect(validation.checkSchema(wrong_req_msg[i])).toEqual(true);
        }
    });
});

describe('JSONRPC20Response message check', function() {

    // JSONRPC20Response message example
    var JsonRes_msg = {
        type : 'JSONRPC20Response',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        payload : {}
    };

    it('Recognized JSONRPC20Response message', function() {
        expect(validation.checkSchema(JsonRes_msg)).toEqual(false);
    });

    // wrong JSONRPC20Response message examples
    var wrong_res_msg = [];
    wrong_res_msg[0] = {
        type : 'JSONRPC20Response',
        from : 'fromString',
        to : 'toString',
        //id : 'idString', // required field is missing
        payload : {}
    };
    wrong_res_msg[1] = {
        type : 'JSONRPC20Response',
        from : 'fromString',
        to : 'toString',
        id : 'idString',
        additional_field : 'fieldString', // not allowed field
        payload : {}
    };
    wrong_res_msg[2] = {
        type : 'JSONRPC20Response',
        from : 'fromString',
        to : 'toString',
        id : 5, // wrong type
        payload : {}
    };

    it('Unrecognized JSONRPC20Response messages', function() {
        for (var i = 0; i < wrong_res_msg.length; i++) {
            expect(validation.checkSchema(wrong_res_msg[i])).toEqual(true);
        }
    });
});
