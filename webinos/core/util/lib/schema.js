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
 * Copyright 2011-2013 Torsec -Computer and network security group-
 * Politecnico di Torino
 *
 ******************************************************************************/

(function () {
    'use strict';

    var myEnv = require('schema')('myEnvironment',
        { fallbacks: 'STRICT_FALLBACKS' });
    var assert = require('assert');

    /**
     * Validate messages
     * @name checkSchema
     * @function
     * @param msg Message to validate
     * @param version Message schema version
     */
    var checkSchema = function(msg, version) {


        // Validate messages defined in D3.3
        // http://dev.webinos.org/redmine/projects/wp3-3/wiki/Messaging_and_Routing
        if (version && version === 'D3.3') {
            // generic message validation
            var validation = checkByType(msg, 'generic');

            // validation error is false, so generic message validation is ok
            if(validation === false) {
                return checkByType(msg, msg.type);
            }
            else {
                // generic message validation failed
                return validation;
            }

        // validate old messages
        } else {
            // 'type' field validation
            var validation = checkByType(msg, 'oldGeneric');

            // validation error is false, so validation is ok
            if(validation === false) {
                return checkByType(msg, msg.type);
            } else {
                // 'type' field validation failed
                return validation;
            }
        }
    };

    /**
     * Validate messages by type
     * @name checkByType
     * @function
     * @param message Message to validate
     * @param type Message type
     */
    var checkByType = function(message, type) {
        var schema, validation;

        if (type === 'generic') {
            // 'deliveryNotification', 'JSONRPC20Request', 'JSONRPC20Response'
            // and 'Prop' types are allowed
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties': {
                    'type': {
                        'type': 'string',
                        'enum': ['deliveryNotification', 'JSONRPC20Request',
                            'JSONRPC20Response', 'Prop'],
                        'description': 'non lo so',
                    },
                    'from': {
                        'type': 'string'
                    },
                    'to': {
                        'type': 'string'
                    },
                    'id': {
                        'type': 'string'
                    },
                    'timestamp': {
                        'type': 'string',
                        'optional': true
                    },
                    'expires': {
                        'type': 'string',
                        'optional': true
                    },
                    'deliveryReceipt': {
                        'type': 'boolean',
                        'optional': true
                    },
                    'payload': {
                        'type': ['object', 'string', 'null'],
                        'optional': true
                    }
                },
                'additionalProperties': false
            });
        } else if (type === 'deliveryNotification') {
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties':{
                    'type': {
                        'type': 'string',
                        'enum': ['deliveryNotification']
                    },
                    'deliveryReceipt': {
                        'type': 'boolean',
                        'enum': ['true']
                    },
                    'payload': {
                        'type': 'string',
                        'enum': ['ok', 'duplicate', 'invalid', 'badDestination',
                            'expired', 'refused', 'noReference']
                    }
                },
                'additionalProperties': true
            });
        } else if (type === 'JSONRPC20Request') {
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties':{
                    'type': {
                        'type': 'string',
                        'enum': ['JSONRPC20Request']
                    },
                    'payload': {
                        'type': 'object'
                    }
                },
                'additionalProperties': true
            });
        } else if (type === 'JSONRPC20Response') {
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties':{
                    'type': {
                        'type': 'string',
                        'enum': ['JSONRPC20Response']
                    },
                    'payload': {
                        'type': 'object'
                    }
                },
                'additionalProperties': true
            });
        } else if (type === 'Prop') {
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties':{
                    'type': {
                        'type': 'string',
                        'enum': ['Prop']
                    },
                    'payload': {
                        'type': 'object'
                    }
                },
                'additionalProperties': true
            });
        // old type, not compliant with D3.3
        // added for backward compatibility
        } else if (type === 'oldGeneric') {
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties':{
                    'type': {
                        'type': 'string',
                        'enum': ['JSONRPC', 'prop']
                    }
                },
                // other fields allowed because in this function only 'type'
                // field is tested
                'additionalProperties': true
            });
        // old type, not compliant with D3.3
        // added for backward compatibility
        } else if (type === 'prop') {
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties':{
                    'type': {
                        'type': 'string',
                        'enum': ['prop']
                    },
                    'from': {
                        'type': ['string','null'],
                        'minLength': 0,
                        'maxLength': 99,
                        'default': ''
                    },
                    'to': {
                        'type': ['string','null'],
                        'minLength': 0,
                        'maxLength': 99,
                        'default': ''
                    },
                    'payload': {
                        'type': 'object',
                        'default':[]
                    }
                },
                'additionalProperties': false
            });
        // old type, not compliant with D3.3
        // added for backward compatibility
        } else if (type === 'JSONRPC') {
            schema = myEnv.Schema.create({
                'type': 'object',
                'properties':{
                    'register': {
                        'type':'boolean',
                        'optional' : true
                    },
                    'id': {
                        'type': 'number',
                        'optional' : true
                    },
                    'type': {
                        'type': 'string',
                        'enum': ['JSONRPC']
                    },
                    'from': {
                        'type': ['string','null'],
                        'minLength': 0,
                        'maxLength': 99
                    },
                    'to': {
                        'type': ['string','null'],
                        'minLength': 0,
                        'maxLength': 99
                    },
                    'resp_to': {
                        'type': 'string',
                        'minLength': 0,
                        'maxLength': 99,
                        'optional' : true
                    },
                    'payload': {
                        'type': ['object', 'null'],
                        'default':[]
                    }
                },
                'additionalProperties': false
            });
        } else {
            console.log('Invalid message type: ' + type);
            return true;
        }
        try {
            validation = schema.validate(message);
            assert.strictEqual(validation.isError(), false);
            return validation.isError();
        } catch(err) {
            console.log(type + ' message validation failed');
            console.log(validation.getError().errors);
            return true;
        }
    };

    exports.checkSchema = checkSchema;

}());
