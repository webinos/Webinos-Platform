var test_failed=false

var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var spawn = require('child_process').spawn;
var fs = require('fs');
var url = require('url');


// In order to identify when the emulator is ready for use, we define Utils as an EventEmitter
// The mulator will be the main listener
var nodeUtil = require("util"),
    events = require("events");

var Utils = function(){
    this._curlCMD = 'curl';
}

nodeUtil.inherits(Utils, events.EventEmitter);

/**
 * This function downloads a given file into the specified download location using cURL
 A call back is executed once the child process ends
 * @param sourceURL
 * @param destinationDir
 * @param cb
 */
Utils.prototype.downloadFile = function(sourceURL, destinationDir, cb) {
    var dwnldStatus = false;
    var fileName = url.parse(sourceURL).pathname.split('/').pop();
    var args = ['-o', destinationDir +"/" + fileName, sourceURL];
    this.executeCommandViaSpawn(this._curlCMD, args, cb, [destinationDir +"/" + fileName]);
};

/**
 * This function sets up an env variable for the current Node Process
 * If the variable being set is PATH, then the value is appended to $PATH
 * The variables will only apply to the current node process
 * @param envVar
 * @param envValue
 */
Utils.prototype.setEnv = function(envVar, envValue){
    if(envVar !== undefined){
        if(envVar == "PATH")
            envValue = process.env["PATH"] + ":" + envValue;

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
Utils.prototype.processChildProcess = function(cmdChild, command, cb, argsToForward, grepChild) {
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
    });

    cmdChild.stderr.on('data', function (data) {
        console.error(command + ' stderr: ' + data);
        if(withgrep)
            grepChild.stdin.write(data);
        if(data !== undefined && data.toString().indexOf("Ready") > -1){
            //This will be reached when the shell script echos "Ready..." without exiting
            //additional information is attached in the form "Ready \t comma separated list
            var info = data.toString().substr(data.lastIndexOf("\t")+1);
            var additionalInfo = info.trim().split(",");
            self.emit("Ready", additionalInfo);
        }
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
Utils.prototype.executeCommandViaExec = function(command, arguments, cb, argsToForward ){
    if(command != undefined && arguments != undefined){
        console.log("Executing command " + command + " using Exec with  arguments " + arguments.toString());
        var cmdChild = exec(command + " " + arguments.toString());

        Utils.prototype.processChildProcess(cmdChild, command, cb, argsToForward);
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
Utils.prototype.executeShellScript = function(script, arguments, argsToForward, cb){
    fs.exists(process.cwd() + "/" + script, function (exists) {
        if(exists){
            console.log("Executing script " + script + " with  arguments " + arguments.toString() + " from dir " + process.cwd());

            var cmdChild = execFile(process.cwd() + "/" + script, arguments);
            Utils.prototype.processChildProcess(cmdChild, script, cb, argsToForward);
        }
    });
}

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
    if(command != undefined && arguments != undefined){
        console.log("Executing command " + command + " using Exec with  arguments " + arguments.toString());
        var cmdChild = exec(command + " "  +arguments.toString());
        var grep = undefined;
        if(grepArgs !== undefined)
            grep = spawn('grep', grepArgs);

        Utils.prototype.processChildProcess(cmdChild, command, cb, argsToForward, grep);
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
Utils.prototype.executeCommandViaSpawn = function(command, arguments, cb, argsToForward ){
    if(command != undefined && arguments != undefined){
        console.log("Executing command " + command + " using Spawn with  arguments " + arguments.toString());
        var cmdChild = spawn(command, arguments);

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
    }
}


Utils.prototype.performAPICall = function(apiCallUrl, cb, callType){
    var restReq = undefined;
    switch(callType){
        case "post":
            restReq = restler.post(apiCallUrl);
            break;
        case "get":
        default:
            restReq = restler.get(apiCallUrl);
            break;
    }
    if(restReq !== undefined){
        restReq.on('complete', function(result){
            if(result instanceof Error){
                sys.puts('Error: ' + result.message);
            }else{
                sys.puts(result);
            }
            cb(JSON.parse(result));
        });
    }else{
        console.log("Specified Calltype Not Supported");
    }
}


Utils.prototype.formatURL = function(resourceType, resourceId, operation, apiParams){
    var url = config.BASEURL + config.SERVICES + resourceType;
    if (resource_id != "")
        url += "/" + resourceId;
    var query = {"operation": operation, "user": config.USERNAME, "password": config.PASSWORD };
    url += "?" + querystring.stringify(query);
    //Maybe check the length as well
    if(apiParams !== undefined)
        url += "&" + querystring.stringify(apiParams);
    url = encodeURIComponent(url);
    return url;
}

module.exports = Utils;