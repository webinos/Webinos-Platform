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

if (typeof webinos === "undefined")
	webinos = {};

if (typeof webinos.file === "undefined")
	webinos.file = {};

/**
 * TODO Perform as much operations as possible without network usage (e.g., local buffer reading).
 * TODO Reuse event callback utility functions.
 * TODO Check various "inline" TODOs.
 */
(function (exports) {
	"use strict";
	
	var hex2ArrayBuffer = function (hex) {
		var buffer = new ArrayBuffer(hex.length / 2);
		var view = new Uint8Array(buffer);

		for (var i = 0; i < view.length; i++)
			view[i] = parseInt(hex.substr(i * 2, 2), 16);

		return buffer;
	};
	
	var ArrayBuffer2hex = function (buffer) {
		var hex = "";
		var view = new Uint8Array(buffer);
		
		for (var i = 0; i < view.length; i++)
			hex += ("00" + view[i].toString(16)).slice(-2);

		return hex;
	};

	// TODO Extract (de)serialization to webinos.dom.js? (No.. KILL!)
	var dom = {}

	dom.ProgressEvent = {};
	dom.ProgressEvent.deserialize = function (object, target) {
		object.target = target
		object.currentTarget = target;

		return object;
	};

	exports.Blob = function () {
	};

	exports.Blob.serialize = function (blob) {
		var object = {
			// size: blob.size,
			type: blob.type
		};

		if (blob instanceof exports.Buffer) {
			object._type = "buffer";
			object._buffer = ArrayBuffer2hex(blob._buffer);
		} else if (blob instanceof exports.File) {
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

	exports.Blob.deserialize = function (service, object) {
		switch (object._type) {
			case "buffer":
				return new exports.Buffer(hex2ArrayBuffer(object._buffer), object._type);
			case "file":
				var blob = new exports.File(exports.Entry.deserialize(service, object._entry), object._size, object._start, object._end, object.type);

				blob.lastModifiedDate = object.lastModifiedDate;

				return blob;
		}
	};

	exports.Blob.prototype.size = 0;
	exports.Blob.prototype.type = "";

	exports.Buffer = function (buffer, contentType) {
		exports.Blob.call(this);

		var relativeContentType = "";

		if (typeof contentType === "string" /* && defined(contentType) */)
			relativeContentType = contentType;

		this.size = buffer.byteLength;
		this.type = relativeContentType;

		this._buffer = buffer;
	};

	webinos.utils.inherits(exports.Buffer, exports.Blob);

	exports.Buffer.prototype.slice = function (start, end, contentType) {
		var relativeStart = 0,
			relativeEnd = this.size;
	
		if (typeof start === "number")
			if (start < 0)
				relativeStart = Math.max(this.size + start, 0);
			else
				relativeStart = Math.min(start, this.size);
	
		if (typeof end === "number")
			if (end < 0)
				relativeEnd = Math.max(this.size + end, 0);
			else
				relativeEnd = Math.min(end, this.size);
		
		var span = Math.max(relativeEnd - relativeStart, 0);
	
		var newBuffer = new ArrayBuffer(span);
		var newView = new Uint8Array(newBuffer),
		    oldView = new Uint8Array(this._buffer);
		
		for (var i = 0; i < newView.length; i++)
			newView[i] = oldView[relativeStart + i];
		
		// Normalize contentType during blob construction...
		return new exports.Buffer(newBuffer, contentType);
	};

	exports.File = function (entry, size, start, end, contentType) {
		exports.Blob.call(this);

		var relativeStart = 0,
			relativeEnd = size,
			relativeContentType = "";

		if (typeof start === "number")
			if (start < 0)
				relativeStart = Math.max(size + start, 0);
			else
				relativeStart = Math.min(start, size);

		if (typeof end === "number")
			if (end < 0)
				relativeEnd = Math.max(size + end, 0);
			else
				relativeEnd = Math.min(end, size);

		if (typeof contentType === "string" /* && defined(contentType) */)
			relativeContentType = contentType;

		var span = Math.max(relativeEnd - relativeStart, 0);

		this.name = entry.name;
		this.size = span;
		this.type = relativeContentType;
		this.lastModifiedDate = 0 /* TODO ... */;

		this._entry = entry;
		this._size = size;
		this._start = relativeStart;
		this._end = relativeEnd;
	};

	webinos.utils.inherits(exports.File, exports.Blob);

	exports.File.prototype.slice = function (start, end, contentType) {
		var relativeStart = 0,
			relativeEnd = this.size;

		if (typeof start === "number")
			if (start < 0)
				relativeStart = Math.max(this.size + start, 0);
			else
				relativeStart = Math.min(start, this.size);

		if (typeof end === "number")
			if (end < 0)
				relativeEnd = Math.max(this.size + end, 0);
			else
				relativeEnd = Math.min(end, this.size);

		// Normalize contentType during blob construction...
		return new exports.File(this._entry, this._size, this._start + relativeStart, this._start + relativeEnd, contentType);
	};

	exports.FileReader = function (filesystem) {
		this._filesystem = filesystem;
	};

	exports.FileReader.EMPTY = 0;
	exports.FileReader.LOADING = 1;
	exports.FileReader.DONE = 2;

	exports.FileReader.prototype.readyState = exports.FileReader.EMPTY;
	exports.FileReader.prototype.result = null;
	exports.FileReader.prototype.error = undefined;

	exports.FileReader.prototype.readAsArrayBuffer = function (blob) {
		var eventListener = new RPCWebinosService({
			api: Math.floor(Math.random() * 100)
		});

		var eventCallback = function (attributeFun) {
			return function (params, successCallback, errorCallback) {
				this.readyState = params[0].readyState;
				this.result = hex2ArrayBuffer(params[0].result);
				this.error = params[0].error /* ? dom.DOMError.deserialize(params[0].error) : null */;

				attributeFun.call(this)(dom.ProgressEvent.deserialize(params[1], this));
			};
		};

		eventListener.onloadstart = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onloadstart, this);
		}), this);

		eventListener.onprogress = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onprogress, this);
		}), this);

		eventListener.onerror = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onerror, this);
		}), this);

		eventListener.onabort = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onabort, this);
		}), this);

		eventListener.onload = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onload, this);
		}), this);

		eventListener.onloadend = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onloadend, this);
		}), this);

		webinos.rpcHandler.registerCallbackObject(eventListener);
		webinos.rpcHandler.notify(this._filesystem._service, "readAsBuffer", eventListener.api)(exports.Blob.serialize(blob));
	};

	exports.FileReader.prototype.readAsText = function (blob, encoding) {
		var eventListener = new RPCWebinosService({
			api: Math.floor(Math.random() * 100)
		});

		var eventCallback = function (attributeFun) {
			return function (params, successCallback, errorCallback) {
				this.readyState = params[0].readyState;
				this.result = params[0].result;
				this.error = params[0].error /* ? dom.DOMError.deserialize(params[0].error) : null */;

				attributeFun.call(this)(dom.ProgressEvent.deserialize(params[1], this));
			};
		};

		eventListener.onloadstart = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onloadstart, this);
		}), this);

		eventListener.onprogress = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onprogress, this);
		}), this);

		eventListener.onerror = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onerror, this);
		}), this);

		eventListener.onabort = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onabort, this);
		}), this);

		eventListener.onload = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onload, this);
		}), this);

		eventListener.onloadend = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onloadend, this);
		}), this);

		webinos.rpcHandler.registerCallbackObject(eventListener);
		webinos.rpcHandler.notify(this._filesystem._service, "readAsText", eventListener.api)(exports.Blob.serialize(blob), encoding);
	};

	exports.FileReader.prototype.readAsDataURL = function (blob) {
		// TODO ...
	};

	exports.FileReader.prototype.abort = function () {
		throw new DOMException("NotSupportedError", "aborting is not supported");
	};

//	exports.BlobBuilder = function () {
//	};
//
//	exports.BlobBuilder.prototype._contents = [];
//	exports.BlobBuilder.prototype._contentsLength = 0;
//
//	exports.BlobBuilder.prototype.append = function (data, endings /* ignored */) {
//		// TODO ...
//	};
//
//	exports.BlobBuilder.prototype.getBlob = function (contentType) {
//		// TODO ...
//	};

	exports.BlobBuilder = function () {
	};
 
	// TODO Contents should be stored in an array and read on demand, i.e., when getBlob(contentType) is called.
	exports.BlobBuilder.prototype.__contents = "";
 
	// TODO Add support for Blob and ArrayBuffer(?).
	exports.BlobBuilder.prototype.append = function (data, endings /* ignored */) {
		if (typeof data === "string")
			// TODO Write as UTF-8, converting newlines as specified in endings.
			this.__contents += data;
		else
			throw new TypeError("first argument must be a string" /* ..., a Blob, or an ArrayBuffer */);
	};
 
	exports.BlobBuilder.prototype.getBlob = function (contentType) {
		var buffer = new ArrayBuffer(this.__contents.length);
		var view = new Uint8Array(buffer);

		for (var i = 0; i < this.__contents.length; i++)
			view[i] = this.__contents.charCodeAt(i);
		
		return new exports.Buffer(buffer, contentType);
	};

	exports.FileWriter = function (entry) {
		this.length = 0;

		this._entry = entry;
	};

	exports.FileWriter.INIT = 0;
	exports.FileWriter.WRITING = 1;
	exports.FileWriter.DONE = 2;

	exports.FileWriter.serialize = function (writer) {
		return {
			readyState: writer.readyState,
			error: writer.error ? exports.FileError.serialize(writer.error) : null,
			position: writer.position,
			length: writer.length,
			_entry: exports.Entry.serialize(writer._entry)
		};
	};

	exports.FileWriter.deserialize = function (service, object) {
		var writer = new exports.FileWriter(exports.Entry.deserialize(service, object._entry));

		writer.readyState = object.readyState;
		writer.error = object.error;
		writer.position = object.position;
		writer.length = object.length;

		return writer;
	};

	exports.FileWriter.prototype.readyState = exports.FileWriter.INIT;
	exports.FileWriter.prototype.error = undefined;

	exports.FileWriter.prototype.position = 0;
	exports.FileWriter.prototype.length = 0;

	exports.FileWriter.prototype.write = function (data) {
		var eventListener = new RPCWebinosService({
			api: Math.floor(Math.random() * 100)
		});

		var eventCallback = function (attributeFun) {
			return function (params, successCallback, errorCallback) {
				this.readyState = params[0].readyState;
				this.error = params[0].error ? exports.FileError.deserialize(params[0].error) : null;

				this.position = params[0].position;
				this.length = params[0].length;

				attributeFun.call(this)(dom.ProgressEvent.deserialize(params[1], this));
			};
		};

		eventListener.onwritestart = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onwritestart, this);
		}), this);

		eventListener.onprogress = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onprogress, this);
		}), this);

		eventListener.onerror = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onerror, this);
		}), this);

		eventListener.onabort = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onabort, this);
		}), this);

		eventListener.onwrite = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onwrite, this);
		}), this);

		eventListener.onwriteend = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onwriteend, this);
		}), this);

		webinos.rpcHandler.registerCallbackObject(eventListener);
		webinos.rpcHandler.notify(this._entry.filesystem._service, "write", eventListener.api)(exports.FileWriter.serialize(this), exports.Blob.serialize(data));
	};

	exports.FileWriter.prototype.seek = function (offset) {
		if (this.readyState == exports.FileWriter.WRITING)
			throw new exports.FileException(exports.FileException.INVALID_STATE_ERR);

		if (offset >= 0)
			this.position = Math.min(offset, this.length);
		else
			this.position = Math.max(this.length + offset, 0);
	};

	exports.FileWriter.prototype.truncate = function (size) {
		var eventListener = new RPCWebinosService({
			api: Math.floor(Math.random() * 100)
		});

		var eventCallback = function (attributeFun) {
			return function (params, successCallback, errorCallback) {
				this.readyState = params[0].readyState;
				this.error = params[0].error ? exports.FileError.deserialize(params[0].error) : null;

				this.position = params[0].position;
				this.length = params[0].length;

				attributeFun.call(this)(dom.ProgressEvent.deserialize(params[1], this));
			};
		};

		eventListener.onwritestart = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onwritestart, this);
		}), this);

		eventListener.onprogress = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onprogress, this);
		}), this);

		eventListener.onerror = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onerror, this);
		}), this);

		eventListener.onabort = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onabort, this);
		}), this);

		eventListener.onwrite = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onwrite, this);
		}), this);

		eventListener.onwriteend = webinos.utils.bind(eventCallback(function () {
			return webinos.utils.callback(this.onwriteend, this);
		}), this);

		webinos.rpcHandler.registerCallbackObject(eventListener);
		webinos.rpcHandler.notify(this._entry.filesystem._service, "truncate", eventListener.api)(exports.FileWriter.serialize(this), size);
	};

	exports.FileWriter.prototype.abort = function () {
		throw new exports.FileException(exports.FileException.SECURITY_ERR);
	};

	exports.LocalFileSystem = function (object) {
		WebinosService.call(this, object);
	};

	exports.LocalFileSystem.TEMPORARY = 0;
	exports.LocalFileSystem.PERSISTENT = 1;

	webinos.utils.inherits(exports.LocalFileSystem, WebinosService);

	exports.LocalFileSystem.prototype.requestFileSystem = function (type, size, successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this, "requestFileSystem", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.FileSystem.deserialize(this, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(type, size);
	};

	exports.LocalFileSystem.prototype.resolveLocalFileSystemURL = function (url, successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this, "resolveLocalFileSystemURL", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.Entry.deserialize(this, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(url);
	};

	exports.LocalFileSystem.prototype.getAddress = function (successCallback, errorCallback) {
    webinos.utils.bind(webinos.rpcHandler.request(this, "getAddress", null, function (result) {
      webinos.utils.callback(successCallback, this)(result);
    }, function (error) {
      webinos.utils.callback(errorCallback, this)(error);
    }), this)();
  };

	exports.FileSystem = function (service, name, realPath) {
		this.name = name;
		this.root = new exports.DirectoryEntry(this, "/");

		this._service = service;
		this._realPath = realPath;
	};

	exports.FileSystem.serialize = function (filesystem) {
		return {
			name: filesystem.name,
			// root: exports.Entry.serialize(filesystem.root),
			_realPath: filesystem._realPath
		};
	};

	exports.FileSystem.deserialize = function (service, object) {
		return new exports.FileSystem(service, object.name, object._realPath);
	};

	exports.Entry = function (filesystem, fullPath) {
		this.filesystem = filesystem;

		this.name = webinos.path.basename(fullPath);
		this.fullPath = fullPath;
	};

	exports.Entry.serialize = function (entry) {
		return {
			filesystem: exports.FileSystem.serialize(entry.filesystem),
			isFile: entry.isFile,
			isDirectory: entry.isDirectory,
			// name: entry.name,
			fullPath: entry.fullPath
		};
	};

	exports.Entry.deserialize = function (service, object) {
		var entry;

		if (object.isDirectory)
			entry = new exports.DirectoryEntry(exports.FileSystem.deserialize(service, object.filesystem), object.fullPath);
		else if (object.isFile)
			entry = new exports.FileEntry(exports.FileSystem.deserialize(service, object.filesystem), object.fullPath);

		// HACK
		entry._url = object._url;

		return entry;
	};

	exports.Entry.prototype.isFile = false;
	exports.Entry.prototype.isDirectory = false;

	exports.Entry.prototype.resolve = function () {
		var argsArray = Array.prototype.slice.call(arguments);

		argsArray.unshift(this.fullPath);

		return webinos.path.resolve.apply(path, argsArray);
	};

	exports.Entry.prototype.relative = function (to) {
		return webinos.path.relative(this.fullPath, this.resolve(to));
	};

	exports.Entry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "copyTo", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.Entry.deserialize(this.filesystem._service, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this), exports.Entry.serialize(parent), newName);
	};

	exports.Entry.prototype.getMetadata = function (successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "getMetadata", null, function (result) {
			webinos.utils.callback(successCallback, this)(result);
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this));
	};

	exports.Entry.prototype.getParent = function (successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "getParent", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.Entry.deserialize(this.filesystem._service, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this));
	};

	exports.Entry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "moveTo", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.Entry.deserialize(this.filesystem._service, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this), exports.Entry.serialize(parent), newName);
	};

	exports.Entry.prototype.remove = function (successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "remove", null, function (result) {
			webinos.utils.callback(successCallback, this)();
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this));
	};

	exports.Entry.prototype.toURL = function () {
		// HACK
		return this._url;
	};

	exports.DirectoryEntry = function (filesystem, fullPath) {
		exports.Entry.call(this, filesystem, fullPath);
	};

	webinos.utils.inherits(exports.DirectoryEntry, exports.Entry);

	exports.DirectoryEntry.prototype.isDirectory = true;

	exports.DirectoryEntry.prototype.createReader = function () {
		return new exports.DirectoryReader(this);
	};

	exports.DirectoryEntry.prototype.isPrefixOf = function (fullPath) {
		return webinos.path.isPrefixOf(this.fullPath, fullPath);
	};

	exports.DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "getDirectory", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.Entry.deserialize(this.filesystem._service, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this), path, options);
	};

	exports.DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "getFile", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.Entry.deserialize(this.filesystem._service, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this), path, options);
	};

	exports.DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "removeRecursively", null, function (result) {
			webinos.utils.callback(successCallback, this)();
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this));
	};

	exports.DirectoryReader = function (entry) {
		this._entry = entry;
	};

	exports.DirectoryReader.prototype._start = 0;

	exports.DirectoryReader.prototype.readEntries = function (successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this._entry.filesystem._service, "readEntries", null, function (result) {
			this._start = result._start;

			webinos.utils.callback(successCallback, this)(result.entries.map(function (object) {
				return exports.Entry.deserialize(this._entry.filesystem._service, object);
			}, this));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this._entry), this._start);
	};

	exports.FileEntry = function (filesystem, fullPath) {
		exports.Entry.call(this, filesystem, fullPath);
	};

	webinos.utils.inherits(exports.FileEntry, exports.Entry);

	exports.FileEntry.prototype.isFile = true;

	exports.FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "createWriter", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.FileWriter.deserialize(this.filesystem._service, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this));
	};

	exports.FileEntry.prototype.file = function (successCallback, errorCallback) {
		webinos.utils.bind(webinos.rpcHandler.request(this.filesystem._service, "file", null, function (result) {
			webinos.utils.callback(successCallback, this)(exports.Blob.deserialize(this.filesystem._service, result));
		}, function (error) {
			webinos.utils.callback(errorCallback, this)(exports.FileError.deserialize(error));
		}), this)(exports.Entry.serialize(this));
	};

	exports.FileError = function (code) {
		this.code = code;
	};

	exports.FileError.deserialize = function (object) {
		return new exports.FileError(object.code);
	};

	exports.FileError.NOT_FOUND_ERR = 1;
	exports.FileError.SECURITY_ERR = 2;
	exports.FileError.ABORT_ERR = 3;
	exports.FileError.NOT_READABLE_ERR = 4;
	exports.FileError.ENCODING_ERR = 5;
	exports.FileError.NO_MODIFICATION_ALLOWED_ERR = 6;
	exports.FileError.INVALID_STATE_ERR = 7;
	exports.FileError.SYNTAX_ERR = 8;
	exports.FileError.INVALID_MODIFICATION_ERR = 9;
	exports.FileError.QUOTA_EXCEEDED_ERR = 10;
	exports.FileError.TYPE_MISMATCH_ERR = 11;
	exports.FileError.PATH_EXISTS_ERR = 12;
})(webinos.file);
