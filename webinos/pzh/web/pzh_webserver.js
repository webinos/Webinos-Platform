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
********************************************************************************/

var pzhWebInterface = exports;

var https    = require('https');
var url      = require('url');
var querystr = require('querystring');
var path     = require('path');
var fs       = require('fs');
var crypto    = require('crypto');

var webinos = require('webinos')(__dirname);
var session = webinos.global.require(webinos.global.pzp.location, 'lib/session');
var log     = new session.common.debug("pzh_webserver");

var pzhapis = require('../lib/pzh_internal_apis');
var farm    = require('../lib/pzh_farm');
var openid  = require('./pzh_openid.js');

var storeInfo = [];

function receiveCertificate(instance, payload) {
  // TODO: Do not just add perform some security check
  if (typeof instance !== "undefined" && typeof payload !== "undefined" &&
    payload.name && payload.cert && payload.crl && instance.options.ca &&
    instance.options.crl && instance.config && instance.config.otherCert[payload.name]) {
    instance.config.otherCert[payload.name] = { cert: payload.cert, crl: payload.crl};
    instance.options.ca.push(instance.config.otherCert[payload.name].cert);
    instance.options.crl.push(instance.config.otherCert[payload.name].crl);
    farm.server._contexts.some(function(elem) {
      if (instance.config.serverName.match(elem[0]) !== null) {
        elem[1] =  crypto.createCredentials(instance.options).context;
      }
    });
    session.configuration.storeConfig(instance.config, function() {
      log.info("stored certificates of other pzh");
    });
  } else{
    log.error("missing information in the certificate receive message");
  }

};

// Create HTTPS Server
pzhWebInterface.start = function(hostname, resolvedAddress, callback) {
  if (typeof hostname === "undefined" || typeof resolvedAddress === "undefined" || typeof callback !== "function" ){
    log.error("failed starting PZH web server, invalid parameters");
    callback("failed");
  } else {
    createWebInterfaceCertificate(farm.config, function(webServer){
      var server = https.createServer(webServer, function(req, res){
        req.on('data', function(data){
          var query = JSON.parse(data.toString());
          switch(query.cmd) {
            case "login":
              var filename = path.join(__dirname, "index.html");
              fs.readFile(filename, "binary", function(err, file) {
                if(err) {
                  res.writeHeader(500, {"Content-Type": "text/plain"});
                  res.write(err + "\n");
                  res.end();
                  return;
                }
                res.writeHeader(200, getContentType(filename));
                var msg = {"type" : "prop",
                  "to"   : query.id,
                  "payload":{"status":query.cmd,
                            "message":file}};
                res.write(JSON.stringify(msg));
                res.end();
              });
              break;
            case "sendCert":
              if (farm.pzhs && farm.pzhs[query.to]) {
                receiveCertificate(farm.pzhs[query.to], query);
                if (farm.pzhs[query.to].config && farm.pzhs[query.to].config.master) {
                  var payload = {cmd: "receiveCert",
                    cert: farm.pzhs[query.to].config.master.cert,
                    crl:  farm.pzhs[query.to].config.master.crl};
                  res.write(JSON.stringify(payload));
                  res.end();
                }
              }
              break;
             case 'authenticate-google':
                storeInfo[query.id] = query;
                openid.authenticate(hostname, 'http://www.google.com/accounts/o8/id', res, query);
              break;
             case 'authenticate-yahoo':
                storeInfo[query.id] = query;
                openid.authenticate(hostname, 'http://open.login.yahooapis.com/openid20/www.yahoo.com/xrds', res, query);
              break;
            case "registerPzh":
              if (storeInfo[query.to]) {
                farm.createPzh(hostname, storeInfo[query.to], function(id) {
                  var msgSend = {"type":"prop","from":query.to, "to": query.id, "payload":
                    {
                      "status":"auth-status", "message": "true", "pzhid":id
                    }
                  }
                  if (farm.pzhs[id]) {
                    pzhapis.addPzpQR(farm.pzhs[id], function(result) {
                      msgSend.payload.authCode = result.payload.code;
                      res.write(JSON.stringify(msgSend));
                      res.end();
                    });
                  }
                });
              }
              break;
            case 'enrollPzp':
              if (farm.pzhs[query.to]) {
                var pzh = farm.pzhs[query.to];
                pzh.expecting.isExpected(function(expected) {
                  if (!expected){
                  //we"re not expecting anything - disallow.
                  //not expecting a pzp
                  } else {
                    var validMsgObj = { "type":"prop", "from": query.id, "to": query.to, "payload":
                      { "status":"clientCert", "message":
                        { "code": query.authCode, "csr": query.csr}
                      }
                    };
                    pzh.addNewPZPCert(validMsgObj, function(err, msgSend) {
                      if (err !== null) {
                        pzh.log.error(err);
                        return;
                      } else {
                        msgSend.payload.pzhid = query.to;
                        res.write(JSON.stringify(msgSend));
                        res.end();
                      }
                    });
                  }
                });
              }
            break;
          }

          if (query.from) {
           var currentPzh = new Buffer(query.from, 'base64').toString('ascii');
           if (farm.pzhs[currentPzh] && farm.pzhs[currentPzh].config) {
            farm.pzhs[currentPzh].res = res;
            switch(query.cmd) {
              case 'listDevices':
                pzhapis.listZoneDevices(farm.pzhs[currentPzh], result);
                break;
              case 'userDetails':
                var payload = {email:  farm.pzhs[currentPzh].config.email,
                  country: farm.pzhs[currentPzh].config.country,
                  image:   farm.pzhs[currentPzh].config.image,
                  name:    farm.pzhs[currentPzh].config.name,
                  servername: farm.pzhs[currentPzh].config.serverName};
                result({to: farm.pzhs[currentPzh].config.serverName, cmd:'userDetails', payload: payload});
                break;
              case 'pzhPzh':
                var store = res;
                pzhapis.addPzhCertificate(farm.pzhs[currentPzh], query.to, function(status) {
                  store.writeHeader(200, {'Content-Type': 'application/x-javascript; charset=UTF-8', 'Connection': 'Keep-Alive'});
                  log.info("sending response " + JSON.stringify(status));
                  store.write(JSON.stringify(status));
                  store.end();
                });
                break;
              case 'crashLog':
                pzhapis.crashLog(farm.pzhs[currentPzh], result);
                break;
              case 'addPzp':
                pzhapis.addPzpQR(farm.pzhs[currentPzh], result);
                break;
              case 'logout':
                farm.pzhs[currentPzh].res.socket.end()
                break;
              case 'restartPzh':
                pzhapis.restartPzh(farm.pzhs[currentPzh], result);
                break;
              case 'revokePzp':
                pzhapis.revoke(farm.pzhs[currentPzh], query.pzpid, result);
                break;
              case 'listPzp':
                pzhapis.listPzp(farm.pzhs[currentPzh], result);
                break;
            }
          }
         }
        });
      });


      server.on('error', function(err) {
        log.error(err);
      });

      server.on('request', function(req, res) {
        var parsed = url.parse(req.url, true), query = {};
        var filename = path.join(__dirname, parsed.pathname);
        if (parsed.query) {
          query = parsed.query;
        }

        if (query && query.cmd){
          if(query.cmd === "verify") {
            openid.fetchOpenIdDetails(req, res, storeInfo[query.id], function(host, details) {
              if (query.id === "undefined") {
                if (!farm.pzhs[hostname +'/'+details.username+"/"]) {
                  farm.createPzh(host, details, function(id, instance) {
                    log.info("***** created pzh " + id+ " *****");
                    var crypt = new Buffer(hostname + '/' +details.username+'/').toString('base64');
                    res.writeHead(302, {Location: '/main.html?provider='+details.provider+'&id='+crypt});
                    res.end();
                  });
                } else {
                  var crypt = new Buffer(hostname + '/' +details.username+'/').toString('base64');
                  res.writeHead(302, {Location: '/main.html?provider='+details.provider+'&id='+crypt});
                  res.end();
                }
              } else {
                var storeDetails = storeInfo[query.id], status, auth_code;
                var id = hostname+'/'+details.username+"/";
                if (farm.pzhs[id]) {
                  status = true;
                  pzhapis.addPzpQR(farm.pzhs[id], function(result) {
                    auth_code = result.payload.code;
                    res.writeHead(302, {Location: "http://"+storeDetails.returnPath +"?cmd=auth-status&status="+status+"&pzhid="+id+"&auth_code="+auth_code});
                    res.end();
                  });
                  delete storeInfo[query.id];
                } else {
                  status = false;
                  storeInfo[id]=details;
                  res.writeHead(302, {Location: "http://"+storeDetails.returnPath +"?cmd=auth-status&status="+status+"&pzhid="+id});
                  res.end();
                }
              }
            });
          }
        } else {
          fs.stat(filename, function(err, stats) {
            if(err) {
              res.writeHeader(404, {"Content-Type": "text/plain"});
              res.write("404 Not Found\n");
              res.end();
              return;
            }
            if (stats.isDirectory()) {
              filename = path.join(__dirname, "index.html");
            }
            // Security check, if not logged in, we redirect to index.html
            fs.readFile(filename, "binary", function(err, file) {
              if(err) {
                res.writeHeader(500, {"Content-Type": "text/plain"});
                res.write(err + "\n");
                res.end();
                return;
              }
              res.writeHeader(200, getContentType(filename));
              res.write(file, "binary");
              res.end();
            });
          });
        }
      });


      server.listen(session.configuration.port.farm_webServerPort, hostname, function() {
        log.info('listening on '+ session.configuration.port.farm_webServerPort);
        callback(true);
      });
    });
  }
};



/*pzhWebInterface.updateList = function (self) {
  if (farm.pzhs[self.config.serverName]  && connection[self.config.serverName]) {
    pzhapis.listZoneDevices(self, result);
  }
}*/

function getContentType(uri) {
  var contentType = 'text/plain';
  switch (uri.substr(uri.lastIndexOf('.'))) {
    case '.js':
      contentType = 'application/x-javascript';
      break;
    case '.html':
      contentType = 'text/html';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
  }
  return {'Content-Type': contentType, 'Connection': 'Keep-Alive'};
}

function result(response) {
  if (response && farm.pzhs[response.to].res !== "undefined") {
    farm.pzhs[response.to].res.writeHeader(200, {'Content-Type':
        'application/x-javascript; charset=UTF-8', 'Connection': 'Keep-Alive'});
    log.info("sending response " + JSON.stringify(response));
    farm.pzhs[response.to].res.write(JSON.stringify(response));
    farm.pzhs[response.to].res.end();
  }
}

/**
 * @description: Starts web interface for PZH farm
 * @param {config} certificate configuration parameters
 * */
function createWebInterfaceCertificate (config, callback) {
  if (config && config.webServer && config.webServer.cert === "") {
    session.certificate.selfSigned(config, 'PzhWebServer',
      function(status, selfSignErr, ws_key, ws_cert, csr ) {
      if(status === 'certGenerated') {
        session.configuration.fetchKey(config.master.key_id, function(master_key) {
          session.certificate.signRequest(csr, master_key,  config.master.cert, 1, config.serverName,
          function(result, signed_cert) {
            if(result === 'certSigned') {
              config.webServer.cert = signed_cert;
              session.configuration.storeKey(config.webServer.key_id, ws_key);
              session.configuration.storeConfig(config, function() {
                var wss = {
                        key : ws_key,
                        cert: config.webServer.cert,
                        ca  : config.master.cert
                };
                callback(wss);
              });
            }
          });
        });
      } else {
        log.error('certificate generation error')
      }
    });
} else {
    if (config.webServer.cert !== ""){
      var wss = {
        key : '',
        cert: config.webServer.cert,
        ca  : config.master.cert
        };
      session.configuration.fetchKey(config.webServer.key_id, function(ws_key){
        wss.key = ws_key;
        callback(wss);
      });
    }
  }
}
