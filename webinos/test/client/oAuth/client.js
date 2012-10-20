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
    
	var oauthService;
	
	
	//log to UI
	var log = function(msg){
		$('#messages').prepend('<li><span class="logdate">'+(new Date())+'</span><br/>'+msg+'</li>');
	};
	
	var consumer_key='05tDiDRSMguH1biNFrx1cg',
	consumer_secret='pAePWnhatjkGaDe3ACosKBRVKUeWZvPk4a0rOcmzQQ',
	access_token='407829828-pdMjfJQUX9GK54I86ggReeqlSmtBoIgjBMtD0oQi',
	access_token_secret='hlNbyqdDKlSwAq0sEvX6d76DVWydfiTQXXOSVln4';

	//register actions for all buttons
	$("#commands").delegate("button", "click", function(event){
		
		var clickedButton = event.target;
		
		switch($(clickedButton).attr('id')){
		case 'cmdInit':
				webinos.discovery.findServices(new ServiceType('http://webinos.org/mwc/oauth'), {onFound: function (service) {
					oauthService = service;
					log('<li>oAuth API found: ' + service.api + ' @ ' + service.serviceAddress + '</li>');
					// initialize it
					oauthService.init("https://twitter.com/oauth/request_token",
                 consumer_key, consumer_secret,
				 function(data){
					log('<li>oAuth API inited: ' + data + '</li>');
				 }, function(errorCode){
					log('<li>Error initing oAuth API: ' + errorCode + '</li>');
				 });
					
				}});
			break;
		case 'cmdGetTimeline':
				if(oauthService){
					oauthService.get("http://api.twitter.com/1/statuses/home_timeline.json", access_token, access_token_secret, function(data){
						log('<li>Recieved data from timeline!</li>');
						for(var i=0; i<data.length; i++) {
							log('<li>Data from : ' + data[i].user.screen_name + ' said: ' + data[i].text + '</li>');
						}
					}, function(errorCode){
						log('<li>Error retrieving timeline: ' + errorCode + '</li>');
					});
				}
			break;
		default:
			console.log('DEFAULT CASE: action for the button with id '+$(el).attr('id')+' not defined.');
		}
	});
});


