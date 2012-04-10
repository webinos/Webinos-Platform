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
* Copyright 2011 Istituto Superiore Mario Boella (ISMB)
******************************************************************************/

var util = require('util');
var contacts = require('bridge').load('org.webinos.impl.ContactManagerImpl', this);
var fs = require ('fs');
var path = require('path');

var argv = process.argv;
var argc = process.argv.length;

//By default it writes the output to the SD card, which is writable
var defaultPath = '/mnt/sdcard/';
var writePath = (argc <=  2) ? defaultPath : path.resolve(defaultPath, argv[2]);
var htmlFname = 'phoneContacts.html';
var outputHTMLFile = fs.createWriteStream(writePath + htmlFname);



console.log("javaBridge loaded exposes the following methods: ");

for(var i in contacts)
	console.log(i + ': ' + contacts[i]);

var opt = new Array();

var fields = {};

function makeHTMLFile(contactList)
{
  console.log("makeHTMLFile: writing your contact list to file");

  outputHTMLFile.write("<html>\n<body>\n<h1>Your Phone contacts:</h1><br><br>\n");
  outputHTMLFile.write("Found "+contactList.length+ " contacts<br>");
  console.log("Found",contactList.length, "contacts");

  for(var i=0;i<contactList.length;i++)
  {
    var contact_name = "<b>"+contactList[i].displayName+"</b><br>";
    outputHTMLFile.write(contact_name);
    if (contactList[i].photos[0].value.length !== 0)
      {
      var img_code = "<img src=\"data:image/*;base64," + contactList[i].photos[0].value + "\" alt=\"Image\"><br><br>\n";
      console.log("Photo size: ", contactList[i].photos[0].value.length/1024.0, "KB");
      outputHTMLFile.write(img_code);
      }
      else
      {
	outputHTMLFile.write("no contact photo<br><br>");
      }
    console.log("Contact #",i,":",contactList[i].displayName+" written");
    }

  outputHTMLFile.write("</body>\n</html>");
  console.log(htmlFname + " written");
}


contacts.find(fields, makeHTMLFile, function(){}, opt);

