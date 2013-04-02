/**
 * This object specifies the workflow used when testing android CI using an emulator
 * @param androidCI : object containing CI settings
 * @constructor
 */
var AndroidEmulatorBasedCIWorkflow = function(androidCI){

        var Emulator = require("./emulator-ci");
        var emulator = new Emulator(androidCI.emulatorSettings);
        var webinos = androidCI.webinos;
        this.run = function(){
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
                                    /*async.series({
                                     installApp: function(callback){
                                     installApp(results.webinosPrep, callback);
                                     },
                                     installWebinos: function(callback){
                                     installWebinos(results.webinosPrep, callback);
                                     },
                                     runWebinos: function(callback){
                                     runWebinos(callback);
                                     }
                                     },
                                     function(err, results) {
                                     // results is now equal to: {one: 1, two: 2}
                                     //If we have any errors, then test failed
                                     if(err){
                                     test_failed = true;
                                     }
                                     });  */
                                }
                            });
                    }
            });

        }

        function androidPrep(callback){
            console.log("preparing Android");
            var tarf = "/home/corn/devel/travis-test/Webinos-Platform/tools/android-ci/android-sdk_r21.1-linux.tgz";
            androidCI.setupAndroid(tarf, function(code){
                //TODO: pass the path to the setup android...
                callback(null, "/home/corn/devel/tools/android-sdk-linux");
            });

            /*androidCI.downloadAndroidSDK(function(status, outputFile){
             if(status !== 0){
             callback(Error, "SDK Download Error");
             }else{

             //the outputfile is received as an array forwardded by the downloadAndroidSDK
             // through the utils.downloadFile and returned by utils.executeCommandViaSpawn
             //for now, we assume that it will only contain one element, i.e. path to output file
             if(outputFile != undefined && outputFile[0] != undefined)
             androidCI.setupAndroid(outputFile[0], function(code){
             //TODO: pass the path to the setup android...
             callback(null, "/home/corn/devel/tools/android-sdk-linux");
             });
             }
             });  */
        }


        function anodePrep(cb){
            console.log("preparing Anode");
            androidCI.webinos.gitCloneAnode(function(code, anodePath){
                if(code == 0)
                    cb(null, anodePath);
                else
                    cb(new Error(), code);
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
                            }
                        });
                    },
                    getAvd: function(callback){
                        androidCI.createAVD('pzpavd', '', 2, function(status, x, std){
                            console.log("checkout the output...");console.log(std.toString());
                            callback(null, 'pzpavd');
                        });
                    }
                },
                function(err, results){
                    if(!err){
                        var nextPort = results.getPort;
                        var avd = results.getAvd;
                        emulator.startAndroidEmulator(nextPort, function(status, forwardedAgs, stdout){
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
                    cb(new Error(), code);
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

        emulator.on("Emulator-ready", function(port){
            console.log("Emulator was ready on port:" + port);
            if(status == 0){
                webinos.installWebinosOnEmulatedDevice("emulator-" + port, apps, function(){
                    console.log("Finished installing apps");
                });
            }
        });

    }
