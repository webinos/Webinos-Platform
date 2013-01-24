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
    var xmlParser = new xml2js.Parser(xml2js.defaults["0.2"]);
    var convert2xml = require('data2xml')({attrProp : '$', valProp : '_'});
    var util = require('util');

    /**
    * Translate from manifest to policy
    * @function
    * @param manifestFile Application manifest
    * @param policyFile output file for the application policy
    * @param features Optional features allowed by the user
    */
    var manifest2policy = function(manifestFile, policyFile, features) {
        try {
            var xmlManifest = fs.readFileSync(manifestFile);
            // Parse manifest
            xmlParser.parseString(xmlManifest, function(err, data) {
                if (err === undefined || err === null) {
                    if (data.widget !== null && data.widget !== undefined) {
                        // appId is defined as author-name
                        if (data.widget.author !== null && 
                            data.widget.author !== undefined &&
                            data.widget.name !== null && 
                            data.widget.name !== undefined &&
                            util.isArray(data.widget.author) &&
                            util.isArray(data.widget.name) &&
                            data.widget.author[0].length > 0 && 
                            data.widget.name[0].length > 0) {
                                
                            var appId = data.widget.author[0] + '-' +
                                data.widget.name[0];
                        } else {
                            console.log('It is not possible to define appId');
                            return false;
                        }

                        var policy = policyGeneration(data.widget, appId, 
                                                      features);
                        if (Object.keys(policy).length > 0) {
                            return writePolicy(policy, appId, policyFile);
                        }
                        else {
                            console.log('Policy generation failed');
                            return false;
                        }
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
    * @param appId Application identifier
    * @param features Optional features allowed by the user
    */
    var policyGeneration = function (manifest, appId, features) {
        // target
        var target = [];
        target[0] = {};
        target[0].subject = [];
        var subjectMatch = [];
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

        return policy;
    };

    /**
    * Write the new application policy
    * @function
    * @param appPolicy Generated application policy
    * @param appId Application identifier
    * @param policyFile Output file for the application policy
    */
    var writePolicy = function (appPolicy, appId, policyFile) {
        var policySet = {};
        policySet.policy = [];
        if (appPolicy !== null && appPolicy !== undefined) {
            policySet.policy.push(appPolicy);
        } else {
            console.log('appPolicy is missing');
            return false;
        }

        if (fs.existsSync(policyFile) === true) {
            try {
                var policy = fs.readFileSync(policyFile);
                // Parse manifest
                xmlParser.parseString(policy, function(err, data) {
                    if (err === undefined || err === null) {
                        if (data['policy-set'] !== null &&
                            data['policy-set'] !== undefined &&
                            data['policy-set'].policy !== null && 
                            data['policy-set'].policy !== undefined &&
                            util.isArray(data['policy-set'].policy)) {

                            policySet = insertPolicy (policySet, appId,
                                data['policy-set'].policy);
                        } else {
                            console.log('Invalid policy syntax in file ' +
                                    policyFile);
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
        }

        try {
            var xml = convert2xml('policy-set', policySet);
            xml = xml.replace('<?xml version=\"1.0\" encoding=\"utf-8\"?>\n',
                                '');
            fs.writeFileSync(policyFile, xml);
        } catch (error) {
            console.log(error);
            return false;
        }

    };

    /**
    * Add old application policies into the new policy-set if appId is different
    * @function
    * @param policySet The new policy-set
    * @param appId Application identifier
    * @param parsedPolicy Policies already existing in the output file
    */
    var insertPolicy = function (policySet, appId, parsedPolicy) {
        for (var i = 0; i < parsedPolicy.length; i++) {
            if (parsedPolicy[i].target !== null && 
                parsedPolicy[i].target !== undefined &&
                util.isArray(parsedPolicy[i].target) &&
                parsedPolicy[i].target[0].subject !== null &&
                parsedPolicy[i].target[0].subject !== undefined &&
                util.isArray(parsedPolicy[i].target[0].subject)) {

                var subject = parsedPolicy[i].target[0].subject[0];
                if (subject['subject-match'] !== null &&
                    subject['subject-match'] !== undefined &&
                    util.isArray(subject['subject-match'])) {

                    for (var j = 0 ; j < subject['subject-match'].length; j++) {
                        if (subject['subject-match'][j].$ !== null &&
                            subject['subject-match'][j].$ !== undefined &&
                            subject['subject-match'][j].$.attr === 'id' &&
                            subject['subject-match'][j].$.match !== appId) {
                            
                            // insert the policy of another application
                            policySet.policy.push(parsedPolicy[i]);
                        }
                    }
                }
            }
        }
        return policySet;
    };

    exports.manifest2policy = manifest2policy;

}());
