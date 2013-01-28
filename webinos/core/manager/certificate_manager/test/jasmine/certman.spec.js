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
* Copyright 2011 University of Oxford
*******************************************************************************/
// test for the openssl wrapper.
// TODO: more than just checks for not-empty, need to check some fields
// there is an x509 module somewhere I need to use...

var certman = require("../../src/build/Release/certificate_manager");
var util = require("util");
var rsakey;
var certReq;
var ssCert;
var cert;
var childKey;
var childReq;
var childCert;
var emptyCRL;

var RSA_START       = "-----BEGIN RSA PRIVATE KEY-----";
var RSA_END         = "-----END RSA PRIVATE KEY-----";
var CERT_REQ_START  = "-----BEGIN CERTIFICATE REQUEST-----";
var CERT_REQ_END    = "-----END CERTIFICATE REQUEST-----";
var CERT_START      = "-----BEGIN CERTIFICATE-----";
var CERT_END        = "-----END CERTIFICATE-----";
var CRL_START       = "-----BEGIN X509 CRL-----";
var CRL_END         = "-----END X509 CRL-----";


describe("generate keys", function() {
    it("can create a 1024 size key", function() {       
        rsakey = certman.genRsaKey(1024);
        expect(rsakey).not.toBeNull();
        expect(rsakey).not.toEqual("");
        expect(rsakey).toContain(RSA_START);
        expect(rsakey).toContain(RSA_END);
        expect(rsakey.length).toBeGreaterThan(100);
    });
    it("can create a bigger key", function() {
        var rsakey2 = certman.genRsaKey(2048);
        expect(rsakey).not.toEqual(rsakey2);
    });
});

describe("generate certificate requests", function() {
    it("can create a certificate request", function() {       
        certReq = certman.createCertificateRequest(rsakey, 
    "UK","OX","Oxford","Univ. Oxford","Computer Science","CA Key", "john.lyle@cs.ox.ac.uk");
        
        expect(certReq).not.toBeNull();
        expect(certReq).toContain(CERT_REQ_START);
        expect(certReq).toContain(CERT_REQ_END);
        expect(certReq.length).toBeGreaterThan(100);
    });
});

describe("sign certificate requests", function() {
    it("can self-sign a certificate request", function() {
        ssCert = certman.selfSignRequest(certReq, 30, rsakey, 1, "URI:pzh.webinos.org");
        expect(ssCert).not.toBeNull();
        expect(ssCert).toContain(CERT_START);
        expect(ssCert).toContain(CERT_END);
        expect(ssCert.length).toBeGreaterThan(100);
    });
    
    it("can sign another certificate request", function() {
        childKey = certman.genRsaKey(1024);
        childReq = certReq = certman.createCertificateRequest(rsakey, 
    "UK","OX","Oxford","Univ. Oxford","Computer Science", "Client Key", "john.lyle@cs.ox.ac.uk");
        childCert = certman.signRequest(childReq, 30, rsakey, ssCert, 1, "URI:pzh.webinos.org");
        expect(childCert).not.toBeNull();
        expect(childCert).toContain(CERT_START);
        expect(childCert).toContain(CERT_END);
        expect(childCert.length).toBeGreaterThan(100);
    });
});

describe("create certificate revocation lists", function() {
    it("can create an empty CRL", function() {
        emptyCRL = certman.createEmptyCRL(rsakey, ssCert, 30, 0);
        expect(emptyCRL).not.toBeNull();
        expect(emptyCRL).toContain(CRL_START);
        expect(emptyCRL).toContain(CRL_END);
        expect(emptyCRL.length).toBeGreaterThan(50);
    });
    it("can add to a CRL", function() {
        newCRL = certman.addToCRL(rsakey, emptyCRL, childCert);
        expect(newCRL).not.toBeNull();
        expect(newCRL).toContain(CRL_START);
        expect(newCRL).toContain(CRL_END);
        expect(newCRL.length).toBeGreaterThan(50);
        expect(newCRL).not.toEqual(emptyCRL);
    });
});
    
describe("Proper error handling", function() {
    it("will error given a bad altname", function() {
        childKey = certman.genRsaKey(1024);
        childReq = certReq = certman.createCertificateRequest(rsakey, 
        "UK","OX","Oxford","Univ. Oxford","Computer Science", "Client Key", "john.lyle@cs.ox.ac.uk");
        try {
            childCert = certman.signRequest(childReq, 30, rsakey, ssCert, 1, "foo://bar");
            expect(childCert).toBeNull(); //shouldn't get here.
        } catch (err) {
            expect(err).not.toBeGreaterThan(0);
            expect(err.toString()).toEqual("Error: Failed to sign a certificate");
        }
        
    });
});    
    
describe("get hash", function() {
    it("can get hash of public certificate", function() {       
        hash = certman.getHash("../conn.pem");
        expect(hash).not.toBeNull();
        expect(hash).not.toEqual("");
    });
});
