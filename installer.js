var child = require('child_process').exec
var list = [];
var fs = require('fs');

function exec(list) {
  for (var key = 0; key < list.length; key += 1) {
    child(list[key], function(err, stdout, stderr) {
       if(err) {
         console.log(err);
         process.exit(1);
       }
       if(stderr) console.log(stderr);
    });
  }
}

if (!fs.existsSync("/usr/local/lib/node_modules")) {
   fs.mkdirSync("/usr/local/lib/node_modules");
}

if (!fs.existsSync("/usr/local/lib/node_modules/webinos_platform")) {
   fs.mkdirSync("/usr/local/lib/node_modules/webinos_platform");
}
list.push("cp -rf webinos/* /usr/local/lib/node_modules/webinos_platform/ ")
list.push("cp -rf node_modules/* /usr/local/lib/node_modules/ ")
list.push("cp -rf out/Release/webinos /usr/local/bin/")
list.push("ln -sf /usr/local/lib/node_modules/webinos_platform/pzh/lib/webinos_startPzh.js /usr/local/bin/webinos_pzh")
list.push("ln -sf /usr/local/lib/node_modules/webinos_platform/pzp/lib/webinos_startPzp.js /usr/local/bin/webinos_pzp")
list.push("chmod 777 /usr/local/bin/webinos_pzp")
list.push("chmod 777 /usr/local/bin/webinos_pzh")
exec(list)