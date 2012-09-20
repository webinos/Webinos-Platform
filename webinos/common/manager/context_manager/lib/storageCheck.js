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
* Copyright 2012 EPU-National Technical University of Athens
******************************************************************************/
var storageInfo = null;
var path = require('path');
var fs = require('fs');
var oldSettings = null;
var commonPaths = null;
//console.log("STORAGE CHECK LOADED");

var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

var pathSeperator = process.platform !== 'win32' ? '/' : '\\';

module.exports = function(myCommonPaths, myStorageInfo){
	commonPaths = myCommonPaths;
	storageInfo = myStorageInfo;
	if (commonPaths.storage == null) throw 'Storage Path not set';
	var clearStorage = false;
	if (nPathV.existsSync(commonPaths.storage + pathSeperator + ".storageVersion.json")){
		if(require(commonPaths.storage + pathSeperator + ".storageVersion.json").version != storageInfo.Version){
			clearStorage = true;
		}else{
			//Storage should be ok.
//			console.log("CONTEXT Storage should be ok");
			return;
		}
	}else{
		clearStorage = true;
	}
	if (clearStorage){
		if (nPathV.existsSync(commonPaths.storage + pathSeperator + "settings.json")){
			oldSettings = require(commonPaths.storage + pathSeperator + "settings.json");
		}
		rmdirSyncRecursive(commonPaths.storage, true);
	}
	try{
		fs.statSync(commonPaths.storage);
	}catch(e){
		debugger;
		mkdirSyncRecursive(commonPaths.storage);
	}
	fixFolder(commonPaths.storage, storageInfo.Map);
	if (oldSettings!=null){
		newSettings = require(commonPaths.storage + pathSeperator + "settings.json");
		for (newSetting in newSettings){
			if (oldSettings[newSetting]) newSettings[newSetting] = oldSettings[newSetting];
		}
		fs.writeFileSync(commonPaths.storage + pathSeperator + "settings.json", JSON.stringify(newSettings));
	}
	fs.writeFileSync(commonPaths.storage + pathSeperator + ".storageVersion.json", JSON.stringify({version : storageInfo.Version}));
}

function fixFolder(folderPath, contents){
	folderPath = path.resolve(folderPath);
	try{
		fs.statSync(folderPath);
	}catch(e){
		mkdirSyncRecursive(folderPath);
	}
	for (var i=0; i<contents.length; i++){
		item = contents[i];
		switch (item.type){
			case "folder":
				fixFolder(folderPath+pathSeperator+item.name+pathSeperator, item.contents);
				break;
			default :
				if (item.file){
					var fileContent = fs.readFileSync(commonPaths.local + pathSeperator + 'storage' + pathSeperator + item.file);
		            fs.writeFileSync(folderPath+pathSeperator+item.name, fileContent);
				}else{
					fs.writeFileSync(folderPath+pathSeperator+item.name, ((item.contents)?((item.type === "json")?JSON.stringify(item.contents):item.contents):""));
				}
				break;
		}
	}
}

/*
 * based on: https://github.com/bpedro/node-fs/
 */
function mkdirSyncRecursive(folderPath, position) {
	var parts = path.resolve(folderPath).split(pathSeperator);

    position = position || 0;

    if (position >= parts.length) {
        return true;
    }

    var directory = parts.slice(0, position + 1).join(pathSeperator) || pathSeperator;
    if (!nPathV.existsSync(directory)) {
        try {
            fs.mkdirSync(directory);
        } catch (e) {
            return false; // could be permission error
        }
    }
    mkdirSyncRecursive(folderPath, position + 1);
}

/*
 * based on: https://github.com/ryanmcgrath/wrench-js/
 */
function rmdirSyncRecursive(path, failSilent) {
    var files;

    try {
        files = fs.readdirSync(path);
    } catch (err) {
        if((typeof failSilent !== 'undefined') && failSilent) return;
        throw new Error(err.message);
    }

    /*  Loop through and delete everything in the sub-tree after checking it */
    for(var i = 0; i < files.length; i++) {
        var currFile = fs.statSync(path + pathSeperator + files[i]);

        if(currFile.isDirectory()) // Recursive function back to the beginning
        	rmdirSyncRecursive(path + pathSeperator + files[i]);

        else if(currFile.isSymbolicLink()) // Unlink symlinks
            fs.unlinkSync(path + pathSeperator + files[i]);

        else // Assume it's a file - perhaps a try/catch belongs here?
            fs.unlinkSync(path + pathSeperator + files[i]);
    }

    /*  Now that we know everything in the sub-tree has been deleted, we can delete the main
        directory. Huzzah for the shopkeep. */
    return fs.rmdirSync(path);
}
