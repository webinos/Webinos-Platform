
var policyData;

var modifiedSubject;
var modifiedUser;
var modifiedApp;
var modifiedFeature;
var modifiedFeatureList;


$(document).ready(function() {
   
	showPolicyTable();

}); 


function showPolicyTable() {
	var htmlPageSelection = "<button type=\"button\" id=\"pageSel\" onclick=\"javascript:editPolicy();\">Edit policy</button>";
	$("#pageSelection").html(htmlPageSelection);
	$("#userSelection").html("...loading data...");
	$("#policyEdit").html("");
	policyDataReq();
}


function editPolicy() {
	var htmlPageSelection = "<button type=\"button\" id=\"pageSel\" onclick=\"javascript:showPolicyTable();\">Show policy table</button>";
	$("#pageSelection").html(htmlPageSelection);
	$("#userSelection").html("");
	$("#policyTable").html("");
	showEditMenu();
}


function policyDataReq() {
	var reqUrl = "http://"+window.location.hostname+":7777/getPolicyTable";
	$.ajax({
		url: reqUrl,
		dataType: "text",
		success: policyDataReceived,
		error: function(jqXHR, textStatus, errorThrown) { alert('error ' + textStatus + " " + errorThrown); }
	});
}


function policyDataReceived(data) {
	//alert(data);
	policyData = JSON.parse(data);
	displayPolicyUsers();
}


function displayPolicyUsers() {
	var htmlPageSelection = "<button type=\"button\" id=\"pageSel\" onclick=\"javascript:editPolicy();\">Edit policy</button>";
	$("#pageSelection").html(htmlPageSelection);
	$("#policyEdit").html("");
	var htmlUserSelection = "<select id=\"userSelect\" onChange=\"displayPolicyTable(this.options[this.selectedIndex].value)\">";
	htmlUserSelection += "<option value=\"-1\">no user</option>";
	for (var i=0; i<policyData.users.length; i++) {
		htmlUserSelection += "<option value=\""+i+"\">"+policyData.users[i].id+"</option>";
	}
	htmlUserSelection += "</select>";
	$("#userSelection").html(htmlUserSelection);
}


function displayPolicyTable(userIndex) {
	//alert("displayPolicyTable - 01: "+userIndex);
	var htmlPolicyTable = "";
	if(userIndex == -1) {
		htmlPolicyTable += "Select a user";
	}
	else if(policyData.users[userIndex].apps.length == 0) {
		htmlPolicyTable += "No data available";
	}
	else {
		htmlPolicyTable += "<table>";
		htmlPolicyTable += "<tr><td>Feature</td>";
		for (var i=0; i<policyData.users[userIndex].apps.length; i++) {
			htmlPolicyTable += "<td>"+policyData.users[userIndex].apps[i].id+"</td>";
		}
		htmlPolicyTable += "</tr>";
		for (var i=0; i<policyData.users[userIndex].apps[0].features.length; i++) {
			htmlPolicyTable += "<tr><td>"+policyData.users[userIndex].apps[0].features[i].name+"</td>";
			for (var j=0; j<policyData.users[userIndex].apps.length; j++) {
				htmlPolicyTable += "<td class=\""+policyData.users[userIndex].apps[j].features[i].res+"\"></td>";
			}
			htmlPolicyTable += "</tr>";
		}
		htmlPolicyTable += "</table>";
	}
	//alert("displayPolicyTable - 09: "+htmlPolicyTable);
	$("#policyTable").html(htmlPolicyTable);
}


function showEditMenu() {
	var htmlMenu = "";
	
	htmlMenu += "<button type=\"button\" id=\"editUser\" onclick=\"javascript:getSubjectData();\">Edit user</button><br>";
	htmlMenu += "<button type=\"button\" id=\"editFeature\" onclick=\"javascript:getFeatureData();\">Edit feature</button><br>";
	$("#policyEdit").html(htmlMenu);
}


function getSubjectData() {
	var reqUrl = "http://"+window.location.hostname+":7777/getSubjectData";
	$.ajax({
		url: reqUrl,
		dataType: "text",
		success: subjectDataReceived,
		error: function(jqXHR, textStatus, errorThrown) { alert('error ' + textStatus + " " + errorThrown); }
	});
}


function subjectDataReceived(data) {
	modifiedSubject = JSON.parse(data);
	showEditUser();
}


function showEditUser() {
	var htmlPageSelection = "<button type=\"button\" id=\"back\" onclick=\"javascript:editPolicy();\">Back without saving</button>";
	$("#pageSelection").html(htmlPageSelection);
	$("#userSelection").html("");
	$("#policyTable").html("");
	var htmlUserSelection = "<select id=\"userSelect\" onChange=\"addUserUi(this.options[this.selectedIndex].value)\">";
	htmlUserSelection += "<option value=\"-2\">select...</option>";
	htmlUserSelection += "<option value=\"-1\">new user</option>";
	for (var i=0; i<modifiedSubject.subjects.length; i++) {
		htmlUserSelection += "<option value=\""+i+"\">"+modifiedSubject.subjects[i].userid+"</option>";
	}
	htmlUserSelection += "</select><br>";
	htmlUserSelection += "<button type=\"button\" id=\"saveSubject\" onclick=\"javascript:saveSubject();\">Save</button>";
	$("#policyEdit").html(htmlUserSelection);
}


function addUserUi(num) {
	if(num == -1) {
		modifiedUser = {};
		modifiedUser.userid = "";
		modifiedUser.usertrust = 2;
		modifiedUser.devices = new Array();
		modifiedUser.apps = new Array();
		var defaultApp = {};
		defaultApp.id = "__default__";
		defaultApp.trust = 2;
		modifiedUser.apps.push(defaultApp);
	}
	else {
		modifiedUser = modifiedSubject.subjects[num];
	}
	var htmlPageSelection = "<button type=\"button\" id=\"back\" onclick=\"javascript:showEditUser();\">Back</button>";
	$("#pageSelection").html(htmlPageSelection);
	$("#userSelection").html("");
	$("#policyTable").html("");
	var htmlAddUser = "";
	htmlAddUser += "<table>";
	htmlAddUser += "<tr><td>User id</td><td><input type=\"text\" id=\"userid\"/ value=\""+modifiedUser.userid+"\"></td></tr>";
	htmlAddUser += "<tr><td>User trust</td><td><select id=\"usertrust\">";
	for (var i=0; i<3; i++) {
		htmlAddUser += "<option value=\""+i+"\"";
		if(modifiedUser.usertrust == i) {
			htmlAddUser += " selected=\"selected\"";
		}
		htmlAddUser += ">"+i+"</option>";
	}
	htmlAddUser += "</select></td></tr>";
	//htmlAddUser += "TODO: add devices...<br>";
	htmlAddUser += "<tr><td>Applications:</td><td><button type=\"button\" id=\"addApp\" onclick=\"javascript:modifyApp(-1);\">Add</button></td></tr>";
	htmlAddUser += "</table>";
	htmlAddUser += "<div id=\"showApps\"/>";
	htmlAddUser += "";
	htmlAddUser += "<button type=\"button\" id=\"ok\" onclick=\"javascript:saveUser();\">OK</button>";
	htmlAddUser += "<br><br>WARNING: if the user already exists it will be replaced!";
	htmlAddUser += "<div id=\"editApps\"/>";
	$("#policyEdit").html(htmlAddUser);
	showApps();
}


function showApps() {
	var htmlAppList = "<table>";
	for (var i=0; i<modifiedUser.apps.length; i++) {
		htmlAppList += "<tr><td>App id: "+modifiedUser.apps[i].id+"</td><td>Trust: "+modifiedUser.apps[i].trust+"</td><td><button type=\"button\" id=\"addApp\" onclick=\"javascript:modifyApp("+i+");\">Modify</button></td></tr>";
	}
	htmlAppList += "</table>";
	$("#showApps").html(htmlAppList);
}


function modifyApp(num) {
	var htmlAppEdit = "<br><br>App data:<br><table>";
	if (num == -1) {
		modifiedApp = {};
		modifiedApp.id = "";
		modifiedApp.trust = 2;
	}
	else {
		modifiedApp = modifiedUser.apps[num];
	}

	htmlAppEdit += "<tr><td>App id</td><td><input type=\"text\" id=\"appid\"/ value=\""+modifiedApp.id+"\"></td></tr>";
	htmlAppEdit += "<tr><td>App trust</td><td><select id=\"apptrust\">";
	for (var i=0; i<3; i++) {
		htmlAppEdit += "<option value=\""+i+"\"";
		if(modifiedApp.trust == i) {
			htmlAppEdit += " selected=\"selected\"";
		}
		htmlAppEdit += ">"+i+"</option>";
	}
	htmlAppEdit += "</select></td></tr></table>";
	htmlAppEdit += "<button type=\"button\" id=\"save\" onclick=\"javascript:saveApp("+num+");\">Ok</button>";
	$("#editApps").html(htmlAppEdit);
}


function saveApp(num) {
	modifiedApp.id = $("#appid").val();
	modifiedApp.trust = +($("#apptrust").val());
	if (num == -1) {
		// This is a new app - append to app list
		modifiedUser.apps.unshift(modifiedApp);
	}
	else {
		modifiedUser.apps[num] = modifiedApp;
	}
	$("#editApps").html("");
	showApps();
}


function saveUser() {
	var added = false;
	modifiedUser.userid = $("#userid").val();
	modifiedUser.usertrust = +($("#usertrust").val());
	for(var i=0; i<modifiedSubject.subjects.length; i++) {
		if(modifiedUser.userid == modifiedSubject.subjects[i].userid) {
			modifiedSubject.subjects[i] = modifiedUser;
			added = true;
		}
	}
	if(!added) {
		modifiedSubject.subjects.push(modifiedUser);
	}
	showEditUser();
}


function saveSubject() {
	var reqUrl = "http://"+window.location.hostname+":7777/postSubjectData?subject="+JSON.stringify(modifiedSubject);
	$.ajax({
		url: reqUrl,
		dataType: "text",
		success: editPolicy,
		error: function(jqXHR, textStatus, errorThrown) { alert('error ' + textStatus + " " + errorThrown); }
	});
}


function getFeatureData() {
        var reqUrl = "http://"+window.location.hostname+":7777/getFeatureData";
        $.ajax({
                url: reqUrl,
                dataType: "text",
                success: featureDataReceived,
                error: function(jqXHR, textStatus, errorThrown) { alert('error ' + textStatus + " " + errorThrown); }
        });
}


function featureDataReceived(data) {
        modifiedFeatureList = JSON.parse(data);
        showEditFeature();
}


function showEditFeature() {
	var htmlPageSelection = "<button type=\"button\" id=\"back\" onclick=\"javascript:editPolicy();\">Back</button>";
	$("#pageSelection").html(htmlPageSelection);
	$("#userSelection").html("");
	$("#policyTable").html("");
	var htmlFeatureSelection = "<select id=\"featureSelect\" onChange=\"addFeatureUi(this.options[this.selectedIndex].value)\">";
	htmlFeatureSelection += "<option value=\"-2\">select...</option>";
	htmlFeatureSelection += "<option value=\"-1\">new feature</option>";
	for (var i=0; i<modifiedFeatureList.features.length; i++) {
		htmlFeatureSelection += "<option value=\""+i+"\">"+modifiedFeatureList.features[i].name+"</option>";
	}
	htmlFeatureSelection += "</select><br>";
	htmlFeatureSelection += "<button type=\"button\" id=\"saveFeatureList\" onclick=\"javascript:saveFeatureList();\">Save</button>";
	$("#policyEdit").html(htmlFeatureSelection);
}


function addFeatureUi(num) {
	if(num == -1) {
		modifiedFeature = {};
		modifiedFeature.name = "";
		modifiedFeature.permissions = new Array();
		modifiedFeature.permissions[0] = new Array(0,0,0);
		modifiedFeature.permissions[1] = new Array(2,2,2);
		modifiedFeature.permissions[2] = new Array(1,1,1);
	}
	else {
		modifiedFeature = modifiedFeatureList.features[num];
	}
	var htmlPageSelection = "";
	//htmlPageSelection = "<button type=\"button\" id=\"back\" onclick=\"javascript:showEditUser();\">Back</button>";
	$("#pageSelection").html(htmlPageSelection);
	$("#userSelection").html("");
	$("#policyTable").html("");
	var htmlAddFeature = "";
	htmlAddFeature += "Feature name: <input type=\"text\" id=\"featurename\"/ value=\""+modifiedFeature.name+"\"><br>";
	//Permission table
	htmlAddFeature += "<table><tr><td></td>";
	htmlAddFeature += "<td>High (0) trust user</td>";
	htmlAddFeature += "<td>Medium (1) trust user</td>";
	htmlAddFeature += "<td>Low (2) trust user</td>";
	htmlAddFeature += "</tr><tr>";
	htmlAddFeature += "<td>High (0) trust app</td>";
	htmlAddFeature += insertAppOptions(num, 0);
	htmlAddFeature += "</tr><tr>";
	htmlAddFeature += "<td>Medium (1) trust app</td>";
	htmlAddFeature += insertAppOptions(num, 1);
	htmlAddFeature += "</tr><tr>";
	htmlAddFeature += "<td>Low (2) trust app</td>";
	htmlAddFeature += insertAppOptions(num, 2);
	htmlAddFeature += "</tr></table>";
	htmlAddFeature += "<button type=\"button\" id=\"ok\" onclick=\"javascript:saveFeature("+num+");\">OK</button>";
	htmlAddFeature += "<br><br>WARNING: if the feature already exists it will be replaced!";
	$("#policyEdit").html(htmlAddFeature);
}


function insertAppOptions(featureNum, appTrust) {
	var htmlCode = "";
	for (var i=0; i<3; i++) {
		htmlCode += insertPolicyOptions(featureNum, appTrust, i);
	}
	return htmlCode;
}


function insertPolicyOptions(featureNum, appTrust, userTrust) {
	var htmlCode = "<td><select onChange=\"changePolicy("+featureNum+", "+appTrust+", "+userTrust+", this.options[this.selectedIndex].value)\">";
	for (var i=0; i<3; i++) {
		htmlCode += "<option value=\""+i+"\"";
		if(modifiedFeature.permissions[userTrust][appTrust] == i) {
			htmlCode += " selected=\"selected\"";
		}
		htmlCode += ">"+printPolicyEffect(i)+"</option>";
	}
	htmlCode += "</select></td>";
	return htmlCode;
}


function printPolicyEffect(num) {
        if(num == 0)
                return "PERMIT";
        if(num == 1)
                return "DENY";
        if(num == 2 || num == 3 || num == 4)
                return "PROMPT";
        return "UNDETERMINED";
}


function changePolicy(featureNum, appTrust, userTrust, decision) {
	modifiedFeature.permissions[userTrust][appTrust] = +decision;
}


function saveFeature() {
	var added = false;
	modifiedFeature.name = $("#featurename").val();
	for(var i=0; i<modifiedFeatureList.features.length; i++) {
		if(modifiedFeature.name == modifiedFeatureList.features[i].name) {
			modifiedFeatureList.features[i] = modifiedFeature;
			added = true;
		}
	}
	if(!added) {
		modifiedFeatureList.features.push(modifiedFeature);
	}
	showEditFeature();
}


function saveFeatureList() {
	var reqUrl = "http://"+window.location.hostname+":7777/postFeatureData?feature="+JSON.stringify(modifiedFeatureList);
	$.ajax({
		url: reqUrl,
		dataType: "text",
		success: editPolicy,
		error: function(jqXHR, textStatus, errorThrown) { alert('error ' + textStatus + " " + errorThrown); }
	});
}


