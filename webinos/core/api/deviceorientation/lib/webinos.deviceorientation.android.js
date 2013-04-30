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
 * Copyright 2012 Present Technologies
 ******************************************************************************/
(function () {

var remove = function(arr, val) {
    var idx = arr.indexOf(val);
    if(idx != -1)
        arr.splice(idx, 1);
};

var rpcHandler = null;

// device info
var device = null;

var listeningToDeviceOrientation = false;
var listeningToDeviceMotion = false;

var objectRefs = [];

var orientation = require("bridge").load("org.webinos.impl.DeviceorientationImpl", this);

function addEventListener(params, successCB, errorCB, objectRef) {
    switch (params[0]) {
        case "devicemotion":
            if (typeof objectRefs["devicemotion"] === "undefined")
                objectRefs["devicemotion"] = [];
            objectRefs["devicemotion"].push(objectRef);
            if (objectRefs["devicemotion"].length === 1) {
                console.log("Adding device motion listener");
                orientation.watchMotion(motionCb);
                listeningToDeviceMotion = true;
            }
            break;
        case "deviceorientation":
            if (typeof objectRefs["deviceorientation"] === "undefined")
                objectRefs["deviceorientation"] = [];
            objectRefs["deviceorientation"].push(objectRef);
            if (objectRefs["deviceorientation"].length === 1) {
                console.log("Adding device orientation listener");
                orientation.watchOrientation(orientationCb);
                listeningToDeviceOrientation = true;
            }
            break;
        default:
            console.log("Option not available: " + params[0]);
            break;
    }
}

function motionCb(event) {
    var n = objectRefs["devicemotion"].length;
    for (var i = 0; i < n; i++) {
        console.log("Sending motion event to " + objectRefs["devicemotion"][i]);
        var rpc = rpcHandler.createRPC(objectRefs["devicemotion"][i], "onEvent", event);
        rpcHandler.executeRPC(rpc);
    }
}

function orientationCb(event) {
    var n = objectRefs["deviceorientation"].length;
    for (var i = 0; i < n; i++) {
        console.log("Sending orientation event to " + objectRefs["deviceorientation"][i]);
        var rpc = rpcHandler.createRPC(objectRefs["deviceorientation"][i], "onEvent", event);
        rpcHandler.executeRPC(rpc);
    }
}

function removeEventListener(params, successCB, errorCB, objectRef) {
    switch (params[1]) {
        case "devicemotion":
            if (listeningToDeviceMotion) {
				var idx = objectRefs["devicemotion"].length;
				while(idx-- > 0) {
					if(objectRefs["devicemotion"][idx].rpcId == params[0])
						objectRefs["devicemotion"].splice(idx, 1);
				}
                if (objectRefs["devicemotion"].length === 0) {
                    orientation.unwatchMotion();
                    listeningToDeviceMotion = false;
                }
            }
            break;
        case "deviceorientation":
            if (listeningToDeviceOrientation) {
				var idx = objectRefs["deviceorientation"].length;
				while(idx-- > 0) {
					if(objectRefs["deviceorientation"][idx].rpcId == params[0])
						objectRefs["deviceorientation"].splice(idx, 1);
				}
                if (objectRefs["deviceorientation"].length === 0) {
                    orientation.unwatchOrientation();
                    listeningToDeviceOrientation = false;
                }
            }
            break;
        default:
            console.log("Option not available: " + params[1]);
            break;
    }
}

function setRPCHandler(rpcHdlr) {
    rpcHandler = rpcHdlr;
}

function setRequired(obj) {
    device = obj;
}

exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.setRPCHandler = setRPCHandler;
exports.setRequired = setRequired;

exports.serviceDesc = {
    api:"http://webinos.org/api/deviceorientation",
    displayName:"Device Orientation",
    description:"Provides the physical orientation of the Android device."
};

})(module.exports);
