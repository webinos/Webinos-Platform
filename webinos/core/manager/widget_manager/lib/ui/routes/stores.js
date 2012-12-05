(function(exports) {
    
    var http = require('http');
    var fs = require('fs');
	var path = require('path');

    var webinos = require("find-dependencies")(__dirname);
    var pzp = webinos.global.require(webinos.global.pzp.location, "lib/pzp.js");

	exports.stores = function (req, res) {
		fs.readFile((path.join(pzp.session.getWebinosPath(),'../wrt/webinos_stores.json')), function (err, data) {
			var storesData;
			if (err) {
				console.log(err);
storesData = '[{\
 \"name\": \"Megastore\", \
 \"description\": \"Fraunhofer FOKUS Megastore\", \
 \"location\": \"http://webinos.fokus.fraunhofer.de/store/", \
 \"logo\": \"http://www.fokus.fraunhofer.de/en/fame/_images/_logos/megastore_logo.png\" \
}, \
{ \
 \"name\": \"UbiApps\", \
 \"description\": \"UbiApps demonstration webinos app store\", \
 \"location\": \"http://webinos.two268.com/\", \
 \"logo\": \"http://ubiapps.com/files/2012/05/ubiapps-120.png\" \
} \
]';

			} else {
				storesData = data.toString('utf8');
			}
			var stores = JSON.parse(storesData);
			res.render('stores', { pageTitle: 'online stores', stores: stores });
		});
	};
	
    exports.list = function (req, res) {
		var options = {
			host: 'webinos.two268.com',
			port: 80,
			path: '/Store/List',
		};
        var bodyDataStr = '';
        var clientReq = http.get(options, function (clientResponse) {
            clientResponse.setEncoding('utf8');
            clientResponse.on('data', function (chunk) {
                bodyDataStr += chunk;
            });
            clientResponse.on('end', function () {
                console.log(bodyDataStr);
                var bodyData = JSON.parse(bodyDataStr);
                res.render('store', { pageTitle: 'online store', storeData: bodyData });     
            });
        });

        clientReq.on('error', function (e) {
            console.log('problem with request: ' + e.message);
            res.render('store', { pageTitle: 'online store', storeData: {} });     
        });        
    };

}(module.exports));
