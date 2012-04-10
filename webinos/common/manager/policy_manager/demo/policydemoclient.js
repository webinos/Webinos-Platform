
var policyFileSelected = "policy-allow.xml";
var appCert = "X";

$(document).ready(function() {
   
   refreshTable();

}); 


function policyDataReceived(data) {
	$("#policytable").html(data);
}

function changePolicyFile(file) {
	policyFileSelected = file;
	refreshTable();
}

function changeAppCert(cert) {
	appCert = cert;
	refreshTable();
}

function refreshTable() {
	var reqUrl = "http://"+window.location.hostname+":8124/getPolicyTable?file="+policyFileSelected;
	if(appCert != "X") {
		reqUrl += "&appCert="+appCert;
	}
	$.ajax({
		url: reqUrl,
		dataType: "text",
		success: policyDataReceived,
		error: function(jqXHR, textStatus, errorThrown) { alert('error ' + textStatus + " " + errorThrown); }
	});
}

