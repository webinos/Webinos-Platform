/* This script provides functionality to build webinos for android devices and install it on
an android device
TODO: refactor to use ci-utils
*/

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var url = require('url');

var Utils = require("./ci-utils"),
    utils = new Utils();

/**
 * This object keeps track of webinos specific settings fro enabling interaction with android
 * @param webinosSettings
 * @constructor
 */
var Webinos = function(webinosSettings){
	var self = this;
	this._anodeRepo = webinosSettings.ANODE_REPO;
	this._webinosAndroidPlatform = webinosSettings.ANDROID_PLATFORM_PATH;
    this._webinosAPK = undefined;
    this._appAPK = undefined;
    this._anodeDownloadPath = webinosSettings.ANODE_DOWNLOAD_PATH;
}
	/**
		This function connects to the emulator to install webinos runtime
		and applications. It essentially executes the command:
		adb -s emulator-5556 install path/app.apk
		Performs reinstall if the package is already installed
	*/
    Webinos.prototype.installWebinosOnEmulatedDevice = function(deviceId, appsToInstall, cb){
		var status = "Error";
		//TODO: fix bug on why for loop only gives the last item
		
		for (var key in appsToInstall) {
		  	if (appsToInstall.hasOwnProperty(key)) {
				//TODO: allow installation of unsigned packages
                  utils.executeCommandViaSpawn('adb', ['-s', deviceId, 'install', '-r', appsToInstall[key]], cb, {});
			}else{
				console.log(x + " Android package not found");
			}
		}
		cb(status);
	}

/**
 * This function builds webinos APK package for android
 * @param mode : whether debug or release
 * @param anodePath : the path to anode, which should be setup as ANODE_ROOT
 * @param androidHome : the path to android sdk, which should be setup as ANDROID_HOME
 * @param cb
 */
    Webinos.prototype.buildWebinosAndroidPackage = function(mode, anodePath, androidHome, cb) {
        var self = this;
        var webinosAndroidPlatformPath =  self._webinosAndroidPlatform;
        process.env["ANODE_ROOT"] = anodePath;
        process.env["ANDROID_HOME"] = androidHome;

        try {
            //Change directory to platform/android
           /* process.chdir(webinosAndroidPlatformPath);
            console.log('Now working from directory: ' + process.cwd());     */
            //TODO: refactor to use ci-utils
            var buildFor = '';
            if(mode == 'release')
                buildFor = mode;
            var antChild = spawn(
                'ant',
                [buildFor],
                { cwd: webinosAndroidPlatformPath,  env: process.env }
            );
            var appApkPath = undefined;
            var webinosApkPath = undefined;

            console.log('Executing ant to build android package');

            antChild.stdout.on('data', function (data) {
                console.log('ant info: ' + data);
            });

            antChild.stderr.on('data', function (data) {
                console.error('ant stderr: ' + data);
            });

            antChild.on('close', function (code) {
                if (code !== 0) {
                    console.error('FAILURE: ant process exited with code ' + code);
                } else {
                    //TODO: set appropriate paths to resulting APK files
                    webinosApkPath = webinosAndroidPlatformPath + "/wrt/bin/wrt-debug.apk";
                    appApkPath = webinosAndroidPlatformPath + "/app/bin/app-debug.apk";
                    self._appAPK = appApkPath;
                    self._webinosAPK = webinosApkPath;
                    console.log('SUCCESS: Android package build finished');
                }
                cb(code, webinosApkPath, appApkPath);
            });
        }
        catch (err) {
            console.error('chdir: ' + err);
        }
    }

/**
 * This function clones the anode repository in prepration for building webinos for android
 * @param cb
 */
    Webinos.prototype.gitCloneAnode = function(cb){
        var anodeRepo = this._anodeRepo;
        var anodePath = this._anodeDownloadPath;

        cb(0, anodePath);
		/*console.log("Cloning anode module");
		var gitClone = spawn('git', ['clone', anodeRepo, anodePath]);
		gitClone.stdout.on('data', function (data) {
			console.log(data);
		});

		gitClone.stderr.on('data', function (data) {
			console.log('git clone stderr: ' + data);
		});

		gitClone.on('close', function (code) {
            if(code == 0)
                console.log('SUCCESS: Finished cloning ' + anodeRepo + " into " + anodePath);
			cb(code, anodePath);
		}); */
	}


Webinos.prototype.getAppAPK = function(){
    return this._appAPK;
}

Webinos.prototype.getWebinosAPK = function(){
    return this._webinosAPK;
}

module.exports = Webinos;