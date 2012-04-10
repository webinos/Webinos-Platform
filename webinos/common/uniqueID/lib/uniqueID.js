var os = require('os');
var hash = require('../node_hash');

/*console.log("hostname: "+ os.hostname() + "\n" +
			"type: "+ os.type() + "\n" +
			"platform: "+ os.platform() + "\n" +
			"arch: "+ os.arch() + "\n" +
			"release: "+ parseFloat(os.release()) + "\n" +
			"uptime: "+ parseFloat(os.uptime()) + "\n" +	
			"loadavg: "+ os.loadavg()[0] + " " + os.loadavg()[1] + " " + Math.floor(os.loadavg()[2]) + "\n" +
			"totalmem: "+ parseFloat(os.totalmem()) + "\n" +
			"freemem: "+ parseFloat(os.freemem()) + "\n" +
			"cpus: "+ JSON.stringify(os.cpus()) + "\n" +
			"networkInterfaces: " + JSON.stringify(os.networkInterfaces())
);*/

var memory = hash.sha512(os.totalmem().toString());

var tmp = JSON.parse(JSON.stringify(os.cpus()));
var cpus = hash.sha512(tmp[0].model.toString() + tmp[0].speed.toString());

var platformDetails = hash.sha512(	os.hostname().toString() + 
									os.platform().toString() + 
									os.arch().toString() +
									os.release.toString()
					  );

/*var uniqueID = hash.sha512(memory + tmp + platformDetails);
console.log("uniqueID: " + uniqueID);*/

exports.getUUID_40 = hash.sha1(memory + tmp + platformDetails);;
exports.getUUID_64 = hash.sha256(memory + tmp + platformDetails);;
exports.getUUID_128 = hash.sha512(memory + tmp + platformDetails);;

