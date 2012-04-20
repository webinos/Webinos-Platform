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
 * File API (including Writer, and Directories and System) implementation.
 * 
 * Latest published versions:
 * - File API -- {@link http://www.w3.org/TR/FileAPI/}
 * - File API: Writer -- {@link http://www.w3.org/TR/file-writer-api/}
 * - File API: Directories and System -- {@link http://www.w3.org/TR/file-system-api/}
 * 
 * NOTE: This implementation is partly based on Editor's Drafts and may not incorporate recent additions/changes.
 *       Furthermore, outdated error/exception objects are mixed with DOM-fake errors/exceptions. Both issues will
 *       be addressed soon.
 * 
 * @author Felix-Johannes Jendrusch <felix-johannes.jendrusch@fokus.fraunhofer.de>
 * 
 * TODO Use error/exception types/codes according to specification (check everywhere!).
 * TODO Split "too big" functions up.
 * TODO Check various "inline" TODOs.
 */
(function (exports) {
	"use strict";

	var nFs = require("fs"),
		nPath = require("path"),
		nStream = require("stream"),
		nUtil = require("util");

	// <HACK>
	// var nConnect = require("connect");

	// nConnect(
	// 	nConnect.static(nPath.join(process.cwd(), "default"))
	// ).listen(2409);
	// </HACK>

	//var webinos = require("webinos")(__dirname);
	var dom = require("webinos.dom"),
		path = require("webinos.path"),
		//utils = webinos.global.require(webinos.global.rpc.location, "lib/utils.js");
		utils = require('webinos').utils;
	var mUtils = {};

	/**
	 * try-wraps a function and maps exceptions to FileException (default: FileException.SECURITY_ERROR).
	 * 
	 * @param {Function} fun The function.
	 * @param {Object} map The exception map.
	 * @returns {Function} The wrapped function.
	 */
	mUtils.wrap = function (fun, map) {
		return function () {
			try {
				return fun.apply(this, arguments);
			} catch (exception) {
				var code = exports.FileException.SECURITY_ERR;

				if (typeof map === "object" && typeof map[exception.code] === "number")
					code = map[exception.code];

				throw new exports.FileException(code);
			}
		};
	};

	/**
	 * process.nextTick/try-wraps a function and converts exceptions to FileError (default: FileError.SECURITY_ERROR).
	 * 
	 * @param {Function} fun The function.
	 * @param {Function} [successCallback] The optional success callback.
	 * @param {Function} [errorCallback] The optional error callback.
	 * @returns {Function} The wrapped function.
	 */
	mUtils.schedule = function (fun, successCallback, errorCallback) {
		return function () {
			var argsArray = arguments;

			process.nextTick(utils.bind(function () {
				var result;

				try {
					result = fun.apply(this, argsArray);
				} catch (exception) {
					var code = exports.FileError.SECURITY_ERR;

					if (exception instanceof exports.FileException)
						code = exception.code;

					utils.callback(errorCallback, this)(new exports.FileError(code));

					return;
				}

				utils.callback(successCallback, this)(result);
			}, this));
		};
	};

	/**
	 * Converts an asynchronous object into its synchronous equivalent.
	 * 
	 * @param {Object} The asynchronous object.
	 * @returns {Object} The synchronous equivalent.
	 * @see mUtils.async
	 */
	mUtils.sync = function (obj) {
		if (obj instanceof exports.LocalFileSystem)
			return new exports.LocalFileSystemSync();
		else if (obj instanceof exports.FileSystem)
			return new exports.FileSystemSync(obj.name, obj._realPath);
		else if (obj instanceof exports.DirectoryEntry)
			return new exports.DirectoryEntrySync(mUtils.sync(obj.filesystem), obj.fullPath);
		else if (obj instanceof exports.DirectoryReader)
			return  new exports.DirectoryReaderSync(mUtils.sync(obj._entry), obj._start);
		else if (obj instanceof exports.FileEntry)
			return new exports.FileEntrySync(mUtils.sync(obj.filesystem), obj.fullPath);
		else
			return obj;
	};

	/**
	 * Converts a synchronous object into its asynchronous equivalent.
	 * 
	 * @param {Object} The synchronous object.
	 * @returns {Object} The asynchronous equivalent.
	 * @see mUtils.sync
	 */
	mUtils.async = function (obj) {
		if (obj instanceof exports.LocalFileSystemSync)
			return new exports.LocalFileSystem();
		else if (obj instanceof exports.FileSystemSync)
			return new exports.FileSystem(obj.name, obj._realPath);
		else if (obj instanceof exports.DirectoryEntrySync)
			return new exports.DirectoryEntry(mUtils.async(obj.filesystem), obj.fullPath);
		else if (obj instanceof exports.DirectoryReaderSync)
			return new exports.DirectoryReader(mUtils.async(obj._entry), obj._start);
		else if (obj instanceof exports.FileEntrySync)
			return new exports.FileEntry(mUtils.async(obj.filesystem), obj.fullPath);
		else
			return obj;
	};

	/**
	 * This interface represents immutable raw data.
	 * 
	 * @constructor
	 */
	exports.Blob = function () {
	};

	/** Returns the size of the Blob object in bytes. */
	exports.Blob.prototype.size = 0;
	
	/** The ASCII-encoded string in lower case representing the media type of the Blob, expressed as an RFC2046 MIME
	    type. */
	exports.Blob.prototype.type = "";

	/**
	 * This interface represents immutable raw data in memory. It inherits from Blob.
	 * 
	 * Constructs a new Blob object from the buffer parameter and with a type that is
	 * the value of the optional contentType parameter.
	 * 
	 * @constructor
	 * @param {Buffer} buffer The buffer.
	 * @param {Sring} [contentType=""] The optional media type.
	 * @see exports.Blob
	 */
	exports.Buffer = function (buffer, contentType) {
		exports.Blob.call(this);

		var relativeContentType = "";

		if (typeof contentType === "string" /* && defined(contentType) */)
			relativeContentType = contentType;

		this.size = buffer.length;
		this.type = relativeContentType;

		this._buffer = buffer;
	}

	nUtil.inherits(exports.Buffer, exports.Blob);

	/**
	 * Returns a new Blob object with bytes ranging from the optional start parameter upto but not including the
	 * optional end parameter, and with a type attribute that is the value of the optional contentType parameter
	 * 
	 * @param {long} [start=0] The optional start point.
	 * @param {long} [end=this.size] The optional end point.
	 * @param {String} [contentType=""] The optional media type.
	 * @return {exports.Buffer} The new Blob object.
	 */
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

		// Normalize contentType during blob construction...
		return new exports.Buffer(this._buffer.slice(relativeStart, relativeEnd), contentType);
	};

	/**
	 * This interface describes a single file and exposes its name. It inherits from Blob.
	 * 
	 * Constructs a new Blob object from the entry parameter with bytes ranging from the optional start parameter upto
	 * but not including the optional end paramter, and with a type that is the value of the optional contentType
	 * parameter.
	 * 
	 * @constructor
	 * @param {exports.FileEntry} The entry.
	 * @param {long} [start=0] The optional start point.
	 * @param {long} [end=?] The optional end point.
	 * @param {String} [contentType=""] The optional media type.
	 * @see exports.Blob
	 */
	exports.File = function (entry, start, end, contentType) {
		exports.Blob.call(this);

		// TODO Add exception map.
		var stats = mUtils.wrap(nFs.statSync)(entry.realize());

		var relativeStart = 0,
			relativeEnd = stats.size,
			relativeContentType = "";

		if (typeof start === "number")
			if (start < 0)
				relativeStart = Math.max(stats.size + start, 0);
			else
				relativeStart = Math.min(start, stats.size);

		if (typeof end === "number")
			if (end < 0)
				relativeEnd = Math.max(stats.size + end, 0);
			else
				relativeEnd = Math.min(end, stats.size);

		if (typeof contentType === "string" /* && defined(contentType) */)
			relativeContentType = contentType;

		var span = Math.max(relativeEnd - relativeStart, 0);

		/** The name of the file. */
		this.name = entry.name;
		
		/** The last modified date of the file. */
		this.lastModifiedDate = stats.mtime;
		
		this.size = span;
		this.type = relativeContentType;

		this._entry = entry;
		this._size = stats.size;
		this._start = relativeStart;
		this._end = relativeEnd;
	};

	nUtil.inherits(exports.File, exports.Blob);

	/**
	 * Returns a new Blob object with bytes ranging from the optional start parameter upto but not including the
	 * optional end parameter, and with a type attribute that is the value of the optional contentType parameter
	 * 
	 * @param {long} [start=0] The optional start point.
	 * @param {long} [end=this.size] The optional end point.
	 * @param {String} [contentType=""] The optional media type.
	 * @return {exports.File} The new Blob object.
	 */
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
		return new exports.File(this._entry, this._start + relativeStart, this._start + relativeEnd, contentType);
	};

	/**
	 * This interface provides methods to synchronously read File or Blob objects into memory.
	 * 
	 * @constructor
	 */
	exports.FileReaderSync = function () {
	};

	/**
	 * Provides access to the data of the given Blob object.
	 * 
	 * @param {exports.Blob} blob The Blob object.
	 * @param {"buffer"|"text"|"dataURL"} format The format.
	 * @param {String} encoding The encoding (ignored).
	 * @returns Buffer|String
	 */
	exports.FileReaderSync.prototype._read = function (blob, format, encoding) {
		var buffer;

		if (blob instanceof exports.File)
			// TODO If the file has been modified on disk since the File object reference is created, throw a
			// NotReadableError.
			buffer = mUtils.wrap(nFs.readFileSync)(blob._entry.realize()).slice(blob._start, blob._end);
		else if (blob instanceof exports.Buffer)
			buffer = blob._buffer;
		else
			throw new TypeError("first argument must be a (recognized) blob");

		switch (format) {
			case "buffer":
				return buffer;
			case "text":
				var relativeEncoding /* charset */ = "utf8";

				if (typeof encoding === "string" /* && defined(encoding) */)
					relativeEncoding = encoding /* ... nodify(encoding) */;

				// TODO If the blob's type attribute is present, and its charset parameter is the name or alias of a
				// character set used on the Internet, let relativeEncoding be set to its charset parameter. Otherwise,
				// check the first bytes of blob (see specification for more details).

				return buffer.toString(relativeEncoding);
			case "dataURL":
				// TODO If the blob's type attribute is present and characterizes text (i.e., it equals "text/*"),
				// and, if set, its charset parameter equals "UTF-8", then (1) let the media type's charset parameter
				// be "UTF-8", and (2) encode the buffers's contents with UTF-8 instead of Base64.

				return "data:" + blob.type + ";base64," + buffer.toString("base64");
			default:
				throw new Error("second argument must be 'buffer', 'text', or 'dataURL'");
		}
	};

	/** @see exports.FileReaderSync#_read */
	exports.FileReaderSync.prototype.readAsBuffer = function (blob) {
		return this._read(blob, "buffer");
	};

	/** @see exports.FileReaderSync#_read */
	exports.FileReaderSync.prototype.readAsText = function (blob, encoding) {
		return this._read(blob, "text", encoding);
	};

	/** @see exports.FileReaderSync#_read */
	exports.FileReaderSync.prototype.readAsDataURL = function (blob) {
		return this._read(blob, "dataURL");
	};

	/**
	 * This interface provides methods to read File objects or Blob objects into memory, and to access the data from
	 * those Files or Blobs.
	 * 
	 * @constructor
	 */
	exports.FileReader = function () {
		dom.EventTarget.call(this);

		this.addEventListener("loadstart", function (event) {
			utils.callback(this.onloadstart, this)(event);
		});

		this.addEventListener("progress", function (event) {
			utils.callback(this.onprogress, this)(event);
		});

		this.addEventListener("error", function (event) {
			utils.callback(this.onerror, this)(event);
		});

		this.addEventListener("abort", function (event) {
			utils.callback(this.onabort, this)(event);
		});

		this.addEventListener("load", function (event) {
			utils.callback(this.onload, this)(event);
		});

		this.addEventListener("loadend", function (event) {
			utils.callback(this.onloadend, this)(event);
		});
	};

	/** The FileReader object has been constructed, and there are no pending reads. */
	exports.FileReader.EMPTY = 0;
	
	/** A File or Blob is being read. */
	exports.FileReader.LOADING = 1;
	
	/** The entire File or Blob has been read into memory, OR a file error occurred during read, OR the read was
		aborted using abort(). */
	exports.FileReader.DONE = 2;

	exports.FileReader.BUFFER_SIZE = 1024;

	nUtil.inherits(exports.FileReader, dom.EventTarget);

	exports.FileReader.prototype.readyState = exports.FileReader.EMPTY;
	exports.FileReader.prototype.result = null;
	exports.FileReader.prototype.error = undefined;

	/**
	 * Provides access to the data of the given Blob object.
	 * 
	 * @param {exports.Blob} blob The Blob object.
	 * @param {"buffer"|"text"|"dataURL"} format The format.
	 * @param {String} encoding The encoding (ignored).
	 */
	exports.FileReader.prototype._read = function (blob, format, encoding) {
		if (this.readyState == exports.FileReader.LOADING)
			throw new dom.DOMException("InvalidStateError", "read in progress");

		var isFile = blob instanceof exports.File,
			isBuffer = blob instanceof exports.Buffer;

		if (!isFile && !isBuffer)
			throw new TypeError("first argument must be a (recognized) blob");

		var toBuffer = false,
			toText = false,
			toDataURL = false;

		var relativeEncoding /* charset */,
			relativeMediaType;

		switch (format) {
			case "buffer":
				toBuffer = true;

				this.result = new Buffer(0);
				break;
			case "text":
				toText = true;

				relativeEncoding = "utf8";

				if (typeof encoding === "string" /* && defined(encoding) */)
					relativeEncoding = encoding /* ... nodify(encoding) */;

				// TODO If the blob's type attribute is present, and its charset parameter is the name or alias of a
				// character set used on the Internet, let relativeEncoding be set to its charset parameter. Otherwise,
				// check the first bytes of blob (see specification for more details).

				this.result = "";
				break;
			case "dataURL":
				toDataURL = true;

				relativeEncoding = "base64";
				relativeMediaType = blob.type;

				// TODO If the blob's type attribute is present and characterizes text (i.e., it equals "text/?"),
				// and, if set, its charset parameter equals "UTF-8", then (1) let the media type's charset parameter
				// be "UTF-8", and (2) encode the buffers's contents with UTF-8 instead of Base64.

				this.result = null;
				break;
			default:
				throw new Error("second argument must be 'buffer', 'text', or 'dataURL'");
		}

		this.readyState = exports.FileReader.LOADING;

		var loaded = 0,
			total = blob.size;

		var createEventInitDict = utils.bind(function (withProgress) {
			var eventInitDict = {
				bubbles: false,
				cancelable: false
			};

			if (withProgress) {
				eventInitDict.lengthComputable = true;
				eventInitDict.loaded = loaded;
				eventInitDict.total = total;
			}

			return eventInitDict;
		}, this);

		this.dispatchEvent(new dom.ProgressEvent("loadstart", createEventInitDict(true)));

		utils.bind(mUtils.schedule(function () {
			if (toBuffer || toDataURL)
				var targetBuffer = new Buffer(blob.size),
					targetStart = 0;

			var stream;

			if (isFile)
				stream = nFs.createReadStream(blob._entry.realize(), {
					bufferSize: exports.FileReader.BUFFER_SIZE,
					start: blob._start,
					end: Math.max(blob._end - 1, 0)
				});
			else if (isBuffer)
				stream = new nStream.Stream();

			stream.on("data", utils.bind(function (data) {
				if (toBuffer || toDataURL) {
					data.copy(targetBuffer, targetStart);

					targetStart += data.length;
				}

				if (toBuffer)
					this.result = targetBuffer.slice(0, targetStart);
				else if (toText)
					this.result += data.toString(relativeEncoding);

				loaded += data.length;

				if (toBuffer || toText)
					this.dispatchEvent(new dom.ProgressEvent("progress", createEventInitDict(true)));
			}, this));

			stream.on("error", utils.bind(function (error) {
				this.readyState = exports.FileReader.DONE;
				this.result = null;

				this.error = new dom.DOMError("SecurityError");

				var eventInitDict = createEventInitDict(false);

				this.dispatchEvent(new dom.ProgressEvent("error", eventInitDict));
				this.dispatchEvent(new dom.ProgressEvent("loadend", eventInitDict));
			}, this));

			stream.on("end", utils.bind(function () {
				var eventInitDict = createEventInitDict(true);

				if (((toBuffer || toText) && loaded == 0) || toDataURL)
					this.dispatchEvent(new dom.ProgressEvent("progress", eventInitDict));

				if (toDataURL) {
					this.result = "data:" + relativeMediaType;

					if (relativeEncoding == "base64")
						this.result += ";base64";

					this.result += "," + targetBuffer.toString(relativeEncoding);
				}

				this.readyState = exports.FileReader.DONE;

				this.dispatchEvent(new dom.ProgressEvent("load", eventInitDict));
				this.dispatchEvent(new dom.ProgressEvent("loadend", eventInitDict));
			}, this));

			if (isBuffer) {
				stream.emit("data", blob._buffer);
				stream.emit("end");
			}
		}), this)();
	};

	/** @see exports.FileReader#_read */
	exports.FileReader.prototype.readAsBuffer = function (blob) {
		return this._read(blob, "buffer");
	};

	/** @see exports.FileReader#_read */
	exports.FileReader.prototype.readAsText = function (blob, encoding) {
		return this._read(blob, "text", encoding);
	};

	/** @see exports.FileReader#_read */
	exports.FileReader.prototype.readAsDataURL = function (blob) {
		return this._read(blob, "dataURL");
	};

	// Aborting is currently not supported.
	exports.FileReader.prototype.abort = function () {
		throw new dom.DOMException("NotSupportedError", "aborting is not supported");
	};

	/**
	 * The BlobBuilder is used to construct Blobs.
	 * 
	 * @constructor
	 */
	exports.BlobBuilder = function () {
	};

	exports.BlobBuilder.prototype._contents = [];
	exports.BlobBuilder.prototype._contentsLength = 0;

	/**
	 * Appends the supplied data to the current contents of the BlobBuilder, in case of text, writing it as UTF-8,
	 * converting newlines as specified in endings.
	 * 
	 * @param {String|Buffer} data The data to append.
	 * @param {"transparent"|"native"} endings This parameter specifies how strings containing \n are to be written
	 * 	out (currently ignored).
	 */
	exports.BlobBuilder.prototype.append = function (data, endings /* ignored */) {
		var buffer;

		if (typeof data === "string")
			buffer = new Buffer(data, "utf8");
		else if (data instanceof exports.Blob) {
			// TODO Lazy read appended blobs on 'composite' blob construction (i.e., getBlob)?
			var reader = new exports.FileReaderSync();

			buffer = reader.readAsBuffer(data);
		} else if (Buffer.isBuffer(data))
			buffer = data;
		else
			throw new TypeError("first argument must be a string, blob, or buffer");

		this._contents.push(buffer);
		this._contentsLength += buffer.length;
	};

	/**
	 * Returns the current contents of the BlobBuilder as a Blob.
	 * 
	 * @param {String} contentType Sets the content type of the blob produced.
	 */
	exports.BlobBuilder.prototype.getBlob = function (contentType) {
		var targetBuffer = new Buffer(this._contentsLength),
			targetStart = 0;

		this._contents.forEach(function (buffer) {
			buffer.copy(targetBuffer, targetStart);

			targetStart += buffer.length;
		});

		this._contents = [];
		this._contentsLength = 0;

		return new exports.Buffer(targetBuffer, contentType);
	};

	/**
	 * This interface lets users write, truncate, and append to files using simple synchronous calls.
	 * 
	 * @constructor
	 * @param {exports.FileEntry} entry The FileEntry object.
	 */
	exports.FileWriterSync = function (entry) {
		var stats = mUtils.wrap(nFs.statSync)(entry.realize());

		this.length = stats.size;

		this._entry = entry;
	};

	/** The byte offset at which the next write to the file will occur. */
	exports.FileWriterSync.prototype.position = 0;
	
	/** The length of the file. */
	exports.FileWriterSync.prototype.length = 0;

	/**
	 * Write the supplied data to the file at position.
	 * 
	 * @param {exports.Blob} data The blob to write.
	 */
	exports.FileWriterSync.prototype.write = function (data) {
		var reader = new exports.FileReaderSync();
		var buffer = reader.readAsBuffer(data);

		var fd = mUtils.wrap(nFs.openSync)(this._entry.realize(), "a");

		var written = mUtils.wrap(nFs.writeSync)(fd, buffer, 0, buffer.length, this.position);

		mUtils.wrap(nFs.closeSync)(fd);

		this.position += written;
		this.length = Math.max(this.position, this.length);
	};

	/**
	 * Seek sets the file position at which the next write will occur.
	 * 
	 * @param {long} offset An absolute byte offset into the file.
	 */
	exports.FileWriterSync.prototype.seek = function (offset) {
		if (offset >= 0)
			this.position = Math.min(offset, this.length);
		else
			this.position = Math.max(this.length + offset, 0);
	};

	/**
	 * Changes the length of the file to that specified.
	 * 
	 * @param {unsigned long} size The size to which the length of the file is to be adjusted, measured in bytes.
	 */
	exports.FileWriterSync.prototype.truncate = function (size) {
		var fd = mUtils.wrap(nFs.openSync)(this._entry.realize(), "r+");

		mUtils.wrap(nFs.truncateSync)(fd, size);
		mUtils.wrap(nFs.closeSync)(fd);

		this.position = Math.min(size, this.position);
		this.length = size;
	};

	/**
	 * This interface provides methods to monitor the asynchronous writing of blobs to disk
	 * 
	 * @constructor
	 * @param {exports.FileEntry} entry The FileEntry object.
	 */
	exports.FileWriter = function (entry) {
		dom.EventTarget.call(this);

		var stats = mUtils.wrap(nFs.statSync)(entry.realize());

		this.length = stats.size;

		this._entry = entry;

		this.addEventListener("writestart", function (event) {
			utils.callback(this.onwritestart, this)(event);
		});

		this.addEventListener("progress", function (event) {
			utils.callback(this.onprogress, this)(event);
		});

		this.addEventListener("error", function (event) {
			utils.callback(this.onerror, this)(event);
		});

		this.addEventListener("abort", function (event) {
			utils.callback(this.onabort, this)(event);
		});

		this.addEventListener("write", function (event) {
			utils.callback(this.onwrite, this)(event);
		});

		this.addEventListener("writeend", function (event) {
			utils.callback(this.onwriteend, this)(event);
		});
	};

	exports.FileWriter.INIT = 0;
	exports.FileWriter.WRITING = 1;
	exports.FileWriter.DONE = 2;

	exports.FileWriter.BUFFER_SIZE = 1024;

	nUtil.inherits(exports.FileWriter, dom.EventTarget);

	/** The FileWriter object's current state.  */
	exports.FileWriter.prototype.readyState = exports.FileWriter.INIT;
	
	/** The last error that occurred. */
	exports.FileWriter.prototype.error = undefined;

	/** The byte offset at which the next write to the file will occur. */
	exports.FileWriter.prototype.position = 0;
	
	/** The length of the file. */
	exports.FileWriter.prototype.length = 0;

	/**
	 * Write the supplied data to the file at position.
	 * 
	 * @param {exports.Blob} data The blob to write.
	 */
	exports.FileWriter.prototype.write = function (data) {
		if (this.readyState == exports.FileWriter.WRITING)
			throw new exports.FileException(exports.FileException.INVALID_STATE_ERR);

		var isFile = data instanceof exports.File,
			isBuffer = data instanceof exports.Buffer;

		if (!isFile && !isBuffer)
			throw new TypeError("first argument must be a (recognized) blob");

		this.readyState = exports.FileWriter.WRITING;

		var eventInitDict = {
			bubbles: false,
			cancelable: false,
			lengthComputable: false,
			loaded: 0,
			total: 0
		};

		this.dispatchEvent(new dom.ProgressEvent("writestart", eventInitDict));

		utils.bind(mUtils.schedule(function () {
			// TODO Reuse FileReader stream creation?!
			var source,
				sourcedEnded = false;

			if (isFile)
				source = nFs.createReadStream(data._entry.realize(), {
					bufferSize: exports.FileWriter.BUFFER_SIZE,
					start: data._start,
					end: Math.max(data._end - 1, 0)
				});
			else if (isBuffer)
				source = new nStream.Stream();

			var destination = nFs.createWriteStream(this._entry.realize(), {
				flags: "r+",
				start: this.position
			});

			source.on("data", utils.bind(function (data) {
				if (destination.write(data) === false && isFile)
					source.pause();

				this.position += data.length;
				this.length = Math.max(this.position, this.length);

				this.dispatchEvent(new dom.ProgressEvent("progress", eventInitDict));
			}, this));

			source.on("end", utils.bind(function () {
				if (sourcedEnded)
					return;

				sourcedEnded = true;

				destination.end();
			}, this));

			source.on("close", utils.bind(function () {
				if (sourcedEnded)
					return;

				sourcedEnded = true;

				destination.destroy();
			}, this));

			destination.on("drain", utils.bind(function () {
				if (isFile)
					source.resume();
			}, this));

			if (isBuffer) {
				source.emit("data", data._buffer);
				source.emit("end");
			}
		}, function () {
			this.readyState = exports.FileWriter.DONE;

			this.dispatchEvent(new dom.ProgressEvent("write", eventInitDict));
			this.dispatchEvent(new dom.ProgressEvent("writeend", eventInitDict));
		}, function (error) {
			this.error = new exports.FileError(exports.FileError.SECURITY_ERR);

			this.readyState = exports.FileWriter.DONE;

			this.dispatchEvent(new dom.ProgressEvent("error", eventInitDict));
			this.dispatchEvent(new dom.ProgressEvent("writeend", eventInitDict));
		}), this)();
	};

	/**
	 * Seek sets the file position at which the next write will occur.
	 * 
	 * @param {long} offset An absolute byte offset into the file.
	 */
	exports.FileWriter.prototype.seek = function (offset) {
		if (this.readyState == exports.FileWriter.WRITING)
			throw new exports.FileException(exports.FileException.INVALID_STATE_ERR);

		if (offset >= 0)
			this.position = Math.min(offset, this.length);
		else
			this.position = Math.max(this.length + offset, 0);
	};

	/**
	 * Changes the length of the file to that specified.
	 * 
	 * @param {unsigned long} size The size to which the length of the file is to be adjusted, measured in bytes.
	 */
	exports.FileWriter.prototype.truncate = function (size) {
		if (this.readyState == exports.FileWriter.WRITING)
			throw new exports.FileException(exports.FileException.INVALID_STATE_ERR);

		this.readyState = exports.FileWriter.WRITING;

		var eventInitDict = {
			bubbles: false,
			cancelable: false,
			lengthComputable: false,
			loaded: 0,
			total: 0
		};

		this.dispatchEvent(new dom.ProgressEvent("writestart", eventInitDict));

		utils.bind(mUtils.schedule(function () {
			var fd = mUtils.wrap(nFs.openSync)(this._entry.realize(), "r+");

			mUtils.wrap(nFs.truncateSync)(fd, size);
			mUtils.wrap(nFs.closeSync)(fd);

			this.position = Math.min(size, this.position);
			this.length = size;
		}, function () {
			this.readyState = exports.FileWriter.DONE;

			this.dispatchEvent(new dom.ProgressEvent("write", eventInitDict));
			this.dispatchEvent(new dom.ProgressEvent("writeend", eventInitDict));
		}, function (error) {
			this.error = new exports.FileError(exports.FileError.SECURITY_ERR);

			this.readyState = exports.FileWriter.DONE;

			this.dispatchEvent(new dom.ProgressEvent("error", eventInitDict));
			this.dispatchEvent(new dom.ProgressEvent("writeend", eventInitDict));
		}), this)();
	};

	// Aborting is currently not supported.
	exports.FileWriter.prototype.abort = function () {
		throw new exports.FileException(exports.FileException.SECURITY_ERR);
	};

	exports.LocalFileSystemSync = function () {
	};

	/** Used for storage with no guarantee of persistence. */
	exports.LocalFileSystemSync.TEMPORARY = 0;
	
	/** Used for storage that should not be removed by the user agent without application or user permission. */
	exports.LocalFileSystemSync.PERSISTENT = 1;

	/**
	 * Requests a filesystem in which to store application data.
	 * 
	 * @param {unsigned short} type Whether the filesystem requested should be persistent, as defined above.
	 * @param {unsigned long} size This is an indicator of how much storage space, in bytes, the application expects to
	 *                             need.
	 * @returns {exports.FileSystemSync} The requested filesystem.
	 * 
	 * TODO Choose filesystem according to specification.
	 */
	exports.LocalFileSystemSync.prototype.requestFileSystemSync = function (type, size) {
		return new exports.FileSystemSync("default", nPath.join(process.cwd(), "default"));
	};

	// Resolving a local URL is currently not supported.
	exports.LocalFileSystemSync.prototype.resolveLocalFileSystemSyncURL = function (url) {
		throw new exports.FileException(exports.FileException.SECURITY_ERR);
	};

	/**
	 * This interface represents a file system.
	 * 
	 * @constructor
	 * @param {String} name This is the name of the file system.
	 * @param {String} realPath This is the real path to the filesystem.
	 */
	exports.FileSystemSync = function (name, realPath) {
		/** This is the name of the file system. */
		this.name = name;
		
		/** The root directory of the file system. */
		this.root = new exports.DirectoryEntrySync(this, "/");

		this._realPath = realPath;
	};

	/**
	 * Joins the filesystem's real path with the given full path.
	 * 
	 * @param {String} fullPath The full path.
	 * @returns {String} The joined real path.
	 */
	exports.FileSystemSync.prototype.realize = function (fullPath) {
		return nPath.join(this._realPath, fullPath);
	};

	/**
	 * An abstract interface representing entries in a file system.
	 * 
	 * @constructor
	 * @param {exports.FileSystemSync} filesystem The filesystem.
	 * @param {String} fullPath The full path to the entry.
	 */
	exports.EntrySync = function (filesystem, fullPath) {
		this.filesystem = filesystem;

		/** The name of the entry, excluding the path leading to it. */
		this.name = webinos.path.basename(fullPath);
		
		/** The full absolute path from the root to the entry. */
		this.fullPath = fullPath;
	};

	/**
	 * Create an entry corresponding to the given full path.
	 * 
	 * @param {exports.FileSystemSync} filesystem The filesystem.
	 * @param {String} fullPath The full path.
	 * @returns {export.EntrySync} The corresponding entry.
	 */
	exports.EntrySync.create = function (filesystem, fullPath) {
		var entry;
		var stats = mUtils.wrap(nFs.statSync)(filesystem.realize(fullPath));

		if (stats.isDirectory())
			entry = new exports.DirectoryEntrySync(filesystem, fullPath);
		else if (stats.isFile())
			entry = new exports.FileEntrySync(filesystem, fullPath);
		else
			throw new exports.FileException(exports.FileException.SECURITY_ERR);

		return entry;
	};

	/** EntrySync is a file. */
	exports.EntrySync.prototype.isFile = false;
	
	/** EntrySync is a directory. */
	exports.EntrySync.prototype.isDirectory = false;

	/**
	 * Joins the filesystem's real path with the entry's full path.
	 * 
	 * @returns {String} The joined real path.
	 */
	exports.EntrySync.prototype.realize = function () {
		return this.filesystem.realize(this.fullPath);
	};

	/**
	 * Resolves the last argument to an absolute path by prepending preceding arguments in right to left order, until
	 * an absolute path is found. If after using all given paths still no absolute path is found, the entry's full path
	 * is used as well.
	 * 
	 * @returns {String} The resolved path (normalized, and without any trailing slashes unless the path gets resolved
	 * 		to the root directory).
	 * @see webinos.path#resolve
	 */
	exports.EntrySync.prototype.resolve = function () {
		var argsArray = Array.prototype.slice.call(arguments);

		argsArray.unshift(this.fullPath);

		return webinos.path.resolve.apply(null, argsArray);
	};

	/**
	 * Solves the relative path from the entry's full path to to. to is normalized prior to solving.
	 * 
	 * @param {String} to Target path.
	 * @returns {String} The relative path.
	 * @see webinos.path#relative
	 */
	exports.EntrySync.prototype.relative = function (to) {
		return webinos.path.relative(this.fullPath, this.resolve(to));
	};

	/**
	 * Copy an entry to a different location on the file system.
	 * 
	 * @param {exports.DirectoryEntrySync} parent The directory to which to move the entry.
	 * @param {String} [newName] The new name of the entry. Defaults to the EntrySync's current name if unspecified.
	 * @returns {exports.EntrySync} The new entry.
	 */
	exports.EntrySync.prototype.copyTo = function (parent, newName) {
		newName = newName || this.name;

		if (webinos.path.equals(parent.fullPath, this.getParent().fullPath) && newName == this.name)
			throw new exports.FileException(exports.FileException.INVALID_MODIFICATION_ERR);

		var newFullPath = webinos.path.join(parent.fullPath, newName),
			newEntry;

		if (this.isDirectory) {
			if (this.isPrefixOf(parent.fullPath))
				throw new exports.FileException(exports.FileException.INVALID_MODIFICATION_ERR);

			newEntry = parent.getDirectory(newName, {
				create: true,
				exclusive: true
			});

			var reader = this.createReader();
			var children = [];

			while ((children = reader.readEntries()).length > 0)
				children.forEach(function (child) {
					child.copyTo(newEntry, child.name);
				});
		} else if (this.isFile) {
			newEntry = parent.getFile(newName, {
				create: true,
				exclusive: true
			});

			// TODO Use FileReader(Sync) and FileWriter(Sync) to copy data?
			var buffer = mUtils.wrap(nFs.readFileSync)(this.realize());

			mUtils.wrap(nFs.writeFileSync)(parent.filesystem.realize(newFullPath), buffer);
		}

		return newEntry;
	};

	/**
	 * Look up metadata about this entry.
	 * 
	 * @returns {Object} Metadata.
	 */
	exports.EntrySync.prototype.getMetadata = function () {
		var stats = mUtils.wrap(nFs.statSync)(this.realize());

		return {
			modificationTime: stats.mtime
		};
	};

	/**
	 * Look up the parent DirectoryEntrySync containing this Entry.
	 * 
	 * @returns {exports.DirectoryEntrySync} The parent.
	 */
	exports.EntrySync.prototype.getParent = function () {
		if (webinos.path.equals(this.fullPath, this.filesystem.root.fullPath))
			return this;

		return new exports.DirectoryEntrySync(this.filesystem, webinos.path.dirname(this.fullPath));
	};

	/**
	 * Move an entry to a different location on the file system.
	 * 
	 * @param {exports.DirectoryEntrySync} parent The directory to which to move the entry.
	 * @param {String} [newName] The new name of the entry. Defaults to the EntrySync's current name if unspecified.
	 * @returns {exports.EntrySync} The new entry.
	 */
	exports.EntrySync.prototype.moveTo = function (parent, newName) {
		newName = newName || this.name;

		if (webinos.path.equals(parent.fullPath, this.getParent().fullPath) && newName == this.name)
			throw new exports.FileException(exports.FileException.INVALID_MODIFICATION_ERR);

		// TODO Is this really necessary? (I don't like it.)
		if (this.isDirectory && this.isPrefixOf(parent.fullPath))
			throw new exports.FileException(exports.FileException.INVALID_MODIFICATION_ERR);

		var newFullPath = webinos.path.join(parent.fullPath, newName);

		mUtils.wrap(nFs.renameSync)(this.realize(), parent.filesystem.realize(newFullPath));

		// TODO We already know whether this is a directory or a file...
		return exports.EntrySync.create(parent.filesystem, newFullPath);
	};

	/**
	 * Deletes a file or directory.
	 */
	exports.EntrySync.prototype.remove = function () {
		if (webinos.path.equals(this.fullPath, this.filesystem.root.fullPath))
			throw new exports.FileException(exports.FileException.SECURITY_ERR);

		if (this.isDirectory)
			mUtils.wrap(nFs.rmdirSync)(this.realize());
		else if (this.isFile)
			mUtils.wrap(nFs.unlinkSync)(this.realize());
	}

	// TODO Choose filesystem url scheme, e.g., <webinos:http://example.domain/persistent-or-temporary/path/to/exports.html>.
	exports.EntrySync.prototype.toURL = function () {
		// <HACK>
		// return "webinos:http://localhost:2409" + this.fullPath;
		// </HACK>
	};

	/**
	 * This interface represents a directory on a file system.
	 * 
	 * @constructor
	 * @param {exports.FileSystemSync} filesystem The filesystem.
	 * @param {String} fullPath The full path.
	 */
	exports.DirectoryEntrySync = function (filesystem, fullPath) {
		exports.EntrySync.call(this, filesystem, fullPath);
	};

	nUtil.inherits(exports.DirectoryEntrySync, exports.EntrySync);

	exports.DirectoryEntrySync.prototype.isDirectory = true;

	/**
	 * Creates a new DirectoryReaderSync to read EntrySyncs from this DirectorySync.
	 * 
	 * @returns {exports.DirectoryReaderSync} The reader.
	 */
	exports.DirectoryEntrySync.prototype.createReader = function () {
		return new exports.DirectoryReaderSync(this);
	};

	/**
	 * Checks if fullPath contains a path prefix of the entry's full path.

	 * @param {String} fullPath The full path.
	 * @returns {Boolean} True if fullPath contains a path prefix of the entry's full path, false otherwise.
	 */
	exports.DirectoryEntrySync.prototype.isPrefixOf = function (fullPath) {
		return webinos.path.isPrefixOf(this.fullPath, fullPath);
	};

	/**
	 * Creates or looks up a directory.
	 * 
	 * @param {String} path Either an absolute path or a relative path from this DirectoryEntrySync to the directory to
	 *                      be looked up or created.
	 * @param {Object} [options} Options.
	 * @returns {exports.DirectoryEntrySync} The directory.
	 */
	exports.DirectoryEntrySync.prototype.getDirectory = function (path, options) {
		var fullPath = this.resolve(path),
			entry;

		if (nPath.existsSync(this.filesystem.realize(fullPath))) {
			if (options && options.create && options.exclusive)
				throw new exports.FileException(exports.FileException.PATH_EXISTS_ERR);

			entry = exports.EntrySync.create(this.filesystem, fullPath);

			if (!entry.isDirectory)
				throw new exports.FileException(exports.FileException.TYPE_MISMATCH_ERR);
		} else {
			if (!options || !options.create)
				throw new exports.FileException(exports.FileException.NOT_FOUND_ERR);

			mUtils.wrap(nFs.mkdirSync)(this.filesystem.realize(fullPath));

			entry = new exports.DirectoryEntrySync(this.filesystem, fullPath)
		}

		return entry;
	};

	/**
	 * Creates or looks up a file.
	 * 
	 * @param {String} path Either an absolute path or a relative path from this DirectoryEntrySync to the file to
	 *                      be looked up or created.
	 * @param {Object} [options} Options.
	 * @returns {exports.FileEntrySync} The file.
	 */
	exports.DirectoryEntrySync.prototype.getFile = function (path, options) {
		var fullPath = this.resolve(path),
			entry;

		if (nPath.existsSync(this.filesystem.realize(fullPath))) {
			if (options && options.create && options.exclusive)
				throw new exports.FileException(exports.FileException.PATH_EXISTS_ERR);

			entry = exports.EntrySync.create(this.filesystem, fullPath);

			if (!entry.isFile)
				throw new exports.FileException(exports.FileException.TYPE_MISMATCH_ERR);
		} else {
			if (!options || !options.create)
				throw new exports.FileException(exports.FileException.NOT_FOUND_ERR);

			var fd = mUtils.wrap(nFs.openSync)(this.filesystem.realize(fullPath), "w");

			mUtils.wrap(nFs.closeSync)(fd);

			entry = new exports.FileEntrySync(this.filesystem, fullPath)
		}

		return entry;
	};

	/**
	 * Deletes a directory and all of its contents, if any.
	 */
	exports.DirectoryEntrySync.prototype.removeRecursively = function () {
		var reader = this.createReader();
		var children = [];

		while ((children = reader.readEntries()).length > 0)
			children.forEach(function (child) {
				if (child.isDirectory)
					child.removeRecursively();
				else if (child.isFile)
					child.remove();
			});

		this.remove();
	};

	/**
	 * This interface lets a user list files and directories in a directory.
	 * 
	 * @constructor
	 * @param {exports.DirectoryEntrySync} entry The directory.
	 * @param {unsigned long} [start=0] The start point.
	 */
	exports.DirectoryReaderSync = function (entry, start) {
		this._entry = entry;
		this._start = start || 0;
	};

	exports.DirectoryReaderSync.LENGTH = 32;

	exports.DirectoryReaderSync.prototype._children = undefined;

	/**
	 * Read the next block of entries from this directory.
	 * 
	 * @returns {EntrySync[]} The next block of entries.
	 */
	exports.DirectoryReaderSync.prototype.readEntries = function () {
		if (typeof this._children === "undefined")
			this._children = mUtils.wrap(nFs.readdirSync)(this._entry.realize());

		var entries = [];

		for (var i = this._start; i < Math.min(this._start + exports.DirectoryReaderSync.LENGTH, this._children.length); i++)
			// TODO Shift _children to free up space.
			entries.push(exports.EntrySync.create(this._entry.filesystem, webinos.path.join(this._entry.fullPath, this._children[i])));

		this._start += entries.length;

		return entries;
	};

	/**
	 * This interface represents a file on a file system.
	 * 
	 * @constructor
	 * @param {exports.FileSystemSync} filesystem The filesystem.
	 * @param {String} fullPath The full path.
	 */
	exports.FileEntrySync = function (filesystem, fullPath) {
		exports.EntrySync.call(this, filesystem, fullPath);
	};

	nUtil.inherits(exports.FileEntrySync, exports.EntrySync);

	exports.FileEntrySync.prototype.isFile = true;

	/**
	 * Creates a new FileWriterSync associated with the file that this FileEntrySync represents.
	 * 
	 * @returns {exports.FileWriterSync} The associated FileWriterSync.
	 */
	exports.FileEntrySync.prototype.createWriter = function () {
		return new exports.FileWriterSync(this);
	};

	/**
	 * Returns a File that represents the current state of the file that this FileEntrySync represents.
	 * 
	 * @returns {exports.File} The File.
	 */
	exports.FileEntrySync.prototype.file = function () {
		return new exports.File(this);
	};

	// The following objects are the asynchronous equivalents of the above defined synchronous objects.
	
	exports.LocalFileSystem = function () {
	};

	exports.LocalFileSystem.TEMPORARY = 0;
	exports.LocalFileSystem.PERSISTENT = 1;

	exports.LocalFileSystem.prototype.requestFileSystem = function (type, size, successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.LocalFileSystemSync.prototype.requestFileSystemSync, mUtils.sync(this)), function (filesystem) {
			utils.callback(successCallback, this)(mUtils.async(filesystem));
		}, errorCallback), this)(type, size);
	};

	exports.LocalFileSystem.prototype.resolveLocalFileSystemURL = function (url, successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.LocalFileSystemSync.prototype.resolveLocalFileSystemSyncURL, mUtils.sync(this)), function (entry) {
			utils.callback(successCallback, this)(mUtils.async(entry));
		}, errorCallback), this)(url);
	};

	exports.FileSystem = function (name, realPath) {
		this.name = name;
		this.root = new exports.DirectoryEntry(this, "/");

		this._realPath = realPath;
	};

	exports.FileSystem.prototype.realize = function (fullPath) {
		return exports.FileSystemSync.prototype.realize.call(mUtils.sync(this), fullPath);
	};

	exports.Entry = function (filesystem, fullPath) {
		this.filesystem = filesystem;

		this.name = webinos.path.basename(fullPath);
		this.fullPath = fullPath;
	};

	exports.Entry.create = function (filesystem, fullPath, successCallback, errorCallback) {
		mUtils.schedule(exports.EntrySync.create, function (entry) {
			successCallback(mUtils.async(entry));
		}, errorCallback)(mUtils.sync(filesystem), fullPath);
	};

	exports.Entry.prototype.isFile = false;
	exports.Entry.prototype.isDirectory = false;

	exports.Entry.prototype.realize = function () {
		return exports.EntrySync.prototype.realize.call(mUtils.sync(this));
	};

	exports.Entry.prototype.resolve = function () {
		return exports.EntrySync.prototype.resolve.apply(mUtils.sync(this), arguments);
	};

	exports.Entry.prototype.relative = function (to) {
		return exports.EntrySync.prototype.relative.call(mUtils.sync(this), to);
	};

	exports.Entry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.EntrySync.prototype.copyTo, mUtils.sync(this)), function (entry) {
			utils.callback(successCallback, this)(mUtils.async(entry));
		}, errorCallback), this)(mUtils.sync(parent), newName);
	};

	exports.Entry.prototype.getMetadata = function (successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.EntrySync.prototype.getMetadata, mUtils.sync(this)), successCallback, errorCallback), this)();
	};

	exports.Entry.prototype.getParent = function (successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.EntrySync.prototype.getParent, mUtils.sync(this)), function (entry) {
			utils.callback(successCallback, this)(mUtils.async(entry));
		}, errorCallback), this)();
	};

	exports.Entry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.EntrySync.prototype.moveTo, mUtils.sync(this)), function (entry) {
			utils.callback(successCallback, this)(mUtils.async(entry));
		}, errorCallback), this)(mUtils.sync(parent), newName);
	};

	exports.Entry.prototype.remove = function (successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.EntrySync.prototype.remove, mUtils.sync(this)), successCallback, errorCallback), this)();
	};

	exports.Entry.prototype.toURL = function () {
		return exports.EntrySync.prototype.toURL.call(mUtils.sync(this));
	};

	exports.DirectoryEntry = function (filesystem, fullPath) {
		exports.Entry.call(this, filesystem, fullPath);
	};

	nUtil.inherits(exports.DirectoryEntry, exports.Entry);

	exports.DirectoryEntry.prototype.isDirectory = true;

	exports.DirectoryEntry.prototype.createReader = function () {
		return new exports.DirectoryReader(this);
	};

	exports.DirectoryEntry.prototype.isPrefixOf = function (fullPath) {
		return exports.DirectoryEntrySync.prototype.isPrefixOf.call(mUtils.sync(this), fullPath);
	};

	exports.DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.DirectoryEntrySync.prototype.getDirectory, mUtils.sync(this)), function (entry) {
			utils.callback(successCallback, this)(mUtils.async(entry));
		}, errorCallback), this)(path, options);
	};

	exports.DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.DirectoryEntrySync.prototype.getFile, mUtils.sync(this)), function (entry) {
			utils.callback(successCallback, this)(mUtils.async(entry));
		}, errorCallback), this)(path, options);
	};

	exports.DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
		utils.bind(mUtils.schedule(utils.bind(exports.DirectoryEntrySync.prototype.removeRecursively, mUtils.sync(this)), successCallback, errorCallback), this)();
	};

	exports.DirectoryReader = function (entry, start) {
		this._entry = entry;
		this._start = start || 0;
	};

	exports.DirectoryReader.prototype.readEntries = function (successCallback, errorCallback) {
		var sync = mUtils.sync(this);

		utils.bind(mUtils.schedule(utils.bind(exports.DirectoryReaderSync.prototype.readEntries, sync), function (entries) {
			this._start = sync._start;

			utils.callback(successCallback, this)(entries.map(mUtils.async));
		}, errorCallback), this)();
	};

	exports.FileEntry = function (filesystem, fullPath) {
		exports.Entry.call(this, filesystem, fullPath);
	};

	nUtil.inherits(exports.FileEntry, exports.Entry);

	exports.FileEntry.prototype.isFile = true;

	exports.FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
		utils.bind(mUtils.schedule(function () {
			return new exports.FileWriter(this);
		}, successCallback, errorCallback), this)();
	};

	exports.FileEntry.prototype.file = function (successCallback, errorCallback) {
		utils.bind(mUtils.schedule(function () {
			return new exports.File(this);
		}, successCallback, errorCallback), this)();
	};

	// The following outdated error/exception objects will be replaced soon.
	
	exports.FileError = function (code) {
		this.code = code;
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

	exports.FileException = function (code) {
		this.code = code;
	};

	exports.FileException.NOT_FOUND_ERR = 1;
	exports.FileException.SECURITY_ERR = 2;
	exports.FileException.ABORT_ERR = 3;
	exports.FileException.NOT_READABLE_ERR = 4;
	exports.FileException.ENCODING_ERR = 5;
	exports.FileException.NO_MODIFICATION_ALLOWED_ERR = 6;
	exports.FileException.INVALID_STATE_ERR = 7;
	exports.FileException.SYNTAX_ERR = 8;
	exports.FileException.INVALID_MODIFICATION_ERR = 9;
	exports.FileException.QUOTA_EXCEEDED_ERR = 10;
	exports.FileException.TYPE_MISMATCH_ERR = 11;
	exports.FileException.PATH_EXISTS_ERR = 12;
})(module.exports);
