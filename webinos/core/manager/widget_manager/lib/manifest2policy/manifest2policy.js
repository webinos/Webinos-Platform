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
 *
 ******************************************************************************/


(function () {
    "use strict";

    var fs = require('fs');
    var xml2js = require('xml2js');
    var util = require('util');

    /**
    * Translate from manifest to XACML policy
    * @function
    * @param manifestFile Application manifest
    * @param appId Application ID
    * @param features Optional features allowed by the user
    */
    var manifest2policy = function(manifestFile, appId, features) {
        var manifest = null;

        try {
            var xmlManifest = fs.readFileSync(manifestFile);
            // Load xml parser
            var xmlParser = new xml2js.Parser(xml2js.defaults["0.2"]);
            // Parse manifest
            xmlParser.parseString(xmlManifest, function(err, data) {
                if (err === undefined || err === null) {
                    manifest = data['widget'];
                } else {
                    console.log(err);
                    return '';
                }
            });
        } catch (error) {
            console.log(error);
            return '';
        }

        // target
        var target = [];
        target[0] = {};
        target[0].subject = [];
        var subjectMatch = [];
        // subject-match on application ID
        if (appId !== null && appId !== undefined) {
            subjectMatch.push({'$' : {'attr' : 'id', 'match' : appId}});
        } else {
            colsole.log('appId is missing');
            return '';
        }
        // subject-match on user ID, assuming to receive it as a parameter
        /*if (userId !== null && userId !== undefined) {
            subjectMatch.push({'$' : {'attr' : 'user-id', 'match' : userId}});
        } else {
            colsole.log('userId is missing');
            return '';
        }*/
        target[0].subject[0] = {'subject-match' : subjectMatch};

        console.log(util.inspect(target, false, null));

    };

    exports.manifest2policy = manifest2policy;

}());
