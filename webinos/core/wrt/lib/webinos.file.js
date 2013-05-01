/*******************************************************************************
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
 ******************************************************************************/

// [WP-608] Support write/truncate abort

if (typeof webinos === "undefined") webinos = {};
if (typeof webinos.file === "undefined") webinos.file = {};

(function (exports) {
  exports.Service = Service;

  webinos.util.inherits(Service, WebinosService);
  function Service(object, rpc) {
    Service.super_.call(this, object);

    this.rpc = rpc;
  }

  Service.prototype.requestFileSystem = function (type, size, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self, "requestFileSystem");
    self.rpc.executeRPC(request, function (filesystem) {
      successCallback(new FileSystem(self, filesystem.name));
    }, errorCallback);
  };

  Service.prototype.resolveLocalFileSystemURL = function (url, successCallback, errorCallback) {
    webinos.util.async(errorCallback)(new webinos.util.CustomError("NotSupportedError"));
  };

  function FileSystem(service, name) {
    this.service = service;

    this.name = name;
    this.root = new DirectoryEntry(this, "/");
  }

  FileSystem.prototype.toJSON = function () {
    var json = { name : this.name };
    return json;
  };

  function Entry(filesystem, fullPath) {
    this.name = webinos.path.basename(fullPath);
    this.fullPath = fullPath;
    this.filesystem = filesystem;

    this.service = filesystem.service;
    this.rpc = filesystem.service.rpc;
  }

  Entry.prototype.isFile = false;
  Entry.prototype.isDirectory = false;

  Entry.prototype.getMetadata = function (successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "getMetadata",
        { entry : this });
    this.rpc.executeRPC(request, function (metadata) {
      successCallback(new Metadata(metadata));
    }, errorCallback);
  };

  Entry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "moveTo",
      { source : self, parent : parent, newName : newName });
    self.rpc.executeRPC(request, function (entry) {
      if (self.isDirectory) {
        successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
      } else {
        successCallback(new FileEntry(self.filesystem, entry.fullPath));
      }
    }, errorCallback);
  };

  Entry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "copyTo",
        { source : self, parent : parent, newName : newName });
    self.rpc.executeRPC(request, function (entry) {
      if (self.isDirectory) {
        successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
      } else {
        successCallback(new FileEntry(self.filesystem, entry.fullPath));
      }
    }, errorCallback);
  };

  Entry.prototype.toURL = function () {
    throw new webinos.util.CustomError("NotSupportedError");
  };

  Entry.prototype.remove = function (successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "remove", { entry : this });
    this.rpc.executeRPC(request, successCallback, errorCallback);
  };

  Entry.prototype.getParent = function (successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getParent", { entry : self });
    self.rpc.executeRPC(request, function (entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  Entry.prototype.toJSON = function () {
    var json =
      { name        : this.name
      , fullPath    : this.fullPath
      , filesystem  : this.filesystem
      , isFile      : this.isFile
      , isDirectory : this.isDirectory
      };
    return json;
  };

  function Metadata(metadata) {
    this.modificationTime = new Date(metadata.modificationTime);
    this.size = metadata.size;
  }

  webinos.util.inherits(DirectoryEntry, Entry);
  function DirectoryEntry(filesystem, fullPath) {
    DirectoryEntry.super_.call(this, filesystem, fullPath);
  }

  DirectoryEntry.prototype.isDirectory = true;

  DirectoryEntry.prototype.createReader = function () {
    return new DirectoryReader(this);
  };

  DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getFile",
        { entry : self, path : path, options : options });
    self.rpc.executeRPC(request, function (entry) {
      successCallback(new FileEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getDirectory",
        { entry : self, path : path, options : options });
    self.rpc.executeRPC(request, function (entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "removeRecursively", { entry : this });
    this.rpc.executeRPC(request, successCallback, errorCallback);
  };

  function DirectoryReader(entry) {
    this.entry = entry;

    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc;
  }

  DirectoryReader.prototype.readEntries = function (successCallback, errorCallback) {
    var self = this;

    function next() {
      if (!self.entries.length) return [];

      var chunk = self.entries.slice(0, 10);
      self.entries.splice(0, 10);
      return chunk;
    }

    if (typeof self.entries === "undefined") {
      var request = self.rpc.createRPC(self.service, "readEntries", { entry : self.entry });
      self.rpc.executeRPC(request, function (entries) {
        self.entries = entries.map(function (entry) {
          if (entry.isDirectory) {
            return new DirectoryEntry(self.entry.filesystem, entry.fullPath);
          } else {
            return new FileEntry(self.entry.filesystem, entry.fullPath);
          }
        });

        successCallback(self.entries );
      }, errorCallback);
    } else webinos.util.async(successCallback)(self.entries);
  };

  webinos.util.inherits(FileEntry, Entry);
  function FileEntry(filesystem, fullPath) {
    FileEntry.super_.call(this, filesystem, fullPath);
  }

  FileEntry.prototype.isFile = true;

  FileEntry.prototype.getLink = function (successCallback, errorCallback) {
    var request = this.rpc.createRPC(this.service, "getLink", { entry : this });
    this.rpc.executeRPC(request, successCallback, errorCallback);
  };

  FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getMetadata", { entry : self });
    self.rpc.executeRPC(request, function (metadata) {
      var writer = new FileWriter(self);
      writer.length = metadata.size;

      successCallback(writer);
    }, errorCallback);
  };

  FileEntry.prototype.file = function (successCallback, errorCallback) {
    var self = this;
    var request = self.rpc.createRPC(self.service, "getMetadata", { entry : self });
    self.rpc.executeRPC(request, function (metadata) {
      var blobParts = [];

      var remote;
      var port = self.rpc.createRPC(self.service, "read",
         { entry : self
         , options : { bufferSize : 16 * 1024, autopause : true }
         });
      port.ref = function (params, successCallback, errorCallback, ref) {
        remote = ref;
      };
      port.open = function () {};
      port.data = function (params) {
        blobParts.push(webinos.util.hex2ab(params.data));

        var message = self.rpc.createRPC(remote, "resume", null);
        self.rpc.executeRPC(message);
      };
      port.end = function () {};
      port.close = function () {
        try {
          var blob = new Blob(blobParts);
          blob.name = self.name;
          blob.lastModifiedDate = new Date(metadata.modificationTime);

          successCallback(blob);
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      };
      port.error = function (params) {
        try {
          errorCallback(params.error);
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      };

      self.rpc.registerCallbackObject(port);
      self.rpc.executeRPC(port);
    }, errorCallback);
  };

  webinos.util.inherits(FileWriter, webinos.util.EventTarget);
  function FileWriter(entry) {
    FileWriter.super_.call(this);

    this.entry = entry;

    this.readyState = FileWriter.INIT;
    this.length = 0;
    this.position = 0;

    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc;

    this.addEventListener("writestart", function (event) {
      webinos.util.callback(this.onwritestart)(event);
    });
    this.addEventListener("progress", function (event) {
      webinos.util.callback(this.onprogress)(event);
    });
    this.addEventListener("abort", function (event) {
      webinos.util.callback(this.onabort)(event);
    });
    this.addEventListener("write", function (event) {
      webinos.util.callback(this.onwrite)(event);
    });
    this.addEventListener("writeend", function (event) {
      webinos.util.callback(this.onwriteend)(event);
    });
    this.addEventListener("error", function (event) {
      webinos.util.callback(this.onerror)(event);
    });
  }

  FileWriter.INIT = 0;
  FileWriter.WRITING = 1;
  FileWriter.DONE = 2;

  function BlobIterator(blob) {
    this.blob = blob;
    this.position = 0;
  }

  BlobIterator.prototype.hasNext = function () {
    return this.position < this.blob.size;
  };

  BlobIterator.prototype.next = function () {
    if (!this.hasNext()) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    var end = Math.min(this.position + 16 * 1024, this.blob.size);
    var chunk;
    if (this.blob.slice) {
      chunk = this.blob.slice(this.position, end);
    } else if (this.blob.webkitSlice) {
      chunk = this.blob.webkitSlice(this.position, end);
    } else if (this.blob.mozSlice) {
      chunk = this.blob.mozSlice(this.position, end);
    }
    this.position = end;
    return chunk;
  };

  FileWriter.prototype.write = function (data) {
    var self = this;

    if (self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));

    var reader = new FileReader();
    // reader.onloadstart = function (event) {};
    // reader.onprogress = function (event) {};
    // reader.onabort = function (event) {};
    reader.onload = function () {
      var message = self.rpc.createRPC(remote, "write",
          { data : webinos.util.ab2hex(reader.result) });
      self.rpc.executeRPC(message, function (bytesWritten) {
        self.position += bytesWritten;
        self.length = Math.max(self.position, self.length);

        self.dispatchEvent(new webinos.util.ProgressEvent("progress"));
      });
    };
    // reader.onloadend = function (event) {};
    reader.onerror = function () {
      var message = self.rpc.createRPC(remote, "destroy");
      self.rpc.executeRPC(message, function () {
        try {
          self.error = reader.error;
          self.readyState = FileWriter.DONE;
          self.dispatchEvent(new webinos.util.ProgressEvent("error"));
          self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      });
    };

    var iterator = new BlobIterator(data);
    function iterate() {
      if (iterator.hasNext()) {
        reader.readAsArrayBuffer(iterator.next());
      } else {
        var message = self.rpc.createRPC(remote, "end");
        self.rpc.executeRPC(message, function () {
          try {
            self.readyState = FileWriter.DONE;
            self.dispatchEvent(new webinos.util.ProgressEvent("write"));
            self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
          } finally {
            self.rpc.unregisterCallbackObject(port);
          }
        });
      }
    }

    var remote;
    var port = self.rpc.createRPC(self.service, "write",
       { entry : self.entry, options : { start : self.position } });
    port.ref = function (params, successCallback, errorCallback, ref) {
      remote = ref;
    };
    port.open = function () {
      iterate();
    };
    port.drain = function () {
      iterate();
    };
    port.close = function () {};
    port.error = function (params) {
      try {
        self.error = params.error;
        self.readyState = FileWriter.DONE;
        self.dispatchEvent(new webinos.util.ProgressEvent("error"));
        self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
      } finally {
        reader.abort();

        self.rpc.unregisterCallbackObject(port);
      }
    };

    self.rpc.registerCallbackObject(port);
    self.rpc.executeRPC(port);
  };

  FileWriter.prototype.seek = function (offset) {
    if (this.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    this.position = offset;

    if (this.position > this.length) {
      this.position = this.length;
    }

    if (this.position < 0) {
      this.position = this.position + this.length;
    }

    if (this.position < 0) {
      this.position = 0;
    }
  };

  FileWriter.prototype.truncate = function (size) {
    var self = this;

    if (self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));

    var request = self.rpc.createRPC(self.service, "truncate",
        { entry : self.entry, size : size });
    self.rpc.executeRPC(request, function () {
      self.length = size;
      self.position = Math.min(self.position, size);

      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("write"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
    }, function (error) {
      self.error = error;
      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("error"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
    });
  };

  // FileWriter.prototype.abort = function () {
  //   if (this.readyState === FileWriter.DONE ||
  //       this.readyState === FileWriter.INIT) return;

  //   this.readyState = FileWriter.DONE;

  //   // If there are any tasks from the object's FileSaver task source in one of
  //   // the task queues, then remove those tasks.
  //   // Terminate the write algorithm being processed.

  //   this.error = new webinos.util.CustomError("AbortError");
  //   this.dispatchEvent(new webinos.util.ProgressEvent("abort"));
  //   this.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
  // };
})(webinos.file);
