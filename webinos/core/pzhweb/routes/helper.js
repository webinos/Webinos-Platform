exports.getCertsFromHostDirect = function(options, successCB, errorCB) {
    var innerReq = require("https").request(options, function(innerRes) {
        var data = "";
        innerRes.on('data', function(d) {
            data += d;
        });
        innerRes.on('end', function() {
            var certs = JSON.parse(data);
            successCB(certs);
        });
        innerRes.on('error', function(err) {
            errorCB(err);
        });
    });
    innerReq.on('error', function(err) {
        console.log(require("util").inspect(err));
        errorCB(err);
    });
    innerReq.end();
};

exports.getCertsFromHost = function(hostEmail, hostDomain, successcb, errorcb) {
    var options = {
        host: hostDomain.split(":")[0],
        port: parseInt(hostDomain.split(":")[1]) || 443,
        path: "/main/"+encodeURIComponent(hostEmail)+"/certificates/",
        method: "GET"

    };
    exports.getCertsFromHostDirect(options, successcb, errorcb);
};