/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
 * Copyright 2012 - 2013 University of Oxford
 * Author: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/
var webinos = require ("find-dependencies") (__dirname),
    logger = webinos.global.require (webinos.global.util.location, "lib/logging.js") (__filename) || logger,
    pzhTLS = require ('./realpzhtls.js');

var PzhAdaptor = exports;

function getUserFromEmail (userEmail, cb) {
    cb (userEmail, false);
}

function resultRspHandler (res) {
    return {
        err    :function (err) {
            logger.log (err);
            res.status (500);
        },
        success:function (val) {
            res.json (val);
        }
    };
}

function resultCbHandler (cb) {
    return {
        err    :function (err) {
            logger.error (err);
            cb (false);
        },
        success:function (val) {
            cb (val);
        }
    }
}

function responseCertHandler (res) {
    return {
        err    :function (err) {
            logger.log (err);
            res.status (500);
        },
        success:function (val) {
            res.json (val);
        }
    }
}

function responseHandler (status, res) {
    return {
        err    :function (err) {
            logger.log (err);
            res.status (500);
        },
        success:function (val) {
            var result = { payload:val };
            result.status = "";
            result.cmd = status;
            res.json (result);
        }
    }
}

function pzpResponder (user, port, address, res) {
    return {
        success:function (authCode) {
            res.render("enroll-pzp",{address: address, port: port, authCode:authCode, user: user});
        }
    }
}

function pzpEnrollment(res) {
    return {
        success: function(result) {
            res.json(result);
        }
    }
}

PzhAdaptor.getZoneStatus = function (user, res) {
    pzhTLS.send (user, {type:"getZoneStatus"}, resultRspHandler (res));
};

PzhAdaptor.approveFriend = function (user, externalEmail, res) {
    pzhTLS.send (user, {type:"approveFriend", externalEmail:externalEmail}, resultRspHandler (res));
};

PzhAdaptor.rejectFriend = function (user, externalEmail, res) {
    pzhTLS.send (user, {type:"rejectFriend", externalEmail:externalEmail}, resultRspHandler (res));
};

PzhAdaptor.getRequestingExternalUser = function (user, externalEmail, cb) {
    pzhTLS.send (user, {type:"getExpectedExternal", externalEmail:externalEmail}, resultCbHandler (cb));
};

PzhAdaptor.storeExternalUserCert = function (user, externalEmail, externalPzh, externalCerts, res) {
    pzhTLS.send (user, {type:"storeExternalCert", externalEmail:externalEmail, externalPzh:externalPzh,
        externalCerts       :externalCerts}, resultRspHandler (res));
};

//unauthenticated input
PzhAdaptor.requestAddFriend = function (internaluser, externaluser, externalPzhDetails, res) {
    getUserFromEmail (internaluser, function (user, err) {
        pzhTLS.send (user, {type:"requestAddFriend", externalUser:externaluser, externalPzh:externalPzhDetails}, resultRspHandler (res));
    });
};

PzhAdaptor.fromWebUnauth = function (userEmail, body, res) {
    // we've received a request from the web interface over XHR.
    // translate and send to the PZH TLS server

    //it's not necessarily from a trusted or authenticated user, it's a public
    //request for something.  E.g., for our certificates.
    //first, check that the user is meaningful

    getUserFromEmail (userEmail, function (result, err) {
        if (err) {
            res.writeHead (200);
            res.end ('Request failed: ' + err);
            return;
        } else {
            switch (body.type) {
                case "getCertificates":
                    pzhTLS.send (result, {type:"getCertificates"}, responseCertHandler (res));
                    break;
                default:
                    res.writeHead (200);
                    res.end ('Request failed: ' + err);
            }
        }
    });
};

PzhAdaptor.fromWeb = function (user, body, res) {
    // we've received a request from the web interface over XHR.
    // translate and send to the PZH TLS server
    if (typeof(body.payload) === 'undefined') {
        manageStatus (body.cmd, user, res);
    } else {
        manageStatus (body.payload, user, res);
    }
};

function manageStatus (payload, user, res) {
    switch (payload.status) {
        case 'listDevices':
            pzhTLS.send (user, {type:"getZoneStatus"}, responseHandler (payload.status, res));
            break;
        case 'userDetails':
            pzhTLS.send (user, {type:"getUserDetails"}, responseHandler (payload.status, res));
            break;
        case 'crashLog':
            pzhTLS.send (user, {type:"getCrashLog"}, responseHandler (payload.status, res));
            break;
        case 'infoLog':
            pzhTLS.send (user, {type:"getInfoLog"}, responseHandler (payload.status, res));
            break;
        case 'listPzp':
            pzhTLS.send (user, {type:"getPzps"}, responseHandler (payload.status, res));
            break;
        case 'revokePzp':
            pzhTLS.send (user, {type:"revokePzp", pzpid:payload.pzpid}, responseHandler (payload.status, res));
            break;
        case 'addPzp':
            pzhTLS.send (user, {type:"addPzp"}, responseHandler (payload.status, res));
            break;
        case 'login':
            pzhTLS.send (user, {type:"hasLoggedIn"}, responseHandler (payload.status, res));
            break;
        case 'logout':
            pzhTLS.send (user, {type:"hasLoggedOut"}, responseHandler (payload.status, res));
            break;
        case 'listAllServices':
            pzhTLS.send (user, {type:"listAllServices"}, responseHandler (payload.status, res));
            break;
        case 'listUnregServices':
            pzhTLS.send (user, {type:"listUnregServices", at:payload.at}, responseHandler (payload.status, res));
            break;
        case 'registerService':
            pzhTLS.send (user, {type:"registerService", at:payload.at, name:payload.name}, responseHandler (payload.status, res));
            break;
        case 'unregisterService':
            pzhTLS.send (user, {type:"unregisterService", at:payload.at, svId:payload.svId, svAPI:payload.svAPI }, responseHandler (payload.status, res));
            break;
        case 'authCode':
            pzhTLS.send (user, {type:"authCode"}, pzpResponder (payload.user, payload.port, payload.address, res));
            break;
        case 'getAllPzh':
            pzhTLS.send (user, {type:"getAllPzh"}, responseHandler (payload.status, res));
            break;
        case 'approveUser':
            pzhTLS.send (user, {type:"approveUser"}, responseHandler (payload.status, res));
            break;
        case 'csrAuthCodeByPzp':
            pzhTLS.send (user, {type:"csrAuthCodeByPzp", from: payload.from, csr: payload.csr, code: payload.code}, pzpEnrollment(res));
            break;
    }
}



