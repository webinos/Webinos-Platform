var webinosScriptPath = '../webinos.js'; // ./webinos if in widget

// Adds a script reference to the head and calls the fnc when the script is loaded
function AddScript(src, fnc) {
    var oScript = document.createElement('script');
    oScript.type = 'text/javascript';
    oScript.src = src;
    // most browsers
    oScript.onload = fnc;
    // IE 6 & 7
    oScript.onreadystatechange = function () {
        if (this.readyState == 'complete') {
            fnc();
        }
    }
    document.getElementsByTagName("head")[0].appendChild(oScript);
}

// A function to wait on android for webinos socket to appear
// and inject the webinos.js file (to support browsers)
function initWebinos(callbackFn) {
    if (window.WebSocket || window.MozWebSocket) {
        //Native websocket found.
        AddScript(webinosScriptPath, function(){webinosLoaded(callbackFn);});
    }
    else {
        if (typeof WebinosSocket == 'undefined') {
            //WebinosSocket is undefined! Waiting for it to appear
            setTimeout(initWebinos, 1);
        }
        else {
            //WebinosSocket is defined!
            AddScript(webinosScriptPath, function(){webinosLoaded(callbackFn);});
        }
    }
}

function webinosLoaded(callbackFn){
    if (typeof(callbackFn) == "function"){ //If we do care to be notified when webinos is loaded
        // Wait for webinos to initialize
        webinos.session.addListener('registeredBrowser', function (data) {
            switch (data.payload.message.state.hub) {         
                case "not_connected":
                    // not connected to hub
                    callbackFn({pzhExists: false,pzhName: ''});
                    break;
                case "connected":
                    // connected to hub
                    callbackFn({pzhExists: true,pzhName: data.from});
                    break;
            }
        });
        if(webinos.session.getSessionId()!=null){ //If the webinos has already started, force the registerBrowser event
            webinos.session.message_send({type: 'prop', payload: {status:'registerBrowser'}});
        }
    }
}