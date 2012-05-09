var child = require('child_process').exec
var list = [];
var fs = require('fs');
var cmd = process.argv[2];
var prefixPath = process.argv[3];

function exec(list) {
  var key;
  for (key = 0; key < list.length; key += 1) {
    console.log(list[key]);
    child(list[key], function(err, stdout, stderr) {
       if(err) {
         console.log(err);
         process.exit(1);
       }
       if(stderr) console.log(stderr);       
    });
  } 
}

function writeFile(filename) {
	fs.readFile(prefix+filename, function(err, buffer) {
		if (err) {
			console.log(err);
			process.exit(1);
		}
		var old = buffer.toString('utf8').split('\n').slice(1).join('\n');
		var newcontents = '#!'+prefix+'/bin/webinos\n'+old;
		console.log(prefix+filename);
		fs.writeFileSync(prefix+filename, newcontents );
	});
}

if ( prefixPath !== "undefined") {
	prefix = prefixPath;
} else {
	prefix = '/usr/local';
}

if (cmd === "install") {
	
	
	var filePath = [prefix+"/bin", prefix+"/lib", prefix+"/lib/node_modules", prefix+"/lib/node_modules/webinos_platform" ];
	for ( var key = 0; key < filePath.length; key += 1) {
		if (!fs.existsSync(filePath[key])) {
			fs.mkdirSync(filePath[key]);
		}
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
		list.push("cp -rf out/Release/webinos " + prefix+ "/bin/webinos")
		list.push("cp -rf webinos/* " + prefix + "/lib/node_modules/webinos_platform/ ")
		list.push("cp -rf node_modules/* "+prefix+"/lib/node_modules/");
		list.push("ln -sf "+prefix+ "/lib/node_modules/webinos_platform/pzh/lib/pzh_start.js "+prefix+"/bin/webinos_pzh")
		list.push("ln -sf "+prefix+ "/lib/node_modules/webinos_platform/pzp/lib/pzp_start.js "+prefix+"/bin/webinos_pzp")
		
		list.push("cp -rf "+node_path.variables.node_root+"/deps/npm "+prefix+"/lib/node_modules/" );
		list.push("cp -rf "+node_path.variables.node_root+"/tools/wafadmin "+prefix+"/lib/node/" )
		list.push("cp -rf "+node_path.variables.node_root+"/tools/node-waf "+prefix+"/bin/node_waf" )
		list.push("ln -sf "+prefix+ "/lib/node_modules/npm/bin/npm-cli.js "+prefix+"/bin/npm")
		
		//list.push("cp -rf package.json /usr/local/lib/node_modules/webinos_platform/");
		exec(list);
		setTimeout(function() {
			writeFile("/lib/node_modules/webinos_platform/pzh/lib/pzh_start.js");
			writeFile("/lib/node_modules/webinos_platform/pzp/lib/pzp_start.js");
			writeFile("/lib/node_modules/npm/bin/npm-cli.js");
		}, 500);
		
		
	});
} else {
	list.push("rm -rf " + prefix+ "/bin/webinos");
	list.push("rm -rf " + prefix+ "/bin/node_waf");
	list.push("rm -rf " + prefix+ "/bin/webinos_pzh");
	list.push("rm -rf " + prefix+ "/bin/webinos_pzp");
	list.push("rm -rf " + prefix+ "/bin/npm");
	list.push("rm -rf " + prefix+ "/lib/node_modules/");
	list.push("rm -rf " + prefix+ "/lib/node/");
	exec(list);
}
