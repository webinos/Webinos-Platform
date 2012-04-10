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
var vows = require('vows'),
assert   = require('assert');

var farm = require('../../lib/pzh_farm.js');
var pzhapis = require('../../lib/pzh_internal_apis.js');
var pzp = require('../../../pzp/lib/pzp_sessionHandling.js');

// First start farm ..
exports.desc = desc = vows.describe('Start Farm');
exports.desc1 = desc1 = vows.describe('Add PZH');
exports.desc2 = desc2 = vows.describe('Add Another PZH');
exports.desc3 = desc3 = vows.describe('PZH Functionality');
exports.desc4 = desc4 = vows.describe('PZH - PZH Functionality');
exports.desc5 = desc5 = vows.describe('PZH - PZP Functionality');
exports.desc6 = desc6 = vows.describe('PZP Functionality');

var pzh, pzh2, pzp, code;

desc.addBatch({
	'start farm': {
		topic: function() {
			farm.startFarm('0.0.0.0', '', this.callback);
		},
		'if started': function(results, configure) {
			assert.isTrue(results);
		},
		'check farm configuration': function(results, config) {
			assert.equal(config.details.servername, '0.0.0.0');
			assert.isString(config.conn.cert);
			assert.equal(config.conn.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.isString(config.master.cert);
			assert.equal(config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.isString(config.master.crl);
			assert.equal(config.master.crl.substring(0,24), "-----BEGIN X509 CRL-----");
		},
		'check web interface': function(results, config) {
			assert.isString(config.webServer.cert);
		},
	}
});

desc1.addBatch({
	'PZH André Initialization': {
		topic: function() {
			var userDetails = {};
			userDetails.username = 'AndréPaul'
			farm.getOrCreatePzhInstance('0.0.0.0', userDetails, this.callback);
		},
		'check PZH status': function(name, pzh1) {
			pzh = pzh1;
			assert.equal(name, '0.0.0.0/AndréPaul');
			assert.equal(pzh.sessionId, 'AndréPaul');
			assert.isString(pzh.config.conn.cert);
			assert.equal(pzh.config.conn.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.isString(pzh.config.master.cert);
			assert.equal(pzh.config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.isString(pzh.config.master.crl);
			assert.equal(pzh.config.master.crl.substring(0,24), "-----BEGIN X509 CRL-----");
			assert.equal(pzh.config.details.type, "Pzh");
			assert.equal(pzh.config.details.servername, "0.0.0.0/AndréPaul");
		},
	}
});

desc2.addBatch({
	'PZH Habib Initialization': {
		topic: function() {
			var userDetails = {};
			userDetails.username = 'HabibVirji'
			farm.getOrCreatePzhInstance('0.0.0.0', userDetails, this.callback);
		},
		'check PZH status': function(name, pzh) {
			pzh2 = pzh;
			assert.equal(name, '0.0.0.0/HabibVirji');
			assert.equal(pzh.sessionId, 'HabibVirji');
			assert.isString(pzh.config.conn.cert);
			assert.equal(pzh.config.conn.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.isString(pzh.config.master.cert);
			assert.equal(pzh.config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.isString(pzh.config.master.crl);
			assert.equal(pzh.config.master.crl.substring(0,24), "-----BEGIN X509 CRL-----");
			assert.equal(pzh.config.details.type, "Pzh");
			assert.equal(pzh.config.details.servername, "0.0.0.0/HabibVirji");
		},
	}
});

// We are checking only PZH André
desc3.addBatch({
	'list devices': {
		topic: function() {
			pzhapis.listZoneDevices(pzh, this.callback);
		},
		'device status': function(result, result1) {
			assert.isNotNull(result.payload.pzhs);
		}
	},
	'crash logs': {
		topic: function() {
			pzhapis.crashLog(pzh, this.callback);
		},
		'crash log': function(result, result1) {
			assert.equal(result.cmd, 'crashLog');
		}
	},
	'add new pzp code': {
		topic: function() {
			pzhapis.addPzpQR(pzh, this.callback);
		},
	       'check pzp code': function(result, result1) {
			code = result.payload.code;
			assert.equal(result.cmd, 'addPzpQR');
			assert.isNotNull(result.payload.code);
		}
	}
});

desc4.addBatch({
	'PZH to PZH communication': {
		topic: function() {
			pzhapis.addPzhCertificate(pzh, pzh2.config.details.servername, this.callback);
		},
		'connect pzh status':function(result, result1) {
			assert.isTrue(result1);
		},
	},
});


desc5.addBatch({
	'PZH to PZP communication': {
		topic:function() {
			var pzpModules = [
				{name: "context", param: {}},
				{name: "events", param: {}},
				{name: "get42", param: {}}
			];
			var config = {};
			config.pzhHost = '0.0.0.0/AndréPaul';
			config.pzpHost = '0.0.0.0'
			config.pzpName = '';
			config.code    = code;
			pzp.startPzp(config, pzpModules, this.callback);
		},
		'check pzp ': function(result, instance) {
			pzp = instance;
			assert.equal(result, 'startedPZP');
			assert.isString(instance.config.conn.cert);
			assert.equal(instance.config.conn.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.isString(instance.config.master.cert);
			assert.equal(instance.config.master.cert.substring(0,27), "-----BEGIN CERTIFICATE-----");
			assert.equal(instance.config.details.type, "Pzp");
			assert.equal(instance.config.details.servername, '0.0.0.0/AndréPaul')
			assert.equal(instance.pzhId, 'AndréPaul');
		},
	},
});

/*desc6.addBatch({
	'PZP functionality':{
		topic: function() {
			 webinos.discovery.findServices(new ServiceType('http://webinos.org/api/test'),
				{onFound: function (service) {
					service.bindService({onBind:function() {
						service.get42('foo', this.callback);
					}});
				}});
		},
		'check get42 result': function(result, result1) {
			console.log(result)
		}
	},
})*/