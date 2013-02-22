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
var webinos = require("find-dependencies")(__dirname),
    logger = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || logger,
    pzhTLS = require('./realpzhtls.js');

var PzhAdaptor = exports;

function getUserFromEmail(userEmail, cb) {
    cb(userEmail, false);
}

function responseHandler(res) {
    return {
        err:function (err) {
            logger.log(err);
            res.status(500);
            res.json(err);
        },
        success:function (val) {
            if (typeof res === "function") {
                res(val);
            } else {
                res.json(val);
            }
        }
    }
}

function pzpResponder(user, port, address, pzpPort, res) {
    return {
        success:function (authCode) {
            res.render("enroll-pzp", {address:address, port:port, authCode:authCode.message.payload.code, user:user, pzpPort:pzpPort});
        }
    }
}

PzhAdaptor.getZoneStatus = function (user, res) {
    pzhTLS.send(user, {type:"getZoneStatus"}, responseHandler(res));
};

PzhAdaptor.approveFriend = function (user, externalEmail, res) {
    pzhTLS.send(user, {type:"approveFriend", externalEmail:externalEmail}, responseHandler(res));
};

PzhAdaptor.rejectFriend = function (user, externalEmail, res) {
    pzhTLS.send(user, {type:"rejectFriend", externalEmail:externalEmail}, responseHandler(res));
};

PzhAdaptor.getRequestingExternalUser = function (user, externalEmail, cb) {
    pzhTLS.send(user, {type:"getExpectedExternal", externalEmail:externalEmail}, responseHandler(cb));
};

PzhAdaptor.storeExternalUserCert = function (user, externalEmail, externalPzh, externalCerts, res) {
    pzhTLS.send(user, {type:"storeExternalCert", externalEmail:externalEmail, externalPzh:externalPzh,
        externalCerts:externalCerts}, responseHandler(res));
};

PzhAdaptor.requestAddLocalFriend = function(user, externalEmail, res) {
    pzhTLS.send(user, {type:"requestAddLocalFriend", externalEmail:externalEmail}, responseHandler(res));
};

//unauthenticated input
PzhAdaptor.requestAddFriend = function (internaluser, externaluser, externalPzhDetails, res) {
    getUserFromEmail(internaluser, function (user, err) {
        pzhTLS.send(user, {type:"requestAddFriend", externalUser:externaluser, externalPzh:externalPzhDetails}, responseHandler(res));
    });
};

PzhAdaptor.fromWebUnauth = function (userEmail, body, res) {
    // we've received a request from the web interface over XHR.
    // translate and send to the PZH TLS server

    //it's not necessarily from a trusted or authenticated user, it's a public
    //request for something.  E.g., for our certificates.
    //first, check that the user is meaningful

    getUserFromEmail(userEmail, function (result, err) {
        if (err) {
            res.writeHead(200);
            res.end('Request failed: ' + err);
            return;
        } else {
            switch (body.type) {
                case "getCertificates":
                    pzhTLS.send(result, {type:"getCertificates"}, responseHandler(res));
                    break;
                default:
                    res.writeHead(200);
                    res.end('Request failed: ' + err);
            }
        }
    });
};

PzhAdaptor.fromWeb = function (user, body, res) {
    // we've received a request from the web interface over XHR.
    // translate and send to the PZH TLS server
    if (typeof(body.payload) === 'undefined') {
        manageStatus(body.cmd, user, res);
    } else {
        manageStatus(body.payload, user, res);
    }
};

function manageStatus(payload, user, res) {
    switch (payload.status) {
        case 'getZoneStatus':
            pzhTLS.send(user, {type:"getZoneStatus"}, responseHandler(res));
            break;
        case 'getUserDetails':
            pzhTLS.send(user, {type:"getUserDetails"}, responseHandler(res));
            break;
        case 'getCrashLog':
            pzhTLS.send(user, {type:"getCrashLog"}, responseHandler(res));
            break;
        case 'getInfoLog':
            pzhTLS.send(user, {type:"getInfoLog"}, responseHandler(res));
            break;
        case 'getPzps':
            pzhTLS.send(user, {type:"getPzps"}, responseHandler(res));
            break;
        case 'revokePzp':
            pzhTLS.send(user, {type:"revokePzp", pzpid:payload.pzpid}, responseHandler(res));
            break;
        case 'login':
            pzhTLS.send(user, {type:"login"}, responseHandler(res));
            break;
        case 'logout':
            pzhTLS.send(user, {type:"logout"}, responseHandler(res));
            break;
        case 'listAllServices':
            pzhTLS.send(user, {type:"listAllServices"}, responseHandler(res));
            break;
        case 'listUnregServices':
            pzhTLS.send(user, {type:"listUnregServices", at:payload.at}, responseHandler(res));
            break;
        case 'registerService':
            pzhTLS.send(user, {type:"registerService", at:payload.at, name:payload.name}, responseHandler(res));
            break;
        case 'unregisterService':
            pzhTLS.send(user, {type:"unregisterService", at:payload.at, svId:payload.svId, svAPI:payload.svAPI }, responseHandler(res));
            break;
        case 'getAllPzh':
            pzhTLS.send(user, {type:"getAllPzh"}, responseHandler(res));
            break;
        case 'approveUser':
            pzhTLS.send(user, {type:"approveUser"}, responseHandler(res));
            break;
        case 'csrAuthCodeByPzp':
            pzhTLS.send(user, {type:"csrAuthCodeByPzp", from:payload.from, csr:payload.csr, code:payload.code}, responseHandler(res));
            break;
        case 'enrollPzpAuthCode':
            pzhTLS.send(user, {type:"authCode"}, pzpResponder(payload.user, payload.port, payload.address, payload.pzpPort, res));
            break;
        default:
            responseHandler(res).err({"error":"not valid message type"});
            break;

    }
}



