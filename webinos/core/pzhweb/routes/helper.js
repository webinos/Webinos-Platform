exports.getCertsFromHostDirect = function(externalCertUrl, successCB, errorCB) {
    console.log(externalCertUrl);
    var innerReq = require("https").get(externalCertUrl, function(innerRes) {
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
        });                                                                   g
    });
    innerReq.on('error', function(err) {
        console.log(require("util").inspect(err));
        errorCB(err);
    });
    innerReq.end();
};

exports.getCertsFromHost = function(hostEmail, hostDomain, successcb, errorcb) {
    var externalCertUrl = "https://" + hostDomain + "/main/" + encodeURIComponent(hostEmail) + "/certificates/";
    exports.getCertsFromHostDirect(externalCertUrl, successcb, errorcb);
};