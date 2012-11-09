var devicestatusservice;

$(document).ready(
	function () {

        function fillPZAddrs(data) {
            var pzhId, connectedPzp, connectedPzh;
            var pzpId = data.from;
            //If there is a pzh available
            if(typeof webinos.session.getPZHId()!="undefined") {
                pzhId = webinos.session.getPZHId();
                connectedPzp = data.payload.message.connectedPzp;
                connectedPzh = data.payload.message.connectedPzh;
            }
            
            if(document.getElementById('pzh_pzp_list'))
                document.getElementById('pzh_pzp_list').innerHTML="";
    
            $("<optgroup label = 'PZP' id ='pzp_list' >").appendTo("#pzh_pzp_list");
            var i;
            if (typeof connectedPzp!= "undefined") //If we have some pzps
            for(i =0; i < connectedPzp.length; i++) {
                $("<option value=" + connectedPzp[i] + " >" +connectedPzp[i] + "</option>").appendTo("#pzh_pzp_list");                  
            }
            $("<option value="+pzpId+" >" + pzpId+ "</option>").appendTo("#pzh_pzp_list");                      
            $("</optgroup>").appendTo("#pzh_pzp_list");
            $("<optgroup label = 'PZH' id ='pzh_list' >").appendTo("#pzh_pzp_list");
            if (typeof connectedPzh !="undefined")
            for(i =0; i < connectedPzh.length; i++) {
                $("<option value=" + connectedPzh[i] + " >" +connectedPzh[i] + "</option>").appendTo("#pzh_pzp_list");                  
            }
            $("</optgroup>").appendTo("#pzh_pzp_list");
        }
        webinos.session.addListener('registeredBrowser', fillPZAddrs);
        //TODO: Perhaps we should be reading the info from the already loaded webinos.
        if(webinos.session.getSessionId()!=null){ //If the webinos has already started, force the registerBrowser event
            webinos.session.message_send({type: 'prop', payload: {status:'registerBrowser'}});
        }
        
        function updatePZAddrs(data) {
            if(typeof data.payload.message.pzp !== "undefined") {
                $("<option value=" + data.payload.message.pzp + " >" +data.payload.message.pzp + "</option>").appendTo("#pzp_list");
            } else {
                $("<option value=" + data.payload.message.pzh + " >" +data.payload.message.pzh + "</option>").appendTo("#pzh_list");
            }
        }
        webinos.session.addListener('update', updatePZAddrs);
        
        function printInfo(data) {
            $('#message').append('<li>'+data.payload.message+'</li>');
        }
        webinos.session.addListener('info', printInfo);
        
		function loadAspects () {
			for (var aspect in vocabulary) {
				successCB = function(res) {
					if (res.isSupported) {
						aspects_list.options[aspects_list.options.length] = new Option(res.aspect);
					}
				};
				devicestatusservice.isSupported(aspect, null, successCB);
			}
		}
		
		function loadComponents(components) {
            for (var i = 0; i <components.length; i++)
			components_list.options[components_list.options.length] = new Option(components[i]);
		}

		function loadProperties(aspect) {
			for (var propertyIndex in vocabulary[aspect].Properties) {
				property = vocabulary[aspect].Properties[propertyIndex];
				successCB = function(res) {
					if (res.isSupported) {
						properties_list.options[properties_list.options.length] = new Option(res.property);
					}
				};
				devicestatusservice.isSupported(aspect, property, successCB);
			}
		}

		$('#findService').click(
			function () {
				var address = $('#pzh_pzp_list').val();

				webinos.discovery.findServices(
					new ServiceType("http://wacapps.net/api/devicestatus"),
					{onFound:
						function (service) { 
							devicestatusservice = service;
						} }
				);
			}
		);

		$('#bindService').click(
			function () {
				devicestatusservice.bindService(
					{onBind:
						function (service) {
							loadAspects();
						} }
				);
			}
		);

		$('#getComponents').click(
			function () {
				aspect = $('#aspects_list').val();
				loadProperties(aspect);

				successCB = function (value) { loadComponents(value); };
				errorCB = function (value) { alert("Error: " + value); };
				devicestatusservice.getComponents(aspect, successCB, errorCB);
			}
		);

		$('#getPropertyValue').click(
			function () {
		
				var prop = {component: $('#components_list').val(), aspect: $('#aspects_list').val(), property: $('#properties_list').val()},
				successCB = function (value) { alert("Success => " + prop.property + ": " + value ); };
				errorCB = function (value) { alert("Error: " + value); };
				devicestatusservice.getPropertyValue(successCB, errorCB, prop);
			}
		);

		$('#aspects_list').change(
			function () {
				$('#components_list').empty();
				$('#properties_list').empty();
			}
		);

	}
);
