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
// test 


var path = require('path');
var securestore = require('../../main/javascript/securestore.js');
var fs = require('fs');

var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}


var testfilecontent = "Do not delete - I am testing.\n";
var pass = "nruowgunrwognworu2";
var zipFile = "test2zip.zip";
var zipPath = "testfolder";
var testfile = path.join(zipPath,"testfile1.txt");
var testNoStoreFile = "test2store.zip";
var testStoreDir = "test2store";

describe("encryption and decryption", function() {
    it("can encrypt", function() {       
        console.log("Running from: " + process.cwd());
        read(testfile, function(origdata, err) {
            expect(err).toBeNull();
	        expect(origdata).toEqual(testfilecontent);
		    
		    securestore.encryptFile(testfile, pass, function() {
			    read(testfile, function(encdata) {
			        expect(origdata).not.toEqual(encdata);
				    securestore.decryptFile(testfile, pass, function() {
					    read(testfile, function(decdata) {
						    expect(origdata).toEqual(decdata);
						    expect(testfilecontent).toEqual(decdata);
					    });			
				    });
			    });		
		    });
	    });
    });
});


describe("zip and unzip", function() {

    it("can zip and unzip", function() {
	    read(testfile, function(origdata) {
		    // test zip
		    expect(origdata).toEqual(testfilecontent);
		    // now practice zipping a directory into "zipfile"
		    securestore.zipDir(zipFile, zipPath, function() {
			    //check that the zip file exists
			    expect(fs.lstatSync(zipFile).isFile()).toBeTruthy();
			    //rimraf it
			    rimrafSync(zipPath);					
                //check that the directory is dead
                expect(nPathV.existsSync(zipPath)).toBeFalsy();
			    // test unzip again
			    securestore.unzipFile(zipFile, function() {
                    //check the directory exists
                    console.log("Running from: " + process.cwd());
                    console.log(path.resolve(zipPath));
                    expect(nPathV.existsSync(zipPath)).toBeTruthy();
				    read(testfile, function(unzipData) {
					    expect(origdata).toEqual(unzipData);
                        expect(testfilecontent).toEqual(unzipData);
				    });			
			    });		
		    });
	    });
    });
});



describe("open (no file) and close", function() {
    it("can open and close", function() {
        var val = "";
        securestore.open(pass, testNoStoreFile, testStoreDir, function(err) {	
	        expect(err).toBeUndefined();
	        // check that the store directory exists
	        expect(nPathV.existsSync(testStoreDir)).toBeTruthy();
	        //store a key value
	        securestore.storeKeyValue(testStoreDir, "Why", {because: "we have to store something"}, function() { 
	            securestore.getKeyValue(testStoreDir, "Why", function(err, val) {
	                expect(val["because"]).toEqual("we have to store something");
                    securestore.close(pass, testNoStoreFile, testStoreDir, function(err) {
    	                expect(nPathV.existsSync(testStoreDir)).toBeFalsy();
		                expect(nPathV.existsSync(testNoStoreFile)).toBeTruthy();
	                });	        
	            });
            });
        });
    });
});





function read(file, fun) { 
	fs.readFile(file, 'utf8', function (err, data) {
       console.log("Reading file: " + path.resolve(file));
       console.log("Running from: " + process.cwd());
       console.log("Read file content: " + data);
	   fun(data,err);
	});
}

function rimrafSync (p) {
  var s = fs.lstatSync(p);
  if (!s.isDirectory()) return fs.unlinkSync(p);
  fs.readdirSync(p).forEach(function (f) {
    rimrafSync(path.join(p, f));
  });
  fs.rmdirSync(p);
};
