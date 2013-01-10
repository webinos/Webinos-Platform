module.exports = function (app, address, port, state) {
    "use strict";
    var dependency = require ("find-dependencies") (__dirname),
        logger = dependency.global.require (dependency.global.util.location, "lib/logging.js") (__filename) || console,
        pzhadaptor = require ('../pzhadaptor.js'),
        passport = require ('passport'),
        helper = require ('./helper.js');

    app.get ('/', ensureAuthenticated, function (req, res) {
        if (req.session.isPzp) {
            pzhadaptor.fromWeb (req.user, {payload:{status:"authCode", address:address, port:port}}, res);
            req.session.isPzp = "";
        } else {
            res.redirect ('/main/' + getUserPath (req.user) + "/");
        }
    });

    app.post ('/main/:user/enrollPzp/', function (req, res) { // to use ensure authenticated, for some reason req.isAuthenticated retuns false
        pzhadaptor.fromWeb (req.params.user,
            {payload:{status:"enrollPzp", csr:req.body.csr, authCode:req.body.authCode, from:req.body.from}}, res);
    });

    app.get ('/main/:user/', ensureAuthenticated, function (req, res) {
        if (encodeURIComponent (req.params.user) !== getUserPath (req.user)) {
            logger.log (encodeURIComponent (req.params.user) + " does not equal " + getUserPath (req.user));
            res.redirect ('/login');
        } else {
            res.render ('main', { user:req.user });
        }
    });

    // Arbitrary query interface.
    app.post ('/main/:user/query', ensureAuthenticated, function (req, res) {
        logger.log ("Body: " + require ("util").inspect (req.body));
        pzhadaptor.fromWeb (req.user, req.body, res);
    });

    // A couple of unused REST interfaces
    app.post ('/main/:user/zonestatus/', ensureAuthenticated, function (req, res) {
        pzhadaptor.getZoneStatus (req.user, res);
    });

    app.all ('/main/:user/about-me/', ensureAuthenticated, function (req, res) {
        res.json (req.user);
    });

    // present certificates to an external party.
    app.all ('/main/:useremail/certificates/', function (req, res) {
        //return a JSON object containing all the certificates.
        pzhadaptor.fromWebUnauth (req.params.useremail, {type:"getCertificates"}, res);
    });

    //Certificate exchange...
    app.get ('/main/:user/connect-friend', ensureAuthenticated, function (req, res) {
        //Args: The external user's email address and PZH provider
        //Auth: User must have logged into their PZH
        //UI: NONE
        //Actions: adds the friend's details to the list of 'waiting for approval', redirects the user to the external PZH
        var externalEmail = req.query.externalemail;
        var externalPZH = req.query.externalpzh;
        logger.log ("External: " + externalEmail + " - " + externalPZH);
        //get those certificates
        //"https://" + externalPZH + "/main/" + encodeURIComponent(externalEmail) + "/certificates/"
        helper.getCertsFromHost (externalEmail, externalPZH, function (certs) {
            pzhadaptor.storeExternalUserCert (req.user, externalEmail, externalPZH, certs, res);
            //get my details from somewhere
            var myCertificateUrl = "https://" + address + ":" + port + "/main/" + req.params.user + "/certificates/";
            var myPzhUrl = "https://" + address + ":" + port + "/main/" + req.params.user + "/";
            //where are we sending people
            var redirectUrl = "https://" + externalPZH + "/main/" + encodeURIComponent (externalEmail) +
                "/request-access-login?certUrl=" + encodeURIComponent (myCertificateUrl) +
                "&pzhInfo=" + encodeURIComponent (myPzhUrl);
            res.redirect (redirectUrl);
        }, function (err) {
            res.writeHead (200);
            res.end ('Failed to retrieve certificate from remote host');
        });

        // technically this is a problem.
        // someone could change the URI in transit to transfer different certificates
        // this would make Bob think that Alice was from a different personal zone.
        // TODO: Work out some way of putting the 'get' data into the body, despite this being a redirect.

    });

    //TODO WARNING: This seems like a dodgy function.  Anyone can invoke it.  Make sure that secret is long...
    //    app.post('/main/:user/request-access/:external/', function(req, res) {
    //Args: External user's PZH URL
    //Args: Secret token
    //Args: Certificate for external PZH

    //Auth: check that the URL is expected and that the certificate is valid and that the certificate is valid for this URL.
    //UI: None
    //Action: add this user to the trusted list
    //    });

    app.get ('/main/:user/approve-user/:externalemail/', ensureAuthenticated, function (req, res) {
        pzhadaptor.getRequestingExternalUser (req.user, req.params.externalemail, function (answer) {
            res.render ("approve-user", {user:req.user, externalUser:req.params.externalemail});
        });
        //Args: None
        //Auth: PZH login required
        //UI: Show the external user's details
        //Actions: have a button that, once approved, add the external user's certificate details to the trusted list.
    });

    app.post ('/main/:user/make-user-decision/', ensureAuthenticated, function (req, res) {
        logger.log (util.inspect (req.body));
        logger.log (util.inspect (req.user));
        if (req.body.useremail && req.body.decision && req.user) {
            if (req.body.decision === "approve") {
                pzhadaptor.approveFriend (req.user, req.body.useremail, res);
            } else {
                pzhadaptor.rejectFriend (req.user, req.body.useremail, res);
            }
            res.redirect ('../');
        } else {
            res.redirect ('/');
        }
    });

    app.get ('/login', function (req, res) {
        if (req.query.isPzp) {
            req.session.isPzp = true;
        }
        res.render ('login', { user:req.user });
    });
    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Google authentication will involve redirecting
    //   the user to google.com.  After authenticating, Google will redirect the
    //   user back to this application at /auth/google/return
    app.get ('/auth/google',
        passport.authenticate ('google', { failureRedirect:'/login' }),
        function (req, res) {
            res.redirect ('/');
        }
    );

    // GET /auth/google/return
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get ('/auth/google/return',
        passport.authenticate ('google', { failureRedirect:'/login' }),
        function (req, res) {
            res.redirect ('/');
        }
    );

    app.get ('/logout', function (req, res) {
        req.logout ();
        //window.open('https://www.google.com/accounts/Logout');
        //window.open('https://login.yahoo.com/config/login?logout=1');
        res.redirect ('/');
    });

    app.get ('/auth/yahoo',
        passport.authenticate ('yahoo'),
        function (req, res) {
            // The request will be redirected to Yahoo for authentication, so
            // this function will not be called.
        }
    );

    app.get ('/auth/yahoo/return',
        passport.authenticate ('yahoo', { failureRedirect:'/login' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect ('/');
        }
    );

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated (req, res, next) {
        if (req.isAuthenticated ()) {
            return next ();
        }
        res.redirect ('/login');
    }

    function getUserPath (user) {
        return encodeURIComponent (user.emails[0].value);
    }
};
