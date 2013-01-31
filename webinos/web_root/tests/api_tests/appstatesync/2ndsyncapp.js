var objTemplate = {
	"prop0": "nop"
};

var syncObj;

var msgHandlers = {
	create: create,
	setprop: setprop,
	remove: remove
};

function create(objid) {
	webinos.sync.create(objid, function(so) {
		console.log("created test sync object in other app");
		syncObj = so;
		window.parent.postMessage("created:", "*");

	}, function(err) {
		console.log(err);
	}, { // options
		referenceObject: objTemplate
	});
}

function setprop(val) {
	if (!syncObj) {
		console.log("couldn't set prop, no sync object");
		return;
	}
	syncObj.data.prop0 = val;
	console.log("set prop on sync object in other app");
}

function remove(objid) {
	webinos.sync.remove(objid, function() {
		window.parent.postMessage("removed:", "*");
	});
}

function messageHandler(event) {
	var msg = event.data;
	var i = msg.indexOf(":");
	var h = msg.slice(0, i);
	var p = msg.slice(i + 1);

	var handler = msgHandlers[h];
	if (handler) handler(p);
}

window.addEventListener("message", messageHandler, false);
