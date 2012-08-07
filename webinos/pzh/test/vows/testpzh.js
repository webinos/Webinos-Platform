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
  os      = require('os'),
  fs      = require('fs');

var pzh     = webinos.global.require(webinos.global.pzh.location, 'lib/pzh');
var pzp     = webinos.global.require(webinos.global.pzp.location, 'lib/pzp');
var session = webinos.global.require(webinos.global.pzp.location, 'lib/session');

// First start farm ..
exports.desc  = desc  = vows.describe('Start Farm');
exports.desc1 = desc1 = vows.describe('Add PZH');
exports.desc2 = desc2 = vows.describe('PZH Functionality');
exports.desc3 = desc3 = vows.describe('PZH - PZP Functionality');
exports.desc4 = desc4 = vows.describe('PZP Functionality');
exports.desc5 = desc5 = vows.describe('Cleanup');

var firstPzh, secondPzh, firstPzp, secondPzp, name, serverName;
/**
 * Create a PZH Farm
 **/
desc.addBatch({
  'start farm': {
    topic: function() {
      name = os.hostname();
      session.common.fetchIP(function(addr) {
        serverName = addr;
      });
      pzh.farm.startFarm('', '', this.callback);
    },
    'check if farm is started status': function(results, config) {
      assert.isTrue(results);
    },
    'check if type and name are set': function(results, config) {
      assert.equal(config.type,"PzhFarm");
      assert.equal(config.name, name+"_PzhFarm");
    },
    'check if IP address is properly set' : function(results, config) {
      assert.equal(config.serverName, serverName);
    },
    'check connection certificates': function(results, config) {
      assert.isString(config.own.cert);
      assert.equal(config.own.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
    },
    'check master certificates': function(results, config) {
      assert.isString(config.master.cert);
      assert.equal(config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
    },
    'check master crl': function(results, config) {
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
 **/
desc1.addBatch({
  'PZH Alice Initialization': {
    topic: function() {
      var userDetails = {};
      userDetails.username = 'Alicé'
      pzh.farm.createPzh(serverName, userDetails, this.callback);
    },
    'check PZH status': function(name, pzh) {
      firstPzh = pzh;
      assert.equal(pzh.config.serverName, serverName+'/Alicé');
    },
    'check PZH name and type': function(name, pzh) {
      assert.equal(pzh.config.name, 'Alicé');
      assert.equal(pzh.config.type, 'Pzh');
    },
    'check PZH connection certificate': function(name, pzh) {
      assert.isString(pzh.config.own.cert);
      assert.equal(pzh.config.own.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
    },
    'check PZH master certificate': function(name, pzh) {
      assert.isString(pzh.config.master.cert);
      assert.equal(pzh.config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
    },
    'check PZH master crl': function(name, pzh) {
      assert.isString(pzh.config.master.crl);
      assert.equal(pzh.config.master.crl.substring(0,24), "-----BEGIN X509 CRL-----");
    },
  }
});

/**
 * Test PZH Functionalities
 **/
desc2.addBatch({
  'list devices': {
    topic: function() {
      pzh.apis.listZoneDevices(firstPzh, this.callback);
    },
    'check command and to field': function(result, result1) {
      assert.equal(result.to, serverName+'/Alicé');
      assert.equal(result.cmd, 'listDevices');
    },
    'check pzh connection details': function(result, result1) {
      assert.isNotNull(result.payload.pzhs);
      assert.equal(result.payload.pzhs[0].id, 'Alicé (Your PZH)');
      assert.isTrue(result.payload.pzhs[0].isConnected);
    },
  },
  'add new pzp code': {
    topic: function() {
      pzh.apis.addPzpQR(firstPzh, this.callback);
    },
   'check pzp code are present': function(result, result1) {
      code = result.payload.code;
      assert.equal(result.cmd, 'addPzpQR');
      assert.equal(result.to,  serverName+'/Alicé');
      assert.isNotNull(result.payload.code);
      assert.isNotNull(result.payload.img);

    }
  }
});

/**
 * Test PZH - PZP connection
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
        config.pzhHost = serverName+'/Alicé';
        config.pzpHost = serverName
        config.pzpName = '';
        config.code    = result.payload.code;
        var pzp1 = new pzp.session();
        pzp1.initializePzp(config, pzpModules, self.callback);
      });
    },
    'check PZP Status': function(result, instance) {
      firstPzp = instance;
      assert.equal(result, 'startedPZP');
    },
    'check PZP configuration': function(result, instance) {
      assert.equal(instance.config.name, name+"_Pzp");
      assert.equal(instance.config.type, "Pzp");
    },
    'check PZH details': function(result, instance) {
      assert.equal(instance.config.serverName, serverName+'/Alicé')
      assert.equal(instance.config.pzhId, 'Alicé');
    },
    'check PZP signed certificate' : function(result, instance) {
      assert.isString(instance.config.own.cert);
      assert.equal(instance.config.own.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
    },
    'check PZH certificate if present': function(result, instance) {
      assert.isString(instance.config.master.cert);
      assert.equal(instance.config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
    }
  },
});

desc5.addBatch({
  'Cleanup': {
    'topic': function() {
      var path = session.common.webinosConfigPath();
      fs.unlink(path +'/config/Alicé.json', this.callback);
      fs.unlink(path +'/config/'+name+'_PzhFarm.json', this.callback);
      fs.unlink(path +'/config/'+name+'_Pzp.json', this.callback);
    },
    'check if deleted': function(err) {
      assert.isNotNull(err);
    }
  }
})
