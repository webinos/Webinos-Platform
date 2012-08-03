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
******************************************************************************/
(function() {
 webinos.session = {};
  var sessionid = null;
  var pzpId, pzhId;
  var serviceLocation;
  var listenerMap = {};
  var channel;
  webinos.session.setChannel = function(channel1) {
    channel = channel1
  };
  webinos.session.message_send_messaging = function(msg, to) {
    msg.resp_to = webinos.session.getSessionId();
    channel.send(JSON.stringify(msg))
  };
  webinos.session.message_send = function(rpc, to) {
    var type, id = Math.floor(Math.random() * 101);
    if(rpc.type !== undefined && rpc.type === "prop") {
      type = "prop";
      rpc = rpc.payload
    }else {
      type = "JSONRPC"
    }
    if(typeof rpc.method !== undefined && rpc.method === "ServiceDiscovery.findServices") {
      id = rpc.params[2]
    }
    if(typeof to === "undefined") {
      to = pzpId
    }
    var message = {"type":type, "id":id, "from":webinos.session.getSessionId(), "to":to, "resp_to":webinos.session.getSessionId(), "payload":rpc};
    if(rpc.register !== "undefined" && rpc.register === true) {
      console.log(rpc);
      channel.send(JSON.stringify(rpc))
    }else {
      console.log("creating callback");
      console.log("WebSocket Client: Message Sent");
      console.log(message);
      channel.send(JSON.stringify(message))
    }
  };
  webinos.session.setServiceLocation = function(loc) {
    serviceLocation = loc
  };
  webinos.session.getServiceLocation = function() {
    if(typeof serviceLocation !== "undefined") {
      return serviceLocation
    }else {
      return pzpId
    }
  };
  webinos.session.getSessionId = function() {
    return sessionid
  };
  webinos.session.getPZPId = function() {
    return pzpId
  };
  webinos.session.getPZHId = function() {
    return pzhId
  };
  webinos.session.getOtherPZP = function() {
    return otherpzp
  };
  webinos.session.addListener = function(statusType, listener) {
    var listeners = listenerMap[statusType] || [];
    listeners.push(listener);
    listenerMap[statusType] = listeners;
    return listeners.length
  };
  webinos.session.removeListener = function(statusType, id) {
    var listeners = listenerMap[statusType] || [];
    try {
      listeners[id - 1] = undefined
    }catch(e) {
    }
  };
  function callListenerForMsg(data) {
    var listeners = listenerMap[data.payload.status] || [];
    for(var i = 0;i < listeners.length;i++) {
      listeners[i](data)
    }
  }
  webinos.session.handleMsg = function(data) {
    switch(data.payload.status) {
      case "registeredBrowser":
        sessionid = data.to;
        pzpId = data.from;
        if(typeof data.payload.message !== "undefined" && data.from !== "virgin_pzp") {
          pzhId = data.payload.message.pzhId
        }
        webinos.messageHandler.setGetOwnId(sessionid);
        var msg = webinos.messageHandler.registerSender(sessionid, pzpId);
        webinos.session.message_send(msg, pzpId);
        callListenerForMsg(data);
        break;
      case "update":
        if(data.type === "prop") {
          callListenerForMsg(data)
        }
        break;
      case "info":
      ;
      case "listPzh":
      ;
      case "listAllPzps":
      ;
      case "crashLog":
      ;
      case "addPzpQR":
        callListenerForMsg(data);
        break;
      case "login":
        callListenerForMsg(data);
        break;
      case "authenticate-google":
        callListenerForMsg(data);
        break;
      case "authenticate-yahoo":
        callListenerForMsg(data);
        break;
      case "auth-status":
        callListenerForMsg(data);
        break;
      case "error":
        callListenerForMsg(data);
        break
    }
  }
}());
