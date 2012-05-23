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
var vows  = require('vows'),
  assert  = require('assert'),
  webinos = require('webinos')(__dirname),
  os      = require('os');

var pzh     = webinos.global.require(webinos.global.pzh.location, 'lib/pzh');
var pzp     = webinos.global.require(webinos.global.pzp.location, 'lib/pzp');
var session = webinos.global.require(webinos.global.pzp.location, 'lib/session');

// First start farm ..
exports.desc  = desc  = vows.describe('Start Farm');
exports.desc1 = desc1 = vows.describe('Add PZH');
exports.desc2 = desc2 = vows.describe('PZH Functionality');
exports.desc3 = desc3 = vows.describe('PZH - PZP Functionality');
exports.desc4 = desc4 = vows.describe('PZP Functionality');

var firstPzh, secondPzh, firstPzp, secondPzp, name;
/**
 * Create a PZH Farm
 * 1. Create PZH farm instance
 * 2. Check PZH farm status
 * 3. Check PZH farn certificate
 * 4. Check if web server certifcates are in place
 **/
desc.addBatch({
  'start farm': {
    topic: function() {
      name = os.hostname();
      pzh.farm.startFarm('localhost', '', this.callback);
    },
    'check status': function(results, configure) {
      assert.isTrue(results);
      assert.equal(configure.type, "PzhFarm");
      assert.equal(configure.name, name+"_PzhFarm");
      assert.equal(configure.serverName, "localhost");
    },
    'check certificates': function(results, config) {
      assert.isString(config.own.cert);
      assert.equal(config.own.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
      
      assert.isString(config.master.cert);
      assert.equal(config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
      
      assert.isString(config.master.crl);
      assert.equal(config.master.crl.substring(0,24), "-----BEGIN X509 CRL-----");
    },
    'check web interface': function(results, config) {
      assert.isString(config.webServer.cert);
      assert.equal(config.webServer.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
    },
  }
});
/**
 * Create a PZH in PZH Farm
 * 1. Create pzh instance
 * 2. Check PZH status
 * 3. Check PZH certificate
 **/
desc1.addBatch({
  'PZH Alice Initialization': {
    topic: function() {
      var userDetails = {};
      userDetails.username = 'Alice'
      pzh.farm.getOrCreatePzhInstance('localhost', userDetails, this.callback);
    },
    'check PZH status': function(name, pzh) {
      firstPzh = pzh;
      assert.equal(pzh.config.serverName, 'localhost/Alice');
      assert.equal(pzh.config.name, 'Alice');
      assert.equal(pzh.config.type, 'Pzh');      
    },
    'check PZH certificate': function(name, pzh) {
      assert.isString(pzh.config.own.cert);
      assert.equal(pzh.config.own.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");

      assert.isString(pzh.config.master.cert);
      assert.equal(pzh.config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");

      assert.isString(pzh.config.master.crl);
      assert.equal(pzh.config.master.crl.substring(0,24), "-----BEGIN X509 CRL-----");
    },
    
  }
});

/**
 * Test PZH Functionalities
 * 1. Check list devices
 * 2. Check if new code is generated
 **///Alicé
desc2.addBatch({
  'list devices': {
    topic: function() {
      pzh.apis.listZoneDevices(firstPzh, this.callback);
    },
    'device status': function(result, result1) {
      assert.isNotNull(result.payload.pzhs);
    }
  },
  'add new pzp code': {
    topic: function() {
      pzh.apis.addPzpQR(firstPzh, this.callback);
    },
   'check pzp code': function(result, result1) {
      code = result.payload.code;
      assert.equal(result.cmd, 'addPzpQR');
      assert.isNotNull(result.payload.code);
    }
  }
});

/**
 * Test PZH - PZP connection
 * 1. First generate authCode
 * 2. Initialize PZP
 * 3. Check PZP status 
 * 4. Check if certificates are in place
 **/
desc3.addBatch({
  'PZH to PZP communication': {
    topic:function() {
      var self = this;
      pzh.apis.addPzpQR(firstPzh, function(result) {
        var pzpModules = [
          {name: "context", param: {}},
          {name: "events", param: {}},
          {name: "get42", param: {}}
        ];
        var config = {};
        config.pzhHost = 'localhost/Alice';
        config.pzpHost = 'localhost'
        config.pzpName = '';
        config.code    = result.payload.code;
        var pzp1 = new pzp.session();
        pzp1.initializePzp(config, pzpModules, self.callback);
      });
    },
    'check PZP Status ': function(result, instance) {
      firstPzp = instance;
      assert.equal(result, 'startedPZP');
      assert.equal(firstPzp.config.name, name+"_Pzp");
      assert.equal(firstPzp.config.type, "Pzp");
      assert.equal(firstPzp.config.serverName, 'localhost/Alice')
      assert.equal(firstPzp.config.pzhId, 'Alice');
    },
    'check certificate' : function(result, instance) {
      assert.isString(instance.config.own.cert);
      assert.equal(instance.config.own.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
      assert.isString(instance.config.master.cert);
      assert.equal(instance.config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
      }
  },
});
/**
 * Test Service Discovery
 * Test done:
 * 1. Find Service 
 * 2. Bind Service
 * 3. Check result of bind service if the service is found
 * */
desc4.addBatch({
  'PZP functionality':{
    topic: function() {
      var self = this;
      var service42
      var ServiceDisco = webinos.global.require(webinos.global.wrt.location, 'lib/webinos.servicedisco').ServiceDiscovery;
      var get42        = webinos.global.require(webinos.global.wrt.location, 'lib/webinos.get42').TestModule;
      console.log(get42)
      var discovery    = new ServiceDisco(firstPzp.rpcHandler);
      discovery.findServices(new ServiceType('http://webinos.org/api/test'),
        { onFound: function (service) {
          service42 = service;
          service42.bindService({onBind:self.callback});
      }});
    },
    'check bind service result': function(bindResult, result1) {
      assert.equal(bindResult.api, 'http://webinos.org/api/test');
      assert.equal(bindResult.serviceAddress, firstPzp.sessionId);
      assert.equal(bindResult._testAttr, 'HelloWorld');
    }
  },
})
