var path = require('path'),
    dsm = require(path.resolve(__dirname,'../lib/webinos.devicestatus.js')).devicestatus,
    vocabulary = require('./vocabulary.js').vocabulary;

for (var aspect in vocabulary) {

	successCB = function(res) {
        if (res.isSupported){
//                console.log("\n" + aspect);
		console.log("\n" + aspect + (res.isSupported ? " (":" (not ") + "supported)");
		for (var property in vocabulary[aspect].Properties)
		{
			var prop = {component: "_default", aspect: aspect, property: vocabulary[aspect].Properties[property]},
			
			successCB = function (value) { 
				console.log("\t" + prop.property + ": " + value );
			};

			errorCB = function (value) {
				console.log("\t" + prop.property + ": " + value );
			};

			dsm.devicestatus.getPropertyValue(successCB, errorCB, prop);
		}
}
	};
	dsm.devicestatus.isSupported(aspect, "", successCB);
}


