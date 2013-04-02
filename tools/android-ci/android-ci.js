/**
 * This function sets up essentialandroid ci settings. These should be changed depending on the environment
 * @param cb
 */
var setupCI = function(cb){
    var settings = {};
    var emulatorSettings = {};
    var webinosSettings = {};
    var deviceSettings = {};

    webinosSettings.ANODE_REPO = "git://github.com/paddybyers/anode.git";
    webinosSettings.ANDROID_PLATFORM_PATH = "/home/corn/devel/travis-test/Webinos-Platform/webinos/platform/android";
    webinosSettings.ANODE_DOWNLOAD_PATH = "/home/corn/devel/tools/anode";

    emulatorSettings.WEBINOS_AVD = "Test";
    emulatorSettings.ANDROID_DEVICE_TARGET = 2;
    emulatorSettings.CONSOLE_PORT = 5554;
    emulatorSettings.STARTER_SCRIPT = "emul.sh";


    settings.EMULATOR_SETTINGS = emulatorSettings;
    settings.WEBINOS_SETTINGS = webinosSettings;
    settings.DEVICE_SETTINGS = deviceSettings;

    settings.ANDROID_HOME = "/home/corn/devel/tools/android-sdk-linux";
    settings.ANDROID_INSTALLED = 0;
    settings.ANDROID_DOWNLOAD_LOCATION = "http://dl.google.com/android/android-sdk_r21.1-linux.tgz";
    settings.ANDROID_INSTALL_PATH = "/home/corn/devel/travis-test/Webinos-Platform/tools/android-ci";
    settings.ANDROID_API_LEVEL = 10;

    var AndroidInit = require('./android-init'),
        ci = new AndroidInit(settings);
    cb(ci);

}

/**
	Executing the specified workflow
*/
var AndroidEmulatorBasedCIWorkflow = require("./emulator-based-workflow");

setupCI(function(androidCI){
    var emulatorBasedWorkflow = AndroidEmulatorBasedCIWorkflow(androidCI);
    emulatorBasedWorkflow.run();
});
