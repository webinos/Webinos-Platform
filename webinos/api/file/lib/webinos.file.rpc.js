/******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 *****************************************************************************/

/**
 * TODO Reuse event callback utility functions.
 * TODO Imporve network usage by transmittig only "changes".
 * TODO Check various "inline" TODOs.
 */
(function (exports) {
	"use strict";

	var nUtil = require("util");

	var webinos = require("webinos")(__dirname);
		webinos.dom = { rpc: require("./webinos.dom.rpc.js") },
		webinos.file = require("./webinos.file.js"),
		webinos.utils = webinos.global.require(webinos.global.rpc.location, "lib/webinos.utils.js");

	exports.Blob = {};
	exports.Blob.serialize = function (blob) {
		var object = {
			// size: blob.size,
			type: blob.type
		};

		if (blob instanceof webinos.file.Buffer) {
			object._type = "buffer";
			object._buffer = blob._buffer.toString("hex");
		} else if (blob instanceof webinos.file.File) {
			object._type = "file";
			object.name = blob.name;
			object.lastModifiedDate = blob.lastModifiedDate;
			object._entry = exports.Entry.serialize(blob._entry);
			object._size = blob._size;
			object._start = blob._start;
			object._end = blob._end;
		}

		return object;
	};

	exports.Blob.deserialize = function (object) {
		switch (object._type) {
			case "buffer":
				return new webinos.file.Buffer(new Buffer(object._buffer, "hex"), object.type);
			case "file":
				return new webinos.file.File(exports.Entry.deserialize(object._entry), object._start, object._end, object.type);
		}
	};

	exports.FileReader = {};
	exports.FileReader.serialize = function (reader, hex) {
		return {
			readyState: reader.readyState,
			result: hex ? reader.result.toString("hex") : reader.result,
			error: reader.error ? webinos.dom.rpc.DOMError.serialize(reader.error) : null
		};
	};

	exports.FileReader.readAsBuffer = function (params, successCallback, errorCallback, objectRef) {
		var reader = new webinos.file.FileReader(); // TODO Deserialize remote FileReader?

		var eventCallback = function (attribute) {
			return function (event) {
				this.rpc.notify(objectRef, attribute)(exports.FileReader.serialize(reader, true), webinos.dom.rpc.ProgressEvent.serialize(event));
			};
		};

		reader.onloadstart = webinos.utils.bind(eventCallback("onloadstart"), this);
		reader.onprogress = webinos.utils.bind(eventCallback("onprogress"), this);
		reader.onerror = webinos.utils.bind(eventCallback("onerror"), this);
		reader.onabort = webinos.utils.bind(eventCallback("onabort"), this);
		reader.onload = webinos.utils.bind(eventCallback("onload"), this);
		reader.onloadend = webinos.utils.bind(eventCallback("onloadend"), this);

		try {
			reader.readAsBuffer(exports.Blob.deserialize(params[0]));
		} catch (exception) {
			// TODO Call errorCallback with exception (converted to error?).
		}
	};

	exports.FileReader.readAsText = function (params, successCallback, errorCallback, objectRef) {
		var reader = new webinos.file.FileReader(); // TODO Deserialize remote FileReader?

		var eventCallback = function (attribute) {
			return function (event) {
				this.rpc.notify(objectRef, attribute)(exports.FileReader.serialize(reader), webinos.dom.rpc.ProgressEvent.serialize(event));
			};
		};

		reader.onloadstart = webinos.utils.bind(eventCallback("onloadstart"), this);
		reader.onprogress = webinos.utils.bind(eventCallback("onprogress"), this);
		reader.onerror = webinos.utils.bind(eventCallback("onerror"), this);
		reader.onabort = webinos.utils.bind(eventCallback("onabort"), this);
		reader.onload = webinos.utils.bind(eventCallback("onload"), this);
		reader.onloadend = webinos.utils.bind(eventCallback("onloadend"), this);

		try {
			reader.readAsText(exports.Blob.deserialize(params[0]), params[1]);
		} catch (exception) {
			// TODO Call errorCallback with exception (converted to error?).
		}
	};

	exports.FileReader.readAsDataURL = function (params, successCallback, errorCallback, objectRef) {
		// TODO ...
	};

	exports.FileWriter = {};
	exports.FileWriter.serialize = function (writer) {
		return {
			readyState: writer.readyState,
			error: writer.error ? exports.FileError.serialize(writer.error) : null,
			position: writer.position,
			length: writer.length,
			_entry: exports.Entry.serialize(writer._entry)
		};
	};

	exports.FileWriter.deserialize = function (object) {
		var writer = new webinos.file.FileWriter(exports.Entry.deserialize(object._entry));

		// writer.readyState = object.readyState;
		writer.error = object.error;
		writer.position = object.position;
		// writer.length = object.length;

		return writer;
	};

	exports.FileWriter.write = function (params, successCallback, errorCallback, objectRef) {
		var writer = exports.FileWriter.deserialize(params[0]);

		var eventCallback = function (attribute) {
			return function (event) {
				this.rpc.notify(objectRef, attribute)(exports.FileWriter.serialize(writer), webinos.dom.rpc.ProgressEvent.serialize(event));
			};
		};

		writer.onwritestart = webinos.utils.bind(eventCallback("onwritestart"), this);
		writer.onprogress = webinos.utils.bind(eventCallback("onprogress"), this);
		writer.onerror = webinos.utils.bind(eventCallback("onerror"), this);
		writer.onabort = webinos.utils.bind(eventCallback("onabort"), this);
		writer.onwrite = webinos.utils.bind(eventCallback("onwrite"), this);
		writer.onwriteend = webinos.utils.bind(eventCallback("onwriteend"), this);

		try {
			writer.write(exports.Blob.deserialize(params[1]));
		} catch (exception) {
			// TODO Call errorCallback with exception (converted to error?).
		}
	};

	exports.FileWriter.truncate = function (params, successCallback, errorCallback, objectRef) {
		var writer = exports.FileWriter.deserialize(params[0]);

		var eventCallback = function (attribute) {
			return function (event) {
				this.rpc.notify(objectRef, attribute)(exports.FileWriter.serialize(writer), webinos.dom.rpc.ProgressEvent.serialize(event));
			};
		};

		writer.onwritestart = webinos.utils.bind(eventCallback("onwritestart"), this);
		writer.onprogress = webinos.utils.bind(eventCallback("onprogress"), this);
		writer.onerror = webinos.utils.bind(eventCallback("onerror"), this);
		writer.onabort = webinos.utils.bind(eventCallback("onabort"), this);
		writer.onwrite = webinos.utils.bind(eventCallback("onwrite"), this);
		writer.onwriteend = webinos.utils.bind(eventCallback("onwriteend"), this);

		try {
			writer.truncate(params[1]);
		} catch (exception) {
			// TODO Call errorCallback with exception (converted to error?).
		}
	};

	exports.LocalFileSystem = {};
	exports.LocalFileSystem.object = new webinos.file.LocalFileSystem();
	exports.LocalFileSystem.requestFileSystem = function (params, successCallback, errorCallback) {
		exports.LocalFileSystem.object.requestFileSystem(params[0], params[1], function (filesystem) {
			successCallback(exports.FileSystem.serialize(filesystem));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.LocalFileSystem.resolveLocalFileSystemURL = function (params, successCallback, errorCallback) {
		exports.LocalFileSystem._object.resolveLocalFileSystemURL(params[0], function (entry) {
			successCallback(exports.Entry.serialize(entry));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.FileSystem = {};
	exports.FileSystem.serialize = function (filesystem) {
		return {
			name: filesystem.name,
			// root: exports.Entry.serialize(filesystem.root),
			_realPath: filesystem._realPath
		};
	};

	exports.FileSystem.deserialize = function (object) {
		return new webinos.file.FileSystem(object.name, object._realPath);
	};

	exports.Entry = {};
	exports.Entry.serialize = function (entry) {
		return {
			filesystem: exports.FileSystem.serialize(entry.filesystem),
			isFile: entry.isFile,
			isDirectory: entry.isDirectory,
			// name: entry.name,
			fullPath: entry.fullPath,
			// HACK
			_url: entry.toURL()
		};
	};

	exports.Entry.deserialize = function (object) {
		if (object.isDirectory)
			return new webinos.file.DirectoryEntry(exports.FileSystem.deserialize(object.filesystem), object.fullPath);
		else if (object.isFile)
			return new webinos.file.FileEntry(exports.FileSystem.deserialize(object.filesystem), object.fullPath);
	};

	exports.Entry.copyTo = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.copyTo(exports.Entry.deserialize(params[1]), params[2], function (newEntry) {
			successCallback(exports.Entry.serialize(newEntry));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.Entry.getMetadata = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.getMetadata(function (metadata) {
			successCallback(metadata);
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.Entry.getParent = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.getParent(function (parentEntry) {
			successCallback(exports.Entry.serialize(parentEntry));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.Entry.moveTo = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.moveTo(exports.Entry.deserialize(params[1]), params[2], function (newEntry) {
			successCallback(exports.Entry.serialize(newEntry));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.Entry.remove = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.remove(function () {
			successCallback();
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.DirectoryEntry = {};
	exports.DirectoryEntry.getDirectory = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.getDirectory(params[1], params[2], function (otherEntry) {
			successCallback(exports.Entry.serialize(otherEntry));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.DirectoryEntry.getFile = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.getFile(params[1], params[2], function (otherEntry) {
			successCallback(exports.Entry.serialize(otherEntry));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.DirectoryEntry.removeRecursively = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.removeRecursively(function () {
			successCallback();
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.DirectoryReader = {};
	exports.DirectoryReader.readEntries = function (params, successCallback, errorCallback) {
		var reader = exports.Entry.deserialize(params[0]).createReader();

		reader._start = params[1];
		reader.readEntries(function (entries) {
			successCallback({
				_start: reader._start,
				entries: entries.map(exports.Entry.serialize)
			});
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.FileEntry = {};
	exports.FileEntry.createWriter = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.createWriter(function (writer) {
			successCallback(exports.FileWriter.serialize(writer));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.FileEntry.file = function (params, successCallback, errorCallback) {
		var entry = exports.Entry.deserialize(params[0]);

		entry.file(function (file) {
			successCallback(exports.Blob.serialize(file));
		}, function (error) {
			errorCallback(exports.FileError.serialize(error));
		});
	};

	exports.FileError = {};
	exports.FileError.serialize = function (error) {
		return {
			code: error.code
		};
	};

	exports.Service = function (rpc) {
		RPCWebinosService.call(this, {
			api: "http://webinos.org/api/file",
			displayName: "File API",
			description: "File API (including Writer, and Directories and System) implementation."
		});

		this.rpc = rpc;
	};

	nUtil.inherits(exports.Service, RPCWebinosService);

	exports.Service.prototype.readAsBuffer = exports.FileReader.readAsBuffer;
	exports.Service.prototype.readAsText = exports.FileReader.readAsText;
	exports.Service.prototype.readAsDataURL = exports.FileReader.readAsDataURL;

	exports.Service.prototype.write = exports.FileWriter.write;
	exports.Service.prototype.seek = exports.FileWriter.seek;
	exports.Service.prototype.truncate = exports.FileWriter.truncate;

	exports.Service.prototype.requestFileSystem = exports.LocalFileSystem.requestFileSystem;
	exports.Service.prototype.resolveLocalFileSystemURL = exports.LocalFileSystem.resolveLocalFileSystemURL;

	exports.Service.prototype.copyTo = exports.Entry.copyTo;
	exports.Service.prototype.getMetadata = exports.Entry.getMetadata;
	exports.Service.prototype.getParent = exports.Entry.getParent;
	exports.Service.prototype.moveTo = exports.Entry.moveTo;
	exports.Service.prototype.remove = exports.Entry.remove;

	exports.Service.prototype.getDirectory = exports.DirectoryEntry.getDirectory;
	exports.Service.prototype.getFile = exports.DirectoryEntry.getFile;
	exports.Service.prototype.removeRecursively = exports.DirectoryEntry.removeRecursively;

	exports.Service.prototype.readEntries = exports.DirectoryReader.readEntries;

	exports.Service.prototype.createWriter = exports.FileEntry.createWriter;
	exports.Service.prototype.file = exports.FileEntry.file;
})(module.exports);