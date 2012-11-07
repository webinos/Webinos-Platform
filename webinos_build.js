#!/usr/bin/env node
var child = require('child_process').exec
var list = [];
var fs = require('fs');
var path = require('path');


/** This is the list of js files that build up the final webinos.js
 *
 * !ATTENTION!
 * If you update this list, make sure you also update the build.xml
 * located in /webinos/test folder
 *
 * @type {String}
 */
var fileList =
    " --js ./webinos/core/wrt/lib/webinos.util.js" +
    " --js ./webinos/core/rpc/lib/registry.js" +
    " --js ./webinos/core/rpc/lib/rpc.js" +
    " --js ./webinos/core/manager/messaging/lib/messagehandler.js" +
    " --js ./webinos/core/wrt/lib/webinos.session.js" +
    " --js ./webinos/core/wrt/lib/webinos.servicedisco.js" +
    " --js ./webinos/core/wrt/lib/webinos.js" +
    " --js ./webinos/core/api/file/lib/virtual-path.js" +
    " --js ./webinos/core/wrt/lib/webinos.file.js" +
    " --js ./webinos/core/wrt/lib/webinos.tv.js" +
    " --js ./webinos/core/wrt/lib/webinos.oauth.js" +
    " --js ./webinos/core/wrt/lib/webinos.get42.js" +
    " --js ./webinos/core/wrt/lib/webinos.geolocation.js" +
    " --js ./webinos/core/wrt/lib/webinos.sensors.js" +
    " --js ./webinos/core/wrt/lib/webinos.events.js" +
    " --js ./webinos/core/wrt/lib/webinos.applauncher.js" +
    " --js ./webinos/core/wrt/lib/webinos.vehicle.js" +
    " --js ./webinos/core/wrt/lib/webinos.deviceorientation.js" +
    " --js ./webinos/core/wrt/lib/webinos.context.js" +
    " --js ./webinos/core/wrt/lib/webinos.authentication.js" +
    " --js ./webinos/core/wrt/lib/webinos.contacts.js" +
    " --js ./webinos/core/wrt/lib/webinos.devicestatus.js" +
    " --js ./webinos/core/wrt/lib/webinos.discovery.js" +
    " --js ./webinos/core/wrt/lib/webinos.payment.js";

function exec(list) {
  var key =0;
  for (key =0; key < list.length; key += 1) {
    console.log(list[key]);
    child(list[key], function(err, stdout, stderr) {
       if(err) {
         console.log(err);
         process.exit(1);
       }

    });
  }
}

/**
 * Available compilation arguments here:
 * http://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/javascript/jscomp/CommandLineRunner.java
 * @type {String}
 */
var closureCompilerCmd = 'java -jar tools/closure-compiler/compiler.jar'
                       + ' --compilation_level WHITESPACE_ONLY'
                       + ' --formatting PRETTY_PRINT'
                       + ' --warning_level VERBOSE'
                       + ' --output_wrapper \"if(typeof webinos === \'undefined\'){%output%}\"'
                       + ' --js_output_file webinos/web_root/webinos.js'
                       + fileList;
list.push(closureCompilerCmd);

exec(list);
