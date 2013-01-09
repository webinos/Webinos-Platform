
var webinos = require("find-dependencies")(__dirname),
    logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || logger,
    pzhTLS  = require('./realpzhtls.js');

var PzhAdaptor = exports;

function getUserFromEmail(userEmail, cb) {
    cb(userEmail, false);
}

function resultRspHandler(res) {
    return {
        err : function(err) {
            logger.log(err);
            res.status(500);
        },
        success : function(val) {
            res.json(val);
        }
    };
}

function resultCbHandler(cb) {
    return {
        err : function(err) {
            console.log(err);
            cb(false);
        },
        success : function(val) {
            cb(val);
        }
    }
}

function responseCertHandler(res) {
    return {
        err : function(err) {
            logger.log(err);
            res.status(500);
        },
        success : function(val) {
            var result = val;
            res.json(result);
        }
    }
}

function responseHandler(status, res) {
    return {
        err : function(err) {
            logger.log(err);
            res.status(500);
        },
        success : function(val) {
            var result = { payload : val };
            result.status = "";
            result.cmd = status;
            res.json(result);
        }
    }
}

function pzpResponder(email, res){
    return {
        success: function(authCode) {
            var msg = "<script> window.parent.postMessage("+
                JSON.stringify({cmd: 'requestEnroll',
                    pzhId: email,
                    authCode: authCode})+
                ", 'http://localhost:8080')</script>";
            res.write(msg);
            res.end();
        }
    }
}

function pzpEnrollResponder(res){
    return {
        success: function(payload) {
            var msg = JSON.stringify(payload);
            res.write(msg);
            res.end();
        }
    }
}

PzhAdaptor.getZoneStatus = function(user, res) {
    pzhTLS.send(user, {type : "getZoneStatus"}, resultRspHandler(res));
};

PzhAdaptor.approveFriend = function(user, externalEmail, res) {
    pzhTLS.send(user, {type:"approveFriend", externalEmail:externalEmail}, resultRspHandler(res));
};

PzhAdaptor.rejectFriend = function(user, externalEmail, res) {
    pzhTLS.send(user, {type:"rejectFriend", externalEmail:externalEmail}, resultRspHandler(res));
};

PzhAdaptor.getRequestingExternalUser = function(user, externalEmail, cb) {
    pzhTLS.send(user, {type:"getExpectedExternal", externalEmail:externalEmail}, resultCbHandler(cb));
};

PzhAdaptor.storeExternalUserCert = function(user, externalEmail, externalPzh, externalCerts, res) {
    pzhTLS.send(user, {type:"storeExternalCert",externalEmail:externalEmail, externalPzh:externalPzh,
            externalCerts: externalCerts}, resultRspHandler(res));
};

//unauthenticated input
PzhAdaptor.requestAddFriend = function(internaluser, externaluser, externalPzhDetails, res) {
    getUserFromEmail(internaluser, function(user, err) {
        pzhTLS.send(user, {type:"requestAddFriend", externalUser:externaluser, externalPzh:externalPzhDetails}, resultRspHandler(res));
    });
};

PzhAdaptor.fromWebUnauth = function(userEmail, body, res) {
    // we've received a request from the web interface over XHR.
    // translate and send to the PZH TLS server
    
    //it's not necessarily from a trusted or authenticated user, it's a public
    //request for something.  E.g., for our certificates.
    //first, check that the user is meaningful
    
    getUserFromEmail(userEmail, function(result, err) {
        if (err) {
            res.writeHead(200);
            res.end('Request failed: ' + err);
            return;
        } else {
            switch (body.type) {
                case "getCertificates":
                    pzhTLS.send(result, {type:"getCertificates"}, responseCertHandler(res));
                    break;
                case "authCode":
                    pzhTLS.send(result, {type:"authCode"}, res);
                    break;
                default:
                    res.writeHead(200);
                    res.end('Request failed: ' + err);
            }
        }
    });
}

PzhAdaptor.fromWeb = function(user, body, res) {
    // we've received a request from the web interface over XHR.
    // translate and send to the PZH TLS server
    if (typeof(body.payload) === 'undefined') {
        manageStatus(body.cmd, user, res);
    } else { 
        manageStatus(body.payload, user, res);
    }
}

function manageStatus(payload, user, res) {
    switch (payload.status) {
        case 'listDevices':
            pzhTLS.send(user, {type:"getZoneStatus"}, responseHandler(payload.status, res));
            break;
        case 'userDetails':
            pzhTLS.send(user, {type:"getUserDetails"}, responseHandler(payload.status, res));
            break;
      case 'crashLog':
          pzhTLS.send(user, {type:"getCrashLog"}, responseHandler(payload.status, res));
          break;
      case 'infoLog':
          pzhTLS.send(user, {type:"getInfoLog"}, responseHandler(payload.status, res));
          break;
      case 'listPzp':
          pzhTLS.send(user, {type:"getPzps"}, responseHandler(payload.status, res));
          break;
      case 'revokePzp':
          pzhTLS.send(user, {type:"revokePzp", pzpid: payload.pzpid}, responseHandler(payload.status, res));
          break;
      case 'addPzp':
          pzhTLS.send(user, {type:"addPzp"}, responseHandler(payload.status, res));
          break;
      case 'login':
          pzhTLS.send(user, {type:"hasLoggedIn"}, responseHandler(payload.status, res));
          break;
      case 'logout':
          pzhTLS.send(user, {type:"hasLoggedOut"}, responseHandler(payload.status, res));
          break;
      case 'listAllServices':
          pzhTLS.send(user, {type:"listAllServices"}, responseHandler(payload.status, res));
          break;
      case 'listUnregServices':
          pzhTLS.send(user, {type:"listUnregServices", at: payload.at}, responseHandler(payload.status, res));
          break;
      case 'registerService':
          pzhTLS.send(user, {type:"registerService", at: payload.at, name: payload.name}, responseHandler(payload.status, res));
          break;
      case 'unregisterService':
          pzhTLS.send(user, {type:"unregisterService", at: payload.at, svId: payload.svId, svAPI: payload.svAPI }, responseHandler(payload.status, res));
          break;
      case 'enrollPzp':
          pzhTLS.send(user, {type:"enrollPzp", from: payload.from, authCode: payload.authCode, csr: payload.csr}, pzpEnrollResponder(res));
          break;
      case 'authCode':
          pzhTLS.send(user, {type:"authCode"}, pzpResponder(user.emails[0].value, res));
          break;
      case 'getAllPzh':
          pzhTLS.send(user, {type:"getAllPzh"}, responseHandler(payload.status, res));
          break;
    }
}



