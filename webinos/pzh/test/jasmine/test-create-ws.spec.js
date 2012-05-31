
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
*******************************************************************************/


var path            = require('path'),	
    util            = require('util'),
    fs              = require('fs'),
    moduleRoot      = require(path.resolve(__dirname, '../dependencies.json')),
    dependencies    = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json')),
    webinosRoot     = path.resolve(__dirname, '../' + moduleRoot.root.location),
    webCert         = require(path.join(webinosRoot, dependencies.pzh.location, 'web/pzh_web_certs.js')),
    certman         = require(path.resolve(webinosRoot,dependencies.manager.certificate_manager.location));

var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

var RSA_START       = "-----BEGIN RSA PRIVATE KEY-----";
var RSA_END         = "-----END RSA PRIVATE KEY-----";
var CERT_START      = "-----BEGIN CERTIFICATE-----";
var CERT_END        = "-----END CERTIFICATE-----";

function createPZH() {
    "use strict";
    var pzh = {
        server : "servername",
        config : { 
            pzhKeyDir : "./",
            pzhCertDir : "./",
            master : {
                key : { 
                    name  : "master-key.pem",
                    value : null
                },
                cert : {
                    name  : "master-cert.pem",
                    value : null
                }
            },
            webserver : {
                key : { 
                    name  : "webserver-key.pem",
                    value : null
                },
                cert : {
                    name  : "webserver-cert.pem",
                    value : null
                }                
            },
            country : "UK",
            state   : "OX",
            city    : "Oxford",
            orgname : "OU",
            orgunit : "CS",
            email   : "test@example.com"
        }
    }   
    
    pzh.config.master.key.value = certman.genRsaKey(1024).toString();
       
    
    var csr = certman.createCertificateRequest(
                            pzh.config.master.key.value, 
                            pzh.config.country, 
                            pzh.config.state,
                            pzh.config.city,
                            pzh.config.orgname,
                            pzh.config.orgunit,
                            "PZH Master common name",
                            pzh.config.email);
    
    pzh.config.master.cert.value = certman.selfSignRequest(
        csr, 30, pzh.config.master.key.value, 0 ,"http://test.url").toString();
        
    return pzh;
};

function deleteFiles() {
    if (nPathV.existsSync("./webserver-key.pem")) {
        fs.unlinkSync("./webserver-key.pem");
    }
    if (nPathV.existsSync("./webserver-cert.pem")) {
        fs.unlinkSync("./webserver-cert.pem");
    }

}


describe("generate web server certificate", function() {
    it("can create keys in a particular directory", function() {       
        
        var pzh = createPZH();
        console.log(pzh);
        
        deleteFiles();       

        webCert.createWSCert(pzh, function(err, wsCert, wsKey) {
            var certPath = path.join(pzh.config.pzhCertDir, pzh.config.webserver.cert.name);
            var keyPath = path.join(pzh.config.pzhKeyDir, pzh.config.webserver.key.name);
            expect(err).toBeNull();
            expect(wsCert).not.toBeNull();
            expect(wsCert).toContain(CERT_START);
            expect(wsCert).toContain(CERT_END);
            expect(nPathV.existsSync(certPath)).toBeTruthy();  
            expect(fs.readFileSync(certPath).toString()).toEqual(wsCert);
                        
            expect(wsKey).not.toBeNull(); 
            expect(wsKey).toContain(RSA_START);
            expect(wsKey).toContain(RSA_END);
            expect(nPathV.existsSync(keyPath)).toBeTruthy();  
            expect(fs.readFileSync(keyPath).toString()).toEqual(wsKey);
            
            deleteFiles();
        });
        
    });
});

