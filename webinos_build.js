#!/usr/bin/env node
var child = require('child_process').exec
var list = [];
var fs = require('fs');
var path = require('path');

var fileList =
    " --js ./webinos/wrt/lib/webinos.util.js" +
    " --js ./webinos/common/rpc/lib/registry.js" +
    " --js ./webinos/common/rpc/lib/rpc.js" +
    " --js ./webinos/common/manager/messaging/lib/messagehandler.js" +
    " --js ./webinos/wrt/lib/webinos.session.js" +
    " --js ./webinos/wrt/lib/webinos.servicedisco.js" +
    " --js ./webinos/wrt/lib/webinos.js" +
    " --js ./webinos/api/file/lib/virtual-path.js" +
    " --js ./webinos/wrt/lib/webinos.file.js" +
    " --js ./webinos/wrt/lib/webinos.tv.js" +
    " --js ./webinos/wrt/lib/webinos.oauth.js" +
    " --js ./webinos/wrt/lib/webinos.get42.js" +
    " --js ./webinos/wrt/lib/webinos.geolocation.js" +
    " --js ./webinos/wrt/lib/webinos.sensors.js" +
    " --js ./webinos/wrt/lib/webinos.events.js" +
    " --js ./webinos/wrt/lib/webinos.applauncher.js" +
    " --js ./webinos/wrt/lib/webinos.vehicle.js" +
    " --js ./webinos/wrt/lib/webinos.deviceorientation.js" +
    " --js ./webinos/wrt/lib/webinos.context.js" +
    " --js ./webinos/wrt/lib/webinos.devicestatus.js" +
    " --js ./webinos/wrt/lib/webinos.contacts.js" +
    " --js ./webinos/wrt/lib/webinos.discovery.js" +
    " --js ./webinos/wrt/lib/webinos.authentication.js";

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

list.push("java -jar tools/closure-compiler/compiler.jar --compilation_level WHITESPACE_ONLY --warning_level VERBOSE "+ fileList +" --js_output_file webinos/test/client/webinos.js");
exec(list);
