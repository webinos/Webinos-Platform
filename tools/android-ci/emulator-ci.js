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

//we set Emulator as an event emitter to signal to other modules when the emulator is
// ready to accept commands
var nodeUtil = require("util"),
    events = require("events");

var Utils = require("./ci-utils"),
    utils = new Utils();

/**
	This object represents a particular instance of an emulator
	If executed multiple times, a number of devices will be available
	on the system, each with its own port
*/
var EmulatorDevice = function(avd, target, consolePort, adbPort){
    this._avd = avd;
    this._target = target;
    this._adbport = adbPort;
    this._consolePort = consolePort;
    this.getConsolePort = function(cb){
           var self = this;
        cb(self._consolePort);
    }
}

/**
 * This object represents an interface to emulated devices. It provides essential functions for
 * managing the devices and working with these devices
 * @param emulSettings
 * @constructor
 */
var Emulator = function(emulSettings){
    events.EventEmitter.call(this);
    this.devices = [];
	var self = this;
	this._avd = emulSettings.WEBINOS_AVD;
	this._target = emulSettings.ANDROID_DEVICE_TARGET;
    this._consolePort = emulSettings.CONSOLE_PORT;
    this._emulCMD = 'emulator';
    this._adbCMD = 'adb';
    this._startEmulatorScript = emulSettings.STARTER_SCRIPT;

    utils.on("EmulatorReady", function(additionalInfo){
        console.log("Emulator ready received from utils with details:" + additionalInfo.toString());
        if(additionalInfo !== undefined && additionalInfo[1] !== undefined){
            var port = additionalInfo[1];
            self.emit("Ready", port);
            self.devices.push(new EmulatorDevice(self._avd,undefined, port, port + 1));
            console.log("Emulator Started started on port: "  + port);
        }
    });

}

//We use node utils to specify that the the Emulator is an event emitter
nodeUtil.inherits(Emulator, events.EventEmitter);

/**
 * This function simply returns the set of all devices that are currently running
 * on the system
 * @return {*}
 */
Emulator.prototype.getDevices = function(){
    return this.devices;
}

/**
 * This function uses a shell script to start an emulator instance at the specified port
 * The instance will use the AVD specified in the configuration
 * @param port
 * @param cb
 */
Emulator.prototype.startAndroidEmulator = function(port, avd, cb){
    var self = this;
    var script = self._startEmulatorScript;
    console.log("Starting Android Emulator:" + avd + " on port:" + port);

    //We set this to enable utils to notify us of the progress
    var withNotify = true;
    utils.executeShellScript(script, [port, avd], {}, withNotify, function(){

    });
}


Emulator.prototype.stopAndroidEmulator = function(port, cb){
    var self = this;
    var script = self._startEmulatorScript;
    console.log("Stopping Android Device: emulator-" + port);

    utils.executeCommandViaExec(self._adbCMD + " -s emulator-" + port + " emu kill", [], [], function(code, forwardedArgs, stdout){
        if(code == 0)
            console.log("Device emulator-" + port + " Successfully Stopped");
        cb(0);
    });
}


Emulator.prototype.shutdown = function(cb){
    var self = this;
    if(self.devices !== undefined){
        for(var i in self.devices){
            var emulDev = self.devices[i];
            emulDev.getConsolePort(function(port){
                self.stopAndroidEmulator(port, function(code){
                   //if code is 0 then emulator was stopped successfulyy
                });
            })
        }
        cb();
    }
}
/**
 * This function executes a shell command on the specified emulated device only if the device is ready
 * @param command
 * @param device
 * @param cb
 */
Emulator.prototype.executeShellCommandOnEmulator = function(command, deviceId, args, cb){
    var self = this;
    this.getDeviceStatus(deviceId, function(status){
        if(status == "device"){
            console.log("Executing command: " + command + " on " + deviceId + " with arguments " + args.toString());
            utils.executeCommandViaSpawn(self._adbCMD, ['-s', deviceId, 'shell', command, args], cb, {});
        }
    });
}

/**
 * This function checks the status of the device represented by this emulator instance
 * It returns offline | online | device depending on the status as returned by adb devices
 * @param deviceId
 * @param cb
 */
/*
Emulator.prototype.getDeviceStatus = function(deviceId, cb){
    utils.executeCommandViaSpawn('adb', ['devices'], function(status, forwardedArgs, stdout){
        var state = "offline";
         for(var i in stdout){
             var entry = stdout[i].toString().split("\n");
             if(entry !== undefined){
                 for(var x in entry){
                     var line = entry[x];
                     if(line !== undefined && line !== ""){
                         line = line.toString();
                         if(line.indexOf(deviceId) > -1){
                            // each line is shown by device name\tstatus
                            state = line.substr(line.lastIndexOf("\t")+1);
                         }
                     }
                 }
            }
         }
        cb(state);
    }, {}) ;
}
*/

Emulator.prototype.getDeviceStatus = function(deviceId, cb){
    utils.executeCommandViaSpawn('adb', ['-s', deviceId, 'get-state'], function(status, forwardedArgs, stdout){
        //TODO: check the status code
       cb(stdout.toString().trim());
    }, {}) ;
}
/**
 * This function determines the next available port that can be used by an emulator instance
 * @param cb
 */
Emulator.prototype.getNextFreePort = function(cb){
    utils.executeCommandViaSpawn('adb', ['devices'], function(status, forwardedArgs, stdout){

        var portsInUse = [];
        //This is the first port available
        var nextPort = 5554;
        for(var i in stdout){
            var entry = stdout[i].toString().split("\n");
            if(entry !== undefined){
                for(var x in entry){
                    var line = entry[x];
                    if(line !== undefined && line !== "List of devices attached "){
                        line = line.toString();
                        var deviceName = line.substr(0, line.indexOf("\t"));
                        var deviceNPort = deviceName.trim().split("-");
                        if(deviceNPort[1] !== undefined)
                            portsInUse.push(deviceNPort[1]);
                    }
                }
            }
        }
        var top = portsInUse.pop();
        //Can't find peek, so we push back the top item
        portsInUse.push(top);
        if(top  !== undefined)  {
            top = parseInt(top);
            if(top !== NaN)
                nextPort = top + 2;
            else{
                //we have parsed the output of adb devices wrongly
                status = "adb Error";
            }
        }
        //Maximum Allowable port is 5584
        if(nextPort == 5586){
            status = "Full";
            nextPort = 0;
        }
        cb(status, nextPort, portsInUse);
    }, {}) ;
}

/**
 * This function installs the specified APK to the emulator represented by the given deviceId
 * @param deviceId
 * @param appToInstall
 * @param cb
 */
Emulator.prototype.installAppOnEmulatedDevice = function(deviceId, appToInstall, cb){
    console.log("Installing app: " + appToInstall + " on " + deviceId);
    this.getDeviceStatus(deviceId, function(status){
        if(status == "device"){
            //TODO: force installation of unsigned packages
            utils.executeCommandViaSpawn('adb', ['-s', deviceId, 'install', '-r', appToInstall], cb, {});
        }else{
            console.log("Device " + deviceId + " not ready. Status=" + status);
        }
    });
}

//function to really, really check things are booted up
function waitForBootComplete(consolePort, bootProperty, bootPropertyTest){
    console.log("[emulator-" + consolePort + "] Checking " + bootProperty + "...");
    var cmd="adb -s emulator-"+ consolePort + " shell \"" + bootProperty + "\" 2>/dev/null";
    var args=[ "-s", "emulator-"+ consolePort, "shell", bootProperty, "2>/dev/null"];
    utils.executeCommandExecWithGrep(cmd, [], function(stdout){
        console.log(stdout);
    }, {}, [bootPropertyTest]);
}

/**
 * Function checking whether a particular emulator boot property has been set
 * @param property
 * @param delay
 * @param propertyTest
 * @param cb
 */
function checkEmulatorBootProperty(consolePort, property, delay, propertyTest, cb) {
    setTimeout(function () {
            waitForBootComplete(consolePort, property, propertyTest);
            cb();
        }, delay
    );
}

module.exports = Emulator;
