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

// zip helper functions!
// Requires modules: zipper and zipfile
//
var path = require('path');
var fs = require('fs');
var Zipper = require('zipper').Zipper; //for zipping
var zipfile = require('zipfile'); // for unzipping (!!)
var zipHelper = exports;
var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

//helper function for recursing through a directory
zipHelper.makeStruct = function (filepath) {
    "use strict";
    var list, arr, j, csize;
    if (fs.lstatSync(filepath).isFile()) {
        return {
            type: "file",
            isfile: true,
            p: filepath,
            children: null,
            size: 1
        };
    } else {
        list = fs.readdirSync(filepath);
        arr = new Array(list.length);
        csize = 0;
        for (j = 0; j < list.length; (j = j + 1)) {
            arr[j] = zipHelper.makeStruct(path.join(filepath, list[j]));
            csize = csize + arr[j].size;
        }
        return {
            type: "directory",
            isfile: false,
            p: filepath,
            children: arr,
            size: (csize + 1)
        };
    }
};

//flatten our directory structure
zipHelper.flatten = function (struct) {
    "use strict";
    var carray, k;
    if (struct.isfile) {
        return [struct];
    } else {
        carray = [struct];
        for (k = 0; k < struct.children.length; (k = k + 1)) {
            carray = carray.concat(zipHelper.flatten(struct.children[k]));
        }
        return carray;
    }
};

//actually make a zip file
zipHelper.makeZipFile = function (directoryPath, zipFileName, callback) {
    "use strict";
    var zipf = new Zipper(zipFileName);
    var fileArr = zipHelper.flatten(zipHelper.makeStruct(directoryPath));
    var i = 0;
    var addToZip = function (err) {
        if (err) {
            console.log("Error!");
            throw err;
        }
        if (i < fileArr.length) {
            i = i + 1;
            if (fileArr[i - 1].isfile) {
                zipf.addFile(fileArr[i - 1].p, fileArr[i - 1].p, addToZip);
            } else {
                addToZip();
            }
        } else {
            if (callback !== undefined) {
                callback();
            }
        }
    };
    addToZip();
};



zipHelper.mkdirRecursiveSync = function (fname) {
    "use strict";
    var dirParent = path.dirname(fname);
    if (!nPathV.existsSync(dirParent)) {
        zipHelper.mkdirRecursiveSync(dirParent);
    }
    if (!nPathV.existsSync(fname)) {
        fs.mkdirSync(fname, 448);
    }
    return;
};


//unzips a file to the working directory.
zipHelper.unzipFile = function (fname, callback) {
    "use strict";
    var zf = new zipfile.ZipFile(fname);
    var i, dir, filname, buffer;

    for (i = 0; i < zf.names.length; (i = i + 1)) {
        dir = path.dirname(zf.names[i]);
        filname = path.basename(zf.names[i]);
        zipHelper.mkdirRecursiveSync(dir);
        if (!nPathV.existsSync(zf.names[i])) {
            buffer = zf.readFileSync(zf.names[i]);
            fs.writeFileSync(zf.names[i], buffer, "binary");
        }
    }

    if (callback !== undefined) {
        callback();
    }
};


// This version of unzip uses the "unzip" command line.  do not use.
zipHelper.cmdLineUnzipFile = function (zipFile, outPath, callback) {
    "use strict";
    var spawn = require('child_process').spawn;
    var zip = spawn('unzip', ["-o", zipFile, "-d", outPath]);
    // End the response on zip exit
    zip.on('exit', function () {
        callback();
    });
};

// This version of unzip uses the "zip" command line.  do not use.
zipHelper.cmdLineZipDir = function (zipFile, inPath, callback) {
    "use strict";
    var spawn = require('child_process').spawn;
    var zip = spawn('zip', ['-r', zipFile, inPath]);
    // End the response on zip exit
    zip.on('exit', function () {
        callback();
    });
};
