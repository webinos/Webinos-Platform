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

fs.readFile('config.gypi', function(err, buffer) {
	if (err) {
		console.log('Please run ./configure before running make install');
		process.exit(1);
	}

// Parse options file and remove first comment line
	var buf       = buffer.toString('utf8').replace(/'/gi, '"');
	var parse     = buf.split('\n').slice(1).join('');
	var node_path = JSON.parse(parse);
	list.push("cp -rf out/Release/webinos /usr/local/bin/webinos")
	list.push("cp -rf webinos/* /usr/local/lib/node_modules/webinos_platform/ ")
	list.push("cp -rf "+node_path.variables.node_root+"/deps/npm /usr/local/lib/node_modules/" );
	list.push("cp -rf "+node_path.variables.node_root+"/tools/wafadmin /usr/local/lib/node/" )
	list.push("cp -rf "+node_path.variables.node_root+"/tools/node-waf /usr/local/bin/node_waf" )
	list.push("ln -sf /usr/local/lib/node_modules/webinos_platform/pzh/lib/webinos_startPzh.js /usr/local/bin/webinos_pzh")
	list.push("ln -sf /usr/local/lib/node_modules/webinos_platform/pzp/lib/webinos_startPzp.js /usr/local/bin/webinos_pzp")
	list.push("ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm")
	list.push("cp -rf node_modules/* /usr/local/lib/node_modules/");
	//list.push("cp -rf package.json /usr/local/lib/node_modules/webinos_platform/");
	exec(list);
	fs.readFile('/usr/local/lib/node_modules/npm/bin/npm-cli.js', function(err, buffer) {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		var old = buffer.toString('utf8').split('\n').slice(1).join('\n');
		var newcontents = '#!/usr/local/bin/webinos\n'+old;
		fs.writeFileSync('/usr/local/lib/node_modules/npm/bin/npm-cli.js', newcontents );
		list = [];	
		//list.push("sudo npm install -unsafe-perm");// /usr/local/lib/node_modules/webinos_platform/package.json")
		
		//exec(list);
	});
	
});

