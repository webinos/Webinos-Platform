(function () {
	var nConnect = require("connect"),
		nHttp = require("http"),
		nPath = require("path");
	
	var app = nConnect().use(nConnect.static(nPath.join(process.cwd(), "default")));
	
	nHttp
		.createServer(app)
		.on("error", function (error) {
			console.log("webinos.file.hack.js: Error starting `connect` middleware (" + error + ").");
		})
		.listen(6789);
})();
