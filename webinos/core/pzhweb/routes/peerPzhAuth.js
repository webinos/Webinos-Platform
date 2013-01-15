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
 * Author: Habib Virji (habib.virji@samsung.com)
 *******************************************************************************/
module.exports = function (app, address, port) {
    var openid = require ('openid');
    var dependency = require ("find-dependencies") (__dirname),
        logger = dependency.global.require (dependency.global.util.location, "lib/logging.js") (__filename) || console,
        pzhAdaptor = require ('../pzhadaptor.js'),
        helper = require ('./helper.js');

    var attr = new openid.AttributeExchange ({
        "http://axschema.org/contact/country/home":"required",
        "http://axschema.org/namePerson/first"    :"required",
        "http://axschema.org/pref/language"       :"required",
        "http://axschema.org/namePerson/last"     :"required",
        "http://axschema.org/contact/email"       :"required",
        "http://axschema.org/namePerson/friendly" :"required",
        "http://axschema.org/namePerson"          :"required",
        "http://axschema.org/media/image/default" :"required",
        "http://axschema.org/person/gender/"      :"required"
    });

    app.get ('/main/:useremail/request-access-login', function (req, res) {
        //Args: External user's PZH URL
        //Args: External user's PZH certificate
        //Auth: Check that the certificate is valid and that the certificate is valid for this URL.
        //UI: Presents a button that the user must click to confirm the request
        //UI: External user must then present an OpenID account credential...
        //sets req.externalprovider
        var externalCertUrl = req.query.certUrl;
        var externalPZHUrl = req.query.pzhInfo;

        res.render ('login-remote', {externalCertUrl:encodeURIComponent (externalCertUrl), externalPZHUrl:encodeURIComponent (externalPZHUrl)});
    });

    app.get ('/main/:useremail/request-access-authenticate', function (req, res) {
        //Args: External user's PZH URL
        //Args: External user's PZH certificate
        //Auth: Check that the certificate is valid and that the certificate is valid for this URL.
        //UI: Presents a button that the user must click to confirm the request
        //UI: External user must then present an OpenID account credential...

        var externalRelyingParty = new openid.RelyingParty (
            'https://' + address + ':' + port + '/main/' + encodeURIComponent (req.params.useremail) + '/request-access-verify',
            null, false, false, [attr]);

        //'&externalCertUrl=' + encodeURIComponent(req.query.externalCertUrl) +  '&externalPZHUrl=' +  encodeURIComponent(req.query.externalPZHUrl)

        var identifierUrl = (req.query.externalprovider === "google") ? 'http://www.google.com/accounts/o8/id' :
            'http://open.login.yahooapis.com/openid20/www.yahoo.com/xrds';

        externalRelyingParty.authenticate (identifierUrl, false, function (error, authUrl) {
            if (error) {
                res.writeHead (200);
                res.end ('Authentication failed: ' + error.message);
            } else if (!authUrl) {
                res.writeHead (200);
                res.end ('Authentication failed');
            } else {
                //this data needs to come with us on the next attempt...
                req.session.expectedExternalAuth = {
                    internalUser        :req.params.useremail,
                    externalCertUrl     :req.query.externalCertUrl,
                    externalPZHUrl      :req.query.externalPZHUrl,
                    externalRelyingParty:req.query.externalprovider,
                    externalAuthUrl     :authUrl
                };
                res.writeHead (302, { Location:authUrl });
                res.end ();
            }
        });
    });

    app.get ('/main/:useremail/request-access-verify', function (req, res) {
        //Args: External user's PZH URL
        //Args: External user's PZH certificate
        //Auth: Check that the certificate is valid and that the certificate is valid for this URL.
        //Auth: OpenID credential.  THis is the redirect from a provider.
        //UI: Present some confirmation

        var externalRelyingParty = new openid.RelyingParty (
            'https://' + address + ':' + port + '/main/' + encodeURIComponent (req.params.useremail) + '/request-access-verify',
            null, false, false, [attr]);

        externalRelyingParty.verifyAssertion (req, function (error, result) {
            if (error) {
                res.writeHead (200);
                res.end ('Authentication failed');
            } else {
                logger.log ("Successfully authenticated external user: " + result.email +
                    "who claims to have: " + req.session.expectedExternalAuth.externalCertUrl +
                    " and " + req.session.expectedExternalAuth.externalPZHUrl);

                if (!req.session.expectedExternalAuth.externalCertUrl) {
                    res.writeHead (200);
                    res.end ('Failed to read cookies');
                }
                var session = req.session.expectedExternalAuth;
                var externalUrl = require ("url").parse (req.session.expectedExternalAuth.externalCertUrl);
                // Parse out the address and port out of the external URL
                var options = {
                    host  :externalUrl.hostname,
                    port  :externalUrl.port || 443,
                    path  :"/main/" + encodeURIComponent (result.email) + "/certificates/",
                    method:"GET"

                };

                helper.getCertsFromHostDirect (options, function (certs) {
                    var pzhData = {
                        pzhCerts            :certs,
                        externalCertUrl     :session.externalCertUrl,
                        externalPZHUrl      :session.externalPZHUrl,
                        externalRelyingParty:session.externalRelyingParty,
                        externalAuthUrl     :session.externalAuthUrl
                    };
                    pzhAdaptor.requestAddFriend (session.internalUser, result, pzhData, res);
                    //TODO: Check we're dealing with the same _internal_ user
                    // This is for the same user...
                    // This is redirecting to the originator of request... but url is  pointing to the request-verify.. what to do?
                    res.render ("external-request-success",
                        {externaluser     :result, user:session.internalUser,
                            externalPzhUrl:session.externalPZHUrl});
                }, function (err) {
                    res.writeHead (200);
                    res.end ('Failed to retrieve certificate from remote host');
                });
            }
        });
    });
};