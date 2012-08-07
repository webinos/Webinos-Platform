var webinosPZH = {
  channel: null,
  userId: function() {
    if (window.location.pathname.split('/') !== -1) {
      return window.location.pathname.split('/')[1];
    } else {
      return "username missing";
    }
  },
  init: function(openCallback){
    if (typeof openCallback === 'function') openCallback();
  },
  messageRecieved: function(){ // Process incoming messages
    if(webinosPZH.channel.readyState === 4) {
      var msg = webinosPZH.channel.responseText;
      console.log('Message Received : ' + JSON.stringify(msg));
      if( typeof msg === 'string' && msg !== ""){
        msg = JSON.parse(msg);

        if(msg.payload.status=== "authenticate-google") {
          window.location.href=msg.payload.url;
        }
        switch(msg.cmd){
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
      }
    }
  },
  send: function(payload){
    // Try to add from if specified in the url
    var urlArgs = window.location.search.split("=");
    if (urlArgs.length >= 2) payload.from = urlArgs[2];
    webinosPZH.channel = new XMLHttpRequest();
    webinosPZH.channel.onreadystatechange = webinosPZH.messageRecieved;
    if (typeof location.port !== "undefined") {
      webinosPZH.channel.open("POST", 'https://'+window.location.hostname+":"+location.port+"?cmd=pzhWS");
    } else {
      webinosPZH.channel.open("POST", 'https://'+window.location.hostname+"?cmd=pzhWS");
    }
    webinosPZH.channel.setRequestHeader("Content-Type","application/json");
    webinosPZH.channel.send(JSON.stringify(payload));
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
        webinosPZH.send({cmd:"authenticate-google"});
      },
      yahoo: function(){
        webinosPZH.send({cmd:"authenticate-yahoo"});
      },
    },
    logout: function(){
      webinosPZH.send("logout");
      if ( window.location.search && window.location.search.split("?") &&
        window.location.search.split("?")[1].split('=')[1].split("&")[0] === 'google') {
        window.open('https://www.google.com/accounts/Logout');
      } else {
        window.open('https://login.yahoo.com/config/login?logout=1');
      }
      window.location.href='/index.html';
    },
    listDevices: function(callback){
      webinosPZH.callbacks.listDevices = callback;
       webinosPZH.send({cmd:"listDevices"});
    },
    addPzp: function(callback){
      webinosPZH.callbacks.addPzpQR = callback;
      webinosPZH.send({cmd:"addPzp"});
    },
    connectPzh: function(connectPzhId, callback){
      webinosPZH.callbacks.pzhPzh = callback;
      webinosPZH.send({cmd:"pzhPzh", "to":connectPzhId});
    },
    listPzp: function(callback){
      webinosPZH.callbacks.listPzp = callback;
      webinosPZH.send({cmd:"listPzp"});
    },
    revokePzp: function(id, callback) {
      webinosPZH.callbacks.revokePzp = callback;
      webinosPZH.send({cmd:"revokePzp","pzpid":id});
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
    },
  }
};
