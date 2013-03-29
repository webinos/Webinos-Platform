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
        expect(validation.checkSchema(wrong_generic_msg, 'D3.3')).toEqual(true);
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
        expect(validation.checkSchema(prop_msg, 'D3.3')).toEqual(false);
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
            expect(validation.checkSchema(wrong_prop_msg[i], 'D3.3'))
                .toEqual(true);
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
        expect(validation.checkSchema(dn_msg, 'D3.3')).toEqual(false);
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
            expect(validation.checkSchema(wrong_dn_msg[i], 'D3.3'))
                .toEqual(true);
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
        expect(validation.checkSchema(req_msg, 'D3.3')).toEqual(false);
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
            expect(validation.checkSchema(wrong_req_msg[i], 'D3.3'))
                .toEqual(true);
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
        expect(validation.checkSchema(JsonRes_msg, 'D3.3')).toEqual(false);
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
            expect(validation.checkSchema(wrong_res_msg[i], 'D3.3'))
                .toEqual(true);
        }
    });
});

// old messages tests

describe('Generic old message check', function() {

    // wrong genric old message example
    var wrong_generic_msg = {
        type : 'another type', // unrecognized type
        from : 'WebinosPzh/WebinosPzp',
        to : 'WebinosPzh',
        payload:{
            status : 'pzpDetails',
            message : 8040
        }
    };

    it('Unrecognized generic message', function() {
        expect(validation.checkSchema(wrong_generic_msg)).toEqual(true);
    });
});


describe ('Old prop message check', function () {

    // old prop message example
    var prop_msg = {
        type : 'prop',
        from : 'WebinosPzh/WebinosPzp',
        to : 'WebinosPzh',
        payload : {
            status : 'pzpDetails',
            message : 8040
        }
    };

    it ('Recognized old prop message', function () {
        expect (validation.checkSchema(prop_msg)).toEqual(false);
    });

    var wrong_prop_msg = {
        type : 'prop',
        id : 3, // forbidden field
        from : 'WebinosPzh/WebinosPzp',
        to : 'WebinosPzh',
        payload : {
            status : 'pzpDetails',
            message : 8040
        }
    };

    it ('Unrecognized old prop message', function () {
        expect (validation.checkSchema(wrong_prop_msg)).toEqual(true);
    });

});

describe ('Old JSONRPC message check', function () {

    // JSONRPC message examples
    var JSONRPC_msg = [];
    JSONRPC_msg[0] = {
        type : 'JSONRPC',
        register : true,
        from : 'WebinosPzh/WebinosPzp',
        to : 'WebinosPzh',
        payload : null
    };
    JSONRPC_msg[1] = {
        type : 'JSONRPC',
        id : 3,
        from : 'WebinosPzh/WebinosPzp/0',
        to : 'WebinosPzh',
        resp_to : 'WebinosPzh/WebinosPzp/0',
        payload : {
            jsonrpc : '2.0',
            id : 68,
            method : 'http://webinos.org/api/test@6e6885b25a7ddb5f4658e7.get42',
            serviceAddress : 'WebinosPzh',
            params : ['foo']
        }
    };

    it ('Recognized old JSONRPC message', function () {
        for (var i = 0; i < JSONRPC_msg.length; i++) {
            expect(validation.checkSchema(JSONRPC_msg[i])).toEqual(false);
        }
    });

    var wrong_JSONRPC_msg = {
        type : 'JSONRPC',
        id : 3,
        from : 'WebinosPzh/WebinosPzp/0',
        to : 'WebinosPzh',
        resp_to : null, // forbidden value
        payload : {
            jsonrpc : '2.0',
            id : 68,
            method : 'http://webinos.org/api/test@6e6885b25a7ddb5f4658e7.get42',
            serviceAddress : 'WebinosPzh',
            params : ['foo']
        }
    };

    it ('Unrecognized old JSONRPC message', function () {
        expect (validation.checkSchema(wrong_JSONRPC_msg)).toEqual(true);
    });

});
