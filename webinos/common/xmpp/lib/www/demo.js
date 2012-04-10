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
*******************************************************************************/

/*
 * demo.js
 *
 * This file contains javascript for the demo application.
 *
 * Authors: Victor Klos & Eelco Cramer (TNO)
 */


/**
 * Creates the socket communication channel
 * for a locally hosted websocket server at port 8080
 * for now this channel is used for sending RPC, later the webinos
 * messaging/eventing system will be used
 */
function createCommChannel( port ) {
	var ws_uri = 'ws://' + window.location.hostname + ':' + port;
	try {
	    channel  = new WebSocket(ws_uri);
	} catch(e) {
		channel  = new MozWebSocket(ws_uri);
	}
	channel.onopen = function() {
	    $('#status').css('background-color', 'yellowgreen');
		//webinos.rpc.setWriter(write);
		//if (typeof successCB === 'function') successCB();
	};
	channel.onmessage = function(ev) {
		var j = jQuery.parseJSON(ev.data);
		if (j.jid) {
			$('#status')[0].innerHTML = " " + j.jid;
		}
		//alert("got" + j.jid);
		$('#status').html = "celebrate?";
		//webinos.rpc.handleMessage(ev.data);
	};
}

	
$(document).ready(function () {
    // make other top fieldsets same height as action_group (possible in css but how? :-)
    $('#actions_group').siblings().css('min-height', $('#actions_group').css('height'));
    
    // install handler for toggle logging button
    $('#toggle-logging').click( function() { $('#logging-console').toggle('fast'); });
    
    // now login (should be implicit in the future, but hey: this is a demo...)
    $('#status').css('background-color', 'darkorange');

    // Setup webinos discovery
    if ("webinosDiscoAndBootstrap" in window) {
        webinosDiscoAndBootstrap.connect(function() {
			webinosDiscoAndBootstrap.resolveLocalFeatures(onServiceHandler);
	        // set handlers for service discovery
	        webinosDiscoAndBootstrap.findServices({api: webinosDiscoAndBootstrap.NS.GEOLOCATION}, onServiceHandler);
	        webinosDiscoAndBootstrap.findServices({api: webinosDiscoAndBootstrap.NS.GET42}, onServiceHandler);
		});
    }

    // Add handlers to buttons and checkboxes on page
   	$('#input').keydown(function (e) {        // input field for talking back XMPP
        if (e.ctrlKey && e.keyCode == 13) {   // ctrl-Enter pressed
            $('#send_button').click();
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
	if (services[s.id] != null) {
		// we already have this service.
		return;
	}
	
    services[s.id] = s;  // keep service object
    
    // if the service becomes unavailable remove it from the GUI and from the administration
    s.onRemove = function(service) {
        delete services[this.id];
        $("#" + this.id).fadeOut('fast', function() {$(this).remove(); });
    }
    
    // Add the service to the GUI
	var target;
	if (s.isMine()) {
		if (s.isLocal()) {
			target = "#your_local_services_group";
		} else {
			target = "#your_remote_services_group";
		}
	} else {
		target = "#buddies_services_group";
	}

    var topText = (s.name == 'geolocation') ? "Location: unknown" : s.name;
    var element = $("<div class='service " + s.name + "' id='" + s.id + "'>" + topText + "<br><em>" + s.device + "</em></div>" )
        .hide().appendTo(target).fadeIn('fast');

    // Attach handlers for service removal and invocation
    // $(element).click( function() {invoke($(this).attr('id'));} );
    $(element).click( function() {invoke(s.id);} );
    
    // Install handlers that present results of geolocation queries
    if (s.name == 'geolocation') {
        s.onResult = function(location) {
            $('#' + s.id).html(location.coords.latitude + '&deg; / ' + location.coords.longitude + "&deg;<br><em>" + s.device + "</em>").effect("pulsate", { times:1 }, 400);
        };
        s.onError = function(err) {
            $('#' + s.id).html("<span class=geo-error>" + err + "</span><br><em>" + s.device + "</em>").effect("pulsate", { times:1 }, 400);
        };
    }

    if (s.name == 'get42') {
        s.onResult = function(result) {
            $('#' + s.id).html('Value = ' + result + "<br><em>" + s.device + "</em>").effect("pulsate", { times:1 }, 400);
        };
        s.onError = function(err) {
            $('#' + s.id).html("<span class=geo-error>" + err + "</span><br><em>" + s.device + "</em>").effect("pulsate", { times:1 }, 400);
        };
    }

	if (s.isLocal()) {
		var checkbox = $("<input id='cb" + s.id + "' type='checkbox' name='" + s.id + "'>" + s.friendlyName + "</input><br>");

		if (s.isShared()) {
			checkbox.attr('checked', true);
		}

		$(checkbox).click(function() {
	        webinosDiscoAndBootstrap.shareService($(this).attr('name'), $(this).is(':checked'))
	    });
	
		checkbox.hide().appendTo("#actions_group").fadeIn('fast');
	} 
}

function invoke(s_id) {
    var service = services[s_id];
    service.invoke(s_id);
    
    // if geolocation invoke show status pending
   // if (service.name == "geolocation")
       $('#' + s_id).html("Location: <strong>pending</strong><br><em>" + service.device + "</em>");
}

// Install triggers for 'onConnect' and 'onDisconnect'.
// (Temporary construct, will probably be quite diff in final webinos.)
$(document).bind('onWebinosConnect', function (event, j) {
    $('#status').css('background-color', 'yellowgreen');

	if (j.device) {
		$('#status')[0].innerHTML = j.device;
	}
	
	$('#status').html = "celebrate?";
});

$(document).bind('onWebinosDisconnect', function () {
	services = [];
	$('.service').remove();

    $('#status').css('background-color', 'firebrick');
    $('#connect-button').removeAttr('disabled').attr('value', 'Reconnect');
});

