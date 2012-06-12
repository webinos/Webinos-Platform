var webinosPZH = {
	channel: null, // The websocket channel
	channelIsOpen: false,
	init: function(openCallback){
		try{
			webinosPZH.channel  = new WebSocket('wss://'+window.location.hostname+':8900');
		} catch(e) {
			webinosPZH.channel  = new MozWebSocket('wss://'+window.location.hostname+':8900');
		}
		webinosPZH.channel.onmessage = webinosPZH.messageRecieved;
		webinosPZH.channel.onopen = function(ev) {	webinosPZH.channelIsOpen = true; if (typeof openCallback === 'function') openCallback(); }; 
	},
	messageRecieved: function(ev){ // Process incoming messages
		console.log('WebSocket Client: Message Received : ' + JSON.stringify(ev.data));
		var msg = ev.data;
		if( typeof ev.data === 'string'){
			msg = JSON.parse(ev.data);
		}
		console.log(msg);
		switch(msg.cmd){
			case 'auth-url':
				window.location.href=msg.payload;
				break;
			case 'listDevices':
				if (typeof webinosPZH.callbacks.listDevices === 'function') webinosPZH.callbacks.listDevices(msg.payload);
				break;
			case 'userDetails':
				if (typeof webinosPZH.callbacks.userDetails === 'function') webinosPZH.callbacks.userDetails(msg.payload);
				break;
			case 'addPzpQR':
				if (typeof webinosPZH.callbacks.addPzpQR === 'function') webinosPZH.callbacks.addPzpQR(msg.payload);
				break;
			case 'crashLog':
				if (typeof webinosPZH.callbacks.crashLog === 'function') webinosPZH.callbacks.crashLog(msg.payload);
				break;
			case 'pzhPzh':
				if (typeof webinosPZH.callbacks.pzhPzh === 'function') webinosPZH.callbacks.pzhPzh(msg.payload);
				break;
			case 'listPzp':
				if (typeof webinosPZH.callbacks.listPzp === 'function') webinosPZH.callbacks.listPzp(msg.payload);
				break;
			case 'revokePzp':
				if (typeof webinosPZH.callbacks.revokePzp === 'function') webinosPZH.callbacks.revokePzp(msg.pzpid);
				break;
		}
	},
	send: function(payload){
		// Try to add from if specified in the url
		var urlArgs = window.location.search.split("=");
		if (urlArgs.length >= 2) payload.from = urlArgs[2];
		// If the channel is open send the message
		if(webinosPZH.channelIsOpen)
			webinosPZH.channel.send(JSON.stringify(payload));
		else // TODO: Wait for channel to open and resend the msg?
			console.log("Channel is not open!");
	},
	callbacks: {
		listDevices: null,
		userDetails: null,
		addPzpQR: null,
		crashLog: null,
		pzhPzh: null,
		listPzp: null,
		revokePzp: null
	},
	commands: {
		authenticate: {
			google: function(){
				webinosPZH.send({cmd: "authenticate-google"});
			},
			yahoo: function(){
				webinosPZH.send({cmd: "authenticate-yahoo"});
			}
		},
		logout: function(){
			webinosPZH.send({cmd:'logout'});
			if (window.location.search && window.location.search.split("?") && window.location.search.split("?")[1].split('=')[1] === 'google') {
				window.open('https://www.google.com/accounts/Logout');
			} else {
				window.open('https://login.yahoo.com/config/login?logout=1');
			}
			window.location.href='/index.html';
		},
		listDevices: function(callback){
			webinosPZH.callbacks.listDevices = callback;
			webinosPZH.send({cmd:'listDevices'});
		},
		addPzp: function(callback){
			webinosPZH.callbacks.addPzpQR = callback;
			webinosPZH.send({cmd:'addPzp'});
		},
		connectPzh: function(connectPzhId, callback){
			webinosPZH.callbacks.pzhPzh = callback;
			webinosPZH.send({cmd:'pzhPzh', to:connectPzhId});
		},
		listPzp: function(callback){
			webinosPZH.callbacks.listPzp = callback;
			webinosPZH.send({cmd:'listPzp'});
		},
		revokePzp: function(self, callback) {
			webinosPZH.callbacks.revokePzp = callback;
			webinosPZH.send({cmd: 'revokePzp', pzpid: self.id});
		},
		crashLog: function(callback){
			webinosPZH.callbacks.crashLog = callback;
			webinosPZH.send({cmd:'crashLog'});
		},
		userDetails: function(callback){
			webinosPZH.callbacks.userDetails = callback;
			webinosPZH.send({cmd:'userDetails'});
		},
		restartPzh: function(){
			webinosPZH.send({cmd:'restartPzh'});
		}
	}
};



