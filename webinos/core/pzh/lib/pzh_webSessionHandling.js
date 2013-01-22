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
 * Author: Habib Virji (habib.virji@gmail.com)
 *******************************************************************************/
var pzhWI = function (pzhs, hostname, port, addPzh, refreshPzh, getAllPzh) {
    "use strict";
    var dependency = require("find-dependencies")(__dirname);
    var util = dependency.global.require(dependency.global.util.location);
    var logger = util.webinosLogging(__filename) || logger;
    var lock = true;
    var messageType = {
        "getUserDetails":getUserDetails,
        "getZoneStatus":getZoneStatus,
        "getCrashLog":getCrashLog,
        "getInfoLog":getInfoLog,
        "getPzps":getPZPs,
        "revokePzp":revokePzp,
        "listAllServices":listAllServices,
        "listUnregServices":listUnRegisterServices,
        "registerService":registerService,
        "unregisterService":unregisterService,
        "getCertificates":getCertificates,
        "storeExternalCert":storeExternalCert,
        "requestAddFriend":requestAddFriend,
        "getExpectedExternal":getExpectedExternal,
        "approveFriend":approveFriend,
        "rejectFriend":rejectFriend,
        "authCode":authCode,
        "csrAuthCodeByPzp":csrAuthCodeByPzp,
        "getAllPzh":getAllPzhList,
        "approveUser":approveUser
    };

    function getLock() {
        return lock;
    }

    function setLock() {
        lock = false;
    }

    function releaseLock() {
        lock = true;
    }

    function sendMsg(conn, user, msg) {
        var jsonString = JSON.stringify({user:user, payload:msg});
        var buf = util.webinosMsgProcessing.jsonStr2Buffer(jsonString);
        conn.write(buf);
    }

    function getConnectedPzp(_instance) {
        var i, pzps = [], list = Object.keys(_instance.config.trustedList.pzp);
        for (i = 0; i < list.length; i = i + 1) {
            if (_instance.pzh_state.connectedPzp.hasOwnProperty(list[i])) {
                pzps.push({id:list[i].split("/")[1], url:list[i], isConnected:true});
            } else {
                pzps.push({id:list[i].split("/")[1], url:list[i], isConnected:false});
            }
        }
        return pzps;
    }

    function getConnectedPzh(_instance) {
        var pzhs = [], i, list = Object.keys(_instance.config.trustedList.pzh);
        for (i = 0; i < list.length; i = i + 1) {
            if (_instance.pzh_state.connectedPzh.hasOwnProperty(list[i])) {
                pzhs.push({id:list[i].split("_")[1], url:list[i], isConnected:true});
            } else {
                pzhs.push({id:list[i].split("_")[1], url:list[i], isConnected:false});
            }
        }
        pzhs.push({id:_instance.config.userData.email[0].value + " (Your Pzh)", url:_instance.config.metaData.serverName, isConnected:true});
        return pzhs;
    }

    function getRevokedCert(_instance) {
        var revokedCert = [], myKey;
        for (myKey in _instance.config.cert.internal.revokedCert) {
            if (_instance.config.cert.internal.revokedCert.hasOwnProperty(myKey)) {
                revokedCert.push({id:myKey, url:myKey, isConnected:false});
            }
        }
        return revokedCert;
    }

    function getAllPzhList(conn, obj, userObj) {
        sendMsg(conn, obj.user, { type:"getAllPzh", message:getAllPzh(userObj.pzh_state.sessionId, userObj) });
    }

    function getUserDetails(conn, obj, userObj) {
        sendMsg(conn, obj.user, { type:"getUserDetails", message:userObj.config.userData });
    }

    function getZoneStatus(conn, obj, userObj) {
        var result = {pzps:[], pzhs:[]};
        result.pzps = getConnectedPzp(userObj);
        result.pzhs = getConnectedPzh(userObj);
        sendMsg(conn, obj.user, { type:"getZoneStatus", message:result });
    }

    function getCrashLog(conn, obj, userObj) {
        logger.fetchLog("error", "Pzh", userObj.config.metaData.friendlyName, function (data) {
            sendMsg(conn, obj.user, { type:"getCrashLog", message:data });
        });
    }

    function getInfoLog(conn, obj, userObj) {
        logger.fetchLog("info", "Pzh", userObj.config.metaData.friendlyName, function (data) {
            sendMsg(conn, obj.user, { type:"getInfoLog", message:data });
        });
    }

    function getPZPs(conn, obj, userObj) {
        var result = {signedCert:[], revokedCert:[]}, myKey;
        result.signedCert = getConnectedPzp(userObj);
        result.revokedCert = getRevokedCert(userObj);
        sendMsg(conn, obj.user, { type:"getPzps", message:result });
    }

    function revokePzp(conn, obj, userObj) {
        userObj.revoke.revokeCert(obj.message.pzpid, refreshPzh, function (result) {
            sendMsg(conn, obj.user, { type:"revokePzp", message:result });
        });
    }

    function listAllServices(conn, obj, userObj) {
        var result = { pzEntityList:[] }, connectedPzp = getConnectedPzp(userObj), key;
        result.pzEntityList.push({pzId:userObj.pzh_state.sessionId});
        for (key = 0; key < connectedPzp.length; key = key + 1) {
            result.pzEntityList.push({pzId:connectedPzp[key].url});
        }
        result.services = userObj.pzh_otherManager.discovery.getAllServices();
        sendMsg(conn, obj.user, { type:"listAllServices", message:result });
    }

    function listUnRegisterServices(conn, obj, userObj) {
        function runCallback(pzEntityId, modules) {
            var result = {
                "pzEntityId":pzEntityId,
                "modules":modules
            };
            sendMsg(conn, obj.user, { type:"listUnRegisterServices", message:result });
        }

        if (userObj.pzh_state.sessionId !== obj.message.at) {
            var id = userObj.pzh_otherManager.addMsgListener(function (modules) {
                runCallback(obj.message.at, modules.services);
            });
            var msg = {"type":"prop", "from":userObj.pzh_state.sessionId, "to":obj.message.at,
                "payload":{"status":"listUnregServices", "message":{listenerId:id}}};
            userObj.sendMessage(msg, obj.message.at);
        } else {
            runCallback(userObj.pzh_state.sessionId, userObj.pzh_otherManager.getInitModules());
        }
    }

    function registerService(conn, obj, userObj) {
        if (userObj.pzh_state.sessionId !== obj.message.at) {
            var msg = {"type":"prop", "from":userObj.pzh_state.sessionId, "to":obj.message.at,
                "payload":{"status":"registerService", "message":{name:obj.message.name, params:{}}}};
            userObj.sendMessage(msg, obj.message.at);
        } else {
            util.webinosService.loadServiceModule(
                {"name":obj.message.name, "params":{}},
                userObj.pzh_otherManager.registry,
                userObj.pzh_otherManager.rpcHandler);
        }
        sendMsg(conn, obj.user, { type:"registerServices", message:true });
    }

    function unregisterService(conn, obj, userObj) {
        if (userObj.pzh_state.sessionId !== obj.message.at) {
            var msg = {"type":"prop", "from":userObj.pzh_state.sessionId, "to":obj.message.at,
                "payload":{"status":"unregisterService", "message":{svId:obj.message.svId, svAPI:obj.message.svAPI}}};
            userObj.sendMessage(msg, obj.message.at);
        } else {
            userObj.pzh_otherManager.registry.unregisterObject({id:obj.message.svId, api:obj.message.svAPI});
        }
        sendMsg(conn, obj.user, { type:"unregisterService", message:true });
    }

    // First step in connect friend
    // The PZH we are trying to connect calls this to sends its certificate to connecting PZH
    function getCertificates(conn, obj, userObj) {
        var result = {
            "provider":"provider-cert-data",
            "server":userObj.config.cert.internal.master.cert,
            "crl":userObj.config.crl,
            "serverPort":userObj.config.userPref.ports.provider
        };
        sendMsg(conn, obj.user, { type:"getCertificates", message:result });
    }

    // Second step
    // Connecting PZH stores certificates retrieved from another PZH
    function storeExternalCert(conn, obj, userObj) {
        logger.log(obj.user.displayName + " is now expecting external connection from " + obj.message.externalEmail);
        var url = require("url").parse("https://" + obj.message.externalPzh);
        var name = url.hostname + "_" + obj.message.externalEmail;
        if (url.port && parseInt(url.port) !== 443) {
            name = url.hostname + ":" + url.port + "_" + obj.message.externalEmail;
        }

        if (userObj.config.cert.external.hasOwnProperty(name) && userObj.config.trustedList.pzh.hasOwnProperty(name)) {
            sendMsg(conn, obj.user, { type:"storeExternalCert", message:false }); // PZH ALREADY ENROLLED
        } else {
            if (!userObj.config.cert.external.hasOwnProperty(name)) {
                userObj.config.cert.external[name] = {
                    url:"https://" + obj.message.externalPzh + "/main/" + obj.message.externalEmail + "/",
                    host:url.hostname,
                    port:url.port ? url.port : 443,
                    externalCerts:obj.message.externalCerts.server,
                    externalCrl:obj.message.externalCerts.crl,
                    serverPort:obj.message.externalCerts.serverPort
                };
                userObj.config.storeCertificate(userObj.config.cert.external, "external");
                userObj.setConnParam(function (status, certificateParam) {// refresh your own certs
                    if (status) {
                        var id = hostname + "_" + userObj.config.userData.email[0].value;
                        if (port !== 443) {
                            id = hostname + ":" + port + "_" + userObj.config.userData.email[0].value;
                        }
                        refreshPzh(id, certificateParam);
                    }
                });
            }
            if (!userObj.config.trustedList.pzh.hasOwnProperty(name)) {
                userObj.config.trustedList.pzh[name] = {};
                userObj.config.storeTrustedList(userObj.config.trustedList);
            }
            sendMsg(conn, obj.user, { type:"storeExternalCert", message:true });
        }
        // After this step OpenId authentication is triggered
    }

    // Third step
    // The PZH we are trying to connect calls this presumably this should return something unique
    function requestAddFriend(conn, obj, userObj) {
        logger.log("PZH TLS Server is now aware that the user " +
            obj.message.externalUser.email + " with PZH details : " + obj.message.externalPzh.externalPZHUrl +
            " has been authenticated and would like to be added to the list of trusted users to " +
            obj.user + "'s zone");

        var url = require("url").parse(obj.message.externalPzh.externalPZHUrl);
        userObj.config.untrustedCert[obj.message.externalUser.email] = {
            host:url.hostname,
            port:url.port ? url.port : 443,
            url:obj.message.externalPzh.externalPZHUrl,
            externalCerts:obj.message.externalPzh.pzhCerts.server,
            externalCrl:obj.message.externalPzh.pzhCerts.crl,
            serverPort:obj.message.externalPzh.pzhCerts.serverPort};
        userObj.config.storeUntrustedCert(userObj.config.untrustedCert);
        sendMsg(conn, obj.user, { type:"requestAddFriend", message:true });
    }

    // Fourth Step
    // Connecting Pzh calls this to
    function approveUser(conn, obj, userObj) {
        function userList() {
            var list = [];
            for (var item in userObj.config.untrustedCert) {
                if (userObj.config.untrustedCert.hasOwnProperty(item)) {
                    list.push({name:item, url:userObj.config.untrustedCert[item].url});
                }
            }
            return list;
        }

        sendMsg(conn, obj.user, { type:"approveUser", message:userList() });
    }

    // Fifth
    // The PZH Connecting calls this to get approval from other PZH
    function getExpectedExternal(conn, obj, userObj) {
        logger.log("Is " + obj.user.emails[0].value + " expecting to be asked to approve access to " +
            obj.message.externalEmail + "? ... Yes");
        if (userObj.config.untrustedCert.hasOwnProperty(obj.message.externalEmail)) {
            sendMsg(conn, obj.user, { type:"getExpectedExternal", message:true });
        } else {
            sendMsg(conn, obj.user, { type:"getExpectedExternal", message:false });
        }
    }

    // Sixth
    function approveFriend(conn, obj, userObj) {
        if (userObj.config.untrustedCert.hasOwnProperty(obj.message.externalEmail)) {
            logger.log("Approving friend request for " + obj.message.externalEmail + " by " + obj.user.emails[0].value);
            // Store Certificates
            var details = userObj.config.untrustedCert[obj.message.externalEmail], name = details.host + "_" + obj.message.externalEmail;
            if (details.port && parseInt(details.port) !== 443) {
                name = details.host + ":" + details.port + "_" + obj.message.externalEmail;
            }
            if (!userObj.config.cert.external.hasOwnProperty(name)) {
                userObj.config.cert.external[name] = details;
                userObj.config.storeCertificate(userObj.config.cert.external, "external");
                userObj.setConnParam(function (status, certificateParam) {
                    if (status) {
                        var id = hostname + "_" + userObj.config.userData.email[0].value;
                        if (port !== 443) {
                            id = hostname + ":" + port + "_" + userObj.config.userData.email[0].value;
                        }
                        refreshPzh(id, certificateParam);
                        userObj.pzh_pzh.connectOtherPZH(name, certificateParam);
                    }
                });
            }
            if (!userObj.config.trustedList.pzh.hasOwnProperty(name)) {
                userObj.config.trustedList.pzh[name] = {};
                userObj.config.storeTrustedList(userObj.config.trustedList);
            }
            delete userObj.config.untrustedCert[obj.message.externalEmail];
            userObj.config.storeUntrustedCert(userObj.config.untrustedCert);
        }
    }

    // Sixth
    function rejectFriend(conn, obj, userObj) {
        if (userObj.config.untrustedCert.hasOwnProperty(obj.message.externalUser.email)) {
            logger.log("Rejecting friend request by " + obj.message.externalUser.email + " for " + obj.user);
            delete untrustedCert[obj.message.externalUser.email];
        }
    }

    function authCode(conn, obj, userObj) {
        var qrCode = require("./pzh_qrcode.js");
        qrCode.addPzpQRAgain(userObj, function (result) {
            sendMsg(conn, obj.user, { type:"authCode", message:result});
        });
    }

    function csrAuthCodeByPzp(conn, obj, userObj) {
        userObj.enroll.addNewPZPCert(obj, function (status, payload) {
            if (status) {
                sendMsg(conn, obj.user, { type:"csrAuthCodeByPzp", message:payload });
            }
        });
    }

    function createPzh(obj, userId, callback) {
        try {
            var pzh_session = require("./pzh_tlsSessionHandling.js");
            var pzhId = hostname + "_" + userId;
            if (port !== 443) {
                pzhId = hostname + ":" + port + "_" + userId;
            }
            logger.log("adding new zone hub - " + pzhId);
            pzhs[pzhId] = new pzh_session();
            pzhs[pzhId].addLoadPzh(userId, pzhId, obj.user, function (status, options, uri) {
                if (status) {
                    addPzh(uri, options);
                    releaseLock();
                    return callback(true, pzhId);
                } else {
                    return callback(false, "failed adding pzh");
                }
            });

        } catch (err) {
            logger.log(err);
        }
    }

    function findUserFromEmail(obj, callback) {
        var email = obj.user.emails || obj.user;
        var bufferObj = {};
        for (var p in pzhs) {
            if (pzhs.hasOwnProperty(p)) {
                var i, j;
                for (i = 0; i < pzhs[p].config.userData.email.length; i = i + 1) {
                    if (typeof email === "object") {
                        for (j = 0; j < email.length; j = j + 1) {
                            if (pzhs[p].config.userData.email[i].value === email[j].value) {
                                return callback(pzhs[p]);
                            }
                        }
                    } else {
                        if (pzhs[p].config.userData.email[i].value === email) {
                            return callback(pzhs[p]);
                        }
                    }
                }
            }
        }
        if (getLock()) {
            setLock();
            if (typeof email === "object") email = (email.email || email[0].value);
            createPzh(obj, email, function (status, id) {
                if (status) {
                    logger.log("created pzh - " + id);
                    callback(pzhs[id]);
                    for (var obj in bufferObj) {
                        findUserFromEmail(obj, bufferObj[obj]);
                        delete bufferObj[obj];
                    }
                    return;
                } else {
                    return callback(null);
                }
            });
        } else {
            bufferObj[obj] = callback;
        }
    }

    function validateMessage(obj) {
        //quick check - TODO: integrate with proper schema checking.
        var valid = obj.hasOwnProperty("user") && obj.hasOwnProperty("message") && obj.message !== undefined && obj.message !== null;
        if (!valid) {
            logger.log("No 'user' or 'message' field in message from web interface");
            return false;
        }
        valid = obj.message.hasOwnProperty("type") && obj.message.type !== undefined && obj.message.type !== null &&
            ( messageType.hasOwnProperty(obj.message.type));
        if (!valid) {
            logger.log("No valid type field in message: " + obj.message.type);
            return false;
        }

        return true;
    }

    function processMsg(conn, obj) {
        if (validateMessage(obj)) {
            if (obj.message.type !== "checkPzh") {
                findUserFromEmail(obj, function (userObj) {
                    if (userObj) {
                        messageType[obj.message.type].apply(this, [conn, obj, userObj]);
                    } else {
                        logger.error("error validating user");
                    }
                });
            } else {
                messageType[obj.message.type].apply(this, [conn, obj]);
            }
        } else {
            sendMsg(conn, obj.user, {type:"error", "message":"not valid msg"});
        }
    }

    this.handleData = function (conn, data) {
        logger.log("handling Web Interface data");
        try {
            conn.pause();
            util.webinosMsgProcessing.readJson(this, data, function (obj) {
                processMsg(conn, obj);
            });
        } catch (err) {
            logger.error("exception in processing received message " + err);
        } finally {
            conn.resume();
        }
    };
};
module.exports = pzhWI
