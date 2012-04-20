(function () {
	var nConnect = require("connect"),
		nPath = require("path");

	nConnect()
		.use(nConnect.static(nPath.join(process.cwd(), "default")))
		.listen(6789);
})();
