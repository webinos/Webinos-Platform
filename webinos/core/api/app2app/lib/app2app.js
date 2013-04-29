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
 * Copyright 2012 Fabian Walraven, TNO
 ******************************************************************************/

(function() {
  var RPCWebinosService = require('webinos-jsonrpc2').RPCWebinosService;

  var App2AppModule = function(rpcHandler, params) {
    this.rpcHandler = rpcHandler;
    this.params = params;
  };
  
  App2AppModule.prototype.init = function (register, unregister) {
    var service = new App2AppService(this.rpcHandler, this.params);
    if (isPzh(this.params)) {
      // always register service for pzh
      register(service);
    } else {
      this.rpcHandler.parent.addStateListener({
        setHubConnected: function(isConnected) {
          if (isConnected) {
            unregister(service);
          } else {
            // only register service for pzp when pzh is not connected
            register(service);
          }
        }
      });
    }
  };

  var App2AppService = function(rpcHandler, params) {
    this.base = RPCWebinosService;
    this.base({
      api: 'http://webinos.org/api/app2app',
      displayName: 'App2App Messaging API',
      description: 'The App2App Messaging API for using channel-based communication between applications.'
    });

    this.rpcHandler = rpcHandler;
  };

  App2AppService.prototype = new RPCWebinosService();

  var CHANNEL_NAMESPACE_REGEXP = /^(urn:[a-z0-9][a-z0-9\-]{0,31}:)([a-z0-9()+,\-.:=@;$_!*'%/?#]+)$/i;
  var CHANNEL_NAMESPACE_WILDCARD = "*";

  var MODE_SEND_RECEIVE = "send-receive";
  var MODE_RECEIVE_ONLY = "receive-only";

  var registeredPeers = {};
  var registeredChannels = {};

  /**
   * Register new peer which is allowed to participate in the app2app system. Typically the peer represents
   * a web runtime, which (de)multiplexes callback invocations (e.g., channel requests, messages, search results)
   * to channel clients.
   */
  App2AppService.prototype.registerPeer = function(params, successCallback, errorCallback, fromObjRef) {
    var peerId = params.peerId;
    if (peerId === 'undefined' || registeredPeers.hasOwnProperty(peerId)) {
      errorCallback(respondWith("Could not register peer: missing id or already registered."));
    } else {
      console.log("Register peer with id " + peerId);
      registeredPeers[peerId] = fromObjRef;
      successCallback();
    }
  };

  App2AppService.prototype.unregisterPeer = function(params, successCallback, errorCallback, fromObjRef) {
    var peerId = params.peerId;
    if (typeof peerId === 'undefined') {
      errorCallback(respondWith("Could not unregister peer: missing id."));
    } else {
      if (registeredPeers.hasOwnProperty(peerId)) {
        console.log("Unregister peer with id " + peerId);

        Object.keys(registeredChannels).forEach(function(namespace) {
          var channel = registeredChannels[namespace];

          channel.clients = channel.clients.filter(function(client) {
            return client.peerId !== peerId;
          });

          if (channel.clients.length === 0) {
            console.log("All channel clients on the same unregistered peer; remove channel");
            delete registeredChannels[channel.namespace];
          } else {
            if (channel.creator.peerId === peerId) {
              // the channel creator is on the peer that is being unregistered
              if (channel.creator.canDetach) {
                console.log("Channel creator is on unregistered peer but can detach; keep channel");
                detachCreator(channel.creator);
              } else {
                console.log("Channel creator is on unregistered peer and can not detach; remove channel");
                delete registeredChannels[channel.namespace];
              }
            }
          }
        });

        delete registeredPeers[peerId];
      }
      successCallback();
    }
  };

  App2AppService.prototype.createChannel = function(params, successCallback, errorCallback, fromObjRef) {
    var peerId = params.peerId;
    var sessionId = params.sessionId;
    var namespace = params.namespace;
    var properties = params.properties;
    var appInfo = params.appInfo;
    var hasRequestCallback = params.hasRequestCallback;
    var reclaimIfExists = (properties.reclaimIfExists === true);

    // first check if the peer is known to us
    if ( ! registeredPeers.hasOwnProperty(peerId)) {
      errorCallback(respondWith("Peer with id " + peerId + " is not registered."));
      return;
    }

    var client = {};
    client.peerId = peerId;
    client.sessionId = sessionId;
    client.hasRequestCallback = hasRequestCallback;
    client.canDetach = (properties.canDetach === true);
    client.proxyId = generateIdentifier();

    if (registeredChannels.hasOwnProperty(namespace)) {
      // channel already exists; check if request is from the same session; if yes assume reconnect
      var existingChannel = registeredChannels[namespace];
      var mysessionId = sessionId.split("//");
        mysessionId[mysessionId.length-1] = mysessionId[mysessionId.length-1].split("_")[0];
        mysessionId = mysessionId.join("//");
        var mycreatorid = existingChannel.creator.sessionId.split("//");
        mycreatorid[mycreatorid.length-1] = mycreatorid[mycreatorid.length-1].split("_")[0];
        mycreatorid = mycreatorid.join("//");

//      if (sessionId === existingChannel.creator.sessionId && reclaimIfExists) {
      if (mysessionId === mycreatorid && reclaimIfExists) {
        console.log("Reconnecting channel creator to channel with namespace " + namespace);

        // refresh client bindings, but keep existing configuration
        existingChannel.clients = existingChannel.clients.filter(notEqualsClient(existingChannel.creator));
        existingChannel.creator = client;
        existingChannel.clients.push(client);

        successCallback(existingChannel);
        return;

      } else {
        errorCallback(respondWith("Channel already exists."));
        return;
      }
    }

    console.log("Create channel with namespace " + namespace);

    var channel = {
      creator: client,
      namespace: namespace,
      properties: properties,
      appInfo: appInfo,
      clients: [client]
    };

    registeredChannels[namespace] = channel;
    successCallback(channel);
  };

  App2AppService.prototype.searchForChannels = function(params, successCallback, errorCallback) {
    var peerId = params.peerId;
    var namespace = params.namespace;
    var zoneIds = params.zoneIds;

    console.log("Search for channels with namespace " + namespace);

    if (registeredPeers.hasOwnProperty(peerId)) {
      successCallback();
    } else {
      errorCallback(respondWith("Peer is not registered."));
      return;
    }

    var match = CHANNEL_NAMESPACE_REGEXP.exec(namespace);
    if (match === null) {
      errorCallback(respondWith("Namespace is not a valid URN."));
      return;
    }

    var prefix = match[1], postfix = match[2];
    var namespaceFilter;
    if (postfix === CHANNEL_NAMESPACE_WILDCARD) {
      // when using a search wildcard, match namespace prefix only
      namespaceFilter = matchesPrefix(prefix);
    } else {
      // otherwise match complete namespace
      namespaceFilter = matches(namespace);
    }

    var peerRef = registeredPeers[peerId];

    Object.keys(registeredChannels).filter(namespaceFilter).forEach(function(matchingNamespace) {
      var searchResult = {};
      searchResult.channel = registeredChannels[matchingNamespace];
      searchResult.proxyId = generateIdentifier();

      var rpc = this.rpcHandler.createRPC(peerRef, "handleChannelSearchResult", searchResult);
      this.rpcHandler.executeRPC(rpc,
        function(success) {
          console.log("Successfully sent found channel with namespace " + searchResult.channel.namespace +
            " matching search query " + namespace);
        },
        function(error) {
          console.log("Could not send a search result for " + namespace);
        }
      );
    }, this);

  };

  App2AppService.prototype.connectToChannel = function(params, successCallback, errorCallback, fromObjRef) {
    var connectRequest = {};
    connectRequest.from = params.from;
    connectRequest.namespace = params.namespace;
    connectRequest.requestInfo = params.requestInfo;

    if ( ! registeredPeers.hasOwnProperty(connectRequest.from.peerId)) {
      errorCallback(respondWith("No registered peer found."));
      return;
    }

    if ( ! registeredChannels.hasOwnProperty(connectRequest.namespace)) {
      errorCallback(respondWith("Channel with namespace " + connectRequest.namespace + " not found."));
      return;
    }

    var channel = registeredChannels[connectRequest.namespace];
    var clients = channel.clients;

    if (clients.some(equalsClient(connectRequest.from))) {
      errorCallback(respondWith("Client already connected to channel."));
      return;
    }

      //ABOT HACK
    // send connect request to channel creator, if callback is provided
    if (false){//channel.creator.hasRequestCallback) {
      var peerRef = registeredPeers[channel.creator.peerId];

      var rpc = this.rpcHandler.createRPC(peerRef, "handleConnectRequest", connectRequest);
      this.rpcHandler.executeRPC(rpc,
        function(success) {
          registeredChannels[connectRequest.namespace].clients.push(connectRequest.from);
          successCallback(connectRequest.from);
        },
        function(error) {
          errorCallback(error);
        }
      );
    } else {
      // no request callback provided; allow access by default
      registeredChannels[connectRequest.namespace].clients.push(connectRequest.from);
      successCallback(connectRequest.from);
    }
  };

  App2AppService.prototype.sendToChannel = function(params, successCallback, errorCallback) {
    var from = params.from;
    var to = params.to;
    var namespace = params.namespace;
    var clientMessage = params.clientMessage;

    if ( ! registeredPeers.hasOwnProperty(from.peerId)) {
      errorCallback(respondWith("No registered peer found."));
      return;
    }

    if (registeredChannels.hasOwnProperty(namespace)) {
      successCallback();
    } else {
      errorCallback(respondWith("Destination channel with namespace " + namespace + " not found."));
      return;
    }

    var channel = registeredChannels[namespace];

    // check if client is connected
    if (channel.clients.every(notEqualsClient(from))) {
      errorCallback(respondWith("Not connected to channel."));
      return;
    }

    // check if client can send (only creator can send on receive-only channel)
    if (channel.properties.mode === MODE_RECEIVE_ONLY && notEqualsClient(from)(channel.creator)) {
      errorCallback(respondWith("Not allowed to send on channel."));
      return;
    }

    // check if we should broadcast or unicast
    var toClients = (typeof to === "undefined" ? channel.clients : [to]);

    console.log("Sending on channel " + namespace + " which has " + channel.clients.length + " connected clients (including the channel creator, if connected)");

    // all ok; send to connected clients
    toClients.forEach(function(toClient) {

      if (notEqualsClient(from)(toClient)) { // do not send to self
        var message = {};
        message.from = from;
        message.to = toClient;
        message.namespace = namespace;
        message.contents = clientMessage;

        var toPeer = registeredPeers[toClient.peerId];

        var rpc = this.rpcHandler.createRPC(toPeer, "handleChannelMessage", message);
        this.rpcHandler.executeRPC(rpc,
          function(success) {
            console.log("Successfully sent message for " + namespace + " to client on peer " +
              toClient.peerId);
          },
          function(error) {
            console.log("Could not send message to client on peer " + toClient.peerId + ": " + error.message);
          }
        );
      }
    }, this);

  };

  App2AppService.prototype.disconnectFromChannel = function(params, successCallback, errorCallback) {
    var from = params.from;
    var namespace = params.namespace;

    if (registeredChannels.hasOwnProperty(namespace)) {
      var channel = registeredChannels[namespace];

      channel.clients = channel.clients.filter(notEqualsClient(from));

      if (channel.clients.length === 0) {
        delete registeredChannels[namespace];
      } else if (equalsClient(from)(channel.creator)) {
        if (channel.creator.canDetach) {
          detachCreator(channel.creator);
        } else {
          // if creator disconnects, remove channel
          delete registeredChannels[namespace];
        }
      }
      successCallback();
    } else {
      errorCallback(respondWith("Channel with namespace " + namespace + " not found."));
    }
  };

  /* Helpers */

  function detachCreator(creator) {
    creator.peerId = "";
    creator.hasRequestCallback = false;
    creator.canDetach = true;
    creator.proxyId = "";
    // we keep the sessionId to allow reconnects
  }

  function isPzh(serviceParams) {
    return (typeof serviceParams !== "undefined" && serviceParams.scope === "pzh");
  }

  function equalsClient(client1) {
    return function(client2) {
      return client1.peerId === client2.peerId &&
        client1.proxyId === client2.proxyId;
    }
  }

  function notEqualsClient(client1) {
    return function(client2) {
      return ! equalsClient(client1)(client2);
    }
  }

  function matchesPrefix(prefix) {
    return function(s) {
      return (typeof s === "string") && s.indexOf(prefix) === 0;
    }
  }

  function matches(some) {
    return function(that) {
      return that === some;
    }
  }

  function respondWith(message) {
    return {
      message: message
    };
  }

  function generateIdentifier() {
    function s4() {
      return ((1 + Math.random()) * 0x10000|0).toString(16).substr(1);
    }
    return s4() + s4() + s4();
  }

  exports.Module=App2AppModule;
})();
