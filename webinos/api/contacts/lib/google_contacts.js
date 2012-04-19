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

var EventEmitter = require('events').EventEmitter;
var https = require('https');
//var http = require('http');
var url = require('url');

var fs = require('fs');

var util = require('util');

//Use npm to install the following dependencies
var xml2js = require('xml2js'); //XML parser


var path = require('path');
// var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
// var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
// var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);


//Webinos contact definition
//var c_def_path = path.resolve(__dirname,'contacts_def.js');
var c_def_path = require('contacts_def');
var Contact = c_def_path.Contact;
var ContactField = c_def_path.ContactField;
var ContactName = c_def_path.ContactName;
var ContactAddress = c_def_path.ContactAddress;
var ContactOrganization = c_def_path.ContactOrganization;

//Authentication module
//var auth = require(path.resolve(__dirname,'authentication_module.js'));
var auth = require('authentication_module');

//GLOBAL VAR //TODO an object?
var TOKEN = "";
var USERNAME = "";

//XML parser object
var xmlParser = new xml2js.Parser();

/*
 * function Contact(_id, _displayName, _name, _nickname, _phonenumbers, _emails,
 * _addrs, _ims, _orgs, _rev, _birthday, _gender, _note, _photos, _catgories,
 * _urls, _timezone)
 * 
 * function ContactName(_formatted, _family, _given, _middle, _pre, _suf)
 * 
 * function ContactField(_value, _type, _pref)
 */

function newContact(i, item, picture, callback)
{
  "use strict";
  var id = item.id;
  var displayName = item.title;
  var j;
  var num, type, pref,addr;
  
  var name = (item['gd:name'] === undefined) ? new ContactName() : new ContactName(item['gd:name']['gd:fullName'], item['gd:name']['gd:familyName'],
    item['gd:name']['gd:givenName'], item['gd:name']['gd:middleName'], item['gd:name']['gd:namePrefix'],
    item['gd:name']['gd:nameSuffix']);

  var nickname = item['gContact:nickname'];
  var phonenumbers = [];
  if (item['gd:phoneNumber'] !== undefined) //contact has email
  {
    
    if (item['gd:phoneNumber'].length !== undefined) //if is an array
    {
      //TODO rewrite with for loop
      j = 0;
      num = item['gd:phoneNumber'][j]['#'];
      type = item['gd:phoneNumber'][j]['@'].rel === undefined ? 'other' :item['gd:phoneNumber'][j]['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
      pref = 'true';
      phonenumbers.push(new ContactField(num, type, pref));
      j+=1;
      while (j < item['gd:phoneNumber'].length)
      {
        num = item['gd:phoneNumber'][j]['#'];
        type =  item['gd:phoneNumber'][j]['@'].rel === undefined ? 'other' : item['gd:phoneNumber'][j]['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
        pref = false; //TODO check
        phonenumbers.push(new ContactField(num, type, pref));
        j+=1;
      }
    }
    else
    //single number
    {
      num = item['gd:phoneNumber']['#'];
      type = item['gd:phoneNumber']['@'].rel === undefined ? 'other' : item['gd:phoneNumber']['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
      pref = true;
      phonenumbers.push(new ContactField(num, type, pref));
    }
  }

  var emails = [];
  if (item['gd:email'] !== undefined) //contact has email
  {
    if (item['gd:email'].length !== undefined) //if is an array
    {
      //TODO rewrite with for loop
      j = 0;
      addr = item['gd:email'][j]['@'].address;
      type = item['gd:email'][j]['@'].rel === undefined ? 'other' :item['gd:email'][j]['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
      pref = item['gd:email'][j]['@'].primary;
      emails.push(new ContactField(addr, type, pref));
      j++;
      while (j < item['gd:email'].length)
      {
        addr = item['gd:email'][j]['@'].address;
        type = item['gd:email'][j]['@'].rel === undefined ? 'other' : item['gd:email'][j]['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
        pref = item['gd:email'][j]['@'].primary;
        emails.push(new ContactField(addr, type, pref));
        j++;
      }
    }
    else
    //single address
    {
      addr = item['gd:email']['@'].address;
      type = item['gd:email']['@'].rel === undefined ? 'other' : item['gd:email']['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
      pref = item['gd:email']['@'].primary;
      emails.push(new ContactField(addr, type, pref));
    }
  }
  /*
   * 'gd:structuredPostalAddress': [ { 'gd:pobox': '12223',
   * 'gd:formattedAddress': 'via della morte nera 56\n12223\nCoruscant,
   * Tatooine, Galaxy far far away 66666\nUniverse', 'gd:postcode': '66666',
   * 'gd:region': 'Galaxy far far away', 'gd:country': 'Universe', '@': { rel:
   * 'http://schemas.google.com/g/2005#home' }, 'gd:city': 'Tatooine',
   * 'gd:neighborhood': 'Coruscant', 'gd:street': 'via della morte nera 56' }, {
   * 'gd:formattedAddress': 'morte nera 555', '@': { rel:
   * 'http://schemas.google.com/g/2005#work' }, 'gd:street': 'morte nera 555' }, {
   * 'gd:formattedAddress': 'via spazio 8', '@': { label: 'Spazio' },
   * 'gd:street': 'via spazio 8' }, [length]: 3 ],
   * 
   * function ContactAddress(_formatted, _type, _street, _pref, _locality,
   * _region, _postalCode, _country)
   */
  var addrs = [];
  var formatted, locality, street, region, postCode, country;
  if (item['gd:structuredPostalAddress'] !== undefined) //contact has email
  {
    if (item['gd:structuredPostalAddress'].length !== undefined) //if is an array
    {
      //TODO rewrite with for loop
      j = 0;

      formatted = item['gd:structuredPostalAddress'][j]['gd:formattedAddress'];
      type = item['gd:structuredPostalAddress'][j]['@'].rel === undefined ? 'other' : item['gd:structuredPostalAddress'][j]['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
      street = item['gd:structuredPostalAddress'][j]['gd:street'];
      pref = true;
      locality = item['gd:structuredPostalAddress'][j]['gd:city'];
      region = item['gd:structuredPostalAddress'][j]['gd:region'];
      postCode = item['gd:structuredPostalAddress'][j]['gd:postcode'];
      country = item['gd:structuredPostalAddress'][j]['gd:country'];

      addrs.push(new ContactAddress(formatted, type, street, pref, locality, region, postCode, country));
      j++;
      while (j < item['gd:structuredPostalAddress'].length)
      {
        formatted = item['gd:structuredPostalAddress'][j]['gd:formattedAddress'];
        type = 'other';
        if(item['gd:structuredPostalAddress'][j]['@'].rel !==undefined) //TODO add checks everywhere?
         {
           type = item['gd:structuredPostalAddress'][j]['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
         }
        street = item['gd:structuredPostalAddress'][j]['gd:street'];
        pref = false;
        locality = item['gd:structuredPostalAddress'][j]['gd:city'];
        region = item['gd:structuredPostalAddress'][j]['gd:region'];
        postCode = item['gd:structuredPostalAddress'][j]['gd:postcode'];
        country = item['gd:structuredPostalAddress'][j]['gd:country'];

        addrs.push(new ContactAddress(formatted, type, street, pref, locality, region, postCode, country));
        j++;
      }
    }
    else
    //single address
    {
      formatted = item['gd:structuredPostalAddress']['gd:formattedAddress'];
      type = item['gd:structuredPostalAddress']['@'].rel === undefined ? 'other' : item['gd:structuredPostalAddress']['@'].rel.substr(('http://schemas.google.com/g/2005#').length);
      street = item['gd:structuredPostalAddress']['gd:street'];
      pref = true;
      locality = item['gd:structuredPostalAddress']['gd:city'];
      region = item['gd:structuredPostalAddress']['gd:region'];
      postCode = item['gd:structuredPostalAddress']['gd:postcode'];
      country = item['gd:structuredPostalAddress']['gd:country'];

      addrs.push(new ContactAddress(formatted, type, street, pref, locality, region, postCode, country));
    }
  }

  var ims = [];
  if (item['gd:im'] !== undefined) //contact has im
  {
    if (item['gd:im'].length !== undefined) //if is an array
    {
      //TODO rewrite with for loop
      j = 0;
      addr = item['gd:im'][j]['@'].address;
      type = item['gd:im'][j]['@'].protocol.substr(('http://schemas.google.com/g/2005#').length);
      pref = 'true';
      ims.push(new ContactField(addr, type, pref));
      j++;
      while (j < item['gd:im'].length)
      {
        addr = item['gd:im'][j]['@'].address;
        type = item['gd:im'][j]['@'].protocol.substr(('http://schemas.google.com/g/2005#').length);
        pref = false;
        ims.push(new ContactField(addr, type, pref));
        j++;
      }
    }
    else
    //single address
    {
      addr = item['gd:im']['@'].address;
      type = item['gd:im']['@'].protocol.substr(('http://schemas.google.com/g/2005#').length);
      pref = 'true';
      ims.push(new ContactField(addr, type, pref));
    }
  }
  /*
   * 'gd:organization': { 'gd:orgName': 'Empire, Inc.', '@': { rel:
   * 'http://schemas.google.com/g/2005#other' }, 'gd:orgTitle': 'Death Star' },
   * 
   * ContactOrganization(_name, _type, _pref, _title, _department)
   */

  var orgs = [];
  if (item['gd:organization'] !== undefined)
  {
    orgs.push(new ContactOrganization(item['gd:organization']['gd:orgName'], item['gd:organization']['@'].rel
      .substr(('http://schemas.google.com/g/2005#').length)), true, item['gd:organization']['gd:orgTitle'],
      item['gd:organization']['gd:orgDepartment']);
  }
  var rev = new Date(item.updated);

  var birthday = item['gContact:birthday'] === undefined ? "" : new Date(item['gContact:birthday']['@'].when);
  var gender = item['gContact:gender'];
  var note = item['gContact:jot'];
  var photos = [];
  //console.log("PICTURE",picture.length)
  if (picture.length > 0)
  {
    photos.push(new ContactField(picture, 'file', true));
  }

  var catgories = [];

  var urls = [];
  if (item['gContact:website'] !== undefined) //contact has url
  {
    if (item['gContact:website'].length !== undefined) //if is an array
    {
      //TODO rewrite with for loop
      j = 0;
      addr = item['gContact:website'][j]['@'].href;
      type = item['gContact:website'][j]['@'].rel;

      urls.push(new ContactField(addr, type));
      j++;
      while (j < item['gContact:website'].length)
      {
        addr = item['gContact:website'][j]['@'].href;
        type = item['gContact:website'][j]['@'].rel;

        urls.push(new ContactField(addr, type));
        j++;
      }
    }
    else
    //single address
    {
      addr = item['gContact:website']['@'].href;
      type = item['gContact:website']['@'].rel;

      urls.push(new ContactField(addr, type));
    }
  }

  var timezone = "";

  //FINALLY
  callback(null, new Contact(id, displayName, name, nickname, phonenumbers, emails, addrs, ims, orgs, rev, birthday,
    gender, note, photos, catgories, urls, timezone));
}

/**
 * Perform authentication with google and store token in token return true if
 * success
 */
//function logMeIn(username, password)
this.logIn = function(username, password, callback)
{
  "use strict";
  //USERNAME = full username, e.g. your_username@gmail.com
  if (username.search('@gmail.com') === -1)
  {
    USERNAME = username+'@gmail.com';
  }
  else
  {
    USERNAME = username;
  }
  var tokenRequirementData = {
    accountType : "GOOGLE",
    service: "cp",
    credentials : {
    username : USERNAME,
    password: password
    }
  };

	//authentication module call
	auth.getToken(tokenRequirementData, function (authToken) {
		if (authToken !== null && authToken !== undefined) {
			TOKEN=authToken;
			callback(true);
		}
		else {
			console.log('Error, token bad or invalid: ', authToken);
			callback(false);
		}
	}

  );

};

/**
 * return true if logged in (token not empty)
 */
this.isLoggedIn = function(callback)
{
  "use strict";
  callback(TOKEN !== "");
};

/**
 * return list of all contacts through callback
 */
this.getContacts = function(callback)
{
  "use strict";
  var seqObj = require('seq');
  seqObj([ TOKEN, USERNAME ]).seq(function(token, username)
  {
    //TODO if username not empty
    var contactsGet =
    {
      host : "www.google.com",
      path : '/m8/feeds/contacts/' + encodeURI(username) + '/full?max-results=9999&v=3.0',//'http://www.google.com/calendar/feeds/default/owncalendars/full?alt=jsonc',
      port : 443,
      method : "GET",
      headers :
      {
        'Authorization' : 'GoogleLogin auth=' + token
      }
    };

    var get_contacts_req = https.request(contactsGet, this.ok);
    get_contacts_req.end();

  }).seq(function(response)
  {
    var emitter = new EventEmitter();
    if (response.statusCode === 302)
    {
      var path = url.parse(response.headers.location).pathname + "?" + url.parse(response.headers.location).query;
      console.log("<DBG>" + response.statusCode,path);
     // getContactFeed();
    }
    else
    {
      var buffer = "";
      response.on("data", function(data)
      {
        buffer += data;
      });

      response.on("end", function()
      {
        xmlParser.parseString(buffer, function(err, result)
        {
          emitter.emit('done', result.entry);
        });

      });

      response.on("close", function()
      {

      });

      emitter.on('done', this.ok);

    }
  }).flatten().parEach(function(raw_contact, i)
  {
    //IF raw_contact HAS PHOTO
    if (raw_contact.link[0]['@']['gd:etag']) //contact photo exists
    {
      //TODO investigate on why some contact photo is not readable
      //var photo_url = raw_contact['link'][1]['@']['href']; //Get picture data from the given contact 
      var googleName = "https://www.google.com";
      var photo_url = raw_contact.link[0]['@'].href.substr(googleName.length);

      var photoGet =
      {
        host : "www.google.com",
        path : photo_url,
        port : 443,
        method : "GET",
        headers :
        {
          'Authorization' : 'GoogleLogin auth=' + TOKEN
        }
      };

      var self = this;
      var get_photo = https.request(photoGet, function(response)
      {
        response.setEncoding('base64');

        var photo = "";
        response.on("data", function(data)
        {
          photo += data;
        });

        response.on("end", function()
        {
          newContact(i, raw_contact, photo, self.into("" + i));
        });

        response.on("close", function()
        {
        });

      });
      get_photo.end();
    }
    //ELSE
    else
    {
      newContact(i, raw_contact, "", this.into("" + i));
    }

  }).seq( //FINALLY JOIN ALL CONTACTS AND CALL callback
  function()
  {
    var contact_list = new Array(Object.keys(this.vars).length);
    for ( var i = 0; i < contact_list.length; i++)
    {
      contact_list[i] = this.vars[i + ""];
    }
    callback(contact_list);
  });
};

