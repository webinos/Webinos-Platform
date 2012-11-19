//execute when site loads
$(document).ready(function() {
	
    function fillPZAddrs(data) {
		var pzhId, connectedPzp, connectedPzh;
        //If there is a pzh available
        if(typeof webinos.session.getPZHId()!="undefined") {
            pzhId = webinos.session.getPZHId();
			connectedPzp = data.payload.message.connectedPzp;
			connectedPzh = data.payload.message.connectedPzh;
		}
		var pzpId = data.from;


		if(document.getElementById('pzh_pzp_list'))
			document.getElementById('pzh_pzp_list').innerHTML="";

		$("<optgroup label = 'PZP' id ='pzp_list' >").appendTo("#pzh_pzp_list");

		var i;
		if(typeof connectedPzp !== "undefined") {
			for(i =0; i < connectedPzp.length; i++) {
				$("<option value=" + connectedPzp[i] + " >" +connectedPzp[i] + "</option>").appendTo("#pzh_pzp_list");                  
			}
		}
		$("<option value="+pzpId+" >" + pzpId+ "</option>").appendTo("#pzh_pzp_list");                      
		$("</optgroup>").appendTo("#pzh_pzp_list");
		$("<optgroup label = 'PZH' id ='pzh_list' >").appendTo("#pzh_pzp_list");
		if(typeof connectedPzh !== "undefined") {
			for(i =0; i < connectedPzh.length; i++) {
				$("<option value=" + connectedPzh[i] + " >" +connectedPzh[i] + "</option>").appendTo("#pzh_pzp_list");                  
			}
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
    
	var discoveredServices = [];
	var channelMapByName = {};
	
	//check if service is present already
	var isServiceDiscovered = function(serviceName,serviceNotFoundMessage){
		if(discoveredServices[serviceName]==null && serviceNotFoundMessage){
				alert(serviceNotFoundMessage);
		}
		return discoveredServices[serviceName]!=null;
	};
	
	//find service by name and link it
	var findServiceByName = function(serviceName){
		
	    webinos.discovery.findServices(new ServiceType('http://webinos.org/api/tv'), {onFound: function (service) {
	    	//if(!isServiceDiscovered(serviceName)){
    			discoveredServices[serviceName] = service;
    			log('<li>recent TV API found: ' + service.api + ' @ ' + service.serviceAddress + '</li>');
	    	//}else{
	    	//	console.log(serviceName+' already found.');
	    	//}
	    }});
	};
	
	//log to UI
	var log = function(msg){
		$('#messages').prepend('<li><span class="logdate">'+(new Date())+'</span><br/>'+msg+'</li>');
	};
	
	var updateUI = function(tvSourceName, channelName,stream){
		if(tvSourceName)
			$('#tvSourceLabel').text(tvSourceName);
		if(channelName)
			$('#channelNameLabel').text(channelName);
		if(stream)
			$('#videoDisplay').attr('src',stream);
		
	};
	
	//register actions for all buttons
	$("#commands").delegate("button", "click", function(event){
		
		var clickedButton = event.target;
		
		switch($(clickedButton).attr('id')){
		case 'findService':
				findServiceByName('TVManager');
			break;
		case 'getTVSources':
				if(isServiceDiscovered('TVManager','TVManager is not discovered yet.')){
					var successCallback = function(sources){
						//clear old sources.
						$('#channels').html('');
						channelMapByName={};
						$(sources).each(function(tvsource_ix,tvsource_el){
							$('#channels').append($('<li>TVSource.name: '+tvsource_el.name+'</li>'));
							$(tvsource_el.channelList).each(function(channel_ix,channel_el){
								$('#channels').append($('<li>'+channel_el.name+'<button id="setChannel" name="'+tvsource_el.name+channel_el.name+'">setChannel</button></li>'));
								channelMapByName[tvsource_el.name+channel_el.name]={tvsource:tvsource_el,channel:channel_el};
								log('CHANNEL FOUND: '+channel_el.name);
							});
						});
					};
					var errorCallback = function(){
						
					};
					discoveredServices['TVManager'].tuner.getTVSources(/*TVSuccessCB*/ successCallback, /*optional TVErrorCB*/ errorCallback);
				}
			break;
		case 'addEventListener':
			if(isServiceDiscovered('TVManager','TVManager is not discovered yet.')){
				var channelChangeHandler = function(channel){
					log('EVENT: CHANNEL CHANGED: '+JSON.stringify(channel));
					updateUI(channel.tvsource.name,channel.name,channel.stream);
				};
				discoveredServices['TVManager'].display.addEventListener('channelchange', channelChangeHandler, false);
				log("EVENTLISTENER registered.");
			}
			break;
		case 'setChannel':
				if(isServiceDiscovered('TVManager','TVManager is not discovered yet.')){
					
					var clickedChannel = channelMapByName[$(clickedButton).attr('name')];
					
					if(clickedChannel){
					
					var successCallback = function(channel){
						console.log('setChannel ok.');
						log('CHANNEL CHANGED: '+JSON.stringify(channel));
						updateUI(channel.tvsource.name,channel.name,channel.stream);
					};
					var errorCallback = function(){
						console.log('setChannel failed.');
					};
					discoveredServices['TVManager'].display.setChannel(/*Channel*/ clickedChannel.channel, /*TVDisplaySuccessCB*/ successCallback, /*TVErrorCB*/ errorCallback);
					}else{
						console.log("ERROR: channel "+$(clickedButton).attr('name')+" not found.");
					}
				}
			break;
			
		case 'getEPGPIC':
			if(isServiceDiscovered('TVManager','TVManager is not discovered yet.')){
				discoveredServices['TVManager'].display.getEPGPIC('dummychannel',function(epg){
					console.log(epg);
				});
			}
			break;
		default:
			console.log('DEFAULT CASE: action for the button with id '+$(el).attr('id')+' not defined.');
		}
	});
});


