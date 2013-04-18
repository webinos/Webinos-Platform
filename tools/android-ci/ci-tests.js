#!/usr/bin/env node
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
/**
 * This script runs unit tests, functionality test of the pzh and android CI tests
 * Android CI tests will only be executed if an env variable '"RUN_ANDROID_CI"="yes"' has been set
 * @type {*}
 */
var async = require('async');
var Utils = require('./ci-utils'),
    utils = new Utils();

var args = process.argv.splice(2);
var inWebinosRoot = false;

/* The first argument is used to determine whether the script is running
 under Webinos-Platform or under tools/android-ci. This is necessary to
 avoid issues with some path dependencies
*/
if(args !== undefined && args[0] !== undefined)
    if(args[0] === "0")
        inWebinosRoot = true;
var cwd = process.cwd();

/**
 * Run all the tests in parallel since they do not have any dependencies between them
 */
async.parallel({
    runUnitTests: function(callback){
        var unitTestScript = (inWebinosRoot)? cwd + '/tools/travis/unit-tests.sh': cwd + '../travis/unit-tests.sh';
        utils.executeShellScript(unitTestScript, [0], [], false, function(code, argsToForward, stdout){
           if(code !== 0){
               callback(new Error("Unit tests failed"), stdout);
           }else{
               callback(null, stdout);
           }
        });
    },
    runPZHTests: function(callback){
       var pzpTestScript = (inWebinosRoot)? cwd + '/tools/travis/auto-test.sh': cwd + '../travis/auto-test.sh';
        utils.executeShellScript(pzpTestScript, [], [], false, function(code, argsToForward, stdout){
            if(code !== 0){
                callback(new Error("PZH tests failed"), stdout);
            }else{
                callback(null, stdout);
            }
        });
    },
    runAndroidTests: function(callback){
        //check if we need to run android CI tests. This should be specified as an edfdefenv: RUN_ANDROID_CI="yes"
        if(process.env["RUN_ANDROID_CI"] === "yes"){
            var
                Utils = require("./ci-utils"),
                utils = new Utils();
            var androidCi = require('./android-ci');
            androidCi.run(inWebinosRoot, function(code, message){
                //We assume that errors would have been returned through the call
                if(code === 0)
                    callback(null, message);
                else
                    callback(new Error(message));
            });
        }else{
            console.log("Android CI not performed");
            callback(null);
        }
    }
    }, function(err, results){
          if(err)
            process.exit(1);
          else
            process.exit(0);
    });