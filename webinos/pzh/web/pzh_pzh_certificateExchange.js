
var https   = require("https");
var webinos = require('find-dependencies')(__dirname);
var logger  = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;

exports.sendCertificate = function( to, serverName, webServerPort, providerPort, masterCert, masterCrl, fetchPzh, refreshCert, connectOtherPZH, callback) {
  var payload = {
      to  : to, from: serverName,
      payload: {
        status: "sendCert", message:{cert: masterCert, crl : masterCrl}}
    },
    length = (JSON.stringify(payload).length % 2 === 0)? JSON.stringify(payload).length + 1: JSON.stringify(payload).length,
    options= {
      host: to.split('_')[0],
      port: webServerPort,
      path: "/main.html?cmd=transferCert",
      method:"POST"//,
      //headers: { 'Content-Length': length}
    };
  logger.log("pzh to pzh connection initiated");
  var req = https.request(options, function(res) {
    res.on('data', function(data) {
      var parse = JSON.parse(data);
      if (parse.payload && parse.payload.status === "receiveCert") {
        logger.log("pzh to pzh receive response");
        var instance = fetchPzh(parse.to);
        if(instance) {
          instance.addExternalCert(parse, function(serverName, options){
            refreshCert(serverName, options);
            connectOtherPZH(to, options, providerPort, callback);
          });
        } else {
          callback({to: parse.to, cmd: 'pzhPzh', payload: "Pzh does not exist in this farm"});
        }
      } else if (parse.payload.status === "error") {
        logger.error(parse.payload.message);
        callback({to: parse.to, cmd: 'pzhPzh', payload: parse.payload.message});
      }
    });
  });
  req.on('error', function(err) {
    logger.error(err);
    if (callback) { callback({to: serverName, cmd: 'pzhPzh', payload: "pzh to pzh certificate exchange failed due to "+ err.message});}
  });
  req.write(JSON.stringify(payload));
  req.end();
};
