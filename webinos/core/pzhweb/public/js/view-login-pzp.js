function loginGoogle() {
	var options = {"type": 'prop', "payload":{"status": "authenticate", "message": "google"}};
	webinos.session.message_send(options);
}
function loginYahoo() {
	var options = {"type": 'prop', "payload":{"status": "authenticate", "message": "yahoo"}};
	webinos.session.message_send(options);
}
function authenticate(msg){
	console.log(msg);
	window.location.href=msg.payload.message;
}
webinos.session.addListener('authenticate', authenticate);