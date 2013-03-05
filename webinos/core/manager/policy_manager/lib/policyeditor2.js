/*******************************************************************************
 *  Code contributed to the webinos project
 * 
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Copyright 2013 Telecom Italia SpA
 * 
 ******************************************************************************/


(function () {
    'use strict';

    var fs = require('fs');
    var xml2js = require('xml2js');
    var convert2xml = require('data2xml')({attrProp:'$'});
    var path = require('path');
    var dependencies= require('find-dependencies')(__dirname);
    //var webinosPath = dependencies.local.require(dependencies.local.pzp.location).getWebinosPath();
    var webinosPath = '.';

    var userPolicyFile = path.join(webinosPath,'policies', 'policy.xml');
    var manufacturerPolicyFile = path.join(webinosPath,'policies', 'man-policy.xml');
    var decisionPolicyFile = path.join(webinosPath,'policies', 'decisionpermanent.xml');
    var appPolicyFiles = new Array();
    var decisionsessionPolicyFiles = new Array();


    var policyEditor2 = function() {
        console.log('Policy editor 2 constructor');
        //Load the xml parser
        var xmlParser = new xml2js.Parser(xml2js.defaults['0.2']);
        //init list of available policy files; this list should be updated every time a funcion
        //is called since some policy files may be added or deleted (app policies or session decision policies)
        var policyFiles = new Array();
        policyFiles.push({'path': manufacturerPolicyFile, 'desc': 'Manufacturer policy', 'content': null});
        policyFiles.push({'path': userPolicyFile, 'desc': 'User policy', 'content': null});
        policyFiles.push({'path': decisionPolicyFile, 'desc': 'Permanent decision', 'content': null});


        function updateFileList() {
        }


        function addType(policySet) {
            if(policySet['policy']) {
                for(var i in policySet['policy']) {
                    policySet['policy'][i]['$']['type'] = 'policy';
                }
            }
            if(policySet['policy-set']) {
                for(var i in policySet['policy-set']) {
                    policySet['policy-set'][i]['$']['type'] = 'policy-set';
                    policySet['policy-set'][i] = addType(policySet['policy-set'][i]);
                }
            }
            return policySet;
        }


        function readFileContent(fileId) {
            var result = null;
            var xmlPolicy = fs.readFileSync(policyFiles[fileId].path);
            //TODO: it is not clear why parseString ends in a sync way...
            xmlParser.parseString(xmlPolicy, function(err, data) {
                result = data['policy-set'];
            });
            //Adds type (policy or policy-set
            result['$']['type'] = 'policy-set';
            result = addType(result);
            policyFiles[fileId].content = result;
        }


        function getPolicyById(policySet, policyId) {
            //TODO: if the attribute id of the policy/policy-set is not defined, the function will crash
            //console.log('getPolicyById - policySet is '+JSON.stringify(policySet));
            if(policyId == null || policySet['$']['id'] == policyId) {
                return policySet;
            }
            if(policySet['policy']) {
                for(var j in policySet['policy']) {
                    if(policySet['policy'][j]['$']['id'] == policyId) {
                        return policySet['policy'][j];
                    }
                }
            }
            if(policySet['policy-set']) {
                for(var j in policySet['policy-set']) {
                    if(policySet['policy-set'][j]['$']['id'] == policyId) {
                        return policySet['policy-set'][j];
                    }
                    var tmp = getPolicyById(policySet['policy-set'][j], policyId);
                    if(tmp != null) {
                        return tmp;
                    }
                }
            }
            return null;
        }


        function getIdList(policySet, policyType) {
            var result = new Array();
            if(policyType == 'policy' && policySet['policy']) {
                for(var j in policySet['policy']) {
                    result.push(policySet['policy'][j]['$']['id']);
                }
            }
            if(policySet['policy-set']) {
                for(var j in policySet['policy-set']) {
                    if(policyType == 'policy-set') {
                        result.push(policySet['policy-set'][j]['$']['id']);
                    }
                    result = result.concat(getIdList(['policy-set'][j], policyType));
                }
            }
            return result;
        }


        function getNewId(fileId, policyType) {
            //TODO: padding is fixed; what if index exceeds?
            var padding = 6;
            var ids = getIdList(policyFiles[fileId].content, policyType);
            ids.sort();
            var nextId = parseInt(ids[ids.length-1].slice(1))+1;
            var result = ('00000000'+nextId).substr(-padding);
            if(policyType == 'policy') {
                result = 'p'+result;
            }
            else {
                result = 's'+result;
            }
            return result;
        }


        function removePolicyById(policySet, policyId) {
            //console.log('removePolicyById - id is '+policyId+', set is '+JSON.stringify(policySet));
            if(policySet['policy']) {
                for(var j in policySet['policy']) {
                    if(policySet['policy'][j]['$']['id'] == policyId) {
                        policySet['policy'].splice(j, 1);
                        return true; 
                    }
                }
            }
            if(policySet['policy-set']) {
                for(var j in policySet['policy-set']) {
                    if(policySet['policy-set'][j]['$']['id'] == policyId) {
                        policySet['policy-set'].splice(j, 1);
                        return true;
                    }
                    if(removePolicyById(policySet['policy-set'][j], policyId)) {
                        return true;
                    }
                }
            }
            return false;
        }


        function removeType(policySet) {
            var result = policySet;
            delete result['$']['type'];
            if(result['policy']) {
                for(var i in result['policy']) {
                    delete result['policy'][i]['$']['type'];
                }
            }
            if(result['policy-set']) {
                for(var i in result['policy-set']) {
                    removeType(result['policy-set'][i]);
                }
            }
            return result;
        }


        function removeSub(subject, attribute) {
            for(var i in subject[0]['subject-match']) {
                if(subject[0]['subject-match'][i]['$']['attr'] == attribute) {
                    delete subject[0]['subject-match'][i];
                    return;
                }
            }
        }


        function addSub(subject, attribute, match) {
            var tmp = {'$':{}};
            tmp['$']['attr'] = attribute;
            tmp['$']['match'] = match;
            subject[0]['subject-match'].push(tmp);
        }


        this.getPolicyFiles = function() {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to decide which files can be accessed
            var result = new Array();
            for(var i=0; i<policyFiles.length; i++) {
                if(policyFiles[i] != null) {
                    //console.log('Policy '+i+' is '+policyFiles[i].desc+' ('+policyFiles[i].path+')');
                    result.push({'id': i, 'desc': policyFiles[i].desc});
                }
            }
            return result;
        }


        this.getPolicy = function(fileId, policyId) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            if (policyFiles[fileId].content == null) {
                readFileContent(fileId);
            }
            return getPolicyById(policyFiles[fileId].content, policyId);
        }


        this.getPolicyIds = function(fileId, policyId) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            if (policyFiles[fileId].content == null) {
                readFileContent(fileId);
            }
            var policySet = getPolicyById(policyFiles[fileId].content, policyId);
            var result = new Array();
            if(policySet['policy']) {
                for(var i in policySet['policy']) {
                    result.push(policySet['policy'][i]['$']['id']);
                }
            }
            if(policySet['policy-set']) {
                for(var i in policySet['policy-set']) {
                    result.push(policySet['policy-set'][i]['$']['id']);
                }
            }
            return result;
        }


        this.getTarget = function(fileId, policyId) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            if(policyId == null) {
                return null;
            }
            else {
                var policy = getPolicyById(policyFiles[fileId].content, policyId);
                if(policy == null || policy['target'] == null) {
                    return null;
                }
                return(policy['target']);
            }
        }


        this.getRules = function(fileId, policyId) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            if(policyId == null) {
                return null;
            }
            else {
                var policy = getPolicyById(policyFiles[fileId].content, policyId);
                if(policy == null || policy['rule'] == null) {
                    return null;
                }
                return(policy['rule']);
            }
        }


        this.addPolicy = function(fileId, policyId, newPolicyType, newPolicyPoition, newPolicyDescription) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            var policySet = getPolicyById(policyFiles[fileId].content, policyId);
            if(policySet['$']['type'] != 'policy-set') {
                return null;
            }
            if(newPolicyType != 'policy' && newPolicyType != 'policy-set') {
                return null;
            }
            var newId = getNewId(fileId, newPolicyType);
            var newPolicy = {'$':{'combine': 'first-matching-target', 'description': newPolicyDescription, 'id': newId, 'type': newPolicyType}};
            if(newPolicyType == 'policy') {
                newPolicy['target'] = [{}];
                newPolicy['rule'] = [{'$':{'effect':'deny'}}];
                newPolicy['DataHandlingPreferences'] = [{'$':{'PolicyId':'#DHP_allow_all'},'AuthorizationsSet':[{'AuthzUseForPurpose':[{'Purpose':[{}]}]}]}];
                newPolicy['ProvisionalActions'] = [{'ProvisionalAction':[{'AttributeValue':['#DHP_allow_all','http://webinos.org']},{'AttributeValue':['#DHP_allow_all','http://www.w3.org']},{'AttributeValue':['#DHP_allow_all','http://wacapps.net']}]}];
            }
            if(newPolicyType == 'policy-set') {
                newPolicy['policy'] = [];
            }
            if(!policySet['policy']) {
                policySet['policy'] = new Array();
            }
            //TODO: At the moment the new policy is added at the beginning of existing policies...
            policySet['policy'].unshift(newPolicy);
            return newId;
        }


        this.addSubject = function(fileId, policyId, attribute, match) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            var policy = getPolicyById(policyFiles[fileId].content, policyId);
            if(policy == null) {
                return null;
            }
            if(policy['target'][0]['subject'] == null) {
                policy['target'][0] = {'subject':[{'subject-match':[]}]};
            }
            else {
                removeSub(policy['target'][0]['subject'], attribute);
            }
            addSub(policy['target'][0]['subject'], attribute, match);
        }


        this.removeSubject = function() {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            var policy = getPolicyById(policyFiles[fileId].content, policyId);
            if(policy == null) {
                return null;
            }
        }


        this.addRule = function(fileId, policyId, effect, feature, params) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            //Check if effect is valid value (deny is included in default rule)
            if(effect != 'permit' && effect != 'prompt-oneshot' && effect != 'prompt-session' && effect != 'prompt-blanket' /*&& effect != 'deny'*/) {
                return null;
            }
            var policy = getPolicyById(policyFiles[fileId].content, policyId);
            if(policy == null) {
                return null;
            }
            if(policy['$']['type'] != 'policy') {
                return null;
            }
            //TODO: at the moment params are not taken in account
            //TODO: at the moment only api features are supported - add services
            //TODO: Check if the feature is already present and remove it
            for(var i in policy['rule']) {
            }
            //TODO where should the new feature be added? Problems of subfeatures and parameters...
            //Add feature
            for(var i in policy['rule']) {
                if(policy['rule'][i]['$']['effect'] == effect) {
                    policy['rule'][i]['condition'][0]['resource-match'].push({'$':{'attr':'api-feature','match':feature}});
                    return;
                }
            }
            policy['rule'].unshift({'$':{'effect': effect},'condition':[{'$':{'combine':'or'},'resource-match':[{'$':{'attr':'api-feature','match':feature}}]}]});
        }


        this.removePolicy = function(fileId, policyId) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            if(policyId == null) {
                return;
            }
            removePolicyById(policyFiles[fileId].content, policyId);
        }


        this.save = function(fileId) {
            updateFileList();
            //TODO - VERY IMPORTANT: this function should check policies to verify if selected policy can be accessed
            //Check if fileId has valid value
            if(fileId >= policyFiles.length || policyFiles[fileId] == null) {
                return null;
            }
            var policy2save = removeType(JSON.parse(JSON.stringify(policyFiles[fileId].content)));
            var data = convert2xml('policy-set', policy2save);
            fs.writeFileSync(policyFiles[fileId].path, data);
        }


    };


    exports.policyEditor2 = policyEditor2;

}());

