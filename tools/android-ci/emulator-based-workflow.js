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

var async = require('async');
/**
 * This object specifies the workflow used when testing android CI using an emulator
 * @param androidCI : object containing CI settings
 * @constructor
 */
var AndroidEmulatorBasedCIWorkflow = function(androidCI){

    var Emulator = require("./emulator-ci");
    var emulator = new Emulator(androidCI.emulatorSettings);
    var webinos = androidCI.webinos;

    emulator.on("Ready", function(port){
        console.log("Emulator was ready on port:" + port);
        //if(status == 0){
            installApps(port);
    });

    this.run = function(cb){
        async.parallel({
                androidPrep: function(callback){
                    androidPrep(callback);
                },
                anodePrep: function(callback){
                    anodePrep(callback);
                }
            },
            function(err, results) {
                if(err){
                    console.error("Error Occured: " + err);
                    cb(1, "Android or anode setup failed");
                }
                else{
                    console.log("Android and anode prep complete: " + results);
                    async.parallel({
                        webinosPrep: function(callback){
                            webinosPrep(results.anodePrep, results.androidPrep, callback);
                        },
                        emulatorPrep: function(callback){
                            emulatorPrep(callback);
                        }
                    },
                    function(err, results) {
                        if(!err){
                            console.log("Webinos and Emulator Preparation Complete:" + results);
                            cb();
                        } else{
                            console.error("Webinos or Emulator Preparation Failed:");
                            cb(1, "Webinos or Emulator Preparation Failed:");
                        }
                    });
                }
        });

    }

    /**
     * Function for installing webinos-related apps to the emulator running on specified port
     * @param port
     */
    function installApps(port) {
        var appAPK = webinos.getAppAPK();
        var webinosAPK = webinos.getWebinosAPK();
        async.series({
            installApp: function (callback) {
                emulator.installAppOnEmulatedDevice("emulator-" + port, appAPK, function (code, argsToForward, stdout) {
                    if(code == 0){
                        console.log("Finished installing app: " + appAPK);
                        callback(null, "");
                    }else
                        callback(new Error("Webinos Application Installation on Emulator Failed!"));
                });
            },
            installWebinos: function (callback) {
                emulator.installAppOnEmulatedDevice("emulator-" + port, webinosAPK, function (code, argsToForward, stdout) {
                    if(code == 0){
                        console.log("Finished installing app: " + webinosAPK);
                        callback(null, "");
                    }else
                        callback(new Error("Webinos Installation on Emulator Failed!"));
                });
            }
        }, function (err, results) {
            var exitcode = 1;
            if (!err) {
                //Run Webinos Tests and return results
                console.log("Finished Installing Apps. Exiting with success!");
                exitcode = 0;
            }  else{
                console.log("Error occurred while installing app: " + err);
            }
            emulator.shutdown(function(){
                process.exit(exitcode);
            });
        });
    }

    function androidPrep(callback){
        console.log("preparing Android");
        androidCI.downloadAndroidSDK(function(status, outputFile){
            if(status !== 0){
                callback(new Error("SDK Download Error"));
            }else{
            //the outputfile is received as an array forwardded by the downloadAndroidSDK
            // through the utils.downloadFile and returned by utils.executeCommandViaSpawn
            //for now, we assume that it will only contain one element, i.e. path to output file
                if(outputFile != undefined && outputFile[0] != undefined)
                    androidCI.setupAndroid(outputFile[0], function(code, envSettings){
                        if(envSettings !== undefined)
                            callback(null, envSettings.ANDROID_HOME);
                    });
            }
        });
    }


    function anodePrep(cb){
        console.log("preparing Anode");
        androidCI.webinos.gitCloneAnode(function(code, anodePath){
            if(code == 0)
                cb(null, anodePath);
            else
                cb(new Error("Anode preparation failed with code: " + code), code);
        });
    }

    function emulatorPrep(cb){
        console.log("Preparing emulator");
        async.parallel({
                getPort: function(callback){
                    emulator.getNextFreePort(function(status, nextPort, portsInUse){
                        if(status !== "Full" && status !== "adb Error"){
                            console.log("next port:" + nextPort);
                            callback(null, nextPort);
                        }else{
                            callback(new Error("Could not get next available port: "), nextPort);
                        }
                    });
                },
                getAvd: function(callback){
                    androidCI.createAVD('pzpavd', '', 2, function(status, x, std){
                        if(status == 0)
                            callback(null, 'pzpavd');
                        else
                            callback(new Error("Could not create AVD. Error code: " + status), 'pzpavd');

                    });
                }
            },
            function(err, results){
                if(!err){
                    var nextPort = results.getPort;
                    var avd = results.getAvd;
                    emulator.startAndroidEmulator(nextPort, avd, function(status, forwardedAgs, stdout){
                        //Never gets here until the emulator exists
                        console.log(stdout);
                        cb();
                    });
                }
            }
        );

    }

    function webinosPrep(anodePath, androidHome, cb){
        console.log("Preparing webinos");
        webinos.buildWebinosAndroidPackage('debug', anodePath, androidHome, function(code, webinosApkPath, appApkPath){
            if(code == 0)
                cb(null, [webinosApkPath, appApkPath]);
            else
                cb(new Error("Webinos Preparation Failed with code: " + code), code);
        });
    }
    function installWebinos(webinosApkPath, cb){
        installApp(webinosApkPath, cb);
    }
    function installApp(appApkPath, cb){
        emulator.installAppOnEmulatedDevice(deviceId, appApkPath, function(code){
            cb();
        });
    }

    function runWebinos(cb){
        console.log("Running webinos");
    }


    }

module.exports = AndroidEmulatorBasedCIWorkflow;