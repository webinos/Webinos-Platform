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
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
* Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
* Authors: Habib Virji
******************************************************************************/

(function() {
  "use strict";
  webinos.session = {};
  var sessionId = null, pzpId, pzhId, otherPzp = [], otherPzh = [], isConnected = false, enrolled = false, mode, port = 8080;
  var serviceLocation;
  var listenerMap = {};
  var channel;
  webinos.session.setChannel = function(_channel) {
    channel = _channel;
  };
  webinos.session.setPzpPort = function (port_) {
    port = port_;
  };
  webinos.session.getPzpPort = function () {
    return port;
 };
  webinos.session.message_send_messaging = function(msg, to) {
    msg.resp_to = webinos.session.getSessionId();
    channel.send(JSON.stringify(msg));
  };
  webinos.session.message_send = function(rpc, to) {
    var type, id = Math.floor(Math.random() * 101);
    if(rpc.type !== undefined && rpc.type === "prop") {
      type = "prop";
      rpc = rpc.payload;
    }else {
      type = "JSONRPC";
    }
    if (typeof rpc.method !== undefined && rpc.method === "ServiceDiscovery.findServices") {
        id = rpc.params[2];
    }
    if (typeof to === "undefined") {
        to = pzpId;
    }
      var message = {"type":type,
          "id":id,
          "from":webinos.session.getSessionId(),
          "to":to,
          "resp_to":webinos.session.getSessionId(),
          "payload":rpc};
      if(rpc.register !== "undefined" && rpc.register === true) {
          console.log(rpc);
          channel.send(JSON.stringify(rpc));
      }else {
          console.log("creating callback");
          console.log("WebSocket Client: Message Sent");
          console.log(message);
          channel.send(JSON.stringify(message));
    }
  };
    webinos.session.setServiceLocation = function (loc) {
        serviceLocation = loc;
    };
    webinos.session.getServiceLocation = function () {
        if (typeof serviceLocation !== "undefined") {
            return serviceLocation;
        } else {
            return pzpId;
        }
    };
    webinos.session.getSessionId = function () {
        return sessionId;
    };
    webinos.session.getPZPId = function () {
        return pzpId;
    };
    webinos.session.getPZHId = function () {
        return ( pzhId || "");
    };
    webinos.session.getOtherPZP = function () {
        return (otherPzp || []);
    };
    webinos.session.getOtherPZH = function () {
        return (otherPzh || []);
    };
    webinos.session.addListener = function (statusType, listener) {
        var listeners = listenerMap[statusType] || [];
        listeners.push (listener);
        listenerMap[statusType] = listeners;
        return listeners.length;
    };
    webinos.session.removeListener = function (statusType, id) {
        var listeners = listenerMap[statusType] || [];
        try {
            listeners[id - 1] = undefined;
        } catch (e) {
        }
    };
    webinos.session.isConnected = function () {
        return isConnected;
    };

  webinos.session.getSessionId = function() {
    return sessionId;
  };
  webinos.session.getPZPId = function() {
    return pzpId;
  };
  webinos.session.getPZHId = function() {
    return ( pzhId || "");
  };
  webinos.session.getOtherPZP = function() {
    return (otherPzp || []);
  };
  webinos.session.getOtherPZH = function() {
    return (otherPzh || []);
  };
  webinos.session.getPzpModeState = function (mode_name) {
    if (enrolled && mode[mode_name] === "connected") {
      return true;
    } else {
      return false;
    }
  };
  webinos.session.addListener = function(statusType, listener) {
    var listeners = listenerMap[statusType] || [];
    listeners.push(listener);
    listenerMap[statusType] = listeners;
    return listeners.length;
  };
  webinos.session.removeListener = function(statusType, id) {
    var listeners = listenerMap[statusType] || [];
    try {
      listeners[id - 1] = undefined;
    }catch(e) {
    }
  };
  webinos.session.isConnected = function(){
    return isConnected;
  };
  function callListenerForMsg(data) {
    var listeners = listenerMap[data.payload.status] || [];
    for(var i = 0;i < listeners.length;i++) {
      listeners[i](data) ;
    }
  }
  function setWebinosMessaging() {
    webinos.messageHandler.setOwnSessionId(sessionId);
    var msg = webinos.messageHandler.createRegisterMessage(sessionId, pzpId);
    webinos.session.message_send(msg, pzpId);
  }
  function updateConnected(message){
    otherPzh = message.connectedPzh;
    otherPzp = message.connectedPzp;
    isConnected = !!(otherPzh.indexOf(pzhId) !== -1);
    enrolled = message.enrolled;
    mode = message.mode;
  }
  function setWebinosSession(data){
    sessionId = data.to;
    pzpId = data.from;
    if(data.payload.message) {
      pzhId = data.payload.message.pzhId;
      updateConnected(data.payload.message);
    }
    setWebinosMessaging();
  }
  webinos.session.handleMsg = function(data) {
    if(data.type === "prop") {
      switch(data.payload.status) {
        case "registeredBrowser":
          setWebinosSession(data);
          callListenerForMsg(data);
          break;
        case "pzpFindPeers":
          callListenerForMsg(data);
          break;
        case "pubCert":
          callListenerForMsg(data);
          break;
        case "showHashQR":
          callListenerForMsg(data);
          break;
        case "addPzpQR":
          callListenerForMsg(data);
          break;	
        case "requestRemoteScanner":
            callListenerForMsg(data);
          break;	
        case "checkHashQR":
          callListenerForMsg(data);
          break;	  
        case "sendCert":
          callListenerForMsg(data);
          break;
        case "connectPeers":
          callListenerForMsg(data);
          break;
        case "intraPeer":
          callListenerForMsg(data);
          break;   
        case "update":
          setWebinosSession(data);
          callListenerForMsg(data);
          break;
        case "infoLog":
          callListenerForMsg(data);
          break;
        case "errorLog":
          callListenerForMsg(data);
          break;
        case "error":
          callListenerForMsg(data);
          break;
        case "friendlyName":
          callListenerForMsg(data);
          break;
        case "webinosVersion":
          callListenerForMsg(data);
          break;
        case "pzhDisconnected":
          isConnected = false;
          callListenerForMsg(data);
          break;
      }
    }
  }
}());
