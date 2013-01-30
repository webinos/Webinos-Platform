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
 * Copyright 2012 - 2013 Samsung Electronics (UK) Ltd
 * Copyright 2012 - 2013 University of Oxford
 * Author: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/
var PzhProviderWeb = exports;

PzhProviderWeb.startWebServer = function (host, address, port, config, cb) {
    "use strict";
       
    try {
        var express = require('express'),
            util = require('util'),
            path = require('path'),
            crypto = require('crypto'),
            https = require('https'),
            fs = require('fs'),
            passport = require('passport'),
            YahooStrategy = require('passport-yahoo').Strategy,
            GoogleStrategy = require('passport-google').Strategy;
    } catch (err) {
        console.log("missing modules in pzh webserver, please run npm install and try again");
    }

    var tlsConnectionAttempts = 0;

    var dependency = require('find-dependencies')(__dirname),
        logger = dependency.global.require(dependency.global.util.location, 'lib/logging.js')(__filename) || console,
        webTlsCommunicator = require('./realpzhtls.js');
    
    // define the options for the SSL server
    function getSSLOptions(config, callback) {
        var key_id = config.cert.internal.webssl.key_id;
        config.fetchKey(key_id, function (status, value) {
            var options = {
                key:  value,
                ca:   config.cert.internal.webssl.intermediate,                
                requestCert: false,
                rejectUnauthorized:false,
                cert: config.cert.internal.webssl.cert
            };
            callback(options);
        });
    }
    
    //define the options for the client connection to the PZH TLS Server
    function getTLSClientOptions(config, callback) {
        var key_id = config.cert.internal.webclient.key_id;        
        config.fetchKey(key_id, function (status, value) {
            var options = {
                key:  value,
                cert: config.cert.internal.webclient.cert,
                ca:   config.cert.internal.master.cert,
                requestCert: true,
                rejectUnauthorized: true //We're only prepared to talk to the TLS server.
            };
            callback(options);
        });
    }

    function createServer(port, host, address, config, next) {
        var app, routes, server;

        //configure the authentication engine and user binding
        passport = createPassport("https://" + address + ':' + port);


        getSSLOptions(config, function(sslOptions) {
            getTLSClientOptions(config, function(tlsClientOptions) {
            //connect to the TLS Server
                makeTLSServerConnection(config, tlsClientOptions, function (status, value) {
                    if (status) {
                        //configure the express app middleware
                        if (!server) {
                            app = createApp(passport);
                            routes = setRoutes(app, address, port);
                            //actually start the server
                            console.log("Starting SSL server with options: " + util.inspect(sslOptions));
                            server = https.createServer(sslOptions, app).listen(port);
                            handleAppStart(app, server, next);
                        } else {
                            next(value);
                        }
                    } else {
                        logger.error("Failed to connect to the PZH Provider's TLS server");
                        handleAppStart(app, null, next);
                    }
                });
            });
        });
    }

    /* Long lasting connection: this will reconnect after any errors a maximum
     * of 10 times (ok, more like 8).
     *
     */
    function makeTLSServerConnection(config, tlsClientOptions, cb) {
        webTlsCommunicator.init(
            config,
            tlsClientOptions,
            function (data) {
                cb(true, data);
            },
            function (status, value) {
                if (status) {
                    tlsConnectionAttempts++;
                    webTlsCommunicator.send("NO USER", "WEB SERVER INIT", {
                        err:function (error) {
                            console.log("Error: " + error);
                        },
                        success:function () {
                            console.log("Sent.");
                        }
                    });
                    if (tlsConnectionAttempts === 1) {
                        // don't bother with success callbacks if it works
                        // after the first time.
                        cb(status, value);
                    }
                    tlsConnectionAttempts = 1; //reset
                } else {
                    tlsConnectionAttempts++;
                    if (tlsConnectionAttempts < 10) {
                        setTimeout(function () {
                            makeTLSServerConnection(config, tlsClientOptions, cb);
                        }, 1000);
                    } else {
                        cb(false, "Failed to reconnect to TLS server");
                    }
                }
            });
    }


    function createApp(passport) {
        "use strict";
        var app = express();
        var MemStore = express.session.MemoryStore;
        app.configure(function () {
            app.set('views', __dirname + '/views');
            app.set('view engine', 'ejs');
//      app.use(express.logger()); // turn on express logging for every page
            app.use(express.bodyParser());
            app.use(express.methodOverride());
            app.use(express.cookieParser());
            var sessionSecret = crypto.randomBytes(40).toString("base64");
            app.use(express.session({ secret:sessionSecret }));//, store: new MemStore({reapInterval: 6000 * 10})
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(app.router);
            app.use(express.static(__dirname + '/public'));
        });

        // An environment variable will switch between these two, but we don't yet.
        app.configure('development', function () {
            app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
        });

        app.configure('production', function () {
            app.use(express.errorHandler());
        });

        return app;
    }

    function createPassport(serverUrl) {
        "use strict";
        /* No clever user handling here yet */
        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });


        // Use the GoogleStrategy within Passport.
        //   Strategies in passport require a `validate` function, which accept
        //   credentials (in this case, an OpenID identifier and profile), and invoke a
        //   callback with a user object.
        passport.use(new GoogleStrategy({
                returnURL:serverUrl + '/auth/google/return',
                realm:serverUrl + '/'
            },
            function (identifier, profile, done) {
                "use strict";
                // asynchronous verification, for effect...
                process.nextTick(function () {

                    // To keep the example simple, the user's Google profile is returned to
                    // represent the logged-in user.  In a typical application, you would want
                    // to associate the Google account with a user record in your database,
                    // and return that user instead.
                    profile.internal = true;
                    profile.from = "google";
                    profile.identifier = identifier;
                    return done(null, profile);
                });
            }
        ));

        passport.use(new YahooStrategy({
                returnURL:serverUrl + '/auth/yahoo/return',
                realm:serverUrl + '/'
            },
            function (identifier, profile, done) {
                "use strict";
                process.nextTick(function () {
                    profile.internal = true;
                    profile.from = "yahoo";
                    profile.identifier = identifier;
                    return done(null, profile);
                });
            }
        ));
        return passport;
    }


    function setRoutes(app, address, port) {
        "use strict";
        require('./routes')(app, address, port);
        require('./routes/peerPzhAuth.js')(app, address, port);
    }

    function handleAppStart(app, server, next) {
        "use strict";
        if (server === undefined || server === null || server.address() === null) {
            var err = "ERROR! Failed to start PZH Provider web interface: " + util.inspect(server);
            logger.log(err);
            next(false, err);
        } else {
            logger.log("HTTPS PZH Provider Web server at address " + server.address().address + ", listening on port " + server.address().port);
            next(true, null);
        }
    }

    logger.log("Port:    " + port)
    logger.log("Host:    " + host)
    logger.log("Address: " + address)
    createServer(port, host, address, config, cb);
};


