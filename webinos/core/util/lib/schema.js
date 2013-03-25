/*
********************************************************************************
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
*******************************************************************************/

(function () {
    "use strict";

    var myEnv = require("schema")("myEnvironment",
        { fallbacks: "STRICT_FALLBACKS" });
    var assert = require("assert");

    /**
     * Validate messages defined in D3.3
     * http://dev.webinos.org/redmine/projects/wp3-3/wiki/Messaging_and_Routing
     * @name checkSchema
     * @function
     * @param msg Message to validate
     */
    schema.checkSchema = function(msg) {

        // generic message validation
        var validation = checkGenericSchema(msg);

        // validation error is false, so validation is ok
        if(validation === false) {
            if (msg.type === "deliveryNotification") {
                return checkDeliveyNotificationSchema(msg);
            }
            if (msg.type === "JSONRPC20Request") {
                return checkJSONRPC20RequestSchema(msg);
            }
            if (msg.type === "JSONRPC20Response") {
                return checkJSONRPC20ResponseSchema(msg);
            }
            // TODO: check "Prop" messages
        }
        else {
            // generic message validation failed
            return validation;
        }
    };

    /**
     * Validate "deliveryNotification" message
     * @name checkDeliveryNotificationSchema
     * @function
     * @param msg Message to validate
     */
    checkDeliveryNotificationSchema = function(message) {
        var schema, validation;

        schema = myEnv.Schema.create({
            "type": "object",
            "properties":{
                "type": {
                    "type": "string",
                    "enum": ["deliveryNotification"]
                },
                "deliveryReceipt": {
                    "type": "boolean",
                    "enum": ["true"]
                },
                "payload": {
                    "type": "string",
                    "enum": ["ok", "duplicate", "invalid", "badDestination",
                        "expired", "refused", "noReference"]
                }
            },
            "additionalProperties": true
        });
        try {
            validation = schema.validate(message);
            assert.strictEqual(validation.isError(), false);
            return validation.isError();
        } catch (err) {
            console.log(validation.getError());
            console.log(validation.getError().errors);
            return true;
        }
    };

    /**
     * Validate "JSONRPC20Request" message
     * @name checkJSONRPC20RequestSchema
     * @function
     * @param msg Message to validate
     */
    checkJSONRPC20RequestSchema = function(message) {
        var schema, validation;

        schema = myEnv.Schema.create({
            "type": "object",
            "properties":{
                "type": {
                    "type": "string",
                    "enum": ["JSONRPC20Request"]
                },
                "payload": {
                    "type": "object"
                }
            },
            "additionalProperties": true
        });
        try {
            validation = schema.validate(message);
            assert.strictEqual(validation.isError(), false);
            return validation.isError();
        } catch (err) {
            console.log(validation.getError());
            console.log(validation.getError().errors);
            return true;
        }
    };

    /**
     * Validate "JSONRPC20Response" message
     * @name checkJSONRPC20ResponseSchema
     * @function
     * @param msg Message to validate
     */
    checkJSONRPC20ResponseSchema = function(message) {
        var schema, validation;

        schema = myEnv.Schema.create({
            "type": "object",
            "properties":{
                "type": {
                    "type": "string",
                    "enum": ["JSONRPC20Response"]
                },
                "payload": {
                    "type": "object"
                }
            },
            "additionalProperties": true
        });
        try {
            validation = schema.validate(message);
            assert.strictEqual(validation.isError(), false);
            return validation.isError();
        } catch (err) {
            console.log(validation.getError());
            console.log(validation.getError().errors);
            return true;
        }
    };

    /**
     * Validate generic message
     * @name checkGenericSchema
     * @function
     * @param msg Message to validate
     */
    checkGenericSchema = function(message) {
        var schema, validation;

        // "deliveryNotification", "JSONRPC20Request", "JSONRPC20Response" and
        // "Prop" types are allowed
        schema = myEnv.Schema.create({
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["deliveryNotification", "JSONRPC20Request",
                        "JSONRPC20Response", "Prop"]
                },
                "from": {
                    "type": "string"
                },
                "to": {
                    "type": "string"
                },
                "id": {
                    "type": "string"
                },
                "timestamp": {
                    "type": "string",
                    "optional": true
                },
                "expires": {
                    "type": "string",
                    "optional": true
                },
                "deliveryReceipt": {
                    "type": "boolean",
                    "optional": true
                },
                "payload": {
                    "type": ["object", "string", "null"],
                    "optional": true
                }
            },
            "additionalProperties": false
        });
        try {
            validation = schema.validate(message);
            assert.strictEqual(validation.isError(), false);
            return validation.isError();
        } catch (err) {
            console.log("schema");
            console.log(validation.getError());
            console.log(validation.getError().errors);
            return true;
        }
    };

    exports.checkSchema = checkSchema;

}());
