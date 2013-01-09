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

        // rule
        var rule = [];
        // 'permit' rule
        rule[0] = {};
        rule[0].$ = {'effect' : 'permit'};
        rule[0].condition = [];
        rule[0].condition[0] = {};
        rule[0].condition[0].$ = {'combine' : 'or'};
        rule[0].condition[0]['resource-match'] = [];

        if (manifest.feature !== null && manifest.feature !== undefined) {
            for (var i = 0; i < manifest.feature.length; i++) {
                if (manifest.feature[i].$.required === 'true' ||
                    (manifest.feature[i].$.required === 'false' &&
                    features !== null && features !== undefined &&
                    features.indexOf(manifest.feature[i].$.name) >= 0)) {

                    rule[0].condition[0]['resource-match'].push({
                        '$' : {'attr' : 'api-feature',
                        'match' : manifest.feature[i].$.name}});
                }
            }
        } else {
            colsole.log('features are missing');
            return '';
        }
        // default 'deny' rule
        rule[1] = {};
        rule[1].$ = {'effect' : 'deny'};

        // DataHandlingPolicy
        if (manifest.DataHandlingPolicy !== null &&
            manifest.DataHandlingPolicy !== undefined) {

            var dhp = manifest.DataHandlingPolicy;
            var dhpId = [];
            for (var i = 0; i < dhp.length; i++) {
                dhpId[i] = {};
                dhpId[i].oldId = dhp[i].$.PolicyId;
                dhp[i].$.PolicyId = dhp[i].$.PolicyId + '-' + appId;
                dhpId[i].newId = dhp[i].$.PolicyId;
            }
        } else {
            colsole.log('DataHandlingPolicy is missing');
            return '';
        }

        // ProvisionalActions
        if (manifest.ProvisionalActions !== null &&
            manifest.ProvisionalActions !== undefined) {
            var pa = manifest.ProvisionalActions;
            for (var i = 0; i < pa[0].ProvisionalAction.length; i++) {
                for (var j = 0;
                     j < pa[0].ProvisionalAction[i].AttributeValue.length;
                     j++) {
                    for (var k = 0; k < dhpId.length; k++) {
                        if (pa[0].ProvisionalAction[i].AttributeValue[j] ===
                            dhpId[k].oldId) {

                            pa[0].ProvisionalAction[i].AttributeValue[j] =
                                dhpId[k].newId;
                        }
                    }
                }
            }
        } else {
            colsole.log('ProvisionalActions are missing');
            return '';
        }

        console.log(util.inspect(pa, false, null));

    };

    exports.manifest2policy = manifest2policy;

}());
