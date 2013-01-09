var _services = {};
var _service;

$(document).ready(start);
$(document).on("click","#serviceList a", function() { bindService(this.id); });

function start() {
	
	function serviceFoundCB(service) {
		_services[service.id] = service;
		var serviceDiv = $("<div>");
		serviceDiv.attr("id", "div-" + service.id);
		var serviceAnchor = $("<a>");
		serviceAnchor.attr("id",service.id);
		serviceAnchor.attr("href","#");
		serviceAnchor.text(service.serviceAddress);
		serviceDiv.append(serviceAnchor);
		var serviceAnswer = $("<span>");
		serviceAnswer.attr("id","ans-" + service.id);
		serviceDiv.append(serviceAnswer);
		$(serviceList).append(serviceDiv.clone());
        }
	
	function serviceLostCB(service) {
		_services[service.id] = null;
	}
	
	function error(discoveryError) {
		alert("Discovery error: " + discoveryError.message + " (Code: #" + discoveryError.code + ")");
	}

	webinos.discovery.findServices(
			{api:"http://webinos.org/api/test"},
			{onFound:serviceFoundCB, onLost:serviceLostCB, onError:error}, null, null);
}

function bindService(serviceId) {
	if (_services[serviceId]) {
		_service = _services[serviceId];
		_service.bindService({ onBind:serviceBound });
	}
}

function serviceBound(service) {
	$("#ans-" + service.id).text("waiting for response...");
	_service.get42("",function(ans) { $("#ans-" + service.id).text("replied with " + ans); }, function(err) { $("#ans-" + service.id).text("error - " + err); });
}


