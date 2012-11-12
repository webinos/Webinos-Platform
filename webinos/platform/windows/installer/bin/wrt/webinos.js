if(typeof webinos === "undefined"){
if(typeof webinos === "undefined") {
  webinos = {}
}
if(typeof webinos.util === "undefined") {
  webinos.util = {}
}
(function(exports) {
  exports.inherits = inherits;
  function inherits(c, p, proto) {
    proto = proto || {};
    var e = {};
    [c.prototype, proto].forEach(function(s) {
      Object.getOwnPropertyNames(s).forEach(function(k) {
        e[k] = Object.getOwnPropertyDescriptor(s, k)
      })
    });
    c.prototype = Object.create(p.prototype, e);
    c.parent = p
  }
  exports.CustomError = CustomError;
  inherits(CustomError, Error);
  function CustomError(name, message) {
    CustomError.parent.call(this, message || name);
    this.name = name
  }
  exports.EventTarget = EventTarget;
  function EventTarget() {
  }
  EventTarget.prototype.addEventListener = function(type, listener) {
    if(typeof this.events === "undefined") {
      this.events = {}
    }
    if(typeof this.events[type] === "undefined") {
      this.events[type] = []
    }
    this.events[type].push(listener)
  };
  EventTarget.prototype.removeEventListener = function(type, listener) {
    if(typeof this.events === "undefined" || typeof this.events[type] === "undefined") {
      return
    }
    var position = this.events[type].indexOf(listener);
    if(position >= 0) {
      this.events[type].splice(position, 1)
    }
  };
  EventTarget.prototype.removeAllListeners = function(type) {
    if(arguments.length === 0) {
      this.events = {}
    }else {
      if(typeof this.events !== "undefined" && typeof this.events[type] !== "undefined") {
        this.events[type] = []
      }
    }
  };
  EventTarget.prototype.dispatchEvent = function(event) {
    if(typeof this.events === "undefined" || typeof this.events[event.type] === "undefined") {
      return false
    }
    var listeners = this.events[event.type].slice();
    if(!listeners.length) {
      return false
    }
    for(var i = 0, length = listeners.length;i < length;i++) {
      listeners[i].call(this, event)
    }
    return true
  };
  exports.Event = Event;
  function Event(type) {
    this.type = type;
    this.timeStamp = Date.now()
  }
  exports.ProgressEvent = ProgressEvent;
  inherits(ProgressEvent, Event);
  function ProgressEvent(type, eventInitDict) {
    ProgressEvent.parent.call(this, type);
    eventInitDict = eventInitDict || {};
    this.lengthComputable = eventInitDict.lengthComputable || false;
    this.loaded = eventInitDict.loaded || 0;
    this.total = eventInitDict.total || 0
  }
  exports.callback = function(maybeCallback) {
    if(typeof maybeCallback !== "function") {
      return function() {
      }
    }
    return maybeCallback
  };
  exports.async = function(callback) {
    if(typeof callback !== "function") {
      return callback
    }
    return function() {
      var argsArray = arguments;
      window.setTimeout(function() {
        callback.apply(null, argsArray)
      }, 0)
    }
  };
  exports.ab2hex = function(buf) {
    var hex = "";
    var view = new Uint8Array(buf);
    for(var i = 0;i < view.length;i++) {
      var repr = view[i].toString(16);
      hex += (repr.length < 2 ? "0" : "") + repr
    }
    return hex
  };
  exports.hex2ab = function(hex) {
    var buf = new ArrayBuffer(hex.length / 2);
    var view = new Uint8Array(buf);
    for(var i = 0;i < view.length;i++) {
      view[i] = parseInt(hex.substr(i * 2, 2), 16)
    }
    return buf
  }
})(webinos.util);
(function() {
  var logger = console;
  if(typeof module !== "undefined") {
    var webinos_ = require("find-dependencies")(__dirname);
    logger = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename)
  }
  var Registry = function(parent) {
    this.parent = parent;
    this.objects = {}
  };
  var _getNextID = function(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1E7] + -1E3 + -4E3 + -8E3 + -1E11).replace(/[018]/g, _getNextID)
  };
  var _registerObject = function(callback) {
    if(!callback) {
      return
    }
    logger.log("Adding: " + callback.api);
    var receiverObjs = this.objects[callback.api];
    if(!receiverObjs) {
      receiverObjs = []
    }
    callback.id = _getNextID();
    var filteredRO = receiverObjs.filter(function(el, idx, array) {
      return el.id === callback.id
    });
    if(filteredRO.length > 0) {
      throw new Error("Cannot register, already got object with same id.");
    }
    receiverObjs.push(callback);
    this.objects[callback.api] = receiverObjs
  };
  Registry.prototype.registerObject = function(callback) {
    _registerObject.call(this, callback);
    if(this.parent && this.parent.registerServicesWithPzh) {
      this.parent.registerServicesWithPzh()
    }
  };
  Registry.prototype.registerCallbackObject = function(callback) {
    if(!callback) {
      return
    }
    logger.log("Adding: " + callback.api);
    var receiverObjs = this.objects[callback.api];
    if(!receiverObjs) {
      receiverObjs = []
    }
    receiverObjs.push(callback);
    this.objects[callback.api] = receiverObjs
  };
  Registry.prototype.unregisterObject = function(callback) {
    if(!callback) {
      return
    }
    logger.log("Removing: " + callback.api);
    var receiverObjs = this.objects[callback.api];
    if(!receiverObjs) {
      receiverObjs = []
    }
    var filteredRO = receiverObjs.filter(function(el, idx, array) {
      return el.id !== callback.id
    });
    if(filteredRO.length > 0) {
      this.objects[callback.api] = filteredRO
    }else {
      delete this.objects[callback.api]
    }
    if(this.parent && this.parent.registerServicesWithPzh) {
      this.parent.registerServicesWithPzh()
    }
  };
  var load = function(modules) {
    var webinos = require("find-dependencies")(__dirname);
    return modules.map(function(m) {
      return webinos.global.require(webinos.global.api[m.name].location).Service
    })
  };
  Registry.prototype.loadModule = function(module, rpcHandler) {
    var Service = load([module])[0];
    try {
      this.registerObject(new Service(rpcHandler, module.params))
    }catch(error) {
      logger.log("INFO: [Registry] " + error);
      logger.log("INFO: [Registry] " + "Could not load module " + module.name + " with message: " + error)
    }
  };
  Registry.prototype.loadModules = function(modules, rpcHandler) {
    if(!modules) {
      return
    }
    var services = load(modules);
    for(var i = 0;i < services.length;i++) {
      try {
        var Service = services[i];
        if(typeof Service === "function") {
          _registerObject.call(this, new Service(rpcHandler, modules[i].params))
        }
      }catch(error) {
        logger.error(error);
        logger.error("Could not load module " + modules[i].name + " with message: " + error)
      }
    }
  };
  Registry.prototype.getRegisteredObjectsMap = function() {
    return this.objects
  };
  Registry.prototype.getServiceWithTypeAndId = function(serviceTyp, serviceId) {
    var receiverObjs = this.objects[serviceTyp];
    if(!receiverObjs) {
      receiverObjs = []
    }
    var filteredRO = receiverObjs.filter(function(el, idx, array) {
      return el.id === serviceId
    });
    if(typeof filteredRO[0] === "undefined") {
      return receiverObjs[0]
    }
    return filteredRO[0]
  };
  if(typeof module !== "undefined") {
    exports.Registry = Registry;
    var crypto = require("crypto")
  }else {
    this.Registry = Registry
  }
})();
(function() {
  if(typeof webinos === "undefined") {
    webinos = {}
  }
  var logger = console;
  if(typeof module === "undefined") {
    var exports = {}
  }else {
    var exports = module.exports = {};
    var webinos_ = require("find-dependencies")(__dirname);
    logger = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename)
  }
  var idCount = 0;
  _RPCHandler = function(parent, registry) {
    this.parent = parent;
    this.registry = registry;
    this.sessionId = "";
    this.awaitingResponse = {};
    this.messageHandler = {write:function() {
      logger.log("could not execute RPC, messageHandler was not set.")
    }}
  };
  _RPCHandler.prototype.setMessageHandler = function(messageHandler) {
    this.messageHandler = messageHandler
  };
  var newJSONRPCObj = function(id) {
    return{jsonrpc:"2.0", id:id || getNextID()}
  };
  var getNextID = function(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1E7] + -1E3 + -4E3 + -8E3 + -1E11).replace(/[018]/g, getNextID)
  };
  var newPreRPCRequest = function(method, params) {
    var rpc = newJSONRPCObj();
    rpc.method = method;
    rpc.params = params || [];
    rpc.preliminary = true;
    return rpc
  };
  var toJSONRPC = function(preRPCRequest) {
    if(preRPCRequest.preliminary) {
      var rpcRequest = newJSONRPCObj(preRPCRequest.id);
      rpcRequest.method = preRPCRequest.method;
      rpcRequest.params = preRPCRequest.params;
      return rpcRequest
    }else {
      return preRPCRequest
    }
  };
  var newJSONRPCResponseResult = function(id, result) {
    var rpc = newJSONRPCObj(id);
    rpc.result = typeof result === "undefined" ? {} : result;
    return rpc
  };
  var newJSONRPCResponseError = function(id, error) {
    var rpc = newJSONRPCObj(id);
    rpc.error = {data:error, code:-31E3, message:"Method Invocation returned with error"};
    return rpc
  };
  var handleRequest = function(request, from, msgid) {
    var idx = request.method.lastIndexOf(".");
    var service = request.method.substring(0, idx);
    var method = request.method.substring(idx + 1);
    var serviceId = undefined;
    idx = service.indexOf("@");
    if(idx !== -1) {
      var serviceIdRest = service.substring(idx + 1);
      service = service.substring(0, idx);
      var idx2 = serviceIdRest.indexOf(".");
      if(idx2 !== -1) {
        serviceId = serviceIdRest.substring(0, idx2)
      }else {
        serviceId = serviceIdRest
      }
    }
    if(service.length === 0) {
      logger.log("Cannot handle request because of missing service in request");
      return
    }
    logger.log("Got request to invoke " + method + " on " + service + (serviceId ? "@" + serviceId : "") + " with params: " + request.params);
    var includingObject = this.registry.getServiceWithTypeAndId(service, serviceId);
    if(typeof includingObject === "undefined") {
      logger.log("No service found with id/type " + service);
      return
    }
    idx = request.method.lastIndexOf(".");
    var methodPathParts = request.method.substring(0, idx);
    methodPathParts = methodPathParts.split(".");
    for(var pIx = 0;pIx < methodPathParts.length;pIx++) {
      if(methodPathParts[pIx] && methodPathParts[pIx].indexOf("@") >= 0) {
        continue
      }
      if(methodPathParts[pIx] && includingObject[methodPathParts[pIx]]) {
        includingObject = includingObject[methodPathParts[pIx]]
      }
    }
    if(typeof includingObject === "object") {
      var id = request.id;
      var that = this;
      function successCallback(result) {
        if(typeof id === "undefined") {
          return
        }
        var rpc = newJSONRPCResponseResult(id, result);
        that.executeRPC(rpc, undefined, undefined, from, msgid)
      }
      function errorCallback(error) {
        if(typeof id === "undefined") {
          return
        }
        var rpc = newJSONRPCResponseError(id, error);
        that.executeRPC(rpc, undefined, undefined, from, msgid)
      }
      var fromObjectRef = {rpcId:request.id, from:from};
      includingObject[method](request.params, successCallback, errorCallback, fromObjectRef)
    }
  };
  var handleResponse = function(response) {
    if(typeof response.id === "undefined" || response.id == null) {
      return
    }
    logger.log("Received a response that is registered for " + response.id);
    if(typeof this.awaitingResponse[response.id] !== "undefined") {
      if(this.awaitingResponse[response.id] != null) {
        if(typeof this.awaitingResponse[response.id].onResult === "function" && typeof response.result !== "undefined") {
          this.awaitingResponse[response.id].onResult(response.result);
          logger.log("called SCB")
        }
        if(typeof this.awaitingResponse[response.id].onError === "function" && typeof response.error !== "undefined") {
          if(typeof response.error.data !== "undefined") {
            logger.log("Propagating error to application");
            this.awaitingResponse[response.id].onError(response.error.data)
          }else {
            this.awaitingResponse[response.id].onError()
          }
        }
        delete this.awaitingResponse[response.id]
      }
    }
  };
  _RPCHandler.prototype.handleMessage = function(jsonRPC, from, msgid) {
    logger.log("New packet from messaging");
    logger.log("Response to " + from);
    if(typeof jsonRPC.method !== "undefined" && jsonRPC.method != null) {
      handleRequest.call(this, jsonRPC, from, msgid)
    }else {
      handleResponse.call(this, jsonRPC, from, msgid)
    }
  };
  _RPCHandler.prototype.executeRPC = function(preRpc, callback, errorCB, from) {
    var rpc = toJSONRPC(preRpc);
    if(typeof callback === "function") {
      var cb = {};
      cb.onResult = callback;
      if(typeof errorCB === "function") {
        cb.onError = errorCB
      }
      if(typeof rpc.id !== "undefined") {
        this.awaitingResponse[rpc.id] = cb
      }
    }
    if(typeof preRpc.serviceAddress !== "undefined") {
      from = preRpc.serviceAddress
    }
    if(typeof module !== "undefined") {
      this.messageHandler.write(rpc, from)
    }else {
      webinos.session.message_send(rpc, from)
    }
  };
  _RPCHandler.prototype.createRPC = function(service, method, params) {
    if(typeof service === "undefined") {
      throw"Service is undefined";
    }
    if(typeof method === "undefined") {
      throw"Method is undefined";
    }
    var rpcMethod;
    if(service.api && service.id) {
      rpcMethod = service.api + "@" + service.id + "." + method
    }else {
      if(service.rpcId && service.from) {
        rpcMethod = service.rpcId + "." + method
      }else {
        rpcMethod = service + "." + method
      }
    }
    var preRPCRequest = newPreRPCRequest(rpcMethod, params);
    if(service.serviceAddress) {
      preRPCRequest.serviceAddress = service.serviceAddress
    }else {
      if(service.from) {
        preRPCRequest.serviceAddress = service.from
      }
    }
    return preRPCRequest
  };
  _RPCHandler.prototype.registerCallbackObject = function(callback) {
    if(!callback.id) {
      callback.id = getNextID()
    }
    callback.api = callback.id;
    this.registry.registerCallbackObject(callback)
  };
  _RPCHandler.prototype.unregisterCallbackObject = function(callback) {
    if(typeof callback.id === "undefined") {
      callback.id = callback.api
    }
    this.registry.unregisterObject(callback)
  };
  _RPCHandler.prototype.request = function(service, method, objectRef, successCallback, errorCallback) {
    var self = this;
    function callback(maybeCallback) {
      if(typeof maybeCallback !== "function") {
        return function() {
        }
      }
      return maybeCallback
    }
    return function() {
      var params = Array.prototype.slice.call(arguments);
      var message = self.createRPC(service, method, params);
      if(objectRef && objectRef.api) {
        message.id = objectRef.api
      }else {
        if(objectRef) {
          message.id = objectRef
        }
      }
      self.executeRPC(message, callback(successCallback), callback(errorCallback))
    }
  };
  _RPCHandler.prototype.notify = function(service, method, objectRef) {
    return this.request(service, method, objectRef, function() {
    }, function() {
    })
  };
  RPCWebinosService = function(obj) {
    if(!obj) {
      this.id = "";
      this.api = "";
      this.displayName = "";
      this.description = "";
      this.serviceAddress = ""
    }else {
      this.id = obj.id || "";
      this.api = obj.api || "";
      this.displayName = obj.displayName || "";
      this.description = obj.description || "";
      this.serviceAddress = obj.serviceAddress || ""
    }
  };
  RPCWebinosService.prototype.getInformation = function() {
    return{id:this.id, api:this.api, displayName:this.displayName, description:this.description, serviceAddress:this.serviceAddress}
  };
  ServiceType = function(api) {
    if(!api) {
      throw new Error("ServiceType: missing argument: api");
    }
    this.api = api
  };
  _RPCHandler.prototype.setSessionId = function(id) {
    this.sessionId = id
  };
  if(typeof module !== "undefined") {
    exports.RPCHandler = _RPCHandler;
    exports.RPCWebinosService = RPCWebinosService;
    exports.ServiceType = ServiceType
  }else {
    this.RPCHandler = _RPCHandler;
    this.RPCWebinosService = RPCWebinosService;
    this.ServiceType = ServiceType
  }
})();
(function() {
  var logger = console;
  if(typeof module !== "undefined") {
    var webinos_ = require("find-dependencies")(__dirname);
    logger = webinos_.global.require(webinos_.global.util.location, "lib/logging.js")(__filename)
  }
  function logObj(obj, name) {
    for(var myKey in obj) {
      if(typeof obj[myKey] === "object") {
        logger.log(name + "[" + myKey + "] = " + JSON.stringify(obj[myKey]));
        logObj(obj[myKey], name + "." + myKey)
      }
    }
  }
  var MessageHandler = function(rpcHandler) {
    this.sendMsg = null;
    this.objectRef = null;
    this.ownId = null;
    this.separator = null;
    this.rpcHandler = rpcHandler;
    this.rpcHandler.setMessageHandler(this);
    this.clients = {};
    this.message = {};
    this.messageCallbacks = {}
  };
  MessageHandler.prototype.setSendMessage = function(sendMessageFunction) {
    this.sendMsg = sendMessageFunction
  };
  MessageHandler.prototype.sendMessage = function(message, sessionid, objectRef) {
    this.sendMsg(message, sessionid, objectRef)
  };
  MessageHandler.prototype.setObjectRef = function(objref) {
    this.objectRef = objref
  };
  MessageHandler.prototype.setGetOwnId = function(OwnIdGetter) {
    this.ownId = OwnIdGetter
  };
  MessageHandler.prototype.getOwnId = function() {
    return this.ownId
  };
  MessageHandler.prototype.setSeparator = function(sep) {
    this.separator = sep
  };
  MessageHandler.prototype.createMessage = function(options) {
    var message = {};
    for(var i in options) {
      message[i] = options[i]
    }
    return message
  };
  MessageHandler.prototype.createMessageId = function(message, successHandler, errorHandler) {
    message.id = 1 + Math.floor(Math.random() * 1024);
    if(errorHandler || successHandler) {
      this.messageCallbacks[message.id] = {onError:errorHandler, onSuccess:successHandler}
    }
  };
  MessageHandler.prototype.registerSender = function(from, to) {
    var options = {};
    options.register = true;
    options.to = to;
    options.from = from;
    options.type = "JSONRPC";
    options.payload = null;
    var message = this.createMessage(options);
    return message
  };
  MessageHandler.prototype.removeRoute = function(sender, receiver) {
    var session = [sender, receiver];
    session.join("->");
    if(this.clients[session]) {
      this.clients[session] = null
    }
  };
  MessageHandler.prototype.write = function(rpc, respto, msgid) {
    var options = {};
    options.to = respto;
    options.resp_to = this.ownId;
    options.from = this.ownId;
    if(!msgid) {
      msgid = 1 + Math.floor(Math.random() * 1024)
    }
    options.id = msgid;
    if(typeof rpc.jsonrpc !== "undefined") {
      options.type = "JSONRPC"
    }
    options.payload = rpc;
    var message = this.createMessage(options);
    if(message.to !== undefined) {
      var to = message.to;
      var session1 = [to, this.self];
      session1.join("->");
      var session2 = [this.self, to];
      session2.join("->");
      if(!this.clients[session1] && !this.clients[session2]) {
        logger.log("session not set up");
        var occurences = message.to.split(this.separator).length - 1;
        var data = message.to.split(this.separator);
        var id = data[0];
        var forwardto = data[0];
        for(var i = 1;i < occurences;i++) {
          id = id + this.separator + data[i];
          var new_session1 = [id, this.self];
          new_session1.join("->");
          var new_session2 = [this.self, id];
          new_session2.join("->");
          if(this.clients[new_session1] || this.clients[new_session2]) {
            forwardto = id;
            logger.log("forwardto ", forwardto)
          }
        }
        if(forwardto === data[0]) {
          var s1 = [forwardto, this.self];
          s1.join("->");
          var s2 = [this.self, forwardto];
          s2.join("->");
          if(this.clients[s1] || this.clients[s2]) {
            forwardto = data[0]
          }else {
            var own_addr = this.self.split(this.separator);
            var own_pzh = own_addr[0];
            if(forwardto !== own_pzh) {
              forwardto = own_pzh
            }
          }
        }
        this.sendMsg(message, forwardto, this.objectRef)
      }else {
        if(this.clients[session2]) {
          logger.log("clients[session2]:" + this.clients[session2]);
          this.sendMsg(message, this.clients[session2], this.objectRef)
        }else {
          if(this.clients[session1]) {
            logger.log("clients[session1]:" + this.clients[session1]);
            this.sendMsg(message, this.clients[session1], this.objectRef)
          }
        }
      }
    }
  };
  MessageHandler.prototype.onMessageReceived = function(message, sessionid) {
    if(typeof message === "string") {
      try {
        message = JSON.parse(message)
      }catch(e) {
        log.error("JSON.parse (message) - error: " + e.message)
      }
    }
    if(message.hasOwnProperty("register") && message.register) {
      var from = message.from;
      var to = message.to;
      if(to !== undefined) {
        var regid = [from, to];
        regid.join("->");
        if(message.from) {
          this.clients[regid] = message.from
        }else {
          if(sessionid) {
            this.clients[regid] = sessionid
          }
        }
        logger.log("register Message")
      }
      return
    }else {
      if(message.hasOwnProperty("to") && message.to) {
        this.self = this.ownId;
        if(message.to !== this.self) {
          logger.log("forward Message");
          var to = message.to;
          var session1 = [to, this.self];
          session1.join("->");
          var session2 = [this.self, to];
          session2.join("->");
          if(!this.clients[session1] && !this.clients[session2]) {
            logObj(message, "Sender, receiver not registered either way");
            var occurences = message.to.split(this.separator).length - 1;
            var data = message.to.split(this.separator);
            var id = data[0];
            var forwardto = data[0];
            for(var i = 1;i < occurences;i++) {
              id = id + this.separator + data[i];
              var new_session1 = [id, this.self];
              new_session1.join("->");
              var new_session2 = [this.self, id];
              new_session2.join("->");
              if(this.clients[new_session1] || this.clients[new_session2]) {
                forwardto = id
              }
            }
            if(forwardto === data[0]) {
              var s1 = [forwardto, this.self];
              s1.join("->");
              var s2 = [this.self, forwardto];
              s2.join("->");
              if(this.clients[s1] || this.clients[s2]) {
                forwardto = data[0]
              }else {
                var own_addr = this.self.split(this.separator);
                var own_pzh = own_addr[0];
                if(forwardto !== own_pzh) {
                  forwardto = own_pzh
                }
              }
            }
            logger.log("message forward to:" + forwardto);
            this.sendMsg(message, forwardto, this.objectRef)
          }else {
            if(this.clients[session2]) {
              this.sendMsg(message, this.clients[session2], this.objectRef)
            }else {
              if(this.clients[session1]) {
                this.sendMsg(message, this.clients[session1], this.objectRef)
              }
            }
          }
          return
        }else {
          if(message.payload) {
            if(message.to != message.resp_to) {
              var from = message.from;
              var msgid = message.id;
              this.rpcHandler.handleMessage(message.payload, from, msgid)
            }else {
              if(typeof message.payload.method !== "undefined") {
                var from = message.from;
                var msgid = message.id;
                this.rpcHandler.handleMessage(message.payload, from, msgid)
              }else {
                if(typeof message.payload.result !== "undefined" || typeof message.payload.error !== "undefined") {
                  this.rpcHandler.handleMessage(message.payload)
                }
              }
              if(this.messageCallbacks[message.id]) {
                this.messageCallbacks[message.id].onSuccess(message.payload.result)
              }
            }
          }else {
          }
          return
        }
        return
      }
    }
  };
  if(typeof exports !== "undefined") {
    exports.MessageHandler = MessageHandler
  }else {
    this.MessageHandler = MessageHandler
  }
})();
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
      case "authenticate":
        callListenerForMsg(data);
        break;
      case "authStatus":
        callListenerForMsg(data);
        break;
      case "error":
        callListenerForMsg(data);
        break
    }
  }
})();
(function() {
  var isOnNode = function() {
    return typeof module === "object" ? true : false
  };
  var ServiceDiscovery = function(rpcHandler) {
    this.rpcHandler = rpcHandler;
    this.registeredServices = 0;
    this._webinosReady = false;
    if(isOnNode()) {
      return
    }
    var that = this;
    webinos.session.addListener("registeredBrowser", function() {
      that._webinosReady = true;
      finishCallers()
    })
  };
  if(isOnNode()) {
    exports.ServiceDiscovery = ServiceDiscovery
  }else {
    this.ServiceDiscovery = ServiceDiscovery
  }
  var callerCache = [];
  var finishCallers = function() {
    for(var i = 0;i < callerCache.length;i++) {
      var caller = callerCache[i];
      webinos.discovery.findServices(caller.serviceType, caller.callback, caller.options, caller.filter)
    }
    callerCache = []
  };
  ServiceDiscovery.prototype.findServices = function(serviceType, callback, options, filter) {
    var that = this;
    if(!isOnNode() && !this._webinosReady) {
      callerCache.push({serviceType:serviceType, callback:callback, options:options, filter:filter});
      return
    }
    if(serviceType == "BlobBuilder") {
      var tmp = new BlobBuilder;
      this.registeredServices++;
      callback.onFound(tmp);
      return
    }
    function success(params) {
      var baseServiceObj = params;
      console.log("servicedisco: service found.");
      var typeMap = {};
      if(typeof webinos.file !== "undefined" && typeof webinos.file.Service !== "undefined") {
        typeMap["http://webinos.org/api/file"] = webinos.file.Service
      }
      if(typeof TestModule !== "undefined") {
        typeMap["http://webinos.org/api/test"] = TestModule
      }
      if(typeof oAuthModule !== "undefined") {
        typeMap["http://webinos.org/mwc/oauth"] = oAuthModule
      }
      if(typeof WebinosGeolocation !== "undefined") {
        typeMap["http://www.w3.org/ns/api-perms/geolocation"] = WebinosGeolocation
      }
      if(typeof WebinosDeviceOrientation !== "undefined") {
        typeMap["http://webinos.org/api/deviceorientation"] = WebinosDeviceOrientation
      }
      if(typeof Vehicle !== "undefined") {
        typeMap["http://webinos.org/api/vehicle"] = Vehicle
      }
      if(typeof EventsModule !== "undefined") {
        typeMap["http://webinos.org/api/events"] = EventsModule
      }
      if(typeof AppLauncherModule !== "undefined") {
        typeMap["http://webinos.org/api/applauncher"] = AppLauncherModule
      }
      if(typeof Sensor !== "undefined") {
        typeMap["http://webinos.org/api/sensors"] = Sensor;
        typeMap["http://webinos.org/api/sensors.temperature"] = Sensor
      }
      if(typeof PaymentModule !== "undefined") {
        typeMap["http://webinos.org/api/payment"] = PaymentModule
      }
      if(typeof UserProfileIntModule !== "undefined") {
        typeMap["UserProfileInt"] = UserProfileIntModule
      }
      if(typeof TVManager !== "undefined") {
        typeMap["http://webinos.org/api/tv"] = TVManager
      }
      if(typeof DeviceStatusManager !== "undefined") {
        typeMap["http://wacapps.net/api/devicestatus"] = DeviceStatusManager
      }
      if(typeof Contacts !== "undefined") {
        typeMap["http://www.w3.org/ns/api-perms/contacts"] = Contacts
      }
      if(typeof webinos.Context !== "undefined") {
        typeMap["http://webinos.org/api/context"] = webinos.Context
      }
      if(typeof DiscoveryModule !== "undefined") {
        typeMap["http://webinos.org/api/discovery"] = DiscoveryModule
      }
      if(typeof AuthenticationModule !== "undefined") {
        typeMap["http://webinos.org/api/authentication"] = AuthenticationModule
      }
      if(isOnNode()) {
        var path = require("path");
        var moduleRoot = path.resolve(__dirname, "../") + "/";
        var moduleDependencies = require(moduleRoot + "/dependencies.json");
        var webinosRoot = path.resolve(moduleRoot + moduleDependencies.root.location) + "/";
        var dependencies = require(path.resolve(webinosRoot + "/dependencies.json"));
        var Context = require(path.join(webinosRoot, dependencies.wrt.location, "lib/webinos.context.js")).Context;
        typeMap["http://webinos.org/api/context"] = Context
      }
      var ServiceConstructor = typeMap[baseServiceObj.api];
      if(typeof ServiceConstructor !== "undefined") {
        var service = new ServiceConstructor(baseServiceObj, that.rpcHandler);
        this.registeredServices++;
        callback.onFound(service)
      }else {
        var serviceErrorMsg = "Cannot instantiate webinos service.";
        console.log(serviceErrorMsg);
        if(typeof callback.onError === "function") {
          callback.onError(new DiscoveryError(102, serviceErrorMsg))
        }
      }
    }
    var id = Math.floor(Math.random() * 1001);
    var rpc = this.rpcHandler.createRPC("ServiceDiscovery", "findServices", [serviceType, options, filter]);
    rpc.onservicefound = function(params) {
      success(params)
    };
    this.rpcHandler.registerCallbackObject(rpc);
    var serviceAddress;
    if(typeof this.rpcHandler.parent !== "undefined") {
      serviceAddress = this.rpcHandler.parent.config.pzhId
    }else {
      serviceAddress = webinos.session.getServiceLocation()
    }
    rpc.serviceAddress = serviceAddress;
    this.rpcHandler.executeRPC(rpc);
    return
  };
  var DiscoveryError = function(code, message) {
    this.code = code;
    this.message = message
  };
  DiscoveryError.prototype.FIND_SERVICE_CANCELED = 101;
  DiscoveryError.prototype.FIND_SERVICE_TIMEOUT = 102;
  DiscoveryError.prototype.PERMISSION_DENIED_ERROR = 103;
  WebinosService = function(obj) {
    this.base = RPCWebinosService;
    this.base(obj)
  };
  WebinosService.prototype = new RPCWebinosService;
  WebinosService.prototype.state = "";
  WebinosService.prototype.icon = "";
  WebinosService.prototype.bindService = function(bindCB) {
    if(typeof bindCB === "undefined") {
      return
    }
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  WebinosService.prototype.unbind = function() {
    webinos.discovery.registeredServices--;
    if(channel != null && webinos.discovery.registeredServices > 0) {
      channel.close();
      channel = null
    }
  }
})();
(function() {
  if(typeof webinos === "undefined") {
    webinos = {}
  }
  var channel = null;
  function createCommChannel(successCB) {
    var channel = null;
    if(typeof WebinosSocket !== "undefined") {
      channel = new WebinosSocket
    }else {
      var port, hostname;
      var defaultHost = "localhost";
      var defaultPort = "8081";
      var isWebServer = true;
      var useDefaultHost = false;
      var useDefaultPort = false;
      port = window.location.port - 0 || 80;
      hostname = window.location.hostname;
      if(hostname == "") {
        isWebServer = false
      }
      if(isWebServer) {
        try {
          var xmlhttp = new XMLHttpRequest;
          xmlhttp.open("GET", "/webinosConfig.json", false);
          xmlhttp.send();
          if(xmlhttp.status == 200) {
            var resp = JSON.parse(xmlhttp.responseText);
            port = resp.websocketPort
          }else {
            console.log("CAUTION: webinosConfig.json failed to load. Are you on a pzp/widget server or older version of webinos? Trying the guess  communication channel's port.");
            port = port + 1
          }
        }catch(err) {
          console.log("CAUTION: The pzp communication host and port are unknown. Trying the default communication channel.");
          useDefaultHost = true;
          useDefaultPort = true
        }
      }else {
        console.log("CAUTION: No web server detected. Using a local file? Trying the default communication channel.");
        useDefaultHost = true;
        useDefaultPort = true
      }
      if(useDefaultHost) {
        hostname = defaultHost
      }
      if(useDefaultPort) {
        port = defaultPort
      }
      var ws = window.WebSocket || window.MozWebSocket;
      try {
        channel = new ws("ws://" + hostname + ":" + port)
      }catch(err) {
        throw new Error("Your browser does not support websockets. Please report your browser on webinos.org.");
      }
    }
    webinos.session.setChannel(channel);
    channel.onmessage = function(ev) {
      console.log("WebSocket Client: Message Received : " + JSON.stringify(ev.data));
      var data = JSON.parse(ev.data);
      if(data.type === "prop") {
        webinos.session.handleMsg(data)
      }else {
        webinos.messageHandler.setGetOwnId(webinos.session.getSessionId());
        webinos.messageHandler.setObjectRef(this);
        webinos.messageHandler.setSendMessage(webinos.session.message_send_messaging);
        webinos.messageHandler.onMessageReceived(data, data.to)
      }
    }
  }
  createCommChannel();
  if(typeof webinos === "undefined") {
    webinos = {}
  }
  webinos.rpcHandler = new RPCHandler(undefined, new Registry);
  webinos.messageHandler = new MessageHandler(webinos.rpcHandler);
  webinos.discovery = new ServiceDiscovery(webinos.rpcHandler);
  webinos.ServiceDiscovery = webinos.discovery
})();
if(typeof module === "undefined") {
  if(typeof webinos === "undefined") {
    webinos = {}
  }
  if(typeof webinos.path === "undefined") {
    webinos.path = {}
  }
}
(function(exports) {
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;
  function splitPath(path) {
    var result = splitPathRe.exec(path);
    return[result[1] || "", result[2] || "", result[3] || "", result[4] || ""]
  }
  function normalizeArray(parts, allowAboveRoot) {
    var up = 0;
    for(var i = parts.length - 1;i >= 0;i--) {
      var part = parts[i];
      if(part === ".") {
        parts.splice(i, 1)
      }else {
        if(part === "..") {
          parts.splice(i, 1);
          up++
        }else {
          if(up) {
            parts.splice(i, 1);
            up--
          }
        }
      }
    }
    if(allowAboveRoot) {
      for(;up--;) {
        parts.unshift("..")
      }
    }
    return parts
  }
  exports.normalize = function(path) {
    var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
    path = normalizeArray(path.split("/").filter(function(part) {
      return!!part
    }), !isAbsolute).join("/");
    if(!path && !isAbsolute) {
      path = "."
    }
    if(path && trailingSlash) {
      path += "/"
    }
    return(isAbsolute ? "/" : "") + path
  };
  exports.join = function() {
    var paths = Array.prototype.slice.call(arguments, 0);
    return exports.normalize(paths.filter(function(path) {
      return path && typeof path === "string"
    }).join("/"))
  };
  exports.resolve = function() {
    var resolvedPath = "", resolvedAbsolute = false;
    for(var i = arguments.length - 1;i >= 0 && !resolvedAbsolute;i--) {
      var path = arguments[i];
      if(!path || typeof path !== "string") {
        continue
      }
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path.charAt(0) === "/"
    }
    resolvedPath = normalizeArray(resolvedPath.split("/").filter(function(part) {
      return!!part
    }), !resolvedAbsolute).join("/");
    return(resolvedAbsolute ? "/" : "") + resolvedPath || "."
  };
  exports.relative = function(from, to) {
    from = exports.resolve(from).substr(1);
    to = exports.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for(;start < arr.length;start++) {
        if(arr[start] !== "") {
          break
        }
      }
      var end = arr.length - 1;
      for(;end >= 0;end--) {
        if(arr[end] !== "") {
          break
        }
      }
      if(start > end) {
        return[]
      }
      return arr.slice(start, end - start + 1)
    }
    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for(var i = 0;i < length;i++) {
      if(fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break
      }
    }
    var outputParts = [];
    for(var i = samePartsLength;i < fromParts.length;i++) {
      outputParts.push("..")
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/")
  };
  exports.isParentOf = function(parent, mayBeChild) {
    if(parent === "/" && mayBeChild !== "/") {
      return true
    }
    if(parent.length > mayBeChild.length || mayBeChild.indexOf(parent) !== 0) {
      return false
    }
    if(mayBeChild.charAt(parent.length) !== "/") {
      return false
    }
    return true
  };
  exports.dirname = function(path) {
    var result = splitPath(path), root = result[0], dir = result[1];
    if(!root && !dir) {
      return"."
    }
    if(dir) {
      dir = dir.substr(0, dir.length - 1)
    }
    return root + dir
  };
  exports.basename = function(path, ext) {
    var file = splitPath(path)[2];
    if(ext && file.substr(-1 * ext.length) === ext) {
      file = file.substr(0, file.length - ext.length)
    }
    return file
  };
  exports.extname = function(path) {
    return splitPath(path)[3]
  }
})(typeof module !== "undefined" ? module.exports : webinos.path);
if(typeof webinos === "undefined") {
  webinos = {}
}
if(typeof webinos.file === "undefined") {
  webinos.file = {}
}
(function(exports) {
  exports.Service = Service;
  webinos.util.inherits(Service, WebinosService);
  function Service(object, rpc) {
    Service.parent.call(this, object);
    this.rpc = rpc
  }
  Service.prototype.requestFileSystem = function(type, size, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self, "requestFileSystem", {type:type, size:size});
    self.rpc.executeRPC(request, function(filesystem) {
      successCallback(new FileSystem(self, filesystem.name))
    }, errorCallback)
  };
  Service.prototype.resolveLocalFileSystemURL = function(url, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self, "resolveLocalFileSystemURL", {url:url});
    self.rpc.executeRPC(request, function(entry) {
      var filesystem = new FileSystem(self, entry.filesystem.name);
      if(entry.isDirectory) {
        successCallback(new DirectoryEntry(filesystem, entry.fullPath))
      }else {
        successCallback(new FileEntry(filesystem, entry.fullPath))
      }
    }, errorCallback)
  };
  function FileSystem(service, name) {
    this.service = service;
    this.name = name;
    this.root = new DirectoryEntry(this, "/")
  }
  FileSystem.prototype.toJSON = function() {
    var json = {name:this.name};
    return json
  };
  function Entry(filesystem, fullPath) {
    this.name = webinos.path.basename(fullPath);
    this.fullPath = fullPath;
    this.filesystem = filesystem;
    this.service = filesystem.service;
    this.rpc = filesystem.service.rpc
  }
  Entry.prototype.isFile = false;
  Entry.prototype.isDirectory = false;
  Entry.prototype.getMetadata = function(successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "getMetadata", {entry:this});
    this.rpc.executeRPC(request, function(metadata) {
      successCallback(new Metadata(metadata))
    }, errorCallback)
  };
  Entry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "moveTo", {source:self, parent:parent, newName:newName});
    self.rpc.executeRPC(request, function(entry) {
      if(self.isDirectory) {
        successCallback(new DirectoryEntry(self.filesystem, entry.fullPath))
      }else {
        successCallback(new FileEntry(self.filesystem, entry.fullPath))
      }
    }, errorCallback)
  };
  Entry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "copyTo", {source:self, parent:parent, newName:newName});
    self.rpc.executeRPC(request, function(entry) {
      if(self.isDirectory) {
        successCallback(new DirectoryEntry(self.filesystem, entry.fullPath))
      }else {
        successCallback(new FileEntry(self.filesystem, entry.fullPath))
      }
    }, errorCallback)
  };
  Entry.prototype.toURL = function() {
    return"webinos:" + this.filesystem.name + this.fullPath
  };
  Entry.prototype.remove = function(successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "remove", {entry:this});
    this.rpc.executeRPC(request, successCallback, errorCallback)
  };
  Entry.prototype.getParent = function(successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getParent", {entry:self});
    self.rpc.executeRPC(request, function(entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath))
    }, errorCallback)
  };
  Entry.prototype.toJSON = function() {
    var json = {name:this.name, fullPath:this.fullPath, filesystem:this.filesystem, isFile:this.isFile, isDirectory:this.isDirectory};
    return json
  };
  function Metadata(metadata) {
    this.modificationTime = new Date(metadata.modificationTime);
    this.size = metadata.size
  }
  webinos.util.inherits(DirectoryEntry, Entry);
  function DirectoryEntry(filesystem, fullPath) {
    DirectoryEntry.parent.call(this, filesystem, fullPath)
  }
  DirectoryEntry.prototype.isDirectory = true;
  DirectoryEntry.prototype.createReader = function() {
    return new DirectoryReader(this)
  };
  DirectoryEntry.prototype.getFile = function(path, options, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getFile", {entry:self, path:path, options:options});
    self.rpc.executeRPC(request, function(entry) {
      successCallback(new FileEntry(self.filesystem, entry.fullPath))
    }, errorCallback)
  };
  DirectoryEntry.prototype.getDirectory = function(path, options, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getDirectory", {entry:self, path:path, options:options});
    self.rpc.executeRPC(request, function(entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath))
    }, errorCallback)
  };
  DirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "removeRecursively", {entry:this});
    this.rpc.executeRPC(request, successCallback, errorCallback)
  };
  function DirectoryReader(entry) {
    this.entry = entry;
    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc
  }
  DirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
    var self = this;
    function next() {
      if(!self.entries.length) {
        return[]
      }
      var chunk = self.entries.slice(0, 10);
      self.entries.splice(0, 10);
      return chunk
    }
    if(typeof self.entries === "undefined") {
      var request = self.rpc.createRPC(self.service, "readEntries", {entry:self.entry});
      self.rpc.executeRPC(request, function(entries) {
        self.entries = entries.map(function(entry) {
          if(entry.isDirectory) {
            return new DirectoryEntry(self.entry.filesystem, entry.fullPath)
          }else {
            return new FileEntry(self.entry.filesystem, entry.fullPath)
          }
        });
        successCallback(next())
      }, errorCallback)
    }else {
      webinos.util.async(successCallback)(next())
    }
  };
  webinos.util.inherits(FileEntry, Entry);
  function FileEntry(filesystem, fullPath) {
    FileEntry.parent.call(this, filesystem, fullPath)
  }
  FileEntry.prototype.isFile = true;
  FileEntry.prototype.createWriter = function(successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getMetadata", {entry:self});
    self.rpc.executeRPC(request, function(metadata) {
      var writer = new FileWriter(self);
      writer.length = metadata.size;
      successCallback(writer)
    }, errorCallback)
  };
  FileEntry.prototype.file = function(successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getMetadata", {entry:self});
    self.rpc.executeRPC(request, function(metadata) {
      var blobParts = [];
      var remote;
      var port = self.rpc.createRPC(self.service, "read", {entry:self, options:{bufferSize:16 * 1024, autopause:true}});
      port.ref = function(params, successCallback, errorCallback, ref) {
        remote = ref
      };
      port.open = function() {
      };
      port.data = function(params) {
        blobParts.push(webinos.util.hex2ab(params.data));
        var message = self.rpc.createRPC(remote, "resume", null);
        self.rpc.executeRPC(message)
      };
      port.end = function() {
      };
      port.close = function() {
        try {
          var blob = new Blob(blobParts);
          blob.name = self.name;
          blob.lastModifiedDate = new Date(metadata.modificationTime);
          successCallback(blob)
        }finally {
          self.rpc.unregisterCallbackObject(port)
        }
      };
      port.error = function(params) {
        try {
          errorCallback(params.error)
        }finally {
          self.rpc.unregisterCallbackObject(port)
        }
      };
      self.rpc.registerCallbackObject(port);
      self.rpc.executeRPC(port)
    }, errorCallback)
  };
  webinos.util.inherits(FileWriter, webinos.util.EventTarget);
  function FileWriter(entry) {
    FileWriter.parent.call(this);
    this.entry = entry;
    this.readyState = FileWriter.INIT;
    this.length = 0;
    this.position = 0;
    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc;
    this.addEventListener("writestart", function(event) {
      webinos.util.callback(this.onwritestart)(event)
    });
    this.addEventListener("progress", function(event) {
      webinos.util.callback(this.onprogress)(event)
    });
    this.addEventListener("abort", function(event) {
      webinos.util.callback(this.onabort)(event)
    });
    this.addEventListener("write", function(event) {
      webinos.util.callback(this.onwrite)(event)
    });
    this.addEventListener("writeend", function(event) {
      webinos.util.callback(this.onwriteend)(event)
    });
    this.addEventListener("error", function(event) {
      webinos.util.callback(this.onerror)(event)
    })
  }
  FileWriter.INIT = 0;
  FileWriter.WRITING = 1;
  FileWriter.DONE = 2;
  function BlobIterator(blob) {
    this.blob = blob;
    this.position = 0
  }
  BlobIterator.prototype.hasNext = function() {
    return this.position < this.blob.size
  };
  BlobIterator.prototype.next = function() {
    if(!this.hasNext()) {
      throw new webinos.util.CustomError("InvalidStateError");
    }
    var end = Math.min(this.position + 16 * 1024, this.blob.size);
    var chunk;
    if(this.blob.slice) {
      chunk = this.blob.slice(this.position, end)
    }else {
      if(this.blob.webkitSlice) {
        chunk = this.blob.webkitSlice(this.position, end)
      }else {
        if(this.blob.mozSlice) {
          chunk = this.blob.mozSlice(this.position, end)
        }
      }
    }
    this.position = end;
    return chunk
  };
  FileWriter.prototype.write = function(data) {
    var self = this;
    if(self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }
    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));
    var reader = new FileReader;
    reader.onload = function() {
      var message = self.rpc.createRPC(remote, "write", {data:webinos.util.ab2hex(reader.result)});
      self.rpc.executeRPC(message, function(bytesWritten) {
        self.position += bytesWritten;
        self.length = Math.max(self.position, self.length);
        self.dispatchEvent(new webinos.util.ProgressEvent("progress"))
      })
    };
    reader.onerror = function() {
      var message = self.rpc.createRPC(remote, "destroy");
      self.rpc.executeRPC(message, function() {
        try {
          self.error = reader.error;
          self.readyState = FileWriter.DONE;
          self.dispatchEvent(new webinos.util.ProgressEvent("error"));
          self.dispatchEvent(new webinos.util.ProgressEvent("writeend"))
        }finally {
          self.rpc.unregisterCallbackObject(port)
        }
      })
    };
    var iterator = new BlobIterator(data);
    function iterate() {
      if(iterator.hasNext()) {
        reader.readAsArrayBuffer(iterator.next())
      }else {
        var message = self.rpc.createRPC(remote, "end");
        self.rpc.executeRPC(message, function() {
          try {
            self.readyState = FileWriter.DONE;
            self.dispatchEvent(new webinos.util.ProgressEvent("write"));
            self.dispatchEvent(new webinos.util.ProgressEvent("writeend"))
          }finally {
            self.rpc.unregisterCallbackObject(port)
          }
        })
      }
    }
    var remote;
    var port = self.rpc.createRPC(self.service, "write", {entry:self.entry, options:{start:self.position}});
    port.ref = function(params, successCallback, errorCallback, ref) {
      remote = ref
    };
    port.open = function() {
      iterate()
    };
    port.drain = function() {
      iterate()
    };
    port.close = function() {
    };
    port.error = function(params) {
      try {
        self.error = params.error;
        self.readyState = FileWriter.DONE;
        self.dispatchEvent(new webinos.util.ProgressEvent("error"));
        self.dispatchEvent(new webinos.util.ProgressEvent("writeend"))
      }finally {
        reader.abort();
        self.rpc.unregisterCallbackObject(port)
      }
    };
    self.rpc.registerCallbackObject(port);
    self.rpc.executeRPC(port)
  };
  FileWriter.prototype.seek = function(offset) {
    if(this.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }
    this.position = offset;
    if(this.position > this.length) {
      this.position = this.length
    }
    if(this.position < 0) {
      this.position = this.position + this.length
    }
    if(this.position < 0) {
      this.position = 0
    }
  };
  FileWriter.prototype.truncate = function(size) {
    var self = this;
    if(self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }
    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));
    var request = self.rpc.createRPC(self.service, "truncate", {entry:self.entry, size:size});
    self.rpc.executeRPC(request, function() {
      self.length = size;
      self.position = Math.min(self.position, size);
      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("write"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"))
    }, function(error) {
      self.error = error;
      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("error"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
      s
    })
  }
})(webinos.file);
(function() {
  var TVDisplayManager, TVDisplaySuccessCB, TVTunerManager, TVSuccessCB, TVErrorCB, TVError, TVSource, Channel, ChannelChangeEvent;
  var that = this;
  TVDisplayManager = function() {
  };
  TVDisplayManager.prototype.setChannel = function(channel, successCallback, errorCallback) {
    var rpc = webinos.rpcHandler.createRPC(that, "display.setChannel", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCallback(params)
    }, function(error) {
      if(errorCallback) {
        errorCallback()
      }
    });
    return
  };
  TVDisplayManager.prototype.getEPGPIC = function(channel, successCallback, errorCallback) {
    var rpc = webinos.rpcHandler.createRPC(that, "display.getEPGPIC", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCallback(params)
    }, function(error) {
      if(errorCallback) {
        errorCallback()
      }
    });
    return
  };
  TVDisplaySuccessCB = function() {
  };
  TVDisplaySuccessCB.prototype.onSuccess = function(channel) {
    return
  };
  TVDisplayManager.prototype.addEventListener = function(eventname, channelchangeeventhandler, useCapture) {
    var rpc = webinos.rpcHandler.createRPC(that, "display.addEventListener", arguments);
    rpc.onchannelchangeeventhandler = function(params, successCallback, errorCallback) {
      channelchangeeventhandler(params)
    };
    webinos.rpcHandler.registerCallbackObject(rpc);
    webinos.rpcHandler.executeRPC(rpc);
    return
  };
  TVTunerManager = function() {
  };
  TVTunerManager.prototype.getTVSources = function(successCallback, errorCallback) {
    var rpc = webinos.rpcHandler.createRPC(that, "tuner.getTVSources", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCallback(params)
    }, function(error) {
    });
    return
  };
  TVSuccessCB = function() {
  };
  TVSuccessCB.prototype.onSuccess = function(sources) {
    return
  };
  TVErrorCB = function() {
  };
  TVErrorCB.prototype.onError = function(error) {
    return
  };
  TVError = function() {
    this.code = Number
  };
  TVError.prototype.UNKNOWN_ERROR = 0;
  TVError.prototype.ILLEGAL_CHANNEL_ERROR = 1;
  TVError.prototype.code = Number;
  TVSource = function() {
    this.name = String;
    this.channelList = Number
  };
  TVSource.prototype.name = String;
  TVSource.prototype.channelList = Number;
  Channel = function() {
    this.channelType = Number;
    this.name = String;
    this.longName = String;
    this.stream = "new Stream()";
    this.tvsource = new TVSource
  };
  Channel.prototype.TYPE_TV = 0;
  Channel.prototype.TYPE_RADIO = 1;
  Channel.prototype.channelType = Number;
  Channel.prototype.name = String;
  Channel.prototype.longName = String;
  Channel.prototype.stream = null;
  Channel.prototype.tvsource = null;
  ChannelChangeEvent = function() {
    this.channel = new Channel
  };
  ChannelChangeEvent.prototype.channel = null;
  ChannelChangeEvent.prototype.initChannelChangeEvent = function(type, bubbles, cancelable, channel) {
    return
  };
  TVManager = function(obj) {
    this.base = WebinosService;
    this.base(obj);
    that = this;
    this.display = new TVDisplayManager(obj);
    this.tuner = new TVTunerManager(obj)
  };
  TVManager.prototype = new WebinosService
})();
(function() {
  oAuthModule = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  oAuthModule.prototype = new WebinosService;
  oAuthModule.prototype.init = function(requestTokenUrl, consumer_key, consumer_secret, callbackUrl, successCB, errorCB) {
    var params = [];
    params.push(requestTokenUrl);
    params.push(consumer_key);
    params.push(consumer_secret);
    params.push(callbackUrl);
    var rpc = webinos.rpcHandler.createRPC(this, "init", [params]);
    webinos.rpcHandler.executeRPC(rpc, function(pars) {
      if(successCB) {
        successCB(pars)
      }
    }, function(error) {
      if(errorCB) {
        errorCB(error)
      }
    })
  };
  oAuthModule.prototype.get = function(requestUrl, access_token, access_token_secret, successCB, errorCB) {
    var params = [];
    params.push(requestUrl);
    params.push(access_token);
    params.push(access_token_secret);
    var rpc = webinos.rpcHandler.createRPC(this, "get", params);
    webinos.rpcHandler.executeRPC(rpc, function(pars) {
      if(successCB) {
        successCB(pars)
      }
    }, function(error) {
      if(errorCB) {
        errorCB(error)
      }
    })
  };
  oAuthModule.prototype.post = function(requestUrl, access_token, access_token_secret, post_body, post_content_type, successCB, errorCB) {
    var params = [];
    params.push(requestUrl);
    params.push(access_token);
    params.push(access_token_secret);
    params.push(post_body);
    params.push(post_content_type);
    var rpc = webinos.rpcHandler.createRPC(this, "post", params);
    webinos.rpcHandler.executeRPC(rpc, function(pars) {
      if(successCB) {
        successCB(pars)
      }
    }, function(error) {
      if(errorCB) {
        errorCB(error)
      }
    })
  }
})();
(function() {
  TestModule = function(obj) {
    this.base = WebinosService;
    this.base(obj);
    this._testAttr = "HelloWorld";
    this.__defineGetter__("testAttr", function() {
      return this._testAttr + " Success"
    })
  };
  TestModule.prototype = new WebinosService;
  TestModule.prototype.bindService = function(bindCB, serviceId) {
    this.get42 = get42;
    this.listenAttr = {};
    this.listenerFor42 = listenerFor42.bind(this);
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  function get42(attr, successCB, errorCB) {
    console.log(this.id);
    var rpc = webinos.rpcHandler.createRPC(this, "get42", [attr]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCB(params)
    }, function(error) {
      errorCB(error)
    })
  }
  function listenerFor42(listener, options) {
    var rpc = webinos.rpcHandler.createRPC(this, "listenAttr.listenFor42", [options]);
    rpc.onEvent = function(obj) {
      listener(obj);
      webinos.rpcHandler.unregisterCallbackObject(rpc)
    };
    webinos.rpcHandler.registerCallbackObject(rpc);
    webinos.rpcHandler.executeRPC(rpc)
  }
})();
(function() {
  WebinosGeolocation = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  WebinosGeolocation.prototype = new WebinosService;
  WebinosGeolocation.prototype.bindService = function(bindCB, serviceId) {
    this.getCurrentPosition = getCurrentPosition;
    this.watchPosition = watchPosition;
    this.clearWatch = clearWatch;
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  function getCurrentPosition(positionCB, positionErrorCB, positionOptions) {
    var rpc = webinos.rpcHandler.createRPC(this, "getCurrentPosition", positionOptions);
    webinos.rpcHandler.executeRPC(rpc, function(position) {
      positionCB(position)
    }, function(error) {
      positionErrorCB(error)
    })
  }
  function watchPosition(positionCB, positionErrorCB, positionOptions) {
    var rpc = webinos.rpcHandler.createRPC(this, "watchPosition", [positionOptions]);
    rpc.onEvent = function(position) {
      positionCB(position)
    };
    webinos.rpcHandler.registerCallbackObject(rpc);
    webinos.rpcHandler.executeRPC(rpc);
    return parseInt(rpc.id, 16)
  }
  function clearWatch(watchId) {
    var watchIdStr = watchId.toString(16);
    var rpc = webinos.rpcHandler.createRPC(this, "clearWatch", [watchIdStr]);
    webinos.rpcHandler.executeRPC(rpc);
    webinos.rpcHandler.unregisterCallbackObject({api:watchIdStr})
  }
})();
(function() {
  Sensor = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  Sensor.prototype = new WebinosService;
  Sensor.prototype.bind = function(bindCB) {
    var self = this;
    var rpc = webinos.rpcHandler.createRPC(this, "getStaticData", []);
    webinos.rpcHandler.executeRPC(rpc, function(result) {
      self.maximumRange = result.maximumRange;
      self.minDelay = result.minDelay;
      self.power = result.power;
      self.resolution = result.resolution;
      self.vendor = result.vendor;
      self.version = result.version;
      self.configureSensor = function(options, successCB, errorCB) {
        var rpc = webinos.rpcHandler.createRPC(this, "configureSensor", arguments[0]);
        webinos.rpcHandler.executeRPC(rpc, function() {
          successCB()
        }, function(error) {
          errorCB()
        })
      };
      self.addEventListener = function(eventType, eventHandler, capture) {
        var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", eventType);
        rpc.onEvent = function(vehicleEvent) {
          eventHandler(vehicleEvent)
        };
        webinos.rpcHandler.registerCallbackObject(rpc);
        webinos.rpcHandler.executeRPC(rpc)
      };
      if(typeof bindCB.onBind === "function") {
        bindCB.onBind(this)
      }
    }, function(error) {
    })
  }
})();
(function() {
  var registeredListeners = {};
  var registeredRPCCallbacks = {};
  var eventService = null;
  EventsModule = function(obj) {
    this.base = WebinosService;
    this.base(obj);
    eventService = this;
    this.idCount = 0;
    this.myAppID = webinos.messageHandler.getOwnId();
    console.log("MyAppID: " + this.myAppID)
  };
  EventsModule.prototype = new WebinosService;
  EventsModule.prototype.bind = function(bindCB) {
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  EventsModule.prototype.createWebinosEvent = function(type, addressing, payload, inResponseTo, withTimeStamp, expiryTimeStamp, addressingSensitive) {
    var anEvent = new WebinosEvent;
    anEvent.type = type;
    anEvent.addressing = addressing;
    anEvent.payload = payload;
    anEvent.inResponseTo = inResponseTo;
    anEvent.timeStamp = (new Date).getTime();
    anEvent.expiryTimeStamp = expiryTimeStamp;
    anEvent.addressingSensitive = addressingSensitive;
    return anEvent
  };
  EventsModule.prototype.addWebinosEventListener = function(listener, type, source, destination) {
    if(this.idCount === Number.MAX_VALUE) {
      this.idCount = 0
    }
    this.idCount++;
    var listenerId = this.myAppID + ":" + this.idCount;
    var reqParams = {type:type, source:source, destination:destination};
    if(!source) {
      reqParams.source = this.myAppID
    }
    var rpc = webinos.rpcHandler.createRPC(this, "addWebinosEventListener", reqParams);
    rpc.handleEvent = function(params, scb, ecb) {
      console.log("Received a new WebinosEvent");
      listener(params.webinosevent);
      scb()
    };
    webinos.rpcHandler.registerCallbackObject(rpc);
    registeredRPCCallbacks[listenerId] = rpc;
    webinos.rpcHandler.executeRPC(rpc, function(remoteId) {
      console.log("New WebinosEvent listener registered. Mapping remote ID", remoteId, " localID ", listenerId);
      registeredListeners[listenerId] = remoteId
    }, function(error) {
      console.log("Error while registering new WebinosEvent listener")
    });
    return listenerId
  };
  EventsModule.prototype.removeWebinosEventListener = function(listenerId) {
    if(!listenerId || typeof listenerId !== "string") {
      throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "listenerId must be string type");
    }
    var rpc = webinos.rpcHandler.createRPC(this, "removeWebinosEventListener", registeredListeners[listenerId]);
    webinos.rpcHandler.executeRPC(rpc);
    webinos.rpcHandler.unregisterCallbackObject(registeredRPCCallbacks[listenerId]);
    registeredRPCCallbacks[listenerId] = undefined;
    registeredListeners[listenerId] = undefined
  };
  WebinosEventException = function(code, message) {
    this.code = code;
    this.message = message
  };
  WebinosEventException.__defineGetter__("INVALID_ARGUMENT_ERROR", function() {
    return 1
  });
  WebinosEventException.__defineGetter__("PERMISSION_DENIED_ERROR", function() {
    return 2
  });
  WebinosEvent = function() {
    this.id = Math.floor(Math.random() * 1001);
    this.type = null;
    this.addressing = {};
    this.addressing.source = eventService.myAppID;
    this.inResponseTo = null;
    this.timeStamp = null;
    this.expiryTimeStamp = null;
    this.addressingSensitive = null;
    this.forwarding = null;
    this.forwardingTimeStamp = null;
    this.payload = null
  };
  WebinosEvent.prototype.dispatchWebinosEvent = function(callbacks, referenceTimeout, sync) {
    var params = {webinosevent:{id:this.id, type:this.type, addressing:this.addressing, inResponseTo:this.inResponseTo, timeStamp:this.timeStamp, expiryTimeStamp:this.expiryTimeStamp, addressingSensitive:this.addressingSensitive, forwarding:this.forwarding, forwardingTimeStamp:this.forwardingTimeStamp, payload:this.payload}, referenceTimeout:referenceTimeout, sync:sync};
    if(!params.webinosevent.addressing) {
      params.webinosevent.addressing = {}
    }
    params.webinosevent.addressing.source = {};
    params.webinosevent.addressing.source.id = eventService.myAppID;
    if(callbacks) {
      if(typeof callbacks !== "object") {
        throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "callbacks must be of type WebinosEventCallbacks");
      }
      var cbNames = ["onSending", "onCaching", "onDelivery", "onTimeout", "onError"];
      for(var cbName in cbNames) {
        var cb = callbacks[cbName];
        if(cb && typeof cb !== "function") {
          throw new WebinosEventException(WebinosEventException.INVALID_ARGUMENT_ERROR, "cb is not a function");
        }
      }
      params.withCallbacks = true
    }
    var rpc = webinos.rpcHandler.createRPC(eventService, "WebinosEvent.dispatchWebinosEvent", params);
    if(callbacks) {
      console.log("Registering delivery callback");
      rpc.onSending = function(params) {
        if(callbacks.onSending) {
          callbacks.onSending(params.event, params.recipient)
        }
      };
      rpc.onCaching = function(params) {
        if(callbacks.onCaching) {
          callbacks.onCaching(params.event)
        }
      };
      rpc.onDelivery = function(params) {
        if(callbacks.onDelivery) {
          callbacks.onDelivery(params.event, params.recipient)
        }
        webinos.rpcHandler.unregisterCallbackObject(rpc)
      };
      rpc.onTimeout = function(params) {
        if(callbacks.onTimeout) {
          callbacks.onTimeout(params.event, params.recipient)
        }
        webinos.rpcHandler.unregisterCallbackObject(rpc)
      };
      rpc.onError = function(params) {
        if(callbacks.onError) {
          callbacks.onError(params.event, params.recipient, params.error)
        }
        webinos.rpcHandler.unregisterCallbackObject(rpc)
      };
      webinos.rpcHandler.registerCallbackObject(rpc)
    }
    webinos.rpcHandler.executeRPC(rpc)
  };
  WebinosEvent.prototype.forwardWebinosEvent = function(forwarding, withTimeStamp, callbacks, referenceTimeout, sync) {
  }
})();
(function() {
  AppLauncherModule = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  AppLauncherModule.prototype = new WebinosService;
  AppLauncherModule.prototype.bind = function(bindCB) {
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  AppLauncherModule.prototype.launchApplication = function(successCallback, errorCallback, applicationID, params) {
    var reqParams = {};
    reqParams.applicationID = applicationID;
    reqParams.params = params;
    var rpc = webinos.rpcHandler.createRPC(this, "launchApplication", reqParams);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCallback(params)
    }, function(error) {
      errorCallback(error)
    })
  };
  AppLauncherModule.prototype.appInstalled = function(applicationID) {
  }
})();
(function() {
  Vehicle = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  Vehicle.prototype = new WebinosService;
  Vehicle.prototype.bindService = function(bindCB, serviceId) {
    this.get = get;
    this.addEventListener = addEventListener;
    this.removeEventListener = removeEventListener;
    this.requestGuidance = requestGuidance;
    this.findDestination = findDestination;
    this.POI = POI;
    this.Address = Address;
    this.LatLng = LatLng;
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  var _referenceMapping = new Array;
  var _vehicleDataIds = new Array("climate-all", "climate-driver", "climate-passenger-front", "climate-passenger-rear-left", "passenger-rear-right", "lights-fog-front", "lights-fog-rear", "lights-signal-right", "lights-signal-left", "lights-signal-warn", "lights-hibeam", "lights-parking", "lights-head", "lights-head", "wiper-front-wash", "wiper-rear-wash", "wiper-automatic", "wiper-front-once", "wiper-rear-once", "wiper-front-level1", "wiper-front-level2", "destination-reached", "destination-changed", 
  "destination-cancelled", "parksensors-front", "parksensors-rear", "shift", "tripcomputer", "wipers", "oillevel");
  function get(vehicleDataId, callOnSuccess, callOnError) {
    arguments[0] = vehicleDataId;
    var rpc = webinos.rpcHandler.createRPC(this, "get", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(result) {
      callOnSuccess(result)
    }, function(error) {
      callOnError(error)
    })
  }
  function addEventListener(vehicleDataId, eventHandler, capture) {
    if(_vehicleDataIds.indexOf(vehicleDataId) != -1) {
      var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", vehicleDataId);
      _referenceMapping.push([rpc.id, eventHandler]);
      console.log("# of references" + _referenceMapping.length);
      rpc.onEvent = function(vehicleEvent) {
        eventHandler(vehicleEvent)
      };
      webinos.rpcHandler.registerCallbackObject(rpc);
      webinos.rpcHandler.executeRPC(rpc)
    }else {
      console.log(vehicleDataId + " not found")
    }
  }
  function removeEventListener(vehicleDataId, eventHandler, capture) {
    var refToBeDeleted = null;
    for(var i = 0;i < _referenceMapping.length;i++) {
      console.log("Reference" + i + ": " + _referenceMapping[i][0]);
      console.log("Handler" + i + ": " + _referenceMapping[i][1]);
      if(_referenceMapping[i][1] == eventHandler) {
        var arguments = new Array;
        arguments[0] = _referenceMapping[i][0];
        arguments[1] = vehicleDataId;
        console.log("ListenerObject to be removed ref#" + refToBeDeleted);
        var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
        webinos.rpcHandler.executeRPC(rpc, function(result) {
          callOnSuccess(result)
        }, function(error) {
          callOnError(error)
        });
        break
      }
    }
  }
  function POI(name, position, address) {
    this.name = name;
    this.position = position;
    this.address = address
  }
  function Address(country, region, county, city, street, streetNumber, premises, additionalInformation, postalCode) {
    this.county = county;
    this.regions = region;
    this.county = city;
    this.street = streetNumber;
    this.premises = premises;
    this.addtionalInformation = additionalInformation;
    this.postalCode = postalCode
  }
  function LatLng(lat, lng) {
    this.latitude = lat;
    this.longitude = lng
  }
  function requestGuidance(callOnSuccess, callOnError, destinations) {
    arguments = destinations;
    var successCb = callOnSuccess;
    var errorCb = callOnError;
    var rpc = webinos.rpcHandler.createRPC(this, "requestGuidance", arguments);
    webinos.rpcHandler.executeRPC(rpc, function() {
      callOnSuccess()
    }, function(error) {
      callOnError(error)
    })
  }
  function findDestination(callOnSuccess, callOnError, search) {
    arguments = search;
    var rpc = webinos.rpcHandler.createRPC(this, "findDestination", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(results) {
      callOnSuccess(results)
    }, function(error) {
      callOnError(error)
    })
  }
})();
(function() {
  WebinosDeviceOrientation = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  var _referenceMappingDo = new Array;
  var _eventIdsDo = new Array("deviceorientation", "compassneedscalibration", "devicemotion");
  WebinosDeviceOrientation.prototype = new WebinosService;
  WebinosDeviceOrientation.prototype.bindService = function(bindCB, serviceId) {
    this.addEventListener = addEventListener;
    this.removeEventListener = removeEventListener;
    this.dispatchEvent = dispatchEvent;
    this.DeviceOrientationEvent = DeviceOrientationEvent;
    this.DeviceMotionEvent = DeviceMotionEvent;
    this.Acceleration = Acceleration;
    this.RotationRate = RotationRate;
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  function addEventListener(type, listener, useCapture) {
    if(_eventIdsDo.indexOf(type) != -1) {
      console.log("LISTENER" + listener);
      var rpc = webinos.rpcHandler.createRPC(this, "addEventListener", [type, listener, useCapture]);
      _referenceMappingDo.push([rpc.id, listener]);
      console.log("# of references" + _referenceMappingDo.length);
      rpc.onEvent = function(orientationEvent) {
        listener(orientationEvent)
      };
      webinos.rpcHandler.registerCallbackObject(rpc);
      webinos.rpcHandler.executeRPC(rpc)
    }else {
      console.log(type + " not found")
    }
  }
  WDomEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp) {
    this.initEvent(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp)
  };
  WDomEvent.prototype.speed = 0;
  WDomEvent.prototype.initEvent = function(type, target, currentTarget, eventPhase, bubbles, cancelable, timestamp) {
    this.type = type;
    this.target = target;
    this.currentTarget = currentTarget;
    this.eventPhase = eventPhase;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.timestamp = timestamp
  };
  DeviceOrientationEvent = function(alpha, beta, gamma) {
    this.initDeviceOrientationEvent(alpha, beta, gamma)
  };
  DeviceOrientationEvent.prototype = new WDomEvent;
  DeviceOrientationEvent.prototype.constructor = DeviceOrientationEvent;
  DeviceOrientationEvent.parent = WDomEvent.prototype;
  DeviceOrientationEvent.prototype.initDeviceOrientationEvent = function(alpha, beta, gamma) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    var d = new Date;
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
    DeviceOrientationEvent.parent.initEvent.call(this, "deviceorientation", null, null, null, false, false, stamp)
  };
  Acceleration = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z
  };
  RotationRate = function(alpha, beta, gamma) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma
  };
  DeviceMotionEvent = function(acceleration, accelerationIncludingGravity, rotationRate, interval) {
    this.initDeviceMotionEvent(acceleration, accelerationIncludingGravity, rotationRate, interval)
  };
  DeviceMotionEvent.prototype = new WDomEvent;
  DeviceMotionEvent.prototype.constructor = DeviceOrientationEvent;
  DeviceMotionEvent.parent = WDomEvent.prototype;
  DeviceMotionEvent.prototype.initDeviceMotionEvent = function(acceleration, accelerationIncludingGravity, rotationRate, interval) {
    this.acceleration = acceleration;
    this.accelerationIncludingGravity = accelerationIncludingGravity;
    this.rotationRate = rotationRate;
    this.interval = interval;
    var d = new Date;
    var stamp = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
    var stamp = stamp + d.getUTCMilliseconds();
    DeviceOrientationEvent.parent.initEvent.call(this, "devicemotion", null, null, null, false, false, stamp)
  };
  function removeEventListener(type, listener, useCapture) {
    console.log("LISTENER" + listener);
    var refToBeDeleted = null;
    for(var i = 0;i < _referenceMappingDo.length;i++) {
      console.log("Reference" + i + ": " + _referenceMappingDo[i][0]);
      console.log("Handler" + i + ": " + _referenceMappingDo[i][1]);
      if(_referenceMappingDo[i][1] == listener) {
        var arguments = new Array;
        arguments[0] = _referenceMappingDo[i][0];
        arguments[1] = type;
        console.log("ListenerObject to be removed ref#" + _referenceMappingDo[i][0]);
        var rpc = webinos.rpcHandler.createRPC(this, "removeEventListener", arguments);
        webinos.rpcHandler.executeRPC(rpc, function(result) {
          callOnSuccess(result)
        }, function(error) {
          callOnError(error)
        });
        break
      }
    }
  }
  function dispatchEvent(event) {
  }
})();
(function() {
  var Context = function(obj, rpcHandler) {
    this.base = WebinosService;
    this.base(obj);
    this.rpcHandler = rpcHandler
  };
  Context.prototype = new WebinosService;
  Context.prototype.bindService = function(bindCB, serviceId) {
    this.find = find.bind(this);
    this.executeQuery = executeQuery.bind(this);
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  function find(params, successCB, errorCB) {
    var rpc = this.rpcHandler.createRPC(this, "find", params);
    this.rpcHandler.executeRPC(rpc, function(params) {
      successCB(params)
    }, function(error) {
      errorCB(error)
    })
  }
  function registerAppContextObject(APPName, ContextObjectName, ContextFields, callback) {
    var rpc = webinos.rpcHandler.createRPC(this, "registerAppContextObject", query);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      callback(params)
    }, function(error) {
      callback(error)
    })
  }
  function executeQuery(query, successCB, errorCB) {
    var rpc = this.rpcHandler.createRPC(this, "executeQuery", query);
    this.rpcHandler.executeRPC(rpc, function(params) {
      successCB(params)
    }, function(error) {
      errorCB(error)
    })
  }
  if(typeof module !== "undefined") {
    exports.Context = Context
  }else {
    webinos.Context = Context
  }
})();
(function() {
  AuthenticationModule = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  AuthenticationModule.prototype = new WebinosService;
  function authenticate(username, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "authenticate", [username]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      console.log("authenticate successCB: ", params);
      successCB(params)
    }, function(error) {
      console.log("authenticate errorCB: ", error);
      errorCB(error)
    })
  }
  function isAuthenticated(username, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "isAuthenticated", [username]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      console.log("isAuthenticated successCB: ", params);
      successCB(params)
    }, function(error) {
      console.log("isAuthenticated errorCB: ", error);
      errorCB(error)
    })
  }
  function getAuthenticationStatus(username, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "getAuthenticationStatus", [username]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      console.log("getAuthenticatationStatus successCB: ", params);
      successCB(params)
    }, function(error) {
      console.log("getAuthenticationStatus errorCB: ", error);
      errorCB(error)
    })
  }
  AuthenticationModule.prototype.bindService = function(bindCB, serviceId) {
    this.authenticate = authenticate;
    this.isAuthenticated = isAuthenticated;
    this.getAuthenticationStatus = getAuthenticationStatus;
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  }
})();
(function() {
  Contacts = function(obj) {
    this.base = WebinosService;
    this.base(obj);
    this.authenticate = authenticate;
    this.isAlreadyAuthenticated = isAlreadyAuthenticated;
    this.getAllContacts = getAllContacts;
    this.find = find
  };
  Contacts.prototype = new WebinosService;
  Contacts.prototype.bindService = function(bindCB, serviceId) {
    this.authenticate = authenticate;
    this.isAlreadyAuthenticated = isAlreadyAuthenticated;
    this.getAllContacts = getAllContacts;
    this.find = find;
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  function authenticate(attr, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "authenticate", [attr]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCB(params)
    }, function(error) {
      if(typeof errorCB !== "undefined") {
        errorCB(error)
      }
    })
  }
  function isAlreadyAuthenticated(attr, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "isAlreadyAuthenticated", [attr]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCB(params)
    }, function(error) {
      if(typeof errorCB !== "undefined") {
        errorCB(error)
      }
    })
  }
  function getAllContacts(attr, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "getAllContacts", [attr]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCB(params)
    }, function(error) {
      if(typeof errorCB !== "undefined") {
        errorCB(error)
      }
    })
  }
  function find(attr, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "find", [attr]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCB(params)
    }, function(error) {
      if(typeof errorCB !== "undefined") {
        errorCB(error)
      }
    })
  }
})();
(function() {
  var PropertyValueSuccessCallback, ErrorCallback, DeviceAPIError, PropertyRef;
  DeviceStatusManager = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  DeviceStatusManager.prototype = new WebinosService;
  DeviceStatusManager.prototype.bindService = function(bindCB, serviceId) {
    this.getComponents = getComponents;
    this.isSupported = isSupported;
    this.getPropertyValue = getPropertyValue;
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  function getComponents(aspect, successCallback, errorCallback) {
    var rpc = webinos.rpcHandler.createRPC(this, "devicestatus.getComponents", [aspect]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCallback(params)
    });
    return
  }
  function isSupported(aspect, property, successCallback) {
    var rpc = webinos.rpcHandler.createRPC(this, "devicestatus.isSupported", [aspect, property]);
    webinos.rpcHandler.executeRPC(rpc, function(res) {
      successCallback(res)
    });
    return
  }
  function getPropertyValue(successCallback, errorCallback, prop) {
    var rpc = webinos.rpcHandler.createRPC(this, "devicestatus.getPropertyValue", [prop]);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCallback(params)
    }, function(err) {
      errorCallback(err)
    });
    return
  }
  PropertyValueSuccessCallback = function() {
  };
  PropertyValueSuccessCallback.prototype.onSuccess = function(prop) {
    return
  };
  ErrorCallback = function() {
  };
  ErrorCallback.prototype.onError = function(error) {
    return
  };
  DeviceAPIError = function() {
    this.message = String;
    this.code = Number
  };
  DeviceAPIError.prototype.UNKNOWN_ERR = 0;
  DeviceAPIError.prototype.INDEX_SIZE_ERR = 1;
  DeviceAPIError.prototype.DOMSTRING_SIZE_ERR = 2;
  DeviceAPIError.prototype.HIERARCHY_REQUEST_ERR = 3;
  DeviceAPIError.prototype.WRONG_DOCUMENT_ERR = 4;
  DeviceAPIError.prototype.INVALID_CHARACTER_ERR = 5;
  DeviceAPIError.prototype.NO_DATA_ALLOWED_ERR = 6;
  DeviceAPIError.prototype.NO_MODIFICATION_ALLOWED_ERR = 7;
  DeviceAPIError.prototype.NOT_FOUND_ERR = 8;
  DeviceAPIError.prototype.NOT_SUPPORTED_ERR = 9;
  DeviceAPIError.prototype.INUSE_ATTRIBUTE_ERR = 10;
  DeviceAPIError.prototype.INVALID_STATE_ERR = 11;
  DeviceAPIError.prototype.SYNTAX_ERR = 12;
  DeviceAPIError.prototype.INVALID_MODIFICATION_ERR = 13;
  DeviceAPIError.prototype.NAMESPACE_ERR = 14;
  DeviceAPIError.prototype.INVALID_ACCESS_ERR = 15;
  DeviceAPIError.prototype.VALIDATION_ERR = 16;
  DeviceAPIError.prototype.TYPE_MISMATCH_ERR = 17;
  DeviceAPIError.prototype.SECURITY_ERR = 18;
  DeviceAPIError.prototype.NETWORK_ERR = 19;
  DeviceAPIError.prototype.ABORT_ERR = 20;
  DeviceAPIError.prototype.TIMEOUT_ERR = 21;
  DeviceAPIError.prototype.INVALID_VALUES_ERR = 22;
  DeviceAPIError.prototype.NOT_AVAILABLE_ERR = 101;
  DeviceAPIError.prototype.code = Number;
  DeviceAPIError.prototype.message = Number;
  PropertyRef = function() {
    this.component = String;
    this.aspect = String;
    this.property = String
  };
  PropertyRef.prototype.component = String;
  PropertyRef.prototype.aspect = String;
  PropertyRef.prototype.property = String
})();
(function() {
  DiscoveryModule = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  DiscoveryModule.prototype = new WebinosService;
  DiscoveryModule.prototype.BTauthenticate = function(data, success) {
    console.log("BT Authenticate");
    var rpc = webinos.rpcHandler.createRPC(this, "BTauthenticate", data);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      success(params)
    })
  };
  DiscoveryModule.prototype.BTfindservice = function(data, success) {
    console.log("BT findservice");
    var rpc = webinos.rpcHandler.createRPC(this, "BTfindservice", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      success(params)
    })
  };
  DiscoveryModule.prototype.DNSfindservice = function(data, success) {
    console.log("DNS findservice");
    var rpc = webinos.rpcHandler.createRPC(this, "DNSfindservice", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      success(params)
    })
  };
  DiscoveryModule.prototype.findHRM = function(data, success) {
    console.log("HRM find HRM");
    var rpc = webinos.rpcHandler.createRPC(this, "findHRM", data);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      success(params)
    })
  };
  DiscoveryModule.prototype.bindservice = function(data, success) {
    console.log("Linux BT bindservice");
    var rpc = webinos.rpcHandler.createRPC(this, "bindservice", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      success(params)
    })
  };
  DiscoveryModule.prototype.listfile = function(data, success) {
    console.log("Linux BT listfile");
    var rpc = webinos.rpcHandler.createRPC(this, "listfile", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      success(params)
    })
  };
  DiscoveryModule.prototype.transferfile = function(data, success) {
    console.log("Linux BT transferfile");
    var rpc = webinos.rpcHandler.createRPC(this, "transferfile", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      success(params)
    })
  }
})();
(function() {
  PaymentModule = function(obj) {
    this.base = WebinosService;
    this.base(obj)
  };
  var rpcServiceProviderID, rpcCustomerID, rpcShopID;
  PaymentModule.prototype = new WebinosService;
  PaymentModule.prototype.bindService = function(bindCB, serviceId) {
    this.listenAttr = {};
    if(typeof bindCB.onBind === "function") {
      bindCB.onBind(this)
    }
  };
  PaymentModule.prototype.createShoppingBasket = function(successCallback, errorCallback, serviceProviderID, customerID, shopID) {
    rpcServiceProviderID = serviceProviderID;
    rpcCustomerID = customerID;
    rpcShopID = shopID;
    var arguments = new Array;
    arguments[0] = rpcServiceProviderID;
    arguments[1] = rpcCustomerID;
    arguments[2] = rpcShopID;
    var self = this;
    var rpc = webinos.rpcHandler.createRPC(this, "createShoppingBasket", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      successCallback(new ShoppingBasket(self))
    }, function(error) {
      errorCallback(error)
    })
  };
  ShoppingItem = function(obj) {
    this.productID = "";
    this.description = "";
    this.currency = "EUR";
    this.itemPrice = 0;
    this.itemCount = 0;
    this.itemsPrice = 0;
    this.base = WebinosService;
    this.base(obj)
  };
  ShoppingItem.prototype.productID = "";
  ShoppingItem.prototype.description = "";
  ShoppingItem.prototype.currency = "EUR";
  ShoppingItem.prototype.itemPrice = 0;
  ShoppingItem.prototype.itemCount = 0;
  ShoppingItem.prototype.itemsPrice = 0;
  ShoppingBasket = function(obj) {
    this.items = new Array;
    this.extras = new Array;
    this.totalBill = 0;
    this.base = WebinosService;
    this.base(obj)
  };
  ShoppingBasket.prototype.items = null;
  ShoppingBasket.prototype.extras = null;
  ShoppingBasket.prototype.totalBill = 0;
  ShoppingBasket.prototype.addItem = function(successCallback, errorCallback, item) {
    var arguments = new Array;
    arguments[0] = rpcServiceProviderID;
    arguments[1] = rpcCustomerID;
    arguments[2] = rpcShopID;
    arguments[3] = this;
    arguments[4] = item;
    var self = this;
    var rpc = webinos.rpcHandler.createRPC(this, "addItem", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      self.items = params.items;
      self.extras = params.extras;
      self.totalBill = params.totalBill;
      successCallback()
    }, function(error) {
      errorCallback(error)
    })
  };
  ShoppingBasket.prototype.update = function(successCallback, errorCallback) {
    var arguments = new Array;
    arguments[0] = rpcServiceProviderID;
    arguments[1] = rpcCustomerID;
    arguments[2] = rpcShopID;
    arguments[3] = this;
    var self = this;
    var rpc = webinos.rpcHandler.createRPC(this, "update", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      self.items = params.items;
      self.extras = params.extras;
      self.totalBill = params.totalBill;
      successCallback()
    }, function(error) {
      errorCallback(error)
    })
  };
  ShoppingBasket.prototype.checkout = function(successCallback, errorCallback) {
    var arguments = new Array;
    arguments[0] = rpcServiceProviderID;
    arguments[1] = rpcCustomerID;
    arguments[2] = rpcShopID;
    arguments[3] = this;
    var self = this;
    var rpc = webinos.rpcHandler.createRPC(this, "checkout", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
      self = null;
      successCallback()
    }, function(error) {
      errorCallback(error)
    })
  };
  ShoppingBasket.prototype.release = function() {
    var arguments = new Array;
    arguments[0] = rpcServiceProviderID;
    arguments[1] = rpcCustomerID;
    arguments[2] = rpcShopID;
    arguments[3] = this;
    var self = this;
    var rpc = webinos.rpcHandler.createRPC(this, "release", arguments);
    webinos.rpcHandler.executeRPC(rpc, function(params) {
    }, function(error) {
      errorCallback(error)
    });
    self.items = null;
    self.extras = null
  }
})();

}
