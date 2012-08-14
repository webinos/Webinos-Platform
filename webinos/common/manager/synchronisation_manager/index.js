var crypto = require('crypto');

// Create Weak and Strong CheckSum
var Sync = function (sessionId, hashSize) {
  "use strict";
  this.sessionId   = sessionId;
  this.hashSize    = hashSize;
  this.policy      = [];
  this.setting     = []; //includes master, signed, revoked, otherPzh cert  
};


function weak_alg() {
  
}

Sync.prototype.rsyncHash = function(file) {
  var self = this;
  var obj = [];
  if (fs.stat(file, function (err, stats) {
    if (!stat.isDirectory()){
      fs.readFile(file, function(err, data) {
        for (var i = 0 ; i < data.length; i += self.hashSize) {
          var dataHash = data.slice(i, self.hashSize);    
          obj.strong   = crypto.createHash("md5").update(dataHash).digest("hex"); 
          obj.weak     = weak_alg(); 
        }
      });
    } else {
      return -3; 
    }
  }
}
Sync.prototype.createChecksum = function(folder) {
  "use strict";
  if (fs.stat(folder, function(err, stats) {
    if (err) {
      return -1;//"Path Error";
    }
    if (!stats.isDirectory()) {
      return -2;//"Directory Error"
    }
  }
  fs.readdir(folder, function(err, files) {
    for (var i = 0; i < files.length; i  += 1) {
      console.log(files[i]);
      fs.stat(files[i], function (err, stats) {
        if (stats.isDirectory()) {
          self.createChecksum(files[i]);
        } else {
          // Policy Files - policy.xml
          if (files[i] === "policy.xml") {
            self.policy.push(self.rsyncHash(files[i]));
          }
          // Exchange signed, otherPzh and certificate part of json file
          if (files[i] === self.sessionId+".json") {
            self.setting.push(self.rsyncHash(files[i]));
          }
        }
      });
    }
  });  
}

// Find Difference
function findChecksum() {
  
}

exports.webinos_iniitialize = function() {
  
}

exports.webinos_createChecksum = function(fileName) {
  sync.createChecksum();
}

exports.webinos_findSync = function() {
  findChecksum();
}
