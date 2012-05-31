#!/usr/bin/env node
var child = require('child_process').exec
var list = [];
var fs = require('fs');
var path = require('path');
var prefix;
var cmd = process.argv[2];
var prefixPath = process.argv[3];
var nPathV = parseFloat(process.versions.node);
if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

var fileList = "--js ./webinos/common/rpc/lib/rpc.js" +
              " --js ./webinos/common/manager/messaging/lib/messagehandler.js" +
              " --js ./webinos/wrt/lib/webinos.session.js" + 
              " --js ./webinos/wrt/lib/webinos.servicedisco.js" + 
              " --js ./webinos/wrt/lib/webinos.js" + 
              " --js ./webinos/api/file/lib/webinos.path.js" + 
              " --js ./webinos/common/rpc/lib/webinos.utils.js" + 
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
                    
if (typeof cmd === "undefined") {
  help();
}

if (cmd ==="--help") {
  help();
}

function help() {
  console.log("*** This script currently only works for LINUX ****");
  console.log("To compile & install webinos please run");
  console.log("\t node webinos_build.js install");
  console.log("\t node webinos_build.js uninstall/clean");
  console.log("\t (Be default installs in /usr/local to install in different location) ");
  console.log("\t node webinos_build.js install --prefix ");
  process.exit();
}


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

if (typeof prefixPath !== "undefined") {
  prefix = prefixPath;
} else {
  prefix = '/usr/local';
}

if (cmd === "install") {
  var filePath = [prefix+"/bin", prefix+"/lib", prefix+"/lib/node_modules", prefix+"/lib/node_modules/webinos_platform" ];
  for ( var key = 0; key < filePath.length; key += 1) {
    if (!nPathV.existsSync(filePath[key])) {
      fs.mkdirSync(filePath[key]);
    }
  }
  
  child("node-gyp configure", function(err, stdout, stderr) {
    console.log(stderr)
    if (err) {
      console.log(" Error running, please run manually node-gyp configure");
    }
    else {
      child("node-gyp build", function(err, stdout, stderr) {
        console.log(stderr);
        if (!err ) { 
          
          //list.push("cp -r webinos/* " + prefix + "/lib/node_modules/webinos_platform/ ")
          //list.push("cp -r node_modules/*      "+prefix+"/lib/node_modules/");
                    
          list.push("ln -sf "+__dirname+"/webinos_pzh.js "+prefix+"/bin/webinos_pzh")
          list.push("ln -sf "+__dirname+"/webinos_pzp.js "+prefix+"/bin/webinos_pzp")
          
          list.push("java -jar ./tools/closure-compiler/compiler.jar --compilation_level WHITESPACE_ONLY --warning_level VERBOSE "+ fileList +" --js_output_file ./webinos/test/client/webinos.js");
  
          exec(list);
        }  
      });
    }
  });
} else {
  list.push("rm -rf " + prefix+ "/bin/webinos_pzh");
  list.push("rm -rf " + prefix+ "/bin/webinos_pzp");
  list.push("rm -rf build/");
  exec(list);
}
