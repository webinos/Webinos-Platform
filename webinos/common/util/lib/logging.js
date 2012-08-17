/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/
var ansi          = require('ansi');
var cursor        = ansi(process.stderr);

var Log = function(name, id) {
  this.id   = id;
  this.name = name;
  this.writeError;
  this.writeInfo;
};

Log.prototype.error = function(msg) {
  cursor.bg.black();
  cursor.fg.red().write('error ');
  cursor.fg.cyan().write(this.name);
  if (typeof this.id !== "undefined")
    cursor.fg.green().write(' ' + this.id);
  cursor.fg.red().write(' ' + msg + '\n');
  cursor.reset();
  this.writeLog("error", msg);
};

Log.prototype.info = function(msg) {
  cursor.bg.black();
  cursor.fg.white().write('info ');
  cursor.fg.cyan().write(this.name);
  if (typeof this.id !== "undefined")
    cursor.fg.green().write(' ' + this.id);
  cursor.fg.white().write(' ' + msg + '\n');
  cursor.reset();
  this.writeLog("info", msg);
};

Log.prototype.writeLog = function(type, msg) {
  var self = this;
  if (typeof this.id !== "undefined" && typeof this.writeError === "undefined" && typeof this.writeInfo === "undefined"){
    var filepath = webinosConfigPath();
    var filename = path.join(filepath+"/logs/", self.name+"_"+type+".json");
    try{
      fs.exists(filename, function(status){
        // If file does not exist, we create it , create write stream does not create file directly :) ..
        if (!status) {
          fs.writeFile(filename, function(){
            if (type === "error") {
              self.writeError = fs.createWriteStream(filename, { flags: "a", encoding:"utf8"});
              self.writeError.write(msg+'\n');
            } else {
              self.writeInfo  = fs.createWriteStream(filename, { flags: "a", encoding:"utf8"});
              self.writeInfo.write(msg+'\n');
            }
          });
        }
      });
    } catch (err){
      console.log("Error Initializing logs" + err);
    }
  } else if(self.name && self.writeError) {
    if (type === "error") {
      self.writeError.write(msg + '\n');
    } else {
      self.writeInfo.write(msg + '\n');
    }
  }
}

module.exports = Log;
