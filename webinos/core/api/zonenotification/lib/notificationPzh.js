/*******************************************************************************
 * Code contributed to the Webinos project.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	 http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2013 John Lyle, University of Oxford
 ******************************************************************************/
/* This is a helper module for the webinos internal notifications system.  The
 * module is designed to let internal webinos components issue and cancel
 * notifications to this PZP, which will then forward them on to any app that
 * cares using the zonenotification API.
 * 
 * TODO: This currently doesn't persist notifications.  If the PZH stops, we lose
 * all of our notifications.  This isn't a good thing.  Ideally, we want to 
 * register notifications as they arrive.
 */
var util = require('util');
var path = require('path');
var dependency = require("find-dependencies")(__dirname);
var webinosPath = dependency.global.require(dependency.global.util.location, "lib/webinosPath.js")
var pzhSession = dependency.global.require(dependency.global.pzp.location, "lib/pzp_sessionHandling.js");

var NotificationInputs = exports;

// apps[pzh] = [{ rpcid: ..., sendFn: ..., cancelFn: ... }];
var apps = {};

// notification[pzh] = { id : { cancelFns : [...], response : ... } };
var notifications = {};

NotificationInputs.addSubscriber = function (rpcid, send, cancel) {
    var pzh = rpcid.from.split("/")[0];
    console.log("Received subscription request from PZH " + pzh + " on RPC: " + JSON.stringify(rpcid) + ", with cancel function: " + util.inspect(cancel));
    if (!apps.hasOwnProperty(pzh)) {
        apps[pzh] = [];
    }
    apps[pzh].push({
        "rpcid": rpcid,
        "send": send,
        "cancel": cancel
    });
}

// The notifications app has sent a response from the end user
// This should alert the original notification creator.
NotificationInputs.addResponseFromUI = function (pzh, id, response, successcb, errorcb) {
    console.log("Received notification response for notification " + id);
    if (notifications.hasOwnProperty(pzh)) {
        if (notifications[pzh].hasOwnProperty(id)) {
            notifications[pzh][id].onResponse(response);
            return successcb();
        }
    }
    errorcb("No notification with the given ID found");
}

// returns an id.
NotificationInputs.sendFromInternal = function (pzh, msg, idcallback, resultcb) {
    var id = Math.floor(Math.random() * 100000000000);
    console.log("Notification requested for pzh " + pzh + ", id generated: " + id + ", notification: " + util.inspect(msg));
    if (!notifications.hasOwnProperty(pzh)) {
        notifications[pzh] = {};
    }
    notifications[pzh][id] = {
        cancelFns: [],
        onResponse: function (msg) {
            resultcb(id, msg);
        }
    }

    if (!apps.hasOwnProperty(pzh)) {
        apps[pzh] = [];
    }
    for (var a = 0; a < apps[pzh].length; a++) {
        //add to the record
        notifications[pzh][id].cancelFns.push(apps[pzh][a].cancel);
        //send the notification
        apps[pzh][a].send(id, msg);
    }

    idcallback(id);
}

NotificationInputs.cancelFromInternal = function (pzh, id, successcb, errorcb) {
    console.log("Cancellation requested, pzh: " + pzh + ", id: " + id);
    if (!notifications.hasOwnProperty(pzh)) {
        return errorcb("No pzh with this ID found");
    }
    if (notifications[pzh].hasOwnProperty(id)) {
        for (var c = 0; c < notifications[pzh][id].cancelFns.length; c++) {
            notifications[pzh][id].cancelFns[c](id);
        }
        delete notifications[pzh][id];
        successcb();
    } else {
        errorcb("No notification with this ID found");
    }
}
