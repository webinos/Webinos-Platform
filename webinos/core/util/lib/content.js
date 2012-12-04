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

var fs = require('fs');
var path = require('path');

exports.getContentType = function (uri) {
  "use strict";
  var contentType = "text/plain";
  switch (uri.substr(uri.lastIndexOf("."))) {
  case ".js":
    contentType = "application/x-javascript";
    break;
  case ".html":
    contentType = "text/html";
    break;
  case ".css":
    contentType = "text/css";
    break;
  case ".jpg":
    contentType = "image/jpeg";
    break;
  case ".png":
    contentType = "image/png";
    break;
  case ".gif":
    contentType = "image/gif";
    break;
  case ".svg":
    contentType = "image/svg+xml";
    break;
  case ".mp3":
    contentType = "audio/mp3";
    break;
  case ".ogg":
    contentType = "audio/ogg";
    break;
  case ".mp4":
    contentType = "video/mp4";
    break;
  case ".wav":
    contentType = "video/x-ms-wmv";
    break;
  }
  return {"Content-Type": contentType};
};

function respondErr(res, status, body) {
  res.writeHead(status, {"Content-Type": "text/plain"});
  res.write(body);
  res.end();
}

/**
 * Writes given filepath to response object.
 *
 * @param res nodejs response object
 * @param documentRoot absolute path to root dir of server where file should be
 * served from, string
 * @param filepath filepath which was request, string
 * @param indexFile relative path from documentRoot to show as default instead, string
 */
exports.sendFile = function (res, documentRoot, filepath, indexFile) {
  // check requested path to be inside document root
  // no directory traversal past documentRoot allowed
  if (documentRoot !== filepath.slice(0, documentRoot.length)) {
    respondErr(res, 403, "403 Forbidden\n");
    return;
  }

  fs.stat(filepath, function(err, stats) {
    if (err) {
      respondErr(res, 404, "404 Not Found\n");
      return;
    }
    if (stats.isDirectory()) {
      filepath = path.join(filepath, indexFile);
    }
    fs.readFile(filepath, "binary", function(err, file) {
      if (err) {
        respondErr(res, 500, "500 Could not open path\n");
        return;
      }
      res.writeHead(200, exports.getContentType(filepath));
      res.write(file, "binary");
      res.end();
    });
  });
};
