
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
	this._downloadLocation = settings.ANDROID_DOWNLOAD_LOCATION;
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
		utils.downloadFile(this._downloadLocation, this._installDir, cb);
	}

/**
 * This functions sets up the download android tar file as the sdk for use in subsequent steps.
 * @param sdkTarFilePath
 * @param cb
 */
    AndroidInit.prototype.setupAndroid = function(sdkTarFilePath, cb){
        var self = this;
		console.log("Setting up Android..." );
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
                           []);
                   }else
                       console.log("Specified sdk file does not exist");
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
             console.log("Output of setupandroid >>" + results);
            if(!err) cb(0)
            else cb(1)
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
                if(cmp.indexOf("API " + this._apiLevel) > -1) {
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
		    var args = ['update', 'sdk', '-u' , '-f', '-t', components.toString()];
		    utils.executeCommandViaSpawn(self._androidCMD, args, cb, []);
		}else{
			console.log("Components to be installed were not specified");
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