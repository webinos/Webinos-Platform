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
  App2AppModule = function (params) {
    this.base = WebinosService;
    this.base(params);

    this.peerId = webinos.messageHandler.getOwnId();
    module = this;
  };

  App2AppModule.prototype = new WebinosService();

  App2AppModule.prototype.bindService = function (bindCallback) {
    this.createChannel = createChannel;
    this.searchForChannels = searchForChannels;

    registerPeer(
      function (success) {
        console.log("Bind succeeded: registered peer.");
        if (typeof bindCallback.onBind === 'function') {
          bindCallback.onBind(this);
        }
      },
      function (error) {
        console.log("Bind failed: could not register peer: " + error.message);
      }
    );
  };

  App2AppModule.prototype.unbindService = function (successCallback, errorCallback) {
    var params = {};
    params.peerId = module.peerId;

    var rpc = webinos.rpcHandler.createRPC(module, "unregisterPeer", params);

    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback(success);
      },
      function (error) {
        errorCallback(error);
      }
    );
  };

  /* Administration */

  var CHANNEL_NAMESPACE_REGEXP = /^urn:[a-z0-9][a-z0-9-]{0,31}:[a-z0-9()+,\-.:=@;$_!*'%/?#]+$/i;
  var CHANNEL_SEARCH_TIMEOUT = 5000;

  var MODE_SEND_RECEIVE = "send-receive";
  var MODE_RECEIVE_ONLY = "receive-only";

  var module;
  var requestCallbacks = {};
  var messageCallbacks = {};
  var searchCallbacks = {};

  /* Initialisation helpers */

  function registerPeer(successCallback, errorCallback) {
    var params = {};
    params.peerId = module.peerId;

    var rpc = webinos.rpcHandler.createRPC(module, "registerPeer", params);

    // setup callback dispatcher for incoming channel connect requests
    rpc.handleConnectRequest = function (connectRequest, requestSuccessCallback, requestErrorCallback) {
      dispatchConnectRequest(connectRequest, requestSuccessCallback, requestErrorCallback);
    };

    // setup callback dispatcher for incoming channel messages
    rpc.handleChannelMessage = function (channelMessage, messageSuccessCallback, messageErrorCallback) {
      dispatchChannelMessage(channelMessage, messageSuccessCallback, messageErrorCallback);
    };

    // setup callback dispatcher for incoming search results
    rpc.handleChannelSearchResult = function (searchResult, searchSuccessCallback, searchErrorCallback) {
      dispatchChannelSearchResult(searchResult, searchSuccessCallback, searchErrorCallback);
    };

    webinos.rpcHandler.registerCallbackObject(rpc);

    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback(success);
      },
      function (error) {
        errorCallback(error);
      }
    );
  }

  /* Local callback dispatchers */

  function dispatchConnectRequest(connectRequest, successCallback, errorCallback) {
    console.log("Received channel request from proxy " + connectRequest.from.proxyId);
    if (requestCallbacks.hasOwnProperty(connectRequest.namespace)) {
      var requestCallback = requestCallbacks[connectRequest.namespace];
      var isAllowed = requestCallback(connectRequest);

      if (isAllowed) {
        successCallback();
      } else {
        errorCallback(respondWith("Channel creator rejected connect request."));
      }
    } else {
      errorCallback(respondWith("No request callback found for namespace " + connectRequest.namespace));
    }
  }

  function dispatchChannelMessage(channelMessage, successCallback, errorCallback) {
    console.log("Received channel message from proxy " + channelMessage.from.proxyId);

    if (messageCallbacks.hasOwnProperty(channelMessage.to.proxyId)) {
      var messageCallback = messageCallbacks[channelMessage.to.proxyId];
      messageCallback(channelMessage);
      successCallback();
    } else {
      errorCallback(respondWith("No message callback found for namespace " + channelMessage.namespace));
    }
  }

  function dispatchChannelSearchResult(searchResult, successCallback, errorCallback) {
    var channel = searchResult.channel;
    var proxyId = searchResult.proxyId;

    console.log("Received channel search result with namespace " + channel.namespace);
    if (searchCallbacks.hasOwnProperty(module.peerId)) {
      var callback = searchCallbacks[module.peerId];
      callback(new ChannelProxy(channel, proxyId));
      successCallback();
    } else {
      errorCallback(respondWith("No search result callback found for namespace " + searchResult.namespace));
    }
  }

  /* Public API functions */

  /**
   * Create a new channel. The configuration object should contain "namespace", "properties" and optionally "appInfo".
   * Namespace is a valid URN which uniquely identifies the channel in the personal zone. Properties currently contain
   * a "mode" of either "send-receive" or "receive-only". The "send-receive" mode allows both the channel creator
   * and connected clients to send and receive, while "receive-only" only allows the channel creator to send. appInfo
   * allows a channel creator to attach application-specific information to a channel.
   *
   * The channel creator decides which clients are allowed to connect to the channel. For each client which wants to
   * connect to the channel the requestCallback is invoked which should return true (if allowed to connect) or false.
   *
   * @param configuration Channel configuration.
   * @param requestCallback Callback invoked to allow or deny clients access to a channel.
   * @param messageCallback Callback invoked to receive messages.
   * @param successCallback Callback invoked when channel creation was successful.
   * @param errorCallback Callback invoked when channel creation failed.
   */
  function createChannel(configuration, requestCallback, messageCallback, successCallback, errorCallback) {

    // sanity checks

    if (typeof errorCallback !== "function") errorCallback = function() {};

    if (typeof successCallback !== "function") {
      errorCallback(respondWith("Invalid success callback to return the channel proxy."));
      return;
    }

    if (typeof configuration === "undefined") {
      errorCallback(respondWith("Missing configuration."));
      return;
    }

    if ( ! CHANNEL_NAMESPACE_REGEXP.test(configuration.namespace)) {
      errorCallback(respondWith("Namespace is not a valid URN."));
      return;
    }

    if ( ! configuration.hasOwnProperty("properties")) {
      errorCallback(respondWith("Missing properties in configuration."));
      return;
    }

    if ( ! configuration.properties.hasOwnProperty("mode")) {
      errorCallback(respondWith("Missing channel mode in configuration."));
      return;
    }

    if (configuration.properties.mode !== MODE_SEND_RECEIVE && configuration.properties.mode !== MODE_RECEIVE_ONLY) {
      errorCallback(respondWith("Unsupported channel mode."));
      return;
    }

    if (typeof requestCallback !== "function") {
      errorCallback(respondWith("Invalid request callback."));
      return;
    }

    if (typeof messageCallback !== "function") {
      errorCallback(respondWith("Invalid message callback."));
      return;
    }

    var params = {};
    params.peerId = module.peerId;
    params.namespace = configuration.namespace;
    params.properties = configuration.properties;
    params.appInfo = configuration.appInfo;

    var rpc = webinos.rpcHandler.createRPC(module, "createChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function(channel) {
        requestCallbacks[channel.namespace] = requestCallback;
        messageCallbacks[channel.creator.proxyId] = messageCallback;
        successCallback(new ChannelProxy(channel, channel.creator.proxyId));
      },
      function(error) {
        console.log("Could not create channel: " + error.message);
        errorCallback(error);
      }
    );
  }

  /**
   * Search for channels with given namespace, within its own personal zone. It returns a proxy to a found
   * channel through the searchCallback function. Only a single search can be active on a peer at the same time,
   * and a search automatically times out after 5 seconds.
   *
   * @param namespace A valid URN of the channel to be found (see RFC2141). If the NSS is a wildcard ("*")
   *  all channels with the same NID are returned.
   * @param zoneIds Not implemented yet.
   * @param searchCallback Callback function invoked for each channel that is found. A proxy to the channel is
   *  provided as an argument. The proxy is not yet connected to the actual channel; to use it one first has to call
   *  its connect method.
   * @param successCallback Callback invoked when the search is accepted for processing.
   * @param errorCallback Callback invoked when search query could not be processed.
   */
  function searchForChannels(namespace, zoneIds, searchCallback, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if ( ! CHANNEL_NAMESPACE_REGEXP.test(namespace)) {
      errorCallback(respondWith("Namespace is not a valid URN."));
      return;
    }

    if (typeof searchCallback !== "function") {
      errorCallback(respondWith("Invalid search callback."));
      return;
    }

    var params = {};
    params.peerId = module.peerId;
    params.namespace = namespace;
    params.zoneIds = zoneIds;

    // we only allow a single search at a time
    if (searchCallbacks.hasOwnProperty(module.peerId)) {
      console.log("There is already a search in progress.");
      return;
    }

    // set current search callback
    searchCallbacks[module.peerId] = searchCallback;

    var timeoutId = setTimeout(function() {
      console.log("Hit channel search timeout, remove callback");
      delete searchCallbacks[module.peerId];
    }, CHANNEL_SEARCH_TIMEOUT);

    var rpc = webinos.rpcHandler.createRPC(module, "searchForChannels", params);
    webinos.rpcHandler.executeRPC(rpc,
      function(success) {
        successCallback(success);
      },
      function(error) {
        console.log("Could not search for channels: " + error.message);
        errorCallback(error);
      }
    );

    var pendingOperation = {};
    pendingOperation.cancel = function() {
      if (searchCallbacks[module.peerId] === searchCallback) {
        clearTimeout(timeoutId);
        delete searchCallbacks[module.peerId];
      }
    };

    return pendingOperation;

  }

  /* Channel proxy implementation */

  function ChannelProxy(channel, proxyId) {
    this.client = {};
    this.client.peerId = module.peerId;
    this.client.proxyId = proxyId;

    this.creator = channel.creator;
    this.namespace = channel.namespace;
    this.properties = channel.properties;
    this.appInfo = channel.appInfo;
  }

  /**
   * Connect to the channel. The connect request is forwarded to the channel creator, which decides if a client
   * is allowed to connect. The client can provide application-specific info with the request through the
   * requestInfo parameter.
   *
   * @param requestInfo Application-specific information to include in the request.
   * @param messageCallback Callback invoked when a message is received on the channel (only after successful connect).
   * @param successCallback Callback invoked if the client is successfully connected to the channel (i.e. if authorized)
   * @param errorCallback Callback invoked if the client could not be connected to the channel.
   */
  ChannelProxy.prototype.connect = function (requestInfo, messageCallback, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if (typeof messageCallback !== "function") {
      errorCallback(respondWith("Invalid message callback."));
      return;
    }

    var params = {};
    params.from = this.client;
    params.requestInfo = requestInfo;
    params.namespace = this.namespace;

    var rpc = webinos.rpcHandler.createRPC(module, "connectToChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (client) {
        messageCallbacks[client.proxyId] = messageCallback;
        successCallback();
      },
      function (error) {
        console.log("Could not search for channels: " + error.message);
        errorCallback(error);
      }
    );
  };

  /**
   * Send a message to all connected clients on the channel.
   *
   * @param message The message to be send.
   * @param successCallback Callback invoked when the message is accepted for processing.
   * @param errorCallback Callback invoked if the message could not be processed.
   */
  ChannelProxy.prototype.send = function (message, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if (typeof message === "undefined") {
      errorCallback(respondWith("Invalid message."));
      return;
    }

    var params = {};
    params.from = this.client;
    params.namespace = this.namespace;
    params.clientMessage = message;

    var rpc = webinos.rpcHandler.createRPC(module, "sendToChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback();
      },
      function (error) {
        console.log("Could not send to channel: " + error.message);
        errorCallback(error);
      }
    );
  };

  /**
   * Send to a specific client only. The client object of the channel creator is a property of the channel proxy. The
   * App2App Messaging API does not include a discovery mechanism for clients. A channel creator obtains the client
   * objects for each client through its connectRequestCallback, and if needed the channel creator can implement
   * an application-specific lookup service to other clients. A client object only has meaning within the scope of its
   * channel, not across channels. Note that the client object of a message sender can also be found in the "from"
   * property of the message.
   *
   * @param client The client object of the client to send the message to.
   * @param message The message to be send.
   * @param successCallback Callback invoked when the message is accepted for processing.
   * @param errorCallback Callback invoked if the message could not be processed.
   */
  ChannelProxy.prototype.sendTo = function (client, message, successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    if ( ! isValidClient(client)) {
      errorCallback(respondWith("Invalid client."));
      return;
    }

    if (typeof message === "undefined") {
      errorCallback(respondWith("Invalid message."));
      return;
    }

    var params = {};
    params.from = this.client;
    params.to = client;
    params.namespace = this.namespace;
    params.clientMessage = message;

    var rpc = webinos.rpcHandler.createRPC(module, "sendToChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback();
      },
      function (error) {
        console.log("Could not send to channel: " + error.message);
        errorCallback(error);
      }
    );
  };

  /**
   * Disconnect from the channel. After disconnecting the client does no longer receive messages from the channel.
   * If the channel creator disconnects, the channel is closed and is no longer available. The service
   * does not inform connected clients of the disconnect or closing. If needed the client can send an
   * application-specific message to inform other clients before disconnecting.
   *
   * @param successCallback Callback invoked when the disconnect request is accepted for processing.
   * @param errorCallback Callback invoked if the disconnect request could not be processed.
   */
  ChannelProxy.prototype.disconnect = function (successCallback, errorCallback) {

    // sanity checks

    if (typeof successCallback !== "function") successCallback = function() {};
    if (typeof errorCallback !== "function") errorCallback = function() {};

    var params = {};
    params.from = this.client;
    params.namespace = this.namespace;

    var rpc = webinos.rpcHandler.createRPC(module, "disconnectFromChannel", params);
    webinos.rpcHandler.executeRPC(rpc,
      function (success) {
        successCallback();
      },
      function (error) {
        console.log("Could not disconnect from channel: " + error.message);
        errorCallback(error);
      }
    );
  };

  /* Helpers */

  function isValidClient(client) {
    return typeof client !== "undefined" &&
      client.hasOwnProperty("peerId") &&
      client.hasOwnProperty("proxyId");
  }

  function respondWith(message) {
    return {
      message: message
    };
  }

}());
