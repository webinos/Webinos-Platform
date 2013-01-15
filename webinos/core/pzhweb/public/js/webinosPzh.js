var webinosPZH = {
    channel        :null,
    provider       :null,
    userId         :function () {
        if (window.location.pathname.split ('/') !== -1) {
            return window.location.pathname.split ('/')[1];
        } else {
            return "username missing";
        }
    },
    init           :function (openCallback) {
        if (typeof openCallback === 'function') openCallback ();
    },
    messageRecieved:function () { // Process incoming messages
        if (webinosPZH.channel.readyState === 4) {
            var msg = webinosPZH.channel.responseText;
            console.log ('Message Received : ' + JSON.stringify (msg));
            if (typeof msg === 'string' && msg !== "") {
                msg = JSON.parse (msg);
                switch (msg.cmd) {
                    case 'listDevices':
                        if (typeof webinosPZH.callbacks.listDevices === 'function') webinosPZH.callbacks.listDevices (msg.payload);
                        break;
                    case 'userDetails':
                        if (typeof webinosPZH.callbacks.userDetails === 'function') webinosPZH.callbacks.userDetails (msg.payload);
                        break;
                    case 'addPzp':
                        if (typeof webinosPZH.callbacks.addPzpQR === 'function') webinosPZH.callbacks.addPzpQR (msg.payload);
                        break;
                    case 'crashLog':
                        if (typeof webinosPZH.callbacks.crashLog === 'function') webinosPZH.callbacks.crashLog (msg.payload);
                        break;
                    case 'infoLog':
                        if (typeof webinosPZH.callbacks.infoLog === 'function') webinosPZH.callbacks.infoLog (msg.payload);
                        break;
                    case 'pzhPzh':
                        if (typeof webinosPZH.callbacks.pzhPzh === 'function') webinosPZH.callbacks.pzhPzh (msg.payload);
                        break;
                    case 'listPzp':
                        if (typeof webinosPZH.callbacks.listPzp === 'function') webinosPZH.callbacks.listPzp (msg.payload);
                        break;
                    case 'revokePzp':
                        if (typeof webinosPZH.callbacks.revokePzp === 'function') webinosPZH.callbacks.revokePzp (msg.payload);
                        break;
                    case 'listAllServices':
                        if (typeof webinosPZH.callbacks.listAllServices === 'function') webinosPZH.callbacks.listAllServices (msg.payload);
                        break;
                    case 'listUnregServices':
                        if (typeof webinosPZH.callbacks.listUnregServices === 'function') webinosPZH.callbacks.listUnregServices (msg.payload);
                        break;
                    case 'getAllPzh':
                        if (typeof webinosPZH.callbacks.getAllPzh === 'function') webinosPZH.callbacks.getAllPzh (msg.payload);
                        break;
                    case 'approveUser':
                        if (typeof webinosPZH.callbacks.approveUser === 'function') webinosPZH.callbacks.approveUser (msg.payload);
                        break;
                }
            }
        }
    },
    send           :function (payload) {
        // Try to add from if specified in the url
        var urlArgs = window.location.search.split ("=");
        if (urlArgs.length >= 2) payload.from = urlArgs[2];
        webinosPZH.channel = new XMLHttpRequest ();
        webinosPZH.channel.onreadystatechange = webinosPZH.messageRecieved;
        var queryUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "query/";
        webinosPZH.channel.open ("POST", queryUrl);
        webinosPZH.channel.setRequestHeader ("Content-Type", "application/json");
        webinosPZH.channel.send (JSON.stringify (payload));
        console.log (JSON.stringify (queryUrl));
    },
    callbacks      :{
        listDevices    :null,
        userDetails    :null,
        addPzpQR       :null,
        crashLog       :null,
        infoLog        :null,
        pzhPzh         :null,
        listPzp        :null,
        revokePzp      :null,
        listAllServices:null,
        getAllPzh      :null,
        approveUser    :null
    },
    commands       :{
        authenticate     :{
            google:function () {
                webinosPZH.send ({payload:{status:"authenticate", "message":{"provider":"google"}}});
            },
            yahoo :function () {
                webinosPZH.send ({payload:{status:"authenticate", "message":{"provider":"yahoo"}}});
            }
        },
        logout           :function () {
            webinosPZH.send ({payload:{status:"logout"}});
            provider = document.cookie && document.cookie.split (",") && document.cookie.split (",")[2] && document.cookie.split (",")[2].split ("=") && document.cookie.split (",")[2].split ("=")[1] || "google";
            if (provider === 'google') {
                window.open ('https://www.google.com/accounts/Logout');
            } else {
                window.open ('https://login.yahoo.com/config/login?logout=1');
            }
            window.location.href = '/index.html';
        },
        listDevices      :function (callback) {
            webinosPZH.callbacks.listDevices = callback;
            webinosPZH.send ({payload:{status:"listDevices"}});
        },
        addPzp           :function (callback) {
            webinosPZH.callbacks.addPzpQR = callback;
            webinosPZH.send ({payload:{status:"addPzp"}});
        },
        listPzp          :function (callback) {
            webinosPZH.callbacks.listPzp = callback;
            webinosPZH.send ({payload:{status:"listPzp"}});
        },
        revokePzp        :function (id, callback) {
            webinosPZH.callbacks.revokePzp = callback;
            webinosPZH.send ({payload:{status:"revokePzp", "pzpid":id}});
        },
        listAllServices  :function (callback) {
            webinosPZH.callbacks.listAllServices = callback;
            webinosPZH.send ({payload:{status:"listAllServices"}});
        },
        listUnregServices:function (at, callback) {
            webinosPZH.callbacks.listUnregServices = callback;
            webinosPZH.send ({payload:{status:"listUnregServices", "at":at}});
        },
        registerService  :function (at, name, callback) {
            webinosPZH.callbacks.registerService = callback;
            webinosPZH.send ({payload:{status:"registerService", "at":at, "name":name}});
        },
        unregisterService:function (svAddress, svId, svAPI, callback) {
            webinosPZH.callbacks.unregisterService = callback;
            webinosPZH.send ({payload:{status:"unregisterService", "at":svAddress, "svId":svId, "svAPI":svAPI}});
        },
        crashLog         :function (callback) {
            webinosPZH.callbacks.crashLog = callback;
            webinosPZH.send ({payload:{status:'crashLog'}});
        },
        infoLog          :function (callback) {
            webinosPZH.callbacks.infoLog = callback;
            webinosPZH.send ({payload:{status:'infoLog'}});
        },
        userDetails      :function (callback) {
            webinosPZH.callbacks.userDetails = callback;
            webinosPZH.send ({payload:{status:'userDetails'}});
        },
        restartPzh       :function () {
            webinosPZH.send ({payload:{status:'restartPzh'}});
        },
        getAllPzh        :function (callback) {
            webinosPZH.callbacks.getAllPzh = callback;
            webinosPZH.send ({payload:{status:'getAllPzh'}});
        },
        approveUser      :function (callback) {
            webinosPZH.callbacks.approveUser = callback;
            webinosPZH.send ({payload:{status:'approveUser'}});
        }
    }
};
