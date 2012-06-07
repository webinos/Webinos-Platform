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
var openid   = require('openid');
var url      = require('url');
var querystr = require('querystring');
var path     = require('path');
var fs       = require('fs');
var webSocket= require('websocket').server;

var webinos = require('webinos')(__dirname);
var session = webinos.global.require(webinos.global.pzp.location, 'lib/session');
var log     = new session.common.debug("pzh_webserver");

var pzhapis = require('../lib/pzh_internal_apis');
var farm    = require('../lib/pzh_farm');

var authorized   = false;
var rely ;
var connection;
var pzh = [];

// Create HTTPS Server
pzhWebInterface.start = function(hostname, callback) {
    createWebInterfaceCertificate(farm.config, function(webServer){
        var server = https.createServer(webServer, function(req, res){
            var parsed = url.parse(req.url);
            var query = querystr.parse(parsed.query);

            if (query.id === 'verify'){
                fetchOpenIdDetails(req, res, function(provider, userid) {// Important step as we assign pzh instance
                        res.writeHead(302, {Location: '/main.html?provider='+provider+'?id='+userid}); // redirection to same page but without details fetched from google.
                        res.end();
                });
            } else {
                currentPzh = query.id;
    //                              if (typeof currentPzh === "undefined") {
    //                                      res.writeHeader(500, {"Content-Type": "text/plain"});
    //                                      res.write('ID is missing ..' + "\n");
    //                                      res.end();
    //                                      return;
    //                              }
                var filename;
    //                              if(typeof pzh === 'undefined' || !pzh[currentPzh] ) {
    //                                      filename = path.join(__dirname, '/index.html');
    //                              } else {
    //
    //                              }
                filename = path.join(__dirname, parsed.pathname);
                fs.stat(filename, function(err, stats) {
                    if(err) {
                        res.writeHeader(404, {"Content-Type": "text/plain"});
                        res.write("404 Not Found\n");
                        res.end();
                        return;
                    }
                    if (stats.isDirectory()) {
                        filename = path.join(filename, "index.html");
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

        server.listen(session.configuration.webServerPort, hostname, function() {
                log.info('listening on '+ session.configuration.webServerPort);
        });

        server.on('error', function(err) {
                log.error(err);
        });

        var httpsServer = https.createServer(webServer, function(request, response) {
                response.writeHead(404);
                response.end();
        });

        httpsServer.listen(session.configuration.httpServerPort, hostname, function(){
                log.info('http Server listening on '+ session.configuration.httpServerPort);
                callback(true);
        });

        var wsServer = new webSocket({
                httpServer: httpsServer,
                autoAcceptConnections: true
        });

        wsServer.on('connect', function(conn) {
                log.info(conn.remoteAddress + ' connected ');
                connection = conn;
                // TODO: Send only to main.html and not to all ..
                if (typeof pzh !== 'undefined' && pzh[currentPzh]){
                        pzhapis.listZoneDevices(pzh[currentPzh], result);
                }
                conn.on('message', function(data) {
                    var parse = JSON.parse((data.utf8Data));
                    if (parse.cmd)  {
                            switch(parse.cmd){
                                    case 'authenticate-google':
                                            authenticate(hostname, 'http://www.google.com/accounts/o8/id');
                                            break;
                                    case 'authenticate-yahoo':
                                            authenticate(hostname, 'http://open.login.yahooapis.com/openid20/www.yahoo.com/xrds');
                                            break;
                            }
                    }
                    if (parse.cmd && parse.from) {
                        switch(parse.cmd) {
                            case 'listDevices':
                                    pzhapis.listZoneDevices(pzh[parse.from], result);
                                    break;
                            case 'userDetails':
                                    result({cmd:'userDetails', payload: pzh[parse.from].config.details});
                                    break;
                            case 'pzhPzh':
                                    pzhapis.addPzhCertificate(pzh[parse.from], parse.to, function(status) {
                                            result({cmd:'pzhPzh', payload: status});
                                    });
                                    break;
                            case 'crashLog':
                                    pzhapis.crashLog(pzh[parse.from], result);
                                    break;
                            case 'addPzp':
                                    pzhapis.addPzpQR(pzh[parse.from], result);
                                    break;
                            case 'logout':
                                    conn.close();
                                    break;
                            case 'restartPzh':
                                    pzhapis.restartPzh(pzh[parse.from], result);
                                    break;
                            case 'revokePzp':
                                    pzhapis.revoke(pzh[parse.from], parse.pzpid, result);
                                    break;
                            case 'listPzp':
                                    pzhapis.listPzp(pzh[parse.from], result);
                                    break;
                        }
                    }
                });
                conn.on('close', function() {
                        log.info('connection Closed');
                });
        });

        wsServer.on('error', function(err) {
            log.error(err);
        })
    });
}

pzhWebInterface.updateList = function (self) {
    pzhapis.listZoneDevices(self, result);
}

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
    return {'Content-Type': contentType};
}

function result(response) {
    //console.log(response);
    if (typeof connection !== "undefined") {
        connection.send(JSON.stringify(response));
    }
}

function authenticate(hostname, url) {
    var exts= [];
    var attr = new openid.AttributeExchange({
        "http://axschema.org/contact/country/home":     "required",
        "http://axschema.org/namePerson/first":         "required",
        "http://axschema.org/pref/language":            "required",
        "http://axschema.org/namePerson/last":          "required",
        "http://axschema.org/contact/email":            "required",
        "http://axschema.org/namePerson/friendly":      "required",
        "http://axschema.org/namePerson":               "required",
        "http://axschema.org/media/image/default":      "required",
        "http://axschema.org/person/gender/":           "required"
    });
    exts.push(attr);

    rely = new openid.RelyingParty('https://'+hostname+':'+session.configuration.webServerPort+'/main.html?id=verify',
        null,
        false,
        false,
        exts);

    rely.authenticate(url, false, function(error, authUrl) {
        if(error){
            log.error(error);
        } else if (!authUrl) {
            log.error('authentication failed as url to redirect after authentication is missing');
        } else {
            result({cmd:'auth-url', payload: authUrl});
        }
    });
}

function fetchOpenIdDetails(req, res, callback){
    rely.verifyAssertion(req, function(err, userDetails){
        if (err){
            log.error("unable to login " + err.message);
            res.writeHead(302, {Location: '/index.html?error='+err.message}); // redirection to same page but without details fetched from google.
            res.end();
        }
        else if (userDetails.authenticated) {
            var host;
            var details = {country: '', username: '', email: '', image: ''};
            if(req.headers.host.split(':')){
                    host = req.headers.host.split(':')[0];
            } else {
                    host = req.headers.host;
            }

            if(userDetails.claimedIdentifier){
                    // google
                var parsed = url.parse(userDetails.claimedIdentifier);
                var query = querystr.parse(parsed.query);
                if (query && query.id) {
                    details.id = query.id;
                    details.provider = 'google';
                } else {
                    details.id =  parsed.path.split('/')[2];
                    details.provider = 'yahoo';
                }
                callback(details.provider, details.id)
            }
            if(userDetails.country){
                    details.country = userDetails.country;
            }
            if(userDetails.firstname){
                    details.username += userDetails.firstname;
            }
            if(userDetails.lastname){
                    details.username += userDetails.lastname;
            }
            if(userDetails.fullname){
                    details.username = userDetails.fullname.replace(/ /g, '');
            }
            if(userDetails.email){
                    details.email = userDetails.email;
            }
            if(userDetails.image){
                    details.image = userDetails.image;
            }

            farm.getOrCreatePzhInstance(host, details, function(key, pzhInt){
              if (typeof pzhInt !== "undefined" || pzhInt === null) {
                pzh[details.id] = pzhInt;
                pzhapis.listZoneDevices(pzhInt, result);
              } else {
                log.error("failed adding pzh");
              }
            });
        }
    });
}

/**
 * @description: Starts web interface for PZH farm
 * @param {config} certificate configuration parameters
 * */
function createWebInterfaceCertificate (config, callback) {
    if (config.webServer.cert === "") {
        session.certificate.selfSigned(config, 'PzhWebServer', function(status, selfSignErr, ws_key, ws_cert, csr ) {
            if(status === 'certGenerated') {
                session.configuration.fetchKey(config.master.key_id, function(master_key) {
                    session.certificate.signRequest(csr, master_key,  config.master.cert, 1, config.serverName, function(result, signed_cert) {
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
