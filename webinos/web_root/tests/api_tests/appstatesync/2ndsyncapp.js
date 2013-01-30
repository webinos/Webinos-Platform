
var objTemplate = {
	"prop0": "nop"
};

webinos.sync.create("_testObjIdOtherApp", function(syncObj) {
	console.log("created test sync object in other app");

	syncObj.data.prop0 = "baz";
	
	console.log("set prop on sync object in other app");

}, function(err) {
	console.log(err);
}, { // options
	referenceObject: objTemplate
});
