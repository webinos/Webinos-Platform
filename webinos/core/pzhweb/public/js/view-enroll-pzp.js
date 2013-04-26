var channel;
try {
	channel = new window.WebSocket("ws://localhost:"+templateData.pzpPort);
} catch (err) {
	throw new Error ("Your browser does not support websockets. Please report your browser on webinos.org.");
}

channel.onerror = function (error) {
	console.error ("Connection Error: " + error.toString ());
};

channel.onclose = function () {
	console.log ("PZP Connection Closed");
};

channel.onmessage = function (message) {
	var data = JSON.parse (message.data);
	if (data.payload && data.payload.status === "csrAuthCodeByPzp") {
		 //respond back to the PZP
		 var req = new XMLHttpRequest ();
		 req.onreadystatechange = function() {
			if (req.readyState === 4) {
				var msg = req.responseText;
				if (msg !== "") {
					var parse = JSON.parse(msg);
					channel.send(JSON.stringify(parse.message));
                    if (parse.message.payload.status === "signedCertByPzh" || parse.message.payload.status === "error") {
						if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
							window.location.href = "http://localhost:"+templateData.pzpPort+"/apps/wrt/13be5cfb9c336f34de467d6a370e3210c59c5f7f/wgt/index.html?finalStep=1";
						}else{
							window.location.href = "http://localhost:"+templateData.pzpPort+"/testbed/client.html";
						}
						channel.close();
					}
				}
			 }
		 }
		 req.open("POST", window.location.protocol + "//" + window.location.host + "/main/"+templateData.user+"/pzpEnroll/");
		 req.setRequestHeader ("Content-Type", "application/json");
		 req.send(JSON.stringify({authCode:data.payload.authCode, csr:data.payload.csr, from:data.from}));
	}
};

channel.onopen = function() {
	console.log("connection successful");
	var data = {type:"prop", from: window.location.host+"_"+templateData.user , to: "",
	payload:{
		status:"authCodeByPzh",
		authCode:templateData.authCode,
		providerDetails:((templateData.port !== '443') ? (templateData.address+":"+templateData.port) : templateData.address)}};
	channel.send(JSON.stringify(data));
};