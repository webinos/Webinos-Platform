(function(exports) {

    var fs = require('fs');
	var path = require('path');
	var Parser = require('expat2').Parser;
		
    exports.listTestWidgets = function (req, res) {
		var parser = this.parser = new Parser('UTF-8');
		var list = [];
		var current = { text: "" };

		var startElement = function(elt) {
			console.log('listTestWidgets: - startElement: name: ' + elt.nsName);
			
			if (elt.nsName === "test") {
				current.src = elt.attrs["src"];
				current.id = elt.attrs["id"];
				current.forAttr = elt.attrs["for"];
			}
		};
		
		var endElement = function(elt) {
			if (elt.nsName === "test") {
				console.log(current.text);
				list.push(current);
				current = { text: "" };			
			}
		};
		
		var text = function(elt, string) {
			if (elt.nsName === "test") {
				current.text = current.text + string;
			}
		};
		
		parser.on('startElement', startElement);
		parser.on('endElement', endElement);
		parser.on('text', text);

		try {
			var buffer = fs.readFileSync(path.join(__dirname,"../../../../../../web_root/tests/widget_tests/test-suite.xml"),"UTF-8");			
			console.log("listTestWidgets - about to parse: ");				
			parser.parse(buffer, {isFinal:true});
		} catch(e) {
			console.log(e);
		}
		
		res.render('widgetTests', { pageTitle: 'widget tests', widgets: list, baseDir: __dirname });
    };
}(module.exports));
