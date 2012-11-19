
var assert  = require('assert'),
  webinos = require('find-dependencies')(__dirname),
  os      = require('os'),
  path    = require("path"),
  fs      = require('fs'),
  https   = require("https"), net = require("net");

var pzh     = webinos.global.require(webinos.global.pzh.location, 'lib/pzh');
var wPath   = webinos.global.require(webinos.global.util.location, 'lib/webinosPath');
var pzp     = webinos.global.require(webinos.global.pzp.location, 'lib/pzp');
var logger  = webinos.global.require(webinos.global.util.location, 'lib/logging')(__filename);
var session = webinos.global.require(webinos.global.pzp.location, 'lib/session');

var check_webinos_connectivity = function (){
  "use strict";
  var pzh_provider, firstPzh, secondPzh, firstPzp, authCode, address;
  function getIpAddress(callback) {
    var socket = net.createConnection(80, "www.google.com");
    socket.on('connect', function() {
      socket.end();
      address = socket.address().address;
    });
  }

  function startPzh_Provider(callback) {
    pzh_provider = new pzh.provider("", "");
    pzh_provider.startProvider(function(status, details){
      assert.deepEqual(status, true);
      if(status){
        logger.log("started zone provider");
        callback(true);
      } else {
        logger.error("failed starting zone provider");
        callback(true);
      }
    });
  }

  function startPzh(userDetails, callback) {
    pzh_provider.createPzh(userDetails, function(status, uri){
      assert.deepEqual(status, true);
      if (status) {
        logger.log("successfully started pzh " + uri);
      } else {
        logger.error("failed starting pzh " + uri);
      }
      callback(status, uri);
    });
  }

  function testPzhFunctionality(callback) {
    pzh.qrcode.addPzpQRAgain(firstPzh, function(result){
      assert.deepEqual(result.cmd, 'addPzpQR');
      assert.deepEqual(result.to,  firstPzh.getSessionId());
      authCode = result.payload.code;
    });

    pzh.apis.listZoneDevices(firstPzh, function(result) {
      assert.deepEqual(result.to, firstPzh.getSessionId());
      assert.deepEqual(result.cmd, 'listDevices');
      if (result.payload.pzhs.length === 1) {
        assert.deepEqual(result.payload.pzhs[0].id, 'alicé@gmail.com (Your Pzh)');
      } else {
        assert.deepEqual(result.payload.pzhs[1].id, 'alicé@gmail.com (Your Pzh)');
        assert.deepEqual(result.payload.pzhs[0].id, 'bob@gmail.com');
      }
    });

    pzh.apis.listPzp(firstPzh, function(result){
      assert.deepEqual(result.cmd, 'listPzp');
      assert.deepEqual(result.to,  firstPzh.getSessionId());
      if (firstPzh.getConnectedPzp().length >= 1){
      } else {
        assert.deepEqual(result.payload.signedCert, []);
        assert.deepEqual(result.payload.revokedCert,[]);
      }
    });

    pzh.apis.fetchUserData(firstPzh, function(result){
      assert.deepEqual(result.cmd, 'userDetails');
      assert.deepEqual(result.to,  firstPzh.getSessionId());
      assert.deepEqual(result.payload.servername, firstPzh.getSessionId());
    });

    pzh.apis.fetchLogs(firstPzh, "error", function(result){
      assert.deepEqual(result.cmd, 'crashLog');
      assert.deepEqual(result.to,  firstPzh.getSessionId());

    });

    pzh.apis.fetchLogs(firstPzh, "info", function(result){
      assert.deepEqual(result.cmd, 'infoLog');
      assert.deepEqual(result.to,  firstPzh.getSessionId());
    });

    console.log(firstPzh.getConnectedPzh().length)
    if (firstPzh.getConnectedPzh().length <= 1){
      firstPzh.addOtherZoneCert(address+"_bob@gmail.com", pzh_provider.fetchPzh, pzh_provider.refreshCert, function(result) {
        assert.deepEqual(result.cmd, 'pzhPzh');
        assert.deepEqual(result.to,  firstPzh.getSessionId());
        assert.equal(result.payload, true);
        callback(true);
      });
    }else {
      callback(true);
    }

   // Test Authentication
   // Revoke PZP
   // Restart PZH
   // Service configuration
   // logout
   // Test auto enrollment
   // --login
   // --authenticate
   // --auto enrollment
   // --registerPzh
  }
  function startPzp(callback) {
    var pzpModules = [
      {name: "get42", params: {num: "21"}},
      {name: "geolocation", params: {connector : "geoip"}},
      {name: "discovery", params: {}}];
    var config = {pzhHost: "localhost", pzhName: "", friendlyName: ""} ;
    var local_pzp = new pzp.session();
    local_pzp.initializePzp(config, pzpModules, function(status, sessionId, csr) {
      assert.deepEqual(status, true);
      if (status){
        if (local_pzp.getSessionId().split("/") && local_pzp.getSessionId().split("/").length < 2){
          sendAutoEnrollment(address + "_"+ "alicé@gmail.com", sessionId, csr, callback);// After enrollment it will trigger pzh-pzp connection
        }else {
          callback(true, sessionId);
        }
        // Test: PZP TLS Server
        // PZP WebSocket
        // PZP TLS Client
      }
    });
    return local_pzp;
  }

  function sendAutoEnrollment(sendAdd, sessionId, csr, callback) {
    var msg = {"type": 'prop', from: sessionId, to: sendAdd, "payload": { "status": "enrollPzp", message: {csr: csr, authCode:authCode }}};
    var options = { host: sendAdd.split("_")[0],  port: 9000,  path: '/index.html?cmd=pzpEnroll', method: 'POST',
      headers: {'Content-Length': JSON.stringify(msg).length + 1 }};
    console.log(options);
    var req = https.request(options, function(res) {
      res.on('data', function(data) {
        var msg = JSON.parse(data);
        if (msg.payload && msg.payload.status ==="signedCert") {
          firstPzp.enrolledPzp(msg.from, msg.to, msg.payload.message.clientCert, msg.payload.message.masterCert, msg.payload.message.masterCrl);
          setTimeout(function(){
            callback(true, sessionId);
          },1000);
        }
      });
    });
    req.on('error', function(err) {
      logger.error(err);
    });
    req.write(JSON.stringify(msg));
    req.end();
  }

  function deleteFiles(sessionId) {
    var resolve = path.resolve(wPath.webinosPath(), firstPzh.getSessionId().split("_")[1]);
    fs.rmdir(resolve, function(){
      resolve = path.resolve(wPath.webinosPath(), secondPzh.getSessionId().split("_")[1]);
      fs.rmdir(resolve, function(){
        fs.rmdir(wPath.webinosPath() +"/"+ sessionId.split("/")[1], function(){
          process.exit();
        });
      });
    });
  }

  this.startTest = function() {
    getIpAddress();
    startPzh_Provider(function(status) {
      if(status) {
        var userDetails = { email: "alicé@gmail.com", firstname: "Alicé", country: "UK"};
        startPzh(userDetails, function(status, uri) {
          if (status) {
            firstPzh = pzh_provider.fetchPzh(uri);
            userDetails = { email: "bob@gmail.com", name: "Bob", country: "UK"};
            startPzh(userDetails, function(status, uri) {
              secondPzh = pzh_provider.fetchPzh(uri);
              testPzhFunctionality(function() {
                firstPzp = startPzp(function(status, sessionId){
                  if (status) {
                    logger.log("successfully start pzp");
                    deleteFiles(sessionId);
                  }
                });
              });
            });
          }
        });
      } else {
        logger.error("failed running tests.. aborting")
        //process.exit();
      }
    });
  }
};


var check = new check_webinos_connectivity();
check.startTest();
