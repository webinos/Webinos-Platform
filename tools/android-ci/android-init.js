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
 * Copyright 2012 - 2013 University of Oxford
 * AUTHOR: Cornelius Namiluko (corni6x@gmail.com)
 *******************************************************************************/
var exec = require('child_process').exec,
    fs = require('fs'),
    url = require('url'),
    Utils = require("./ci-utils"),
    utils = new Utils(),
    async = require('async');


/**
 * An object that hold common settings for Android continuous integration
 * @param settings
 * @constructor
 */
var AndroidInit = function(settings){
	var self = this;
	this._downloadSource = settings.ANDROID_DOWNLOAD_SOURCE;
	this._apiLevel = settings.ANDROID_API_LEVEL;
	this._isInstalled = settings.ANDROID_INSTALLED;
	this._installDir = settings.ANDROID_INSTALL_PATH;
    this.deviceSettings = settings.DEVICE_SETTINGS;
    this.webinosSettings = settings.WEBINOS_SETTINGS;
    this.emulatorSettings = settings.EMULATOR_SETTINGS;
    this._androidCMD = "android";
    this._adbCMD = "adb";
    this._androidDirName = 'android-sdk-linux';

	var Webinos = require("./webinos-ci");
    this.webinos = new Webinos(this.webinosSettings);

}

/**
 * Function for downloading the android SDK from the location specified in the settings
 * @param cb
 */
AndroidInit.prototype.downloadAndroidSDK = function(cb){
    console.log("Downloading Android SDK");
    utils.downloadFile(this._downloadSource, this._installDir, function(code, argsToFoward, stdout){
        cb(code, argsToFoward, stdout);
    });
}

/**
 * This functions sets up the download android tar file as the sdk for use in subsequent steps.
 * @param sdkTarFilePath
 * @param cb
 */
AndroidInit.prototype.setupAndroid = function(sdkTarFilePath, cb){
    var self = this;
    console.log("Setting up Android..." );
    var options = {cwd: self._installDir, env: process.env};
    async.series({
       extractSDK: function(callback){
           fs.exists(sdkTarFilePath, function (exists) {
               if(exists){
                   //untar the archive
                   utils.executeCommandViaSpawn('tar', ['xvzf', sdkTarFilePath], function(status){
                           //For now, we FIX the path to which the sdk is extracted
                           //TODO: dynamically determine the path to which the SDK has been untarred.
                           var sdkDir = self._androidDirName;
                           //set android home
                           var envVarSettings = {};
                           envVarSettings.ANDROID_HOME = self._installDir +"/" + sdkDir;
                           envVarSettings.ANDROID_SDK_TOOLS = self._installDir  +"/" + sdkDir + "/tools";
                           envVarSettings.ANDROID_SDK_PLATFORM = self._installDir +"/" + sdkDir + "/platform-tools";
                           self.setupAndroidPaths(envVarSettings, cb);
                           callback(null, envVarSettings);
                       },
                       [], options);
               }else
                   callback(new Error("Specified sdk file does not exist"));
           });
       },
       selectAndInstallComponents: function(callback){
           self.getAvailableSDKComponents(function(components){
               self.selectComponents(components, function(selectedComponents){
                       self.installAndroidSDKComponents(selectedComponents, function(){
                           callback(null, selectedComponents);
                       });
                   }
               );
           });
       }
    }, function(err, results){
        /*var arg = "/tmp/android/android-sdk-linux/platform-tools";
        console.log("Checking the contents of android platform tools*********************8888");
        utils.executeCommandViaSpawn("ls", ['-l', arg], function(code, args2Forward, stdout){

        }, []);

        console.log("Checking if aapt tooly exists*************");
        fs.exists(arg + "/aapt", function(exists){
            if(exists)
                console.log(arg + "/aapt exists");
            else
                console.log(arg + "/aapt not found");
        });
        console.log("Checking the PATH VARIABLE*************");
        console.log("PATH=" + process.env['PATH']);
           */
        if(!err){
            console.log("Setup of Android Completed Successfully");
            cb(0, results.extractSDK);
        }
        else {
            console.log("Errors ocured during setup of Android::" + err);
            cb(1);
        }
    });
}

/**
 * This function selects components that have the specified API level
 * Other criteria cabe added by changing the comparison involving the cmp variable.
  * @param components
 * @param cb
 */
AndroidInit.prototype.selectComponents = function(components, cb){
    var selectedComponents = [];
    for(var i in components){
        // For now, any components that have the specified API level will be selected
        //TODO: update selection criteria
        if(components[i] !== undefined){
            var cmp = components[i].toString();
            //Always include the SDK tools and the platform-tools
            if(cmp.indexOf("API " + this._apiLevel) > -1 || cmp.indexOf('SDK Platform-tools') > -1 || cmp.indexOf('SDK Tools') > -1 ) {
                var pkgIndex = cmp.substring(0, cmp.indexOf("-"));
                if(pkgIndex.length > 0)
                    //replace any trailing commas ans spaces
                    selectedComponents.push(pkgIndex.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ','));
            }
        }
    }
    cb(selectedComponents);
}


/**
 * This function sets up appropriate environment variables for android execution
 * CAREFUL; this only sets up on the current node process and its children
 * @param envSettings : an array of name-value for settings that should be set
 * @param cb
 */
AndroidInit.prototype.setupAndroidPaths = function(envSettings, cb){
    console.log("Setting up Android Paths");
    utils.setEnv("ANDROID_HOME", envSettings.ANDROID_HOME);
    utils.setEnv("PATH", envSettings.ANDROID_HOME);
    utils.setEnv("PATH", envSettings.ANDROID_SDK_TOOLS);
    utils.setEnv("PATH", envSettings.ANDROID_SDK_PLATFORM);
    //cb();
}


/**
 * This function install the selected list of android components
 * @param components   is an array containing identifiers of the components as returned by sdk list.
 * @param cb
 */
AndroidInit.prototype.installAndroidSDKComponents = function(components, cb){
    var self = this;
    if(components != undefined){
        console.log("Installing Android SDK components: " + components.toString());
        console.log("System Path::" + process.env['PATH']);
        var args = ['update', 'sdk', '-u', '-a', '-f', '-t', components.toString()];
        utils.executeCommandViaSpawn(self._androidCMD, args, cb, []);
    }else{
        console.log("Components to be installed were not specified");
        cb(-1, "Components to be installed were not specified");
    }
}

/**
 * Function to create an Android Virtual Device from the given target
 * @param avdName  : the name that will be used when executing the emulator
 * @param avdSettings : settings such as SDCARD, audoi, etc (currently not used)
 * @param target : the target device as returned by adb targets
 * @param cb
 */
AndroidInit.prototype.createAVD = function(avdName, avdSettings, target, cb){
/* we will force the creation, just in the AVD already exists,
    we could ask the user whether to override using a command line argument*/
    var args = ['create', 'avd', '-n' , avdName, '-f', '-t', target];
    utils.executeCommandViaSpawn(this._androidCMD, args, cb);
}

/**
 * This function returns a list of android packages available for installation.
 * The caller is responsible for parsing the list to get package indices
 * @param cb
 */
AndroidInit.prototype.getAvailableSDKComponents = function(cb){
    var args = ['list', 'sdk', '-a'];
    var wd = process.cwd();
    utils.executeCommandViaSpawn(this._androidCMD, args, function(status, forwardedArgs, stdout){
        var availableComponents = new Array();
        var cmpListStarted = false;
        var header = "Packages available for installation or update";
        var lines = stdout.toString().trim().split("\n");

        for(line in lines){
            if(cmpListStarted)  {
                var ln = lines[line];
                if(ln !== undefined){
                    //Replace any trailing commas
                    ln = ln.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',');
                    availableComponents.push(ln);
                }
            }
            if(lines[line].indexOf(header) !== -1)
                cmpListStarted = true;
        }
        cb(availableComponents);
    }, []);
}


module.exports = AndroidInit;