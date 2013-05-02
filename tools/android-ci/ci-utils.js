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

var test_failed=false

var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var spawn = require('child_process').spawn;
var fs = require('fs');
var url = require('url'),
_path = require("path");


// In order to identify when the emulator is ready for use, we define Utils as an EventEmitter
// The mulator will be the main listener
var nodeUtil = require("util"),
    events = require("events");

var Utils = function(){
    events.EventEmitter.call(this);
    this._curlCMD = 'curl';

}

nodeUtil.inherits(Utils, events.EventEmitter);

/**
 * This function downloads a given file into the specified download location using cURL
 A call back is executed once the child process ends
 * @param sourceURL : the location from which the file should be downloaded
 * @param destinationDir : directory to which the file should be downloaded
 * @param cb
 */
Utils.prototype.downloadFile = function(sourceURL, destinationDir, cb) {
    var fileName = url.parse(sourceURL).pathname.split('/').pop();
    var args = ['-o', destinationDir +"/" + fileName, sourceURL];
    this.executeCommandViaSpawn(this._curlCMD, args, cb, [destinationDir +"/" + fileName]);
};

/**
 * This function sets up an env variable for the current Node Process
 * If the variable being set is PATH, then the value is appended to $PATH
 * The variables will only apply to the current node process
 * For now, we prepend variables to path rather than append them so that we can override any
 * current settings to allow us to use the new variables.
 * @param envVar
 * @param envValue
 */
Utils.prototype.setEnv = function(envVar, envValue){
    if(envVar !== undefined){
        if(envVar == "PATH")
            envValue = envValue + ":" + process.env["PATH"];

        process.env[envVar] = envValue;
    }
}

/**
 * Function that is common way of processing a node child process
 * @param cmdChild
 * @param command
 * @param cb
 * @param argsToForward
 * @param grepChild
 */
Utils.prototype.processChildProcess = function(cmdChild, command, cb, argsToForward, grepChild, withNotification) {
    var self = this;
    var withgrep = false;
    if(grepChild !== undefined)
        withgrep = true;
    var stdout = [];
    cmdChild.stdout.on('data', function (data) {
        console.log(command + ' info: ' + data);
        stdout.push(data);
        if(withgrep)
            grepChild.stdin.end();
        if(withNotification){
            if(data !== undefined && data.toString().indexOf("EmulatorReady") > -1){
                //This will be reached when the shell script echos "Ready..." without exiting
                //additional information is attached in the form "Ready \t comma separated list
                var info = data.toString().substr(data.lastIndexOf("\t")+1);
                var additionalInfo = info.trim().split(",");
                self.emit("EmulatorReady", additionalInfo);
                console.log("Emulator is ready >> emitting event now");
            }
        }
    });

    cmdChild.stderr.on('data', function (data) {
        console.error(command + ' stderr: ' + data);
        if(withgrep)
            grepChild.stdin.write(data);
    });

    cmdChild.stdout.on('end', function (data) {
        console.log('Finished executing command ' + command);
        if(withgrep)
            grepChild.stdin.end();
        cb(0, argsToForward, stdout);
    });
    cmdChild.on('close', function (code) {
        if (code !== 0) {
            console.error('FAILURE: ' + command + ' process exited with code ' + code);
        } else {
            console.log('SUCCESS: ' + command + ' Exited Successfully');
        }
        if(withgrep)
            grepChild.stdin.end();
        //cb(code);
    });

    if(withgrep){
        grepChild.stdout.on('data', function (data) {
            stdout.push(data);
            console.log("grep out >>" + data);
        });

        grepChild.stderr.on('data', function (data) {
            console.log('grep stderr: ' + data);
        });

        grepChild.on('close', function (code) {
            if (code !== 0) {
                console.log('grep process exited with code ' + code);
            }
        });
    }
}

/**
 * Function for executing shell commands using node child process' exec call
 * @param command : command string to execute, can either be with or without arguments
 * @param arguments : arguments can be specified as an array, where the order in the array will be
 * used as the order of passing the arguments to the command
 * @param cb : callback function
 * @param argsToForward : arguments that can be forwarded to the callback function
 */
Utils.prototype.executeCommandViaExec = function(command, arguments, argsToForward, cb ){
    var self = this;
    if(command != undefined && arguments != undefined){
        console.log("Executing command " + command + " using Exec with  arguments " + arguments.toString());
        var cmdChild = exec(command + " " + arguments.toString());

       self.processChildProcess(cmdChild, command, cb, argsToForward);
    }else{
        console.log("Could not execute specified command - one or both of command or arguments is undefined");
    }
}

/**
 * Function that executes a given script passing the given arguments
 * @param script :shell script to execute, this must be executable
 * @param arguments : arguments for the specified script
 * @param cb : callback function that will be called when execution of the script is complete
 * @param argsToForward :parameters that should be forwarded to the callback function
 */
Utils.prototype.executeShellScript = function(script, args, argsToForward, withNotify, cb){
   // this.emit("Test", "Testing 123");
    var self = this;
    console.log("Preparing to execute script " + script);
    fs.exists(script, function (exists) {
        if(exists){
            console.log("Executing script " + script + " with  arguments " + args.toString() + " from dir " + process.cwd());

            var cmdChild = execFile(script, args);
            var grepChld = undefined;
            self.processChildProcess(cmdChild, script, cb, argsToForward, grepChld, withNotify);
        }
    });
}

Utils.prototype.rmdirSyncRecursive = function(path, failSilent) {
    var self = this;
    var files;

    try {
        files = fs.readdirSync(path);
    } catch (err) {
        if(failSilent) return;
        throw new Error(err.message);
    }

    /*  Loop through and delete everything in the sub-tree after checking it */
    for(var i = 0; i < files.length; i++) {
        var currFile = fs.lstatSync(_path.join(path, files[i]));

        if(currFile.isDirectory()) // Recursive function back to the beginning
            self.rmdirSyncRecursive(_path.join(path, files[i]));

        else if(currFile.isSymbolicLink()) // Unlink symlinks
            fs.unlinkSync(_path.join(path, files[i]));

        else // Assume it's a file - perhaps a try/catch belongs here?
            fs.unlinkSync(_path.join(path, files[i]));
    }

    /*  Now that we know everything in the sub-tree has been deleted, we can delete the main
     directory. Huzzah for the shopkeep. */
    return fs.rmdirSync(path);
};
/**
 * This function provides mechanisms to execute a shell command whose output is
 * piped to grep.
 * @param command : the command to execute
 * @param arguments : arguments to the command
 * @param cb : cqllback function, which will be called when the process ends
 * @param argsToForward : arguments that should be forwarded to the callback
 * @param grepArgs : arguments to grep
 */
Utils.prototype.executeCommandExecWithGrep = function(command, arguments, cb, argsToForward, grepArgs ){
    var self = this;
    if(command != undefined && arguments != undefined){
        console.log("Executing command " + command + " using Exec with  arguments " + arguments.toString());
        var cmdChild = exec(command + " "  +arguments.toString());
        var grep = undefined;
        if(grepArgs !== undefined)
            grep = spawn('grep', grepArgs);

        self.processChildProcess(cmdChild, command, cb, argsToForward, grep);
    }else{
        console.log("Could not execute specified command - one or both of command or arguments is undefined");
    }
}

/**
 *  This function executes the given command using the given arguments
 The arguments must be specified as an array.
 The callback will only be called after the child process has exited
 You can also specify the arguments that should be forwarded to the callback
 TODO: find an alternative, perhaps more elegant way of passing 'argsToForward'
 TODO: Figure out if there is need to return the standard output to the callback
 * @param command
 * @param arguments
 * @param cb
 * @param argsToForward
 */
Utils.prototype.executeCommandViaSpawn = function(command, arguments, cb, argsToForward, options ){
    if(command != undefined && arguments != undefined){
        console.log("Executing command " + command + " using Spawn with  arguments " + arguments.toString());
        var cmdChild = undefined;
        if(options !== undefined)
            cmdChild = spawn(command, arguments, options);
        else
            cmdChild = spawn(command, arguments);

        var stdout = [];
        cmdChild.stdout.on('data', function (data) {
             console.log(command + ' info: ' + data);
            stdout.push(data);
        });

        cmdChild.stderr.on('data', function (data) {
            console.error(command + ' stderr: ' + data);
        });

        cmdChild.stdout.on('end', function(data) {
            console.log('Finished executing command ' + command);
            cb(0, argsToForward, stdout);
        });
        cmdChild.on('close', function (code) {
            if (code !== 0) {
                console.error('FAILURE: ' + command + ' process exited with code ' + code);
            }else{
                console.log('SUCCESS: ' + command + ' Exited Successfully');
            }
            //cb(code);
        });
    }else{
        console.log("Could not execute specified command - one or both of command or arguments is undefined");
        cb(1, "Could not execute specified command - one or both of command or arguments is undefined");
    }
}



module.exports = Utils;