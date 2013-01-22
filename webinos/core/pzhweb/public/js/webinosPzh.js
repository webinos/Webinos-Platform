var webinosPZH = {
    channel:null,
    provider:null,
    userId:function () {
        if (window.location.pathname.split('/') !== -1) {
            return window.location.pathname.split('/')[1];
        } else {
            return "username missing";
        }
    },
    init:function (openCallback) {
        if (typeof openCallback === 'function') openCallback();
    },
    messageReceived:function () { // Process incoming messages
        if (webinosPZH.channel.readyState === 4) {
            var msg = webinosPZH.channel.responseText;
            console.log('Message Received : ' + JSON.stringify(msg));
            if (typeof msg === 'string' && msg !== "") {
                msg = JSON.parse(msg);
                switch (msg.type) {
                    case 'getZoneStatus':
                        if (typeof webinosPZH.callbacks.getZoneStatus === 'function') webinosPZH.callbacks.getZoneStatus(msg.message);
                        break;
                    case 'getUserDetails':
                        if (typeof webinosPZH.callbacks.getUserDetails === 'function') webinosPZH.callbacks.getUserDetails(msg.message);
                        break;
                    case 'authCode':
                        if (typeof webinosPZH.callbacks.authCode === 'function') webinosPZH.callbacks.authCode(msg.message);
                        break;
                    case 'getCrashLog':
                        if (typeof webinosPZH.callbacks.getCrashLog === 'function') webinosPZH.callbacks.getCrashLog(msg.message);
                        break;
                    case 'getInfoLog':
                        if (typeof webinosPZH.callbacks.getInfoLog === 'function') webinosPZH.callbacks.getInfoLog(msg.message);
                        break;
                    case 'pzhPzh':
                        if (typeof webinosPZH.callbacks.pzhPzh === 'function') webinosPZH.callbacks.pzhPzh(msg.message);
                        break;
                    case 'getPzps':
                        if (typeof webinosPZH.callbacks.getPzps === 'function') webinosPZH.callbacks.getPzps(msg.message);
                        break;
                    case 'revokePzp':
                        if (typeof webinosPZH.callbacks.revokePzp === 'function') webinosPZH.callbacks.revokePzp(msg.message);
                        break;
                    case 'listAllServices':
                        if (typeof webinosPZH.callbacks.listAllServices === 'function') webinosPZH.callbacks.listAllServices(msg.message);
                        break;
                    case 'listUnregServices':
                        if (typeof webinosPZH.callbacks.listUnregServices === 'function') webinosPZH.callbacks.listUnregServices(msg.message);
                        break;
                    case 'getAllPzh':
                        if (typeof webinosPZH.callbacks.getAllPzh === 'function') webinosPZH.callbacks.getAllPzh(msg.message);
                        break;
                    case 'approveUser':
                        if (typeof webinosPZH.callbacks.approveUser === 'function') webinosPZH.callbacks.approveUser(msg.message);
                        break;
                }
            }
        }
    },
    send:function (payload) {
        // Try to add from if specified in the url
        var urlArgs = window.location.search.split("=");
        if (urlArgs.length >= 2) payload.from = urlArgs[2];
        webinosPZH.channel = new XMLHttpRequest();
        webinosPZH.channel.onreadystatechange = webinosPZH.messageReceived;
        var queryUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "query/";
        webinosPZH.channel.open("POST", queryUrl);
        webinosPZH.channel.setRequestHeader("Content-Type", "application/json");
        webinosPZH.channel.send(JSON.stringify(payload));
        console.log(JSON.stringify(queryUrl));
    },
    callbacks:{
        getZoneStatus:null,
        getUserDetails:null,
        authCode:null,
        getCrashLog:null,
        getInfoLog:null,
        pzhPzh:null,
        getPzps:null,
        revokePzp:null,
        listAllServices:null,
        getAllPzh:null,
        approveUser:null
    },
    commands:{
        getZoneStatus:function (callback) {
            webinosPZH.callbacks.getZoneStatus = callback;
            webinosPZH.send({payload:{status:"getZoneStatus"}});
        },
        authCode:function (callback) {
            webinosPZH.callbacks.authCode = callback;
            webinosPZH.send({payload:{status:"authCode"}});
        },
        getPzps:function (callback) {
            webinosPZH.callbacks.getPzps = callback;
            webinosPZH.send({payload:{status:"getPzps"}});
        },
        revokePzp:function (id, callback) {
            webinosPZH.callbacks.revokePzp = callback;
            webinosPZH.send({payload:{status:"revokePzp", "pzpid":id}});
        },
        listAllServices:function (callback) {
            webinosPZH.callbacks.listAllServices = callback;
            webinosPZH.send({payload:{status:"listAllServices"}});
        },
        listUnregServices:function (at, callback) {
            webinosPZH.callbacks.listUnregServices = callback;
            webinosPZH.send({payload:{status:"listUnregServices", "at":at}});
        },
        registerService:function (at, name, callback) {
            webinosPZH.callbacks.registerService = callback;
            webinosPZH.send({payload:{status:"registerService", "at":at, "name":name}});
        },
        unregisterService:function (svAddress, svId, svAPI, callback) {
            webinosPZH.callbacks.unregisterService = callback;
            webinosPZH.send({payload:{status:"unregisterService", "at":svAddress, "svId":svId, "svAPI":svAPI}});
        },
        getCrashLog:function (callback) {
            webinosPZH.callbacks.getCrashLog = callback;
            webinosPZH.send({payload:{status:'getCrashLog'}});
        },
        getInfoLog:function (callback) {
            webinosPZH.callbacks.getInfoLog = callback;
            webinosPZH.send({payload:{status:'getInfoLog'}});
        },
        getUserDetails:function (callback) {
            webinosPZH.callbacks.getUserDetails = callback;
            webinosPZH.send({payload:{status:'getUserDetails'}});
        },
        restartPzh:function () {
            webinosPZH.send({payload:{status:'restartPzh'}});
        },
        getAllPzh:function (callback) {
            webinosPZH.callbacks.getAllPzh = callback;
            webinosPZH.send({payload:{status:'getAllPzh'}});
        },
        approveUser:function (callback) {
            webinosPZH.callbacks.approveUser = callback;
            webinosPZH.send({payload:{status:'approveUser'}});
        }
    }
};
