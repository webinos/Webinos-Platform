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
var fs = require('fs');
/**
 * This function sets up essential android ci settings and runs CI tests based
 * on the provided workflow. These should be changed depending on the environment
 * @param cb
 */
var setupCI = function(inWebinosRoot, cb){
    var settings = {};
    var emulatorSettings = {};
    var webinosSettings = {};
    var deviceSettings = {};

    webinosSettings.ANODE_REPO = "git://github.com/paddybyers/anode.git";
    //Assume that if we run it through npm test, then we are working in the Webinos-Platform directory
    // otherwise, we are in Webinos-Platform/tools/android-ci
    var cwd = process.cwd();
    webinosSettings.ANDROID_PLATFORM_PATH = (inWebinosRoot) ? cwd + "/webinos/platform/android":  cwd + "/../../webinos/platform/android";
    webinosSettings.ANODE_DOWNLOAD_PATH = "/tmp/anode";

    emulatorSettings.WEBINOS_AVD = "PZP_AVD";
    emulatorSettings.ANDROID_DEVICE_TARGET = 2;
    emulatorSettings.CONSOLE_PORT = 5554;
    emulatorSettings.STARTER_SCRIPT = (inWebinosRoot) ? cwd + "/tools/android-ci/emul.sh" : cwd + "/emul.sh";


    settings.EMULATOR_SETTINGS = emulatorSettings;
    settings.WEBINOS_SETTINGS = webinosSettings;
    settings.DEVICE_SETTINGS = deviceSettings;

    settings.ANDROID_INSTALL_PATH = "/tmp/android";
    fs.exists(settings.ANDROID_INSTALL_PATH, function(exists){
        if(!exists)    {
            fs.mkdir(settings.ANDROID_INSTALL_PATH, function(result){

            });
        }
    })
    //settings.ANDROID_HOME = "/tmp/android/android-sdk-linux";

    //We assume android SDK has not been installed
    settings.ANDROID_INSTALLED = 0;
    settings.ANDROID_DOWNLOAD_SOURCE = "http://dl.google.com/android/android-sdk_r21.1-linux.tgz";
    //We are working with android 2.3.3
    settings.ANDROID_API_LEVEL = 10;

    var AndroidInit = require('./android-init'),
        ci = new AndroidInit(settings);
    cb(ci);

}

var AndroidEmulatorBasedCIWorkflow = require("./emulator-based-workflow");

/**
 Executing the specified workflow
 */

exports.run = function(inWebinosRoot, cb){
    setupCI(inWebinosRoot, function(androidCI){
        var emulatorBasedWorkflow = new AndroidEmulatorBasedCIWorkflow(androidCI);
        emulatorBasedWorkflow.run(cb);
    });
}
