

var webinos = require('webinos')(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);

var Pzh_Apis = exports;
var inactivity = [];
/**
 *
 * @param callback
 */
Pzh_Apis.fetchLogs = function(instance, type, callback){
  "use strict";
  logger.fetchLog(type, "Pzh", instance.getFriendlyName(), function(data) {
    var payload;
    if (type === "error") {
      payload = {to: instance.getSessionId(), cmd:"crashLog", payload:data};
    } else {
      payload = {to: instance.getSessionId(), cmd:"infoLog", payload:data};
    }
    callback(payload);
  });
};

/**
 * Sets PZH URL id for storing information about QRCode
 * @param {function} cb: Callback to return result
 */
Pzh_Apis.getMyUrl = function(instance, callback) {
  "use strict";
  if(callback) { callback(instance.getSessionId());}
};
/**
 *
 * @param callback
 */
Pzh_Apis.listZoneDevices = function(instance, res, callback) {
  "use strict";
  var result = {pzps: [], pzhs: []}, pzhId = instance.getSessionId();
  if (inactivity.hasOwnProperty(pzhId) && inactivity[pzhId] > 100 ) {
    res.end();
    return;
  } else if (!inactivity.hasOwnProperty(pzhId)){
    inactivity[pzhId] = 0;
  }
  inactivity [pzhId] = inactivity[pzhId] + 1;
  result.pzps = instance.getConnectedPzp();
  result.pzhs = instance.getConnectedPzh();
  if(callback) { callback({to: pzhId, cmd:"listDevices", payload:result});}
};
/**
 *
 * @param callback
 */
Pzh_Apis.listPzp = function(instance, callback) {
  "use strict";
  var result = {signedCert: [], revokedCert: []}, myKey;
  result.signedCert  = instance.getConnectedPzp();
  result.revokedCert = instance.getRevokedCert();
  callback({to: instance.getSessionId(), cmd:"listPzp", payload:result});
};

Pzh_Apis.addOtherZoneCert = function (instance, to, refreshCertF, callback) {
  "use strict";
  var sessionId = instance.getSessionId();
  var connectedPzh = instance.getConnectedPzh();
  if (to && to.split('/')) {
    if (connectedPzh.indexOf(to) !== -1) {
      callback({cmd:'pzhPzh', to: sessionId, payload: "already connected"});
    } else {
      this.sendCertificate(to, sessionId, config.userPref.ports.provider_webServer, config.cert.internal.master.cert, config.crl, refreshCertF, callback);
    }
  } else {
    callback({cmd:'pzhPzh', to: sessionId, payload: "connecting address is wrong"});
  }
};
/**
 *
 * @param callback
 */
Pzh_Apis.fetchUserData = function(instance, callback) {
  "use strict";
  if(callback) {
    var userDetails = instance.getUserDetails();
    callback( {to: instance.getSessionId(),
      cmd: "userDetails",
      payload: {
        email     : userDetails.email,
        country   : userDetails.country,
        image     : userDetails.image,
        name      : userDetails.name,
        servername: instance.getSessionId()
      }
    });
  }
};
Pzh_Apis.listAllServices = function(instance, callback) {
  "use strict";
  var result = { pzEntityList: [] }, connectedPzp = instance.getConnectedPzp(), key;
  result.pzEntityList.push({pzId:instance.getSessionId()});
  for (key = 0; key <  connectedPzp.length; key = key + 1) {
    result.pzEntityList.push({pzId:connectedPzp[key]});
  }
  result.services = instance.discovery.getAllServices();
  var payload = {to: instance.getSessionId(), cmd:"listAllServices", payload:result};
  if (callback) {callback(payload);}
};

Pzh_Apis.listUnregServices = function(instance, at, callback) {
  "use strict";
  function runCallback(pzEntityId, modules) {
    var result = {
      "pzEntityId": pzEntityId,
      "modules"   : modules
    };
    if(callback) {callback({to: instance.getSessionId(), cmd:"listUnregServices", payload:result});}
  }

  if (instance.getSessionId() !== at) {
    var id = instance.addMsgListener(function(modules) {
      runCallback(at, modules);
    });
    var msg = instance.prepMsg(instance.getSessionId(), at, "listUnregServices", {listenerId:id});
    instance.sendMessage(msg, at);
  } else {
    runCallback(instance.getSessionId(), instance.getInitModules());
  }
};

Pzh_Apis.registerService = function(instance, at, name, callback) {
  "use strict";
  if (instance.getSessionId() !== at) {
    var msg = instance.prepMsg(instance.getSessionId(), at, "registerService", {name:name, params:{}});
    instance.sendMessage(msg, at);
  } else {
    instance.registry.loadModule({"name":name, "params":{}}, instance.rpcHandler);
  }
};

Pzh_Apis.unregisterService = function(instance, at, svId, svAPI, callback) {
  "use strict";
  if (instance.sessionId !== at) {
    var msg = instance.prepMsg(instance.getSessionId(), at, "unregisterService", {svId:svId, svAPI:svAPI});
    instance.sendMessage(msg, at);
  } else {
    instance.registry.unregisterObject({"id":svId, "api":svAPI});
  }
};
