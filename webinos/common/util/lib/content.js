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

exports.getContentType = function(uri) {
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
	}
	return {"Content-Type": contentType};
}