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
    var data;

    /**
    * Translate from manifest to policy
    * @function
    * @param manifestFile Application manifest
    * @param policyFile output file for the application policy
    * @param features Array of {name, effect} elements related to not denied
    * features
    * @param userId User identifier
    * @param requestorId Requestor identifier
    */
    var manifest2policy = function(manifestFile, policyFile, features, userId,
                                   requestorId) {

        if (manifestFile === null || manifestFile === undefined) {
            console.log('manifest file parameter is missing');
            return false;
        }
        if (policyFile === null || policyFile === undefined) {
            console.log('policy file parameter is missing');
            return false;
        }
        try {
            var xmlManifest = fs.readFileSync(manifestFile);
            // Parse manifest
            parseFile(xmlManifest);
        } catch (error) {
            console.log(error);
            return false;
        }
        if (data.widget) {
            // appId is defined as the widget id
            if (data.widget.$ && data.widget.$.id && data.widget.$.id !== '') {
                var appId = data.widget.$.id;
            // appId is defined as author-name
            } else if (data.widget.author && data.widget.name
                && util.isArray(data.widget.author) &&
                util.isArray(data.widget.name) &&
                data.widget.author[0].length > 0 &&
                data.widget.name[0].length > 0) {

                var appId = data.widget.author[0] + '-' + data.widget.name[0];
            } else {
                console.log('It is not possible to define appId');
                return false;
            }
            var policy = policyGeneration(data.widget, appId, features, userId,
                                          requestorId);
            if (policy !== '' && Object.keys(policy).length > 0) {
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
    };

    /**
    * Generate the new application policy
    * @function
    * @param manifest Parsed application manifest
    * @param appId Application identifier
    * @param features Array of {name, effect} elements related to not denied
    * features
    * @param userId User identifier
    * @param requestorId Requestor identifier
    */
    var policyGeneration = function (manifest, appId, features, userId,
                                     requestorId) {
        // target
        var target = [];
        target[0] = {};
        target[0].subject = [];
        var subjectMatch = [];

        // appId subject-match
        subjectMatch.push({'$' : {'attr' : 'id', 'match' : appId}});

        // userId subject-match
        if (userId) {
            subjectMatch.push({'$' : {'attr' : 'user-id', 'match' : userId}});
        }
        // requestorId subject-match
        if (requestorId) {
            subjectMatch.push({'$' : {'attr' : 'requestor-id',
                                      'match' : requestorId}});
        }
        target[0].subject[0] = {'subject-match' : subjectMatch};

        // rules
        var rule = [];

        if (manifest.feature && features) {
            var effect = [false, false, false, false];
            for (var i = 0; i < features.length; i++) {
                if (features[i].effect === 'permit') {
                    effect[0] = true;
                } else if (features[i].effect === 'prompt-blanket') {
                    effect[1] = true;
                } else if (features[i].effect === 'prompt-session') {
                    effect[2] = true;
                } else if (features[i].effect === 'prompt-oneshot') {
                    effect[3] = true;
                }
            }
            // permit rule
            if (effect[0] === true) {
                rule.push(addRule(manifest.feature, features, 'permit'));
            }
            // prompt-blanket rule
            if (effect[1] === true) {
                rule.push(addRule(manifest.feature, features,
                                  'prompt-blanket'));
            }
            // prompt-session rule
            if (effect[2] === true) {
                rule.push(addRule(manifest.feature, features,
                                  'prompt-session'));
            }
            // prompt-oneshot rule
            if (effect[3] === true) {
                rule.push(addRule(manifest.feature, features,
                                  'prompt-oneshot'));
            }
        } else {
            console.log('features are missing');
            return '';
        }

        // default 'deny' rule
        rule.push({'$' : {'effect' : 'deny'}});

        // DataHandlingPolicy
        if (manifest.DataHandlingPolicy) {
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
        if (manifest.ProvisionalActions) {
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
        if (appPolicy) {
            policySet.policy.push(appPolicy);
        } else {
            console.log('appPolicy is missing');
            return false;
        }

        if (fs.existsSync(policyFile) === true) {
            try {
                var policy = fs.readFileSync(policyFile);
                // Parse manifest
                data = null;
                parseFile(policy);
            } catch (error) {
                console.log(error);
                return false;
            }

            if (data !== null && data['policy-set'] && data['policy-set'].policy
                && util.isArray(data['policy-set'].policy)) {

                policySet = insertPolicy (policySet, data['policy-set'].policy);
            } else {
                console.log('Invalid policy syntax in file ' + policyFile);
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
        return true;

    };

    /**
    * Add old application policies into the new policy-set if appId is different
    * @function
    * @param policySet The new policy-set
    * @param parsedPolicy Policies already existing in the output file
    */
    var insertPolicy = function (policySet, parsedPolicy) {
        var appId = null;
        var userId = null;
        var requestorId = null;
        var subject = policySet.policy[0].target[0].subject[0];

        for (var i = 0; i < subject['subject-match'].length; i++) {
            if (subject['subject-match'][i].$.attr === 'id') {
                appId = subject['subject-match'][i].$.match;
            } else if (subject['subject-match'][i].$.attr === 'user-id') {
                userId = subject['subject-match'][i].$.match;
            } else if (subject['subject-match'][i].$.attr === 'requestor-id') {
                requestorId = subject['subject-match'][i].$.match;
            }
        }

        for (var i = 0; i < parsedPolicy.length; i++) {
            if (parsedPolicy[i].target && util.isArray(parsedPolicy[i].target)
                && parsedPolicy[i].target[0].subject &&
                util.isArray(parsedPolicy[i].target[0].subject)) {

                var subject = parsedPolicy[i].target[0].subject[0];
                if (subject['subject-match'] &&
                    util.isArray(subject['subject-match'])) {

                    // if all subject matches are true this policy is
                    // overwritten by the new one
                    var subjectMatch = [false, false, false];
                    var userIdExists = false;
                    var requestorIdExists = false;

                    for (var j = 0 ; j < subject['subject-match'].length; j++) {
                        if (subject['subject-match'][j].$ && appId &&
                            subject['subject-match'][j].$.attr === 'id' &&
                            subject['subject-match'][j].$.match === appId) {

                            subjectMatch[0] = true;
                        } else if (subject['subject-match'][j].$ && userId &&
                            subject['subject-match'][j].$.attr === 'user-id' &&
                            subject['subject-match'][j].$.match === userId) {

                            subjectMatch[1] = true;
                        } else if (subject['subject-match'][j].$ && requestorId
                            && subject['subject-match'][j].$.attr ===
                            'requestor-id' &&
                            subject['subject-match'][j].$.match ===
                            requestorId) {

                            subjectMatch[2] = true;
                        }
                        if (subject['subject-match'][j].$ &&
                            subject['subject-match'][j].$.attr === 'user-id') {

                            userIdExists = true;
                        } else if (subject['subject-match'][j].$ &&
                            subject['subject-match'][j].$.attr ===
                            'requestor-id') {

                            requestorIdExists = true;
                        }
                    }
                    if (userId === null && userIdExists === false) {
                        subjectMatch[1] = true;
                    }
                    if (requestorId === null && requestorIdExists === false) {
                        subjectMatch[2] = true;
                    }
                    if (subjectMatch[0] === false || subjectMatch[1] === false
                        || subjectMatch[2] === false) {

                        // insert the old policy
                        policySet.policy.push(parsedPolicy[i]);
                    }
                }
            }
        }
        return policySet;
    };

    /**
    * Parse XML file
    * @function
    * @param xmlFile XML file to parse
    */
    var parseFile = function (xmlFile) {
        xmlParser.parseString(xmlFile, function(err, parsedData) {
            if (err === undefined || err === null) {
                data = parsedData;
            } else {
                console.log(err);
                return false;
            }
        });
    };

    /**
    * Generate a new rule
    * @function
    * @param manifest Parsed application manifest
    * @param features Array of {name, effect} elements related to not denied
    * features
    * @param effect Rule effect (permit, prompt-blanket, prompt-session,
    * prompt-oneshot)
    */
    var addRule = function (manFeature, features, effect) {
        var rule = {};
        rule.$ = {'effect' : effect};
        rule.condition = [];
        rule.condition[0] = {};
        rule.condition[0].$ = {'combine' : 'or'};
        rule.condition[0]['resource-match'] = [];

        for (var i = 0; i < manFeature.length; i++) {
            for (var j = 0; j < features.length; j++) {
                if (features[j].name === manFeature[i].$.name &&
                    features[j].effect === effect) {

                    var done = false;
                    if (manFeature[i].param) {
                        for (var k = 0; k < manFeature[i].param.length; k++) {
                            if (manFeature[i].param[k].$ &&
                                manFeature[i].param[k].$.name === 'label'
                                && manFeature[i].param[k].$.value) {

                                rule.condition[0]['resource-match']
                                    .push({'$' : {'attr' : 'api-feature',
                                    'match' : manFeature[i].$.name,
                                    'label' : manFeature[i].param[k].$.value}});
                                done = true;
                                break;
                            }
                        }
                    }
                    if (done === false) {
                        rule.condition[0]['resource-match'].push({
                            '$' : {'attr' : 'api-feature',
                            'match' : manFeature[i].$.name}});
                    }
                }
            }
        }
        return rule;
    };

    exports.manifest2policy = manifest2policy;

}());
