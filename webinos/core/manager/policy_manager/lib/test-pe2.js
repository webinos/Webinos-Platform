
var fs = require('fs');

var data = fs.readFileSync('./policies/policy.xml.save');
fs.writeFileSync('./policies/policy.xml', data);

data = fs.readFileSync('./policies/man-policy.xml.save');
fs.writeFileSync('./policies/man-policy.xml', data);

var pelib = require('./policyeditor2.js');
var pe = new pelib.policyEditor2();


var policyFiles = pe.getPolicyFiles();
console.log('Found '+policyFiles.length+' policy files');
for(var i in policyFiles) {
    console.log('policy '+policyFiles[i].id+': '+policyFiles[i].desc);
}


var ids = pe.getPolicyIds(0, null);
var res = 'Policy 0 contanis following ids: ';
for (var i in ids) {
    res += ids[i]+', ';
}
console.log(res);

console.log('\nPolicy 0 is:\n'+JSON.stringify(pe.getPolicy(0, null)));
console.log('\nPolicy 0, p000001 is:\n'+JSON.stringify(pe.getPolicy(0, 'p000001')));
console.log('\nPolicy 0, p000002 is:\n'+JSON.stringify(pe.getPolicy(0, 'p000002')));
console.log('\nPolicy 1 is:\n'+JSON.stringify(pe.getPolicy(1, null)));
console.log('\nPolicy 2 is:\n'+JSON.stringify(pe.getPolicy(2, null)));

console.log('\nPolicy 0 target is:\n'+JSON.stringify(pe.getTarget(0, 'p000001')));
console.log('\nPolicy 0 target is:\n'+JSON.stringify(pe.getTarget(0, 'p000002')));

console.log('\nPolicy 0 rule is:\n'+JSON.stringify(pe.getRules(0, 'p000001')));
console.log('\nPolicy 0 rule is:\n'+JSON.stringify(pe.getRules(0, 'p000002')));

//Policy addiction
console.log('\nAdding new policy to Policy 0 s000002 - before:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
var newId = pe.addPolicy(0, 's000002', 'policy', 1, 'new policy');
console.log('\nAdding new policy to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
pe.addRule(0, newId, 'permit', 'http://webinos.org/api/nfc', null);
console.log('\nAdding new permit rule to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
pe.addRule(0, newId, 'permit', 'http://webinos.org/api/messaging', null);
console.log('\nAdding new permit rule to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
pe.addRule(0, newId, 'prompt', 'http://webinos.org/api/geolocation', null);
console.log('\nAdding new prompt rule to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
pe.addRule(0, newId, 'prompt-session', 'http://webinos.org/api/file', null);
console.log('\nAdding new prompt-session rule to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
//Add target to policy
pe.addSubject(0, newId, 'user-id', 'Salvo');
console.log('\nAdding new subject user-id to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
pe.addSubject(0, newId, 'id', 'WebApp');
console.log('\nAdding new subject id to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));
pe.addSubject(0, newId, 'user-id', 'Andrea');
console.log('\nAdding new subject user-id to Policy 0 s000002 - after:\n'+JSON.stringify(pe.getPolicy(0, 's000002')));

//Policy save
pe.save(0);

/*
//Policy removal
console.log('\n\nPolicy 0 :\n'+JSON.stringify(pe.getPolicy(0, null)));
pe.removePolicy(0, 'p000002');
console.log('\nRemoved Policy 0 p000002:\n'+JSON.stringify(pe.getPolicy(0, null)));
pe.removePolicy(0, 'p000003');
console.log('\nRemoved Policy 0 p000003:\n'+JSON.stringify(pe.getPolicy(0, null)));
pe.removePolicy(0, 's000002');
console.log('\nRemoved Policy 0 s000002:\n'+JSON.stringify(pe.getPolicy(0, null)));
*/


//EDITING OF USER POLICY
console.log('\n\nUser policy is:\n'+JSON.stringify(pe.getPolicy(1, null)));
ids = pe.getPolicyIds(1, null);
res = '\nUser Policy contanis following ids: ';
for (var i in ids) {
    res += ids[i]+', ';
}
console.log(res);

//Add new policy for subject Stefano
newId = pe.addPolicy(1, null, 'policy', 0, 'new policy #1');
console.log('\nAdded policy with id '+newId+':\n'+JSON.stringify(pe.getPolicy(1, null)));
pe.addSubject(1, newId, 'user-id', 'Stefano');
//Add rules for Stefano
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/nfc', null);
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/mediacontent', null);
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/sensors', null);
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/actuators', null);
pe.addRule(1, newId, 'prompt-session', 'http://webinos.org/api/messaging', null);
pe.addRule(1, newId, 'prompt-session', 'http://webinos.org/api/contacts', null);
pe.addRule(1, newId, 'prompt-session', 'http://webinos.org/api/calendar', null);
pe.addRule(1, newId, 'prompt-oneshot', 'http://webinos.org/api/secureelement', null);
pe.addRule(1, newId, 'prompt-oneshot', 'http://webinos.org/api/vehicle', null);
console.log('\nNew user policy is:\n'+JSON.stringify(pe.getPolicy(1, null)));

//Add new policy for subject Stefano and app BMWTravel
newId = pe.addPolicy(1, null, 'policy', 0, 'new policy #1');
console.log('\nAdded policy with id '+newId+':\n'+JSON.stringify(pe.getPolicy(1, null)));
pe.addSubject(1, newId, 'user-id', 'Stefano');
pe.addSubject(1, newId, 'id', 'BMWTravel');
//Add rules
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/nfc', null);
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/mediacontent', null);
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/sensors', null);
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/actuators', null);
pe.addRule(1, newId, 'prompt-session', 'http://webinos.org/api/messaging', null);
pe.addRule(1, newId, 'prompt-session', 'http://webinos.org/api/contacts', null);
pe.addRule(1, newId, 'prompt-session', 'http://webinos.org/api/calendar', null);
pe.addRule(1, newId, 'prompt-oneshot', 'http://webinos.org/api/secureelement', null);
pe.addRule(1, newId, 'permit', 'http://webinos.org/api/vehicle', null);
console.log('\nNew user policy is:\n'+JSON.stringify(pe.getPolicy(1, null)));

//Add new policy for subject Cesare
newId = pe.addPolicy(1, null, 'policy', 0, 'new policy #1');
console.log('\nAdded policy with id '+newId+':\n'+JSON.stringify(pe.getPolicy(1, null)));
pe.addSubject(1, newId, 'user-id', 'Cesare');
//Add rules
pe.addRule(1, newId, 'deny', 'http://webinos.org/api/nfc', null);
pe.addRule(1, newId, 'prompt-oneshot', 'http://webinos.org/api/mediacontent', null);
pe.addRule(1, newId, 'prompt-blanket', 'http://webinos.org/api/sensors', null);
pe.addRule(1, newId, 'deny', 'http://webinos.org/api/actuators', null);
pe.addRule(1, newId, 'deny', 'http://webinos.org/api/messaging', null);
pe.addRule(1, newId, 'prompt-session', 'http://webinos.org/api/contacts', null);
pe.addRule(1, newId, 'deny', 'http://webinos.org/api/calendar', null);
pe.addRule(1, newId, 'deny', 'http://webinos.org/api/secureelement', null);
pe.addRule(1, newId, 'deny', 'http://webinos.org/api/vehicle', null);
console.log('\nNew user policy is:\n'+JSON.stringify(pe.getPolicy(1, null)));




//Policy save
pe.save(1);

