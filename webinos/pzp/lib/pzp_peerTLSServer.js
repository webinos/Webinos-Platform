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
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/

/**
* @description: Handles connection with other PZP and starts PZP
*/
var tls   = require("tls");
var session = require("./session");
var logs    = session.common.debug;
var global  = session.configuration;

var PzpServer = function() {
    
}

PzpServer.prototype.startServer = function (parent, callback) {
  session.configuration.fetchKey(parent.config.own.key_id, function(key) {
    // Read server configuration for creating TLS connection
    var certConfig = {
      key: key,
      cert: parent.config.own.cert,
      ca: parent.config.master.cert,
      crl: parent.config.master.crl,
      requestCert: true,
      rejectUnauthorized: true
    };

    var server = tls.createServer(certConfig, function (conn) {
      var cn, clientSessionId;
      /* If connection is authorized:
      * SessionId is generated for PZP. Currently it is PZH"s name and
      * PZP"s CommonName and is stored in form of PZH/PZP.
      * registerClient of message manager is called to store PZP as client of PZH
      * Connected_client list is sent to connected PZP. Message sent is with payload
      * of form {status:"Auth", message:parent.connected_client} and type as prop.
      */
      if (conn.authorized) {
        var text = decodeURIComponent(conn.getPeerCertificate().subject.CN);
        var cn = text.split(":")[1];

        clientSessionId = parent.config.pzhId + "/"+ cn; //parent.pzhId + "/" +cn;
        logs("INFO", "[PZP Server-"+ parent.sessionId+"] Server: Client Authenticated " + clientSessionId) ;

        if (parent.mode === global.modes[1]) {
          parent.mode = global.modes[3];
        } else {
          parent.mode = global.modes[2];
        }

        parent.state = global.states[2];

        parent.connectedPzp[clientSessionId].socket = conn;
        parent.connectedPzp[clientSessionId].state  = global.states[2];

        var msg = parent.messageHandler.registerSender(parent.sessionId, clientSessionId);
        parent.sendMessage(msg, clientSessionId);

      } 

      conn.on("data", function (data) {
        try{
            session.common.processedMsg(parent, data, function(data2) {
              for (var j = 1 ; j < (data2.length-1); j += 1 ) {
                if (data2[j] === "") {
                  continue;
                }
                var parse = JSON.parse(data2[j]);

                if(parse.type === "prop" && parse.payload.status === "findServices") {
                  logs(parent.sessionId, "INFO", "[PZP Server-"+ parent.sessionId+"] Trying to send Webinos Services from this RPC handler to " + parse.from + "...");
                  var services = parent.rpcHandler.getAllServices(parse.from);
                  var msg = {"type":"prop", "from":parent.sessionId, "to":parse.from, "payload":{"status":"foundServices", "message":services}};
                  msg.payload.id = parse.payload.message.id;
                  parent.sendMessage(msg, parse.from);
                  logs("INFO", "[PZP Server-"+ parent.sessionId+"] Sent " + (services && services.length) || 0 + " Webinos Services from this RPC handler.");
                }
                else if (parse.type === "prop" && parse.payload.status === "pzpDetails") {
                  if(parent.connectedPzp[parse.from]) {
                    parent.connectedPzp[parse.from].port = parse.payload.message;
                  } else {
                    logs(2, "[PZP Server-"+ parent.sessionId+"] Server: Received PZP"+
                      "details from entity which is not registered : " + parse.from);
                  }
                } else {
                  parent.messageHandler.onMessageReceived( parse, parse.to);
                }
              }
          });
        } catch(err) {
          logs(1, "[PZP Server-"+ parent.sessionId+"]Server: Exception" + err);
        }
      });

      conn.on("end", function () {
        logs("INFO", "[PZP Server-" + parent.sessionId + "] connection end");
        var status = true;
        for (var key in self.connectedPzp) {
          if (parent.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }

        if(status) {// No pzp is connected directly
          if (parent.mode === global.modes[3]) {
            parent.mode = global.modes[1];
          } else if (parent.mode === global.modes[2]) {
            parent.state = global.states[0];
          }
        } 
        
        for (var key in parent.connectedPzp) {
          if (parent.connectedPzp[key].socket === conn){
            parent.connectedPzp[key].state = global.states[0];
          }
        }  
      });

      // It calls removeClient to remove PZP from connected_client and connectedPzp.
      conn.on("close", function() {
        logs("ERROR", "[PZP Server-" + parent.sessionId + "] socket closed");
      });

      conn.on("error", function(err) {
        parent.connectedPzp[self.peerSessionId].state = global.states[3];
        var status = true;

        for (var key in self.connectedPzp) {
          if (parent.connectedPzp[key].state === global.states[2]) {
            status = false;
            break;
          }
        }

        if(status) {// No pzp is connected directly
          if (parent.mode === global.modes[3]) {
            parent.mode = global.modes[1];
          } else if (parent.mode === global.modes[2]) {
            parent.state = global.states[0];
          }
        } 

        for (var key in parent.connectedPzp) {
          if (parent.connectedPzp[key].socket === conn){
            parent.connectedPzp[key].state = global.states[0];
          }
        }

        logs("ERROR", "[PZP Server-" + parent.sessionId + "] " + err);
      });
    });

    server.on("error", function (err) {
      if (err.code === "EADDRINUSE") {
        logs("INFO", "[PZP Server-" + parent.sessionId + "]  Address in use");
        session.configuration.pzpServerPort = parseInt(session.configuration.pzpServerPort, 10) + 1;
        server.listen(session.configuration.pzpServerPort, parent.pzpAddress);
      }
    });

    server.on("listening", function () {
      logs("INFO", "[PZP Server-" + parent.sessionId + "] listening as server on port :" + session.configuration.pzpServerPort + " address : "+ parent.pzpAddress);
      callback.call(parent, "started");
    });

    server.listen(session.configuration.pzpServerPort, parent.pzpAddress);
  });
};

module.exports = PzpServer;
