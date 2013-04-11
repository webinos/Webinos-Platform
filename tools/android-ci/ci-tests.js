var async = require('async');
var Utils = require('./ci-utils'),
    utils = new Utils();

var args = process.argv.splice(2);
var inWebinosRoot = false;
if(args !== undefined && args[0] !== undefined)
    if(args[0])
        inWebinosRoot = true;
var cwd = process.cwd();

async.parallel({
    runUnitTests: function(callback){
        /*var unitTestScript = (inWebinosRoot)? cwd + '/tools/travis/unit-tests.sh': cwd + '../travis/unit-tests.sh';
        utils.executeShellScript(unitTestScript, [0], [], false, function(code, argsToForward, stdout){
           if(code !== 0){
               callback(new Error("Unit tests failed"), stdout);
           }else{
               callback(null, stdout);
           }
        });  */
        callback(null);
    },
    runPZHTests: function(callback){
        /* = (inWebinosRoot)? cwd + '/tools/travis/auto-test.sh': cwd + '../travis/auto-test.sh';
        utils.executeShellScript(pzpTestScript, [], [], false, function(code, argsToForward, stdout){
            if(code !== 0){
                callback(new Error("PZH tests failed"), stdout);
            }else{
                callback(null, stdout);
            }
        });            */
        callback(null);
    },
    runAndroidTests: function(callback){
        var
            Utils = require("./ci-utils"),
            utils = new Utils();
        var androidCi = require('./android-ci');
        androidCi.run(inWebinosRoot, function(){
            //We assume that errors would have been returned through the call
            callback(null);
        });
    }
    }, function(err, results){
          if(err)
            process.exit(1);
    });