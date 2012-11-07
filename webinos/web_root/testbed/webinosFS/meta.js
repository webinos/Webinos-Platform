(function (exports) {

	exports.getMetaData = function (file) {
	
	var meta = {};
	meta.title = "";
	meta.author = "";
	meta.year = "";
	meta.album = "";
	
	if (exports.endsWith(file,"Peter John Ross - Soulless Poet.mp3")){
		
		meta.title = "Soulless Poet";
		meta.author = "Peter John Ross";
		meta.year = "2003";
		meta.album = "";
		return meta;
	}
	
	if (exports.endsWith(file,"Peter John Ross - Tears of Red.mp3")){
		
		meta.title = "Tears of Red";
		meta.author = "Peter John Ross";
		meta.year = "2011";
		meta.album = "";
		return meta;
	}
	
	if (exports.endsWith(file,"Peter John Ross - The Wild Life.mp3")){
		
		meta.title = "The Wild Life";
		meta.author = "Peter John Ross";
		meta.year = "2008";
		meta.album = "";
		return meta;
	}
	
	
	if (exports.endsWith(file,"techno - Peter John Ross.mp3")){
		
		meta.title = "Techno";
		meta.author = "Peter John Ross";
		meta.year = "2007";
		meta.album = "";
		return meta;
	}
	
	
	
	return null;
	
}




	exports.endsWith = function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}

})(webinosMeta = {});