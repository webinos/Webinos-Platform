/*
 * xmppdemo.js
 *
 * This file contains javascript for the demo application.
 *
 * Author: Victor Klos (TNO)
 */
$(document).ready(function () {

    // make other top fieldsets same height as action_group (possible in css but how? :-)
    $('#actions_group').siblings().css('min-height', $('#actions_group').css('height'));
    
    // install handlers for toggle buttons
    $('#toggle-logging').click( function() { $('#logging-console').toggle('fast'); });
    $('#toggle-raw-logging').click( function() { $('#raw-logging-console').toggle('fast'); });
    
    // install handler for dis/re- connect button
    var is_reconnect = false;
    $('#reconnect_button').click( function() {} );
    
    // Setup webinos
    if ("webinos" in window) {
        // here we go! Firstly setup logging
        webinos.setParams({log: '#logging-console', raw: '#raw-logging-console'});
        
        // set handlers for service discovery
        webinos.findServices({api: webinos.NS.GEOLOCATION}, onServiceHandler);
        webinos.findServices({api: webinos.NS.REMOTE_ALERT}, onServiceHandler);
        
        // now login (should be implicit in the future, but hey: this is a demo...)
        $('#status').css('background-color', 'darkorange');
        webinos.connect();
    }

    // Add handlers to buttons and checkboxes on page
   	$('#input').keydown(function (e) {        // input field for talking back XMPP
        if (e.ctrlKey && e.keyCode == 13) {   // ctrl-Enter pressed
            $('#send_button').click();
        }
    });
    // add handler to checkboxes on page, these share/unshare our own services
    $('#share-location').attr('checked', false);     // clear geoloc
    $('#share-remote-alert').attr('checked', true); // check remote alert
    $('#share-location').change(function() {
        webinos.shareService(webinos.NS.GEOLOCATION, $(this).is(':checked'))
    });
    $('#share-remote-alert').change(function() {
        webinos.shareService(webinos.NS.REMOTE_ALERT, $(this).is(':checked'))
    });
    
    // disable the location service sharing if there is no location info support
    if (!navigator.geolocation) {
        $('#share-location').attr('disabled', true);
    }
    
    // disable XMPP logging button if on mobile
    if (webinos.isMobile()) {
        $('#toggle-raw-logging').attr('disabled', true);
    }

    // add handler for dis/reconnect button
    $('#connect-button').click( function(e) {
        var target = $(e.target);
        target.attr('disabled', 'disabled');
        if (target.attr('value') == 'Disconnect') {
            webinos.disconnect();
        } else {
            $('#status').css('background-color', 'orange');
            webinos.connect();
        }
    });
});

// Keep administration as associative array of {service id, service object}
var services = {};

/*
 * Handler for all service discovery, takes a service object
 * It is called on each newly discovered service. Has threefold task:
 * 1) do administration
 * 2) update GUI
 * 3) install handlers for removal and invocation
 */
function onServiceHandler(s) {
    services[s.id] = s;  // keep service object
    
    // if the service becomes unavailable remove it from the GUI and from the administration
    s.onRemove = function(service) {
        delete services[this.id];
        $("#" + this.id).fadeOut('fast', function() {$(this).remove(); });
    }
    
    // Add the service to the GUI
    var target = (s.isMine()) ? "#your_services_group" : "#buddies_services_group";
    var topText = (s.name == 'geolocation') ? "Location: unknown" : s.name;
    var element = $("<div class='service " + s.name + "' id='" + s.id + "'>" + topText + "<br><em>" + s.device + "</em></div>" )
        .hide().appendTo(target).fadeIn('fast');

    // Attach handlers for service removal and invocation
    $(element).click( function() {invoke($(this).attr('id'));} );
    
    // Install handlers that present results of geolocation queries
    if (s.name == 'geolocation') {
        s.onResult = function(lat, lon) {
            $('#' + this.id).html(lat + '&deg; / ' + lon + "&deg;<br><em>" + s.device + "</em>").effect("pulsate", { times:1 }, 400);
        };
        s.onError = function(err) {
            $('#' + this.id).html("<span class=geo-error>" + err + "</span><br><em>" + s.device + "</em>").effect("pulsate", { times:1 }, 400);
        };
    }
}

function invoke(s_id) {
    var service = services[s_id];
    service.invoke();
    
    // if geolocation invoke show status pending
    if (service.name == "geolocation")
        $('#' + s_id).html("Location: <strong>pending</strong><br><em>" + service.device + "</em>");
}

// Install triggers for 'onConnect' and 'onDisconnect'.
// (Temporary construct, will probably be quite diff in final webinos.)
$(document).bind('onWebinosConnect', function () {
    $('#status').css('background-color', 'yellowgreen');
    $('#connect-button').removeAttr('disabled').attr('value', 'Disconnect');

    // share services according to checkboxes
    if ($('input[id=share-location]').is(':checked'))
        webinos.shareService(webinos.NS.GEOLOCATION, true);
    if ($('input[id=share-remote-alert]').is(':checked'))
        webinos.shareService(webinos.NS.REMOTE_ALERT, true);
        
    // update user name
    $('#status').html(webinos.device);
});
$(document).bind('onWebinosDisconnect', function () {
	services = [];
	$('.service').remove();

    $('#status').css('background-color', 'firebrick');
    $('#connect-button').removeAttr('disabled').attr('value', 'Reconnect');
});

