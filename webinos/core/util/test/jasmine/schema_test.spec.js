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
