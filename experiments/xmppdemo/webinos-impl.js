/*
 * webinosImpl.js
 *
 * This file contains all functionality that has to do with implementing the webinos.js
 * interface with an XMPP backend.
 *
 * THIS IS FOR DEMONSTRATION PURPOSES ONLY! This code may (and does) contain bugs, but
 * more importantly the author nor anybody else here at TNO thinks it might be a good
 * idea to implement the webinos runtime or the PZH or the PZP in Javascript!! ;-)
 *
 * This code file contains three types of methods:
 * 1) interface implementation methods (from webinos.js), these do stuff
 * 2) callbacks, called when a certain XMPP stanza arrives
 * 3) helper functions
 *
 * The code has some documentation. Enjoy!
 *
 * Author: Victor Klos (TNO)
 */

var webinosImpl = {
    connection: null,                       // holds BOSH connection
    log_div: null,                          // html div element to append logging to
    callbacks: {},                          // administration of callbacks for all service types
    sharedServices: {},                     // services that the app wants shared
    remoteServices: {},                     // services that are shared with us, assoc array of arrays
    pendingRequests: {},                    // hash to store <stanza id, geo service> so results can be handled
    featureMap: null,                       // holds features, see initPresence() for explanation
//    BOSH: "http://bosh.metajack.im:5280/xmpp-httpbind",
    BOSH: "/jabber/",
    baseFeatures: ["http://jabber.org/protocol/caps",
                   "http://jabber.org/protocol/disco#info",
                   "http://jabber.org/protocol/commands"],

    setParams: function(p) {
        this.log_div = p['log'];            // id of div to append logging to
        XmlLogger.master_div = p['raw'];    // id of div to append raw XMPP logging to
        log('Logging enabled.');
    },

    findServices: function(p, cb) {
        var api = p['api'];
        if (!api) {
            err('Error installing callback: api missing');
            return;
        }
        if (cb) {
            this.callbacks[api] = cb;
            log('findService callback installed for ' + api);
        } else {
            delete this.callbacks[api];
            log('findService callback removed for ' + api);
        }
    },
    
    shareService: function(ns, flag) {
        log( (flag?"Starting":"Stopping") + " sharing service with ns:" + ns);
        if (flag) {
            this.sharedServices[ns] = flag;
        } else {
            delete this.sharedServices[ns];
        }
        this.updatePresence();
    },
    
    connect: function() {
		// cleanup administration of previous runs
		this.remoteServices = new Array;
		this.pendingRequests = new Array;
        
        if (webinosImpl.connection) {
            webinosImpl.connection.reset();
        }
		
        // Show login dialog
        $('#login_dialog').dialog({
            autoOpen: true, draggable: false, modal: true, title: 'Enter XMPP credentials',
            buttons: {
                "Connect": function () {
                    $(document).trigger('doXmppConnect', {
                        jid: $('#jid').val(),
                        resource: $('#resource').val(),
                        password: $('#password').val()
                    });
                    $(this).dialog('close');
                }
            }
        });
    },
    
    disconnect: function() {
        log('Disconnect in progress...');
        webinosImpl.connection.send($pres({type: 'unavailable'}));
        webinosImpl.connection.flush();
        this.connection.disconnect();
    },

    geolocationInvoke: function(geo) {
        var id = webinosImpl.connection.getUniqueId('geo');
        var stanza = $iq({to: geo.device, type: 'get', 'id': id})
            .c('query', {xmlns: geo.ns});
        webinosImpl.pendingRequests[id] = geo;
        this.connection.send(stanza);
        this.connection.flush();
        log('Geolocation service invoked for ' + geo.device);
    },

    // Asks the user what message to send, then sends it as a message stanza
    remoteAlertingInvoke: function(rem) {
        log('Remote alerting service invoked for ' + rem.device);
        $('#alert-dialog').dialog({
            autoOpen: true, draggable: false, modal: true, title: 'Enter alerting message:',
            buttons: {
                "Send": function () {
                    log('Sending remote-alert to ' + rem.device + '; ' + $('#alert-message').val());
                    webinosImpl.connection.send( $msg({to: rem.device, type: 'headline'}).c('alert', {xmlns: rem.ns}).t( escape($('#alert-message').val()) ) );
                    $(this).dialog('close');
                }
            }
        });
    },

    // This function calculates the possible combinations of shared services and the
    // hashes of those combinations. This is a shortcut, because XEP-115 implies that
    // when an unknown hash is received a disco#info stanza should be sent. As this is
    // a demo and the device type of the sending party is the same as the device type
    // of the receiving party (namely: this software) all possible hashes are known
    // in advance and the additional query is safely skipped.
    //
    // The hashes are stored as an associative array of <hash, array of features>,
    // of which the latter only contains the 'interesting' ones (i.e. no baseFeatures).
    //
    // This function also sends the initial presence statement
    initPresence: function() {
        var featureMap = {};
        jQuery.each([
            [],
            [webinos.NS.GEOLOCATION],
            [webinos.NS.REMOTE_ALERT],
            [webinos.NS.GEOLOCATION, webinos.NS.REMOTE_ALERT]], function(i,v) {
                featureMap[webinosImpl.createVersionHash(v)] = v;
                //log("initPresence key=" + webinosImpl.createVersionHash(v));
        });

        webinosImpl.featureMap = featureMap;
        webinosImpl.updatePresence();
    },
    
    // Send presence notification according to http://xmpp.org/extensions/xep-0115.html
    updatePresence: function() {
        var current = [];
        jQuery.each(this.sharedServices, function(k,v) {
            if (v) current.push(k);
        });
        log("XEP-0115 caps: " + current.join());

        // create stanza. Note that .c("c" is coincidence; create child "c" hence no typo
        var presence =
            $pres({from: webinos.device}).c("c", {
                xmlns: "http://jabber.org/protocol/caps",
                hash: "sha-1",
                node: "http://webinos.org/xmppdemo",
                ver: webinosImpl.createVersionHash(current) });
        webinosImpl.connection.send( presence );
        webinosImpl.connection.flush();     // send immediately
    },

    // Helper function to send an error on a geo query request
    replyGeoError: function(from, to, id, ns, error) {
        log("Replying with error " + error + " to request with id " + id + " from " + to); // from is now us
        webinosImpl.connection.send(
            $iq({'from': from, 'to': to, 'id': id, type: 'result'}).c('query', {xmlns: ns})
                .c('error').t(error)
        );
    },

    // Helper function to return simple string based on browser version
    proposedResource: function() {
		if (webinos.isMobile()) return 'mobile';
        else if($.browser.mozilla) return 'foxy'
        else if($.browser.msie) return 'exploder';
        else if($.browser.opera) return 'opera';
        else if($.browser.safari) return 'webkit';
        else return 'work';
    },

    // Helper function to return a 'clean' id string based on a jid
    jid2Id: function (jid) {
        return jid.split(/@|\/|\./).join("_");
    },
    
    // Helper function to create a feature-version hash from an array of features
    createVersionHash: function (a) {
        return SHA1(webinosImpl.baseFeatures.concat(a).sort().join(''));
    },
    
    // Helper function that creates a service, adds it to the administration and invokes the callback
    createService: function(name, from) {
        var s = (name == "geolocation") ? (new GeolocationService) : (new RemoteAlertingService);
        s.device = from;
        s.owner = Strophe.getBareJidFromJid(from);
        s.id = webinosImpl.jid2Id(from) + '-' + name;

        var currentServices = webinosImpl.remoteServices[from];
        if (!currentServices) currentServices = [];
        currentServices.push(s);
        webinosImpl.remoteServices[from] = currentServices;

        log('Created and added new service of type ' + name);
        var callback = webinosImpl.callbacks[s.ns];
        if (callback) (callback)(s);
    },
    
    // handler used for watching buddies go offline
    onPresenceBye: function(presence) {
        var from = $(presence).attr('from');
        var serviceList = webinosImpl.remoteServices[from];
        delete webinosImpl.remoteServices[from];
        
        // Invoke callback function on all services, so they now
        jQuery.each(serviceList, function(i,v) {v.remove();});
        
        log(from + ' has left the building');
        return true;
    },

    // handler used for receiving updates from buddies and own devices on services shared
    onPresenceDisco: function(presence) {
        var id = $(presence).attr('id');
        var from = $(presence).attr('from');
        var hash = $(presence).find('c').attr('ver');
        var features = webinosImpl.featureMap[hash];
        if (!features) {
            err("onPresenceDisco: unknown ver '" + hash + "', outside demo scope!");
            return true;
        }

        log(from + ' now shares services: ' + features.join(" & ") );

        // Traverse all possible services
        var inCurrent = [];
        jQuery.each(webinos.NS, function(i,v) {
            var name = v.split('/').pop();                      // determine service name
            var inFeatures = jQuery.inArray(v, features) != -1; // is it in the announced features?
            var inCurrent = false;                              // is it in the current list?
            var duploService = null;
            var duploIndex = -1;
            var currentServices = webinosImpl.remoteServices[from];
            if (currentServices) {
                jQuery.each(currentServices, function(i2,v2) {
                    if (v2.name == name) {
                        duploService = v2;
                        duploIndex = i2;
                        inCurrent = true;
                    }
                });
            }
            if (inCurrent && !inFeatures) {                     // remove service
                log('Removing service of type ' + duploService.name + ' from ' + from);
                webinosImpl.remoteServices[from].splice(duploIndex, 1);
                duploService.remove();                          // fires the callback (if applicable)
            } else
            if (!inCurrent && inFeatures) {                     // create and add service
                webinosImpl.createService(name, from);
            }
        });
        return true; // handler must remain active
    },
    
    // handler for device discovery, supports queries w/ or wo/ nodes (with indicates
    // support for http://jabber.org/protocol/caps (=what we use for service discovery)
    onDisco: function(disco) {
        var from = $(disco).attr('from');
        var to = $(disco).attr('to');
        var id = $(disco).attr('id');
        var node = $(disco).find('query').attr('node');
        var ns = $(disco).find('query').attr('xmlns');

        log('Disco req from ' + from + ' with id ' + id + ' for node ' + node);

        // Determine what features to report; if the query contains a node,
        // we should report the features belonging to that node. Else, report
        // the current features.
        var nodeStr = "";
        var features = webinosImpl.baseFeatures.slice(0); // make a copy
        if (node)
        {
            var hash = node.split('#')[1];
            features = this.featureMap[hash];
            if ((features === undefined) || (features === null)) {
                err('HUH? Disco hash not found! Guess we are outside demo boundaries...');
                return true;
            } else {
                nodeStr = ", node: '" + node + "'";
            }
        } else {
            jQuery.each(webinosImpl.sharedServices, function(k,v) {
                if (v) features.push(k);
            });
        }
        eval("var iq = $iq({from: to, id: id, to: from, type: 'result'}) \
            .c('query', {xmlns: 'http://jabber.org/protocol.disco#info'" + nodeStr + "}) \
            .c('identity', {category: 'client', name: 'webinos xmpp demo v1', type: 'web'})"
            + jQuery.map(features, function(a) {return ".up().c('feature', {'var': '" + a + "'})"}).join('')
        );
        webinosImpl.connection.send(iq);
        return true;
    },
    
    onGeoRequest: function(req) {
        var from = $(req).attr('from');
        var to = $(req).attr('to');
        var id = $(req).attr('id');
        var ns = $(req).find('query').attr('xmlns');
        log('Received geolocation request from ' + from);

        // Before answering would be a good time to check policies etc.
        // By just requesting the location, this demo delegates policy
        // handling to the browser...
        var timerId;
        var hasReplied = false;;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    clearTimeout(timerId);
                    if (hasReplied) return; // bail out if user timeout was already sent
                    var reply = $iq({'from': to, 'id': id, 'to': from, 'type': 'result'}).c('query', {'xmlns': ns})
                            .c('latitude').t('' + pos.coords.latitude).up().c('longitude').t('' + pos.coords.longitude);
                    webinosImpl.connection.send( reply );
                    log('Replied to position request with id ' + id + ' from ' + from + ' with ' + pos.coords.latitude + '/' + pos.coords.longitude);
                },
                function(err) {
                    clearTimeout(timerId);
                    var errText;
                    switch(err.code) {
                    case 1: errText = "permission denied"; break;
                    case 2: errText = "unavailable"; break;
                    case 3: errText = "timeout"; break;
                    default: errText = "unknown error"; break;
                    }
                    if (!hasReplied) { // user timout not applicable
                        webinosImpl.replyGeoError(to, from, id, ns, errText);
                    }
                },
                {maximumAge: 60000, timeout: 10000} // At most one minute old, max 10 secs to determine
            );
            timerId = setTimeout( function() {
                hasReplied = true;
                webinosImpl.replyGeoError(to, from, id, ns, "policy timeout") },
                12000 );
        } else {
            webinosImpl.replyGeoError(to, from, id, ns, "unsupported");
        }
        return true;
    },

    onGeoResult: function(res) {
        var from = $(res).attr('from');
        var to = $(res).attr('to');
        var id = $(res).attr('id');
        var ns = $(res).find('query').attr('xmlns');
        var errNode = $(res).find('error');
        
        // retrieve the requesting service from our administration
        var geo = webinosImpl.pendingRequests[id];
        if (geo == null) {
            err('Received geo result from ' + from + ' with id=' + id + ' but have no requester');
            return true;
        }

        if (errNode.length == 0) {    // error not present in repy stanza
            var lon = $(res).find('longitude').text();
            var lat = $(res).find('latitude').text();
            geo.onResult(lat, lon);
        } else {
            geo.onError(errNode.text());
        }
        log('Handled geo result from ' + from + ' with id '+ id);
        return true;
    },
    
    onRemoteAlert: function(msg) {
        var from = $(msg).attr('from');
        var alrt = $(msg).find('alert');
        if (alrt.length) {
            if (alrt.attr('xmlns') != webinos.NS.REMOTE_ALERT) {
                err('Ignoring message from ' + from + ' as it has the wrong namespace');
            } else {
                $('#alert-show-dialog').html('<label>From:</label> ' + from + '<p><strong>' + alrt.text() + '</strong>')
                .dialog({
                    autoOpen: true, draggable: false, modal: true, title: 'Important message:',
                    buttons: {
                        "Ok": function () {
                            $(this).dialog('close');
                        }
                    }
                });
            }
        } else {
            err('Ignoring message from ' + from + ' as it has no alert');
        }
        return true;
    },

    lastBecauseOnlyOnceOmittingTheCommaIsAMenace: null
};

$(document).bind('doXmppConnect', function (ev, data) {
    // create new connection and store it
    var conn = new Strophe.Connection(webinosImpl.BOSH);
    webinosImpl.connection = conn;

    // Attach handlers for raw XMPP logging only if on capable devices
    if (!webinos.isMobile()) {
        conn.xmlInput = function (body) { XmlLogger.show_traffic(body, 'incoming'); };
        conn.xmlOutput = function (body) { XmlLogger.show_traffic(body, 'outgoing'); };
    }

    // create a full jid if necessary
    var jid = data.jid;
    if (jid.indexOf('/') == -1) jid = jid + '/' + data.resource;

    webinos.owner = Strophe.getBareJidFromJid(jid);
    webinos.device = jid;

    log('Connecting ' + jid + ' to server...');
    
    conn.connect(jid, data.password, function (status) {
        switch(status) {
        case Strophe.Status.ERROR:          err('An error has occurred'); break;
        case Strophe.Status.CONNECTING:     log('The connection is currently being made'); break;
        case Strophe.Status.CONNFAIL:       err('The connection attempt failed'); break;
        case Strophe.Status.AUTHENTICATING: log('The connection is authenticating'); break;
        case Strophe.Status.AUTHFAIL:       err('The authentication attempt failed'); break;
        case Strophe.Status.DISCONNECTING:  log('The connection is currently being terminated'); break;
        case Strophe.Status.ATTACHED:       log('The connection has been attached'); break;
        case Strophe.Status.CONNECTED:
            log('The connection has succeeded');
            // install handlers for incoming XMPP stanzas
            conn.addHandler(webinosImpl.onPresenceBye, null, "presence", "unavailable");
            conn.addHandler(webinosImpl.onPresenceDisco, "http://jabber.org/protocol/caps", "presence");
            conn.addHandler(webinosImpl.onDisco, "http://jabber.org/protocol/disco#info", "iq");
            conn.addHandler(webinosImpl.onGeoRequest, "http://webinos.org/api/geolocation", "iq", "get");
            conn.addHandler(webinosImpl.onGeoResult, "http://webinos.org/api/geolocation", "iq", "result");
            conn.addHandler(webinosImpl.onRemoteAlert, null, "message", "headline");

            // send out our presence status
            webinosImpl.initPresence();

            // notify the app that we are connected
            $(document).trigger('onWebinosConnect');
            break;
        case Strophe.Status.DISCONNECTED:
            log('The connection has been terminated');
            // notify the app that we are not connected
            $(document).trigger('onWebinosDisconnect');
            break;
        }
    });
});


// Appends text to the logging div that was set through setParams
function log(text) {
    if (webinosImpl.log_div) {
        var target = $(webinosImpl.log_div);
        var scroll = $(webinosImpl.log_div).get(0);
        var isAtBottom = scroll.scrollTop >= scroll.scrollHeight - scroll.clientHeight;
        target.append("<div class='log-line'>" + text + "</div>");
        if (isAtBottom) // keep it there
            scroll.scrollTop = scroll.scrollHeight;
    }
}
// Appends text as error to the logging div that was set through setParams
function err(text) {
    if (webinosImpl.log_div) {
        var target = $(webinosImpl.log_div);
        var scroll = $(webinosImpl.log_div).get(0);
        target.append("<div class='log-line-error'>" + text + "</div>");
        scroll.scrollTop = scroll.scrollHeight;         // always show
    }
}

// The webinos implementation has _no_ attachments to the application _other_ than through
// the interface as defined in webinos.js.
//
// What you see here doesn't really exist. Oh, and if it does it is merely for user
// convenience; (s)he gets a nice proposal to use as a XMPP resource.
// (Placed here so it does its thing just once, convieniently
$(document).ready(function () {
    $('#resource').val(webinosImpl.proposedResource());
});
