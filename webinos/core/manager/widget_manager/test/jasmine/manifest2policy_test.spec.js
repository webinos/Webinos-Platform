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

var fs = require('fs');
var path = require('path');
var m2p = require (path.join(__dirname,
                             '../../lib/manifest2policy/manifest2policy.js'));

var manifest1 = path.join(__dirname, 'manifestExample1.xml');
var manifest2 = path.join(__dirname, 'manifestExample2.xml');
var manifest3 = path.join(__dirname, 'manifestExample3.xml');
var manifest4 = path.join(__dirname, 'manifestExample4.xml');
var outputFile = path.join(__dirname, 'outputFile.xml');
var allFeatures = [
    {
        name : 'http://webinos.org/feature/internet',
        effect : 'permit'
    },
    {
        name : 'http://webinos.org/api/notifications',
        effect : 'permit'
    },
    {
        name : 'http://webinos.org/api/file',
        effect : 'permit'
    },
    {
        name : 'http://webinos.org/api/w3c/geolocation',
        effect : 'permit'
    }];
var requiredFeatures = [
    {
        name : 'http://webinos.org/feature/internet',
        effect : 'permit'
    },
    {
        name : 'http://webinos.org/api/file',
        effect : 'permit'
    },
    {
        name : 'http://webinos.org/api/w3c/geolocation',
        effect : 'permit'
    }];
var promptFeatures = [
    {
        name : 'http://webinos.org/feature/internet',
        effect : 'permit'
    },
    {
        name : 'http://webinos.org/api/notifications',
        effect : 'prompt-session'
    },
    {
        name : 'http://webinos.org/api/file',
        effect : 'prompt-oneshot'
    },
    {
        name : 'http://webinos.org/api/w3c/geolocation',
        effect : 'prompt-session'
    }];

describe("Manager.WidgetManager.manifest2policy", function() {

    it("Wrong parameters, no policy generated", function() {
        runs(function() {
            expect(m2p.manifest2policy()).toEqual(false);
        });

        runs(function() {
            expect(m2p.manifest2policy(manifest1)).toEqual(false);
        });
    });

    it("Optional features allowed", function() {
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
        runs(function() {
            expect(m2p.manifest2policy(manifest1, outputFile, allFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="John Lyle-Proximity Reminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-John Lyle-Proximity Reminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
		});
	});

    it("Optional features denied", function() {
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
        runs(function() {
            expect(m2p.manifest2policy(manifest1, outputFile, requiredFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="John Lyle-Proximity Reminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-John Lyle-Proximity Reminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
        });
    });

    it("Add a new policy", function() {
        runs(function() {
            expect(m2p.manifest2policy(manifest2, outputFile, allFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="John Lyle-Another Example"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-John Lyle-Another Example"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy><policy><target><subject><subject-match attr="id" match="John Lyle-Proximity Reminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-John Lyle-Proximity Reminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
        });

        runs(function() {
            expect(m2p.manifest2policy(manifest2, outputFile, allFeatures,
                'PzhName', 'PzpName')).toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="John Lyle-Another Example"></subject-match><subject-match attr="user-id" match="PzhName"></subject-match><subject-match attr="requestor-id" match="PzpName"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-John Lyle-Another Example"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy><policy><target><subject><subject-match attr="id" match="John Lyle-Another Example"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-John Lyle-Another Example"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-John Lyle-Another Example</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy><policy><target><subject><subject-match attr="id" match="John Lyle-Proximity Reminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-John Lyle-Proximity Reminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-John Lyle-Proximity Reminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
        });
    });

    it("Widget id usage", function() {
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
        runs(function() {
            expect(m2p.manifest2policy(manifest3, outputFile, allFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
		});
	});

    it("UserId and requestorId usage", function() {
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
        runs(function() {
            expect(m2p.manifest2policy(manifest3, outputFile, allFeatures,
                'Justin', 'Device used by Justin')).toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match><subject-match attr="user-id" match="Justin"></subject-match><subject-match attr="requestor-id" match="Device used by Justin"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
		});
	});

    it("Add a new policy without userId and requestorId", function() {
        runs(function() {
            expect(m2p.manifest2policy(manifest3, outputFile, allFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match><subject-match attr="user-id" match="Justin"></subject-match><subject-match attr="requestor-id" match="Device used by Justin"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
		});
	});

    it("Replace a policy", function() {
        runs(function() {
            expect(m2p.manifest2policy(manifest3, outputFile, requiredFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match><subject-match attr="user-id" match="Justin"></subject-match><subject-match attr="requestor-id" match="Device used by Justin"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
		});
	});

    it("Label attribute usage", function() {
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
        runs(function() {
            expect(m2p.manifest2policy(manifest4, outputFile, allFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet" label="Internet access"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/notifications" label="Web notification"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/file" label="File access"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation" label="GPS"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
		});
	});

    it("Label attribute usage", function() {
        if (fs.existsSync(outputFile)) {
            fs.unlinkSync(outputFile);
        }
        runs(function() {
            expect(m2p.manifest2policy(manifest4, outputFile, promptFeatures))
                .toEqual(true);
            var data = fs.readFileSync(outputFile, 'utf-8');
            data = data.replace(/\r/g, '');
            data = data.replace(/\n/g, '');
            expect(data).toEqual('<policy-set><policy><target><subject><subject-match attr="id" match="http://webinos.org/proximityreminders"></subject-match></subject></target><rule effect="permit"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/feature/internet" label="Internet access"></resource-match></condition></rule><rule effect="prompt-session"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/api/notifications" label="Web notification"></resource-match><resource-match attr="api-feature" match="http://webinos.org/api/w3c/geolocation" label="GPS"></resource-match></condition></rule><rule effect="prompt-oneshot"><condition combine="or"><resource-match attr="api-feature" match="http://webinos.org/api/file" label="File access"></resource-match></condition></rule><rule effect="deny"></rule><DataHandlingPreferences PolicyId="#current-http://webinos.org/proximityreminders"><AuthorizationsSet><AuthzUseForPurpose><Purpose>http://www.w3.org/2002/01/P3Pv1/current</Purpose></AuthzUseForPurpose></AuthorizationsSet><ObligationsSet></ObligationsSet></DataHandlingPreferences><ProvisionalActions><ProvisionalAction><AttributeValue>http://webinos.org/api/w3c/geolocation</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Geolocation is needed to trigger reminders based on your current          location.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/notifications</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Notifications are used to alert you when a reminder is valid -          e.g., at a specific time or place.       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/api/file</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Your reminders are stored in files on the file system       </DeveloperProvidedDescription></ProvisionalAction><ProvisionalAction><AttributeValue>http://webinos.org/feature/internet</AttributeValue><AttributeValue>#current-http://webinos.org/proximityreminders</AttributeValue><DeveloperProvidedDescription language="EN">         Internet access is used to load Google Maps       </DeveloperProvidedDescription></ProvisionalAction></ProvisionalActions></policy></policy-set>');
		});
	});
});

