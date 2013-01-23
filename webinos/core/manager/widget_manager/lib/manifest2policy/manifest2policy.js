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
    var convert2xml = require('data2xml')({attrProp : '$', valProp : '_'});
    //var util = require('util');

    /**
    * Translate from manifest to policy
    * @function
    * @param manifestFile Application manifest
    * @param appId Application ID
    * @param features Optional features allowed by the user
    */
    var manifest2policy = function(manifestFile, features) {
        try {
            var xmlManifest = fs.readFileSync(manifestFile);
            // Load xml parser
            var xmlParser = new xml2js.Parser(xml2js.defaults["0.2"]);
            // Parse manifest
            xmlParser.parseString(xmlManifest, function(err, data) {
                if (err === undefined || err === null) {
                    if (data.widget !== null && data.widget !== undefined) {
                        var policy = policyGeneration(data.widget, features);
                        return true;
                    } else {
                        console.log('Root tag not found');
                        return false;
                    }
                } else {
                    console.log(err);
                    return false;
                }
            });
        } catch (error) {
            console.log(error);
            return false;
        }

    };

    /**
    * Generate the new application policy
    * @function
    * @param manifest Parsed application manifest
    * @param features Optional features allowed by the user
    */
    var policyGeneration = function (manifest, features) {
        // target
        var target = [];
        target[0] = {};
        target[0].subject = [];
        var subjectMatch = [];
        // appId defined as author-name
        if (manifest.author !== null && manifest.author !== undefined &&
            manifest.name !== null && manifest.name !== undefined &&
            manifest.author[0].length > 0 && manifest.name[0].length > 0) {
                
            var appId = manifest.author[0]+'-'+manifest.name[0];
        } else {
            console.log('It is not possible to define appId');
            return '';
        }
        // subject-match on application ID
        subjectMatch.push({'$' : {'attr' : 'id', 'match' : appId}});
        // subject-match on user ID, assuming to receive it as a parameter
        /*if (userId !== null && userId !== undefined) {
            subjectMatch.push({'$' : {'attr' : 'user-id', 'match' : userId}});
        } else {
            console.log('userId is missing');
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
            console.log('features are missing');
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
            console.log('DataHandlingPolicy is missing');
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
            console.log('ProvisionalActions are missing');
            return '';
        }

        var policy = {};
        policy.target = target;
        policy.rule = rule;
        policy.DataHandlingPreferences = dhp;
        policy.ProvisionalActions = pa;

        try {
            var data = convert2xml('policy', policy);
            data = data.replace('<?xml version=\"1.0\" encoding=\"utf-8\"?>\n',
                                '');
            //fs.writeFileSync('./outputPolicyFile.xml', data);
        } catch (error) {
            console.log(error);
            return '';
        }
        //console.log(util.inspect(data, false, null));
        return data;
    };

    exports.manifest2policy = manifest2policy;

}());
