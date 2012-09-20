
var utils = require("util");
var fs    = require("fs");
var path  = require("path");

var pzhP        = require("../lib/pzh_provider.js");
var pzh_openid  = require("./pzh_openid.js");
var qrcode      = require("../lib/pzh_qrcode.js")

var webinos = require('webinos')(__dirname);
var log    = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename);
var content= webinos.global.require(webinos.global.util.location, "lib/content.js");

var Pzh_DeviceEnrollment = function() {
  pzh_openid.call(this);
  var storeDetails = [];
  var self = this;
  function prepErrorMsg(value){
    var msgSend = {"type":"prop","payload":{
      "status":"error",
      "message": value
    }
    }
  }

  function login(res, query) {
    var filename = path.join(__dirname, "index.html");
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        res.writeHeader(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
      } else {
        res.writeHeader(200, content.getContentType(filename));
        var msg = {"type" : "prop",
          "to"   : query.from,
          "from" : query.to,
          "payload":{"status":query.payload.status,
            "message":file}};
        res.write(JSON.stringify(msg));
        res.end();
      }
    });
  }

  function registerPzh(res, query) {
    if (storeDetails[query.from.split("/")[0]]) {
      self.createPzh(storeDetails[query.from.split("/")[0]], function(status, value) {
        var msgSend;
        if (status) {
          msgSend = {"type":"prop","from":value, "to": query.from,
            "payload":
            {
              "status":"authStatus",
              "message": {
                "connected": "true",
                "authCode":""
              }
            }
          };
          var pzhInstance = self.fetchPzh(value);
          qrcode.addPzpQRAgain(pzhInstance, function(result) {
            msgSend.payload.message.authCode = result.payload.code;
            res.write(JSON.stringify(msgSend));
            res.end();
          });
        } else {
          msgSend = {"type":"prop","payload":{"status":"error",   "message": "request for the creating pzh failed " + value}};
          res.write(JSON.stringify(msgSend));
          res.end();
        }
      });
    }
  }

  function enrollPzp(res, query) {
    var pzhInstance = self.fetchPzh(query.to);
    pzhInstance.expecting.isExpected(function(expected) {
      var msgSend;
      if (!expected){
        msgSend = {"type":"prop","payload":{"status":"error",   "message": "not expecting new pzp"}};
        res.write(msgSend);
        res.end();
      } else {
        var validMsgObj = { "type":"prop", "from": query.from, "to": query.to, "payload":
        { "status":"clientCert",
          "message":
          {
            "code": query.payload.message.authCode,
            "csr" : query.payload.message.csr
          }
        }
        };
        pzhInstance.addNewPZPCert(validMsgObj, function(err, msgSend) {
          if (!err) {
            msgSend = {"type":"prop","payload":{"status":"error", "message": "creating new pzp failed, due to " + msgSend }};
            res.write(msgSend);
            res.end();
          } else {
            res.write(JSON.stringify(msgSend));
            res.end();
          }
        });
      }
    });
  }

  function enrollPzh (res, query){
    var instance = self.fetchPzh(query.to);
    if(!instance) {
      res.write(JSON.stringify({to: query.from, payload: {status: 'error', message: "pzh "+ query.to + " does not exist with this provider"}}));
      res.end();
    } else {
      instance.addExternalCert(query.to, query, res, function(serverName, options){
        self.refreshCert(serverName, options);
      });
    }
  }

  this.handleEnrollmentReq = function(res, query) {
    log.info("device/pzh enrollment msg: " + JSON.stringify(query));
    if (query.from) {

    }
    switch(query.payload.status) {
      case "login":
        login(res, query);
        break;
      case 'authenticate':
        if(query.payload.message.provider === "google") {
          storeDetails[query.from] = query;
          this.authenticate( 'http://www.google.com/accounts/o8/id', res, query);
        } else {
          storeDetails[query.from] = query;
          this.authenticate('http://open.login.yahooapis.com/openid20/www.yahoo.com/xrds', res, query);
        }
        break;
      case "registerPzh":
        registerPzh(res, query);
        break;
      case 'enrollPzp':
        enrollPzp(res, query);
        break;
      case "sendCert": // This is pzh enrollment
        enrollPzh(res, query);
        break;

    }
  };

  this.getStoreInfo = function(id) {
    return storeDetails[id];
  };
  this.setStoreInfo = function(id, value) {
    storeDetails[id] = value;
  };
};

utils.inherits(Pzh_DeviceEnrollment, pzh_openid);

module.exports = Pzh_DeviceEnrollment;