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
  
  var App2AppModule = function(rpcHandler) {
    this.base = RPCWebinosService;
    this.base({
      api: 'http://webinos.org/api/app2app',
      displayName: 'App2App Messaging API',
      description: 'The App2App Messaging API for using channel-based communication between applications.'
    });

    this.defaultString = "App2App Messaging API";

    this.rpcHandler = rpcHandler;
  };

  App2AppModule.prototype = new RPCWebinosService();

  var CHANNEL_NAMESPACE_REGEXP = /^(urn:[a-z0-9][a-z0-9-]{0,31}:)([a-z0-9()+,\-.:=@;$_!*'%/?#]+)$/i;
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
  App2AppModule.prototype.registerPeer = function(params, successCallback, errorCallback, fromObjRef) {
    var peerId = params.peerId;
    if (peerId === 'undefined' || registeredPeers.hasOwnProperty(peerId)) {
      errorCallback(respondWith("Could not register peer: missing id or already registered."));
    } else {
      console.log("Register peer with id " + peerId);
      registeredPeers[peerId] = fromObjRef;
      successCallback();
    }
  };

  App2AppModule.prototype.unregisterPeer = function(params, successCallback, errorCallback, fromObjRef) {
    var peerId = params.peerId;
    if (typeof peerId === 'undefined') {
      errorCallback(respondWith("Could not unregister peer: missing id."));
    } else {
      if (registeredPeers.hasOwnProperty(peerId)) {
        console.log("Unregister peer with id " + peerId);

        Object.keys(registeredChannels).forEach(function(channel) {
          if (channel.creator.peerId === peerId) {
            // remove all channels where the creator runs on the peer to unregister
            delete registeredChannels[channel.namespace];
          } else {
            // for all other channels, remove all clients which run on the peer to unregister
            channel.clients = channel.clients.filter(function(client) {
              return client.peerId !== peerId;
            });
          }
        });

        delete registeredPeers[peerId];
      }
      successCallback();
    }
  };

  App2AppModule.prototype.createChannel = function(params, successCallback, errorCallback, fromObjRef) {
    var peerId = params.peerId;
    var namespace = params.namespace;
    var properties = params.properties;
    var appInfo = params.appInfo;

    // first check if the peer is known to us
    if ( ! registeredPeers.hasOwnProperty(peerId)) {
      errorCallback(respondWith("Peer with id " + peerId + " is not registered."));
      return;
    }

    if (registeredChannels.hasOwnProperty(namespace)) {
      errorCallback(respondWith("Channel already exists."));
      return;
    }

    console.log("Create channel with namespace " + namespace);

    var client = {};
    client.peerId = peerId;
    client.proxyId = generateIdentifier();

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

  App2AppModule.prototype.searchForChannels = function(params, successCallback, errorCallback) {
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

  App2AppModule.prototype.connectToChannel = function(params, successCallback, errorCallback, fromObjRef) {
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

    var peerRef = registeredPeers[connectRequest.from.peerId];

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
  };

  App2AppModule.prototype.sendToChannel = function(params, successCallback, errorCallback) {
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

  App2AppModule.prototype.disconnectFromChannel = function(params, successCallback, errorCallback) {
    var from = params.from;
    var namespace = params.namespace;

    if (registeredChannels.hasOwnProperty(namespace)) {
      var channel = registeredChannels[namespace];

      if (equalsClient(from)(channel.creator)) {
        // if creator disconnects, remove channel
        delete registeredChannels[namespace];
      } else {
        // otherwise just remove client from channel list
        channel.clients = channel.clients.filter(notEqualsClient(from));
      }

      successCallback();
    } else {
      errorCallback(respondWith("Channel with namespace " + namespace + " not found."));
    }
  };

  /* Helpers */

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

  exports.Service=App2AppModule;
})();
