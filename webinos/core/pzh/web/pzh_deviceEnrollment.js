/*******************************************************************************
 *  Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
 *******************************************************************************/

var utils = require("util");
var fs    = require("fs");
var path  = require("path");

var qrcode = require("../lib/pzh_qrcode.js");

var webinos = require('find-dependencies')(__dirname);
var logger   = webinos.global.require(webinos.global.util.location, "lib/logging.js")(__filename) || console;
var content = webinos.global.require(webinos.global.util.location, "lib/content.js");

var openid = require("./pzh_openid.js");
/**
 *
 * @constructor
 */
var Pzh_DeviceEnrollment = function() {
  var storeTempDetails = [];//Used by the register pzh function, value is entered in verify function
  var parent = this;

  /**
   *
   * @param res
   * @param from
   * @param to
   * @param cmd
   * @param payload
   */
  function prepMsg(res, from, to, cmd, payload){
    var msgSend = {"type":"prop",
      "from":from,
      "to":to,
      "payload":{
        "status" :cmd,
        "message": payload
      }
    };
    res.write(JSON.stringify(msgSend));
    res.end();
  }

  /**
   *
   * @param query
   * @return {Object}
   */
  function createEnrollMsg(query) {
    return { "type":"prop",
      "from": query.from,
      "to": query.to,
      "payload":
      { "status":"clientCert",
        "message":
        {
          "code": query.payload.message.authCode,
          "csr" : query.payload.message.csr
        }
      }
    };
  }

  /**
   *
   * @param res
   * @param query
   */
  function login(res, query) {
    var filename = path.join(__dirname, "index.html");
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        res.writeHeader(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
      } else {
        //res.writeHeader(200, content.getContentType(filename));
        prepMsg(res, query.to, query.from, "login", file);
      }
    });
  }
  /**
   *
   * @param res
   * @param query
   */
  function authenticate(address, port, res, query){
    var provider;
    if(query.payload.message.provider === "google") {
      provider = 'http://www.google.com/accounts/o8/id'
    } else {
      provider  = 'http://open.login.yahooapis.com/openid20/www.yahoo.com/xrds';
    }

    openid.authenticate(address, port, provider, query.payload.message.returnPath, function(status, url){
      if(status){
        prepMsg(res, query.to, query.from, "authenticate", url);
      } else {
        prepMsg(res, query.to, query.from, "error",  query.payload.message.returnPath);
      }
    });
  }
  /**
   *
   * @param res
   * @param query
   */
  function registerPzh(res, query) {
    if (storeTempDetails[query.to]) {
      parent.createPzh(storeTempDetails[query.to], function(status, value) {
        if (status) {
          var pzhInstance = parent.fetchPzh(value);
          qrcode.addPzpQRAgain(pzhInstance, function(result) {
            prepMsg(res, value, query.from, "authStatus", {connected:"true", authCode: encodeURIComponent(result.payload.code)});
          });
        } else {
          prepMsg(res, query.to, query.from, "error",  "request for the creating pzh failed " + value);
        }
      });
    } else {
      prepMsg(res, query.to, query.from, "error",  "not authenticated");
    }
  }
  /**
   *
   * @param res
   * @param query
   */
  function enrollPzp(res,  query) {
    if (storeTempDetails[query.to]) {
      var pzhInstance = parent.fetchPzh(query.to);
      pzhInstance.pzh_state.expecting.isExpected(function(expected) {
        if (!expected){
          prepMsg(res, query.to, query.from, "error", "not expecting new pzp");
        } else {
          var msg = createEnrollMsg(query);
          pzhInstance.enroll.addNewPZPCert(msg, function(err, msgSend) {
            res.write(JSON.stringify(msgSend));
            res.end();
          });
        }
      });
      delete storeTempDetails[query.to];
    } else {
      prepMsg(res, query.to, query.from, "error",  "not authenticated");
    }
  }
  /**
   *
   * @param res
   * @param query
   */
  function enrollPzh (res, query){
    var instance = parent.fetchPzh(query.to);
    if(!instance) {
      prepMsg(res, query.to, query.from, "error", "pzh "+ query.to + " does not exist with this provider");
    } else {
      instance.pzh_pzh.addExternalCert(query, function(serverName, options, masterCert, masterCrl){
        prepMsg(res, serverName, query.from, "receiveCert", {cert: masterCert,crl: masterCrl});
        parent.refreshCert(serverName, options);
      });
    }
  }
  /**
   * This is part of session handling function
   * @param res
   * @param id
   * @param query
   * @param details
   */
  this.verifyPzpHandling = function(res, id, query, details) {
    storeTempDetails[id]=details;
    if (parent.fetchPzh(id)) {
      var instance = parent.fetchPzh(id);
      qrcode.addPzpQRAgain(instance, function(result) {
        res.writeHeader(200, {'Content-Type':'application/x-javascript; charset=UTF-8'});
        res.writeHead(302, {Location: "http://"+query.returnPath + "?cmd=authStatus&connected=true&pzhid="+id+"&authCode="+encodeURIComponent(result.payload.code)});
        res.end();
      });
    } else {
      res.writeHeader(200, {'Content-Type':'application/x-javascript; charset=UTF-8'});
      res.writeHead(302, {Location: "http://"+query.returnPath + "?cmd=authStatus&connected=false&pzhid="+id});
      res.end();
    }
  };
  /**
   *
   * @param res
   * @param query
   */
  this.handleEnrollmentReq = function(hostname, port, res, query) {
    logger.log("device/pzh enrollment msg: " + JSON.stringify(query));
    switch(query.payload.status) {
      case "login":
        login(res, query);
        break;
      case 'authenticate':
        authenticate(hostname, port, res, query);
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
};


module.exports = Pzh_DeviceEnrollment;