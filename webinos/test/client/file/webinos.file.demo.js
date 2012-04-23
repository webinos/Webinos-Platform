if (typeof webinos === "undefined")
	webinos = {};

if (typeof webinos.file === "undefined")
	webinos.file = {};

if (typeof webinos.file.demo === "undefined")
	webinos.file.demo = {};

(function (exports) {
	"use strict";
	
	var file = webinos.file;
	var path = webinos.path || (webinos.path = {});
	var utils = webinos.utils || (webinos.utils = {});
	
	exports.dialogs = {};
	
	exports.dialogs.Name = function (ok, cancel, value) {
		$("input.name", "div#dialog-name").val(value || "");
		
		return $("div#dialog-name").dialog({
			buttons: {
				"OK": function (event) {
					utils.callback(ok, this)(event, $("input.name", "div#dialog-name").val());
				},
				"Cancel": function (event) {
					utils.callback(cancel, this)(event);
				}
			},
			closeOnEscape: false,
			dialogClass: "ui-dialog-titlebar-no-close",
			draggable: false,
			minHeight: 0,
			minWidth: 0,
			modal: true,
			resizable: false
		});
	}
	
	exports.dialogs.Editor = function (save, discard, value) {
		$("textarea.content", "div#dialog-editor").val(value || "");
		
		return $("div#dialog-editor").dialog({
			buttons: {
				"Save": function (event) {
					utils.callback(save, this)(event, $("textarea.content", "div#dialog-editor").val());
				},
				"Discard": function (event) {
					utils.callback(discard, this)(event);
				}
			},
			minHeight: 0,
			minWidth: 0
		});
	}
	
	exports.Explorer = function (table) {
		this.objects = new utils.DoublyLinkedList(exports.Object.compare);
		
		$(document).bind("file.create", utils.bind(this.create, this));
		$(document).bind("file.copy", utils.bind(this.copy, this));
		$(document).bind("file.move", utils.bind(this.move, this));
		$(document).bind("file.remove", utils.bind(this.remove, this));
		
		this.table = $(table);
		this.table.droppable({
			activeClass: "ui-state-active",
			scope: "file",
			tolerance: "pointer",
			drop: utils.bind(this.drop, this)
		});
		
		$(".create-directory", this.table).click(utils.bind(this.createDirectory, this));
		$(".create-file", this.table).click(utils.bind(this.createFile, this));
		$(".reload", this.table).click(utils.bind(this.reload, this));
	}
	
	exports.Explorer.prototype.directory = null;
	exports.Explorer.prototype.parent = null;
	
	exports.Explorer.prototype.addEntry = function (entry) {
		if (entry.isDirectory)
			var constructor = exports.Directory;
		else
			var constructor = exports.File;
		
		var object = new constructor(this, entry);
		var node = this.objects.insert(object);
		
		if (node.next === null)
			$("tbody", this.table).append(object.row);
		else
			node.next.data.row.before(object.row);
	}
	
	exports.Explorer.prototype.deleteEntry = function (entry) {
		var object = this.objects.find({
			entry: entry
		});
		
		if (object !== null) {
			object.data.row.remove();
			
			this.objects.remove(object);
		}
	}
	
	exports.Explorer.prototype.create = function (event, entry) {
		if (this.directory && path.equals(this.directory.fullPath, path.dirname(entry.fullPath)))
			this.addEntry(entry);
	}
	
	// TODO Copy may overwrite?
	exports.Explorer.prototype.copy = function (event, entry, newEntry) {
		if (this.directory && path.equals(this.directory.fullPath, path.dirname(newEntry.fullPath)))
			this.addEntry(newEntry);
	}
	
	// TODO Move may overwrite.
	exports.Explorer.prototype.move = function (event, oldEntry, newEntry) {
		if (this.directory && oldEntry.isDirectory && oldEntry.isPrefixOf(this.directory.fullPath))
			this.change(newEntry); // TODO Change to subdirectory of newEntry
		else {
			if (this.directory && path.equals(this.directory.fullPath, path.dirname(oldEntry.fullPath)))
				this.deleteEntry(oldEntry);
			
			if (this.directory && path.equals(this.directory.fullPath, path.dirname(newEntry.fullPath)))
				this.addEntry(newEntry);
		}
	}
	
	exports.Explorer.prototype.remove = function (event, entry) {
		if (this.directory && entry.isDirectory && entry.isPrefixOf(this.directory.fullPath))
			this.change(this.directory.filesystem.root);
		else if (this.directory && path.equals(this.directory.fullPath, path.dirname(entry.fullPath)))
			this.deleteEntry(entry);
	}
	
	exports.Explorer.prototype.change = function (directory) {
		this.directory = directory;

		$("tbody", this.table).empty();
		$("caption", this.table).text(this.directory.fullPath);
		
		this.objects.empty();
		
		this.directory.getParent(utils.bind(function (parent) {
			this.parent = new exports.Parent(this, parent);
			
			$("tbody", this.table).prepend(this.parent.row);
		}, this), function (error) {
			alert("Error retrieving parent (#" + error.code + ")");
		});
		
		var reader = directory.createReader();
		
		var successCallback = utils.bind(function (entries) {
			entries.forEach(this.addEntry, this);
			
			if (entries.length > 0)
				reader.readEntries(successCallback, errorCallback);
		}, this);

		var errorCallback = function (error) {
			alert("Error reading directory (#" + error.code + ")");
		};

		reader.readEntries(successCallback, errorCallback);
	}
	
	exports.Explorer.prototype.drop = function (event, ui) {
		var altKey = event.altKey;
		var entry = ui.draggable.parents("tr").data("entry");
		
		var name = new exports.dialogs.Name(utils.bind(function (event, value) {
			if (!altKey)
				var action = utils.bind(entry.copyTo, entry);
			else
				var action = utils.bind(entry.moveTo, entry);
			
			action(this.directory, value, function (newEntry) {
				if (!altKey)
					var eventType = "file.copy";
				else
					var eventType = "file.move";
					
				$(document).trigger(eventType, [entry, newEntry]);
				
				name.dialog("close");
			}, function (error) {
				name.dialog("close");
				
				alert("Error copying/moving entry (#" + error.code + ")");
			})
		}, this), function (event) {
			name.dialog("close");
		}, entry.name);
	}
	
	exports.Explorer.prototype.createDirectory = function (event) {
		var name = new exports.dialogs.Name(utils.bind(function (event, value) {
			this.directory.getDirectory(value, {
				create: true,
				exclusive: true
			}, function (entry) {
				$(document).trigger("file.create", entry);
				
				name.dialog("close");
			}, function (error) {
				name.dialog("close");
				
				alert("Error creating directory (#" + error.code + ")");
			})
		}, this), function (event) {
			name.dialog("close");
		});
		
		return false;
	}
	
	exports.Explorer.prototype.createFile = function (event) {
		var name = new exports.dialogs.Name(utils.bind(function (event, value) {
			this.directory.getFile(value, {
				create: true,
				exclusive: true
			}, function (entry) {
				$(document).trigger("file.create", entry);
				
				name.dialog("close");
			}, function (error) {
				name.dialog("close");
				
				alert("Error creating file (#" + error.code + ")");
			})
		}, this), function (event) {
			name.dialog("close");
		});
		
		return false;
	}
	
	exports.Explorer.prototype.reload = function (event) {
		this.change(this.directory);
		
		return false;
	}
	
	exports.Object = function (explorer, entry) {
		this.explorer = explorer;
		
		this.entry = entry;
	}
	
	exports.Object.prototype.row = null;
	
	exports.Object.compare = function (object1, object2) {
		if (object1.entry.fullPath < object2.entry.fullPath)
			return -1;
		else if (object1.entry.fullPath == object2.entry.fullPath)
			return 0;
		else
			return 1;
	}
	
	exports.Parent = function (explorer, entry) {
		exports.Object.call(this, explorer, entry);
		
		this.row = $("#parent").tmpl({
			name: ".."
		});
		
		$(".name", this.row).click(utils.bind(this.change, this));
	}
	
	exports.Parent.prototype = new exports.Object();
	exports.Parent.prototype.constructor = exports.Parent;
	
	exports.Parent.prototype.change = function (event) {
		this.explorer.change(this.entry);
		
		return false;
	}
	
	exports.Directory = function (explorer, entry) {
		exports.Object.call(this, explorer, entry);
		
		this.row = $("#directory").tmpl({
			name: this.entry.name
		});
		
		this.row.data("entry", this.entry);
		
		$(".name", this.row).click(utils.bind(this.change, this));
		$(".name", this.row).draggable({
			helper: "clone",
			opacity: 1,
			revert: true,
			revertDuration: 0,
			scope: "file"
		});
		
		$(".remove", this.row).click(utils.bind(this.removeRecursively, this));
	}
	
	exports.Directory.prototype = new exports.Object();
	exports.Directory.prototype.constructor = exports.Directory;
	
	exports.Directory.prototype.change = function (event) {
		this.explorer.change(this.entry);
		
		return false;
	}
	
	exports.Directory.prototype.removeRecursively = function (event) {
		this.entry.removeRecursively(utils.bind(function () {
			$(document).trigger("file.remove", this.entry);
		}, this), function (error) {
			alert("Error (recursively) removing directory (#" + error.code + ")");
		});
		
		return false;
	}
	
	exports.File = function (explorer, entry) {
		exports.Object.call(this, explorer, entry);
		
		this.row = $("#file").tmpl({
			name: this.entry.name
		});
		
		this.row.data("entry", this.entry);
		
		$(".name", this.row).click(utils.bind(this.edit, this));
		$(".name", this.row).draggable({
			helper: "clone",
			opacity: 1,
			revert: true,
			revertDuration: 0,
			scope: "file"
		});
		
		$(".remove", this.row).click(utils.bind(this.remove, this));
	}
	
	exports.File.prototype = new exports.Object();
	exports.File.prototype.constructor = exports.File;
	
	exports.File.prototype.edit = function (event) {
		var entry = this.entry;
		var reader = new file.FileReader(this.entry.filesystem);
		
		reader.onerror = function (evt) {
			alert("Error reading file (#" + evt.targer.error.code + ")");
		}

		reader.onload = function (evt) {
			var editor = new exports.dialogs.Editor(function (event, value) {
				entry.createWriter(function (writer) {
					var written = false;
					
					var bb = new file.BlobBuilder();

					bb.append(value);
		
					writer.onerror = function (evt) {
						editor.dialog("close");
						
						alert("Error writing file (#" + evt.targer.error.code + ")");
					}
					
					writer.onwrite = function (evt) {
						if (!written) {
							written = true;

							writer.write(bb.getBlob());
						} else
							editor.dialog("close");
					}
					
					writer.truncate(0);
				}, function (error) {
					editor.dialog("close");
					
					alert("Error retrieving file writer (#" + error.code + ")");
				});
			}, function (event) {
				editor.dialog("close");
			}, evt.target.result);
		}
		
		this.entry.file(function (file) {
			reader.readAsText(file);
		}, function (error) {
			alert("Error retrieving file (#" + error.code + ")");
		});
		
		return false;
	}
	
	exports.File.prototype.remove = function (event) {
		this.entry.remove(utils.bind(function () {
			$(document).trigger("file.remove", this.entry);
		}, this), function (error) {
			alert("Error removing file (#" + error.code + ")");
		});
		
		return false;
	}
})(webinos.file.demo);