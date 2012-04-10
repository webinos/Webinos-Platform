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

var path = require('path');
var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);

var util = require('util');
var contacts_m = require(path.resolve(__dirname,'../lib/contacts_module.js'));

var argv = process.argv;
var argc = process.argv.length;

var findInstructions = '\nFIND CONTACTS: Insert fields to be searched separated by ":"\n'
  + 'for instance:\n    name:john:emails:john@mail.com:address:street where john lives\n'
  + 'Allowed field names are those in W3C specs\n';

function printHelp()
{
  var help_msg = 'Usage:\n' + 'node test_contacts_module_standalone.js --help or -h to print this help\n'
    + 'node test_contacts_module_standalone.js <type> <params>\n'
    + 'if <type> = "local" then params must be a valid .mab file URI '
    + '(try "node_contacts_local/test/testAddressBook/abook.mab")\n'
    + 'on android .mab file URI is not required as we try to access the phone address book'
    + 'if <type> = "remote" then params must be <username> <password> of a valid gmail account\n'
    + '<username> could end with or without "@gmail.com"\n'
    + 'hint: you may write or not the double quotes around the parameters: e.g. local == "local"';
  console.log(help_msg);
}

function printError()
{
  var thisScriptName = argv[1].substr(__dirname.length + 1);
  console.error("Wrong arguments, type: node " + thisScriptName + " --help");
  process.exit(1);
}

var type = "";
var par = [];
switch (argc)
{
  case 3:
  if (argv[2] == '-h' || argv[2] == '--help')
  {
    printHelp();
  }
  else if (argv[2] === 'local' &&process.platform === 'android')
  {
    type = 'local';
    var abook = argv[3];
    console.log("***YOU SELECTED LOCAL CONTACTS***")
    console.log("OPENING:", abook);
    par[0] =
    {
      'type' : type,
      'addressBookName' : abook
    };
  }
  else
  {
    printError();
  }
    break;

  case 4:
  if (argv[2] === 'local')
  {
    type = 'local';
    var abook = argv[3];
    console.log("***YOU SELECTED LOCAL CONTACTS***")
    console.log("OPENING:", abook);
    par[0] =
    {
      'type' : type,
      'addressBookName' : abook
    };
  }
  else
  {
    printError();
  }
    break;

  case 5:
  if (argv[2] == 'remote')
  {
    type = 'remote';
    var username = argv[3];
    var password = argv[4];
    console.log("***YOU SELECTED REMOTE (Google) CONTACTS***")
    console.log("Loggin in as :", username);

    par[0] =
    {
      'type' : type,
      'usr' : username,
      'pwd' : password
    };
  }
  else
  {
    printError();
  }
    break;

  default:
  printError();
 
}

contacts_m.authenticate(par, function(status)
{
  console.log("Authentication success (login): ", status);

  contacts_m.isAlreadyAuthenticated(par, function(status)
  {
    console.log("Is Already Authenticated (has a valid token): ", status);
    if (status)
    {
      contacts_m.getAllContacts(par, function(contacts_list)
      {
	console.log("YOU HAVE " + contacts_list.length + " CONTACTS");
	for ( var i = 0; i < contacts_list.length; i++)
	{
	  if(contacts_list[i]['displayName']!=undefined && contacts_list[i]['displayName']!="" && contacts_list[i]['displayName'].length!=undefined)
	    console.log([i+1]+") "+contacts_list[i]['displayName']);
	  else
	    console.log([i+1]+") NO NAME");
	}
	console.log(findInstructions);
      });

      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', function(input)
      {
	var fields = {};

	var fieldArray = input.trim().split(":");
	if (fieldArray.length > 1)
	{
	  var len = fieldArray.length % 2 == 0 ? fieldArray.length : fieldArray.length - 1;
	  for ( var i = 0; i < len; i += 2)
	  {
	    fields[fieldArray[i]] = fieldArray[i + 1];
	  }

	  contacts_m.find(par[0].type, fields, function(result)
	  {
	    console.log("\nFOUND " + result.length + " MATCHES:");
	    for ( var i = 0; i < result.length; i++)
	    {
	      if (result[i]['displayName'] != undefined && result[i]['displayName'] != "" &&
		result[i]['displayName'].length != undefined)
		console.log([ i + 1 ] + ") " + result[i]['displayName']);
	      else
		console.log([ i + 1 ] + ") NO NAME");
	    }
	    process.stdin.destroy();
	  }, function(err)
	  {
	    console.log("find() ERROR:", err)
	  });
	}
      });

    }
  });

});
