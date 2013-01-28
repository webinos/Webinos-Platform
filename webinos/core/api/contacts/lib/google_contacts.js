/*******************************************************************************
*	Code contributed to the webinos project
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*	
*		 http://www.apache.org/licenses/LICENSE-2.0
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

var path = require('path');

//Webinos contact definition
var c_def_path = require('./contacts_def');
var Contact = c_def_path.Contact;
var ContactField = c_def_path.ContactField;
var ContactName = c_def_path.ContactName;
var ContactAddress = c_def_path.ContactAddress;
var ContactOrganization = c_def_path.ContactOrganization;

//Authentication module
var auth = require('./authentication_module');

//GLOBAL VAR //TODO an object?
var TOKEN = "";
var USERNAME = "";


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
	var id = item.id["$t"];
    var contactIndex = i;
	var displayName = item.title["$t"];
	var j;
	var num, type, pref,addr;
	
	var name = (item['gd$name'] === undefined) ? new ContactName() : new ContactName(item['gd$name']['gd$fullName'], item['gd$name']['gd$familyName'],
		item['gd$name']['gd$givenName'], item['gd$name']['gd$middleName'], item['gd$name']['gd$namePrefix'],
		item['gd$name']['gd$nameSuffix']);

    if(item['gContact$nickname'])
        var nickname = item['gContact$nickname']["$t"];
	var phonenumbers = [];
	if (item['gd$phoneNumber'] !== undefined) //contact has email
	{
        for (j=0; j<item['gd$phoneNumber'].length; j++)
        {
            num = item['gd$phoneNumber'][j]["$t"];
            type = item['gd$phoneNumber'][j].rel === undefined ? 'other' :item['gd$phoneNumber'][j].rel.substr(('http://schemas.google.com/g/2005#').length);
            pref = j==0?true:false;
            phonenumbers.push(new ContactField(num, type, pref));
        }
	}

	var emails = [];
	if (item['gd$email'] !== undefined) //contact has email
	{
        for (j=0; j<item['gd$email'].length; j++)
        {
            addr = item['gd$email'][j].address;
            type = item['gd$email'][j].rel === undefined ? 'other':item['gd$email'][j].rel.substr(('http://schemas.google.com/g/2005#').length);
            pref = item['gd$email'][j].primary;
            emails.push(new ContactField(addr, type, pref));
        }
	}
	/*
	 * 'gd$structuredPostalAddress': [ { 'gd$pobox': '12223',
	 * 'gd$formattedAddress': 'via della morte nera 56\n12223\nCoruscant,
	 * Tatooine, Galaxy far far away 66666\nUniverse', 'gd$postcode': '66666',
	 * 'gd$region': 'Galaxy far far away', 'gd$country': 'Universe', '$': { rel:
	 * 'http://schemas.google.com/g/2005#home' }, 'gd$city': 'Tatooine',
	 * 'gd$neighborhood': 'Coruscant', 'gd$street': 'via della morte nera 56' }, {
	 * 'gd$formattedAddress': 'morte nera 555', '$': { rel:
	 * 'http://schemas.google.com/g/2005#work' }, 'gd$street': 'morte nera 555' }, {
	 * 'gd$formattedAddress': 'via spazio 8', '$': { label: 'Spazio' },
	 * 'gd$street': 'via spazio 8' }, [length]: 3 ],
	 * 
	 * function ContactAddress(_formatted, _type, _street, _pref, _locality,
	 * _region, _postalCode, _country)
	 */
	var addrs = [];
	var formatted, locality, street, region, postCode, country;
	if (item['gd$structuredPostalAddress'] !== undefined) //contact has email
	{
		if (item['gd$structuredPostalAddress'].length !== undefined) //if is an array
		{
            for (j=0; j<item['gd$email'].length; j++)
			{
                if (formatted = item['gd$structuredPostalAddress'][j]['gd$formattedAddress'])
                {
                    formatted = item['gd$structuredPostalAddress'][j]['gd$formattedAddress']["$t"];
                }
				type = 'other';
				if(item['gd$structuredPostalAddress'][j].rel !==undefined)
                {
                    type = item['gd$structuredPostalAddress'][j].rel.substr(('http://schemas.google.com/g/2005#').length);
                }
                if(item['gd$structuredPostalAddress'][j]['gd$street'])
                {
                    street = item['gd$structuredPostalAddress'][j]['gd$street']["$t"];
                }
                j==0?pref=true:pref=false;
                if(item['gd$structuredPostalAddress'][j]['gd$city'])
                {
                    locality = item['gd$structuredPostalAddress'][j]['gd$city']["$t"];
                }
                if(item['gd$structuredPostalAddress'][j]['gd$region'])
                {
                    region = item['gd$structuredPostalAddress'][j]['gd$region']["$t"];
                }
                if(item['gd$structuredPostalAddress'][j]['gd$postcode'])
                {
                    postCode = item['gd$structuredPostalAddress'][j]['gd$postcode']["$t"];
                }
                if(item['gd$structuredPostalAddress'][j]['gd$country'])
                {
                    country = item['gd$structuredPostalAddress'][j]['gd$country']["$t"];
                }

				addrs.push(new ContactAddress(formatted, type, street, pref, locality, region, postCode, country));
			}
		}
		else
		//single address
		{
            if (item['gd$structuredPostalAddress'][j]['gd$formattedAddress'])
                formatted = item['gd$structuredPostalAddress']['gd$formattedAddress']["$t"];
			type = item['gd$structuredPostalAddress'].rel === undefined ? 'other' : item['gd$structuredPostalAddress'].rel.substr(('http://schemas.google.com/g/2005#').length);
			if(item['gd$structuredPostalAddress'][j]['gd$street'])
                street = item['gd$structuredPostalAddress']['gd$street']["$t"];
			pref = true;
            if(item['gd$structuredPostalAddress']['gd$city'])
                locality = item['gd$structuredPostalAddress']['gd$city']["$t"];
            if(item['gd$structuredPostalAddress']['gd$region'])
                region = item['gd$structuredPostalAddress']['gd$region']["$t"];
            if(item['gd$structuredPostalAddress']['gd$postcode'])
                postCode = item['gd$structuredPostalAddress']['gd$postcode']["$t"];
            if(item['gd$structuredPostalAddress']['gd$country'])
                country = item['gd$structuredPostalAddress']['gd$country']["$t"];

			addrs.push(new ContactAddress(formatted, type, street, pref, locality, region, postCode, country));
		}
	}

	var ims = [];
	if (item['gd$im'] !== undefined) //contact has im
	{
		if (item['gd$im'].length !== undefined) //if is an array
		{
			//TODO rewrite with for loop
			j = 0;
			addr = item['gd$im'][j].address;
			type = item['gd$im'][j].protocol.substr(('http://schemas.google.com/g/2005#').length);
			pref = 'true';
			ims.push(new ContactField(addr, type, pref));
			j++;
			while (j < item['gd$im'].length)
			{
				addr = item['gd$im'][j].address;
				type = item['gd$im'][j].protocol.substr(('http://schemas.google.com/g/2005#').length);
				pref = false;
				ims.push(new ContactField(addr, type, pref));
				j++;
			}
		}
		else
		//single address
		{
			addr = item['gd$im'].address;
			type = item['gd$im'].protocol.substr(('http://schemas.google.com/g/2005#').length);
			pref = 'true';
			ims.push(new ContactField(addr, type, pref));
		}
	}
	/*
	 * 'gd$organization': { 'gd$orgName': 'Empire, Inc.', '$': { rel:
	 * 'http://schemas.google.com/g/2005#other' }, 'gd$orgTitle': 'Death Star' },
	 * 
	 * ContactOrganization(_name, _type, _pref, _title, _department)
	 */

	var orgs = [];
	if (item['gd$organization'] !== undefined)
	{
		var util = require('util');
		console.log(util.inspect(item['gd$organization'], true, 10));
		orgs.push(new ContactOrganization(item['gd$organization']['gd$orgName'], item['gd$organization'].rel), true, item['gd$organization']['gd$orgTitle'],
			item['gd$organization']['gd$orgDepartment']);
	}
	
	var rev = new Date(item.updated);

	var birthday = item['gContact$birthday'] === undefined ? "" : new Date(item['gContact$birthday'].when);
	var gender = item['gContact$gender'];
	var note = item['gContact$jot'];
	var photos = [];
	//console.log("PICTURE",picture.length)
	if (picture.length > 0)
	{
		photos.push(new ContactField(picture, 'file', true));
	}

	var catgories = [];

	var urls = [];
	if (item['gContact$website'] !== undefined) //contact has url
	{
		if (item['gContact$website'].length !== undefined) //if is an array
		{
			//TODO rewrite with for loop
			j = 0;
			addr = item['gContact$website'][j].href;
			type = item['gContact$website'][j].rel;

			urls.push(new ContactField(addr, type));
			j++;
			while (j < item['gContact$website'].length)
			{
				addr = item['gContact$website'][j].href;
				type = item['gContact$website'][j].rel;

				urls.push(new ContactField(addr, type));
				j++;
			}
		}
		else
		//single address
		{
			addr = item['gContact$website'].href;
			type = item['gContact$website'].rel;

			urls.push(new ContactField(addr, type));
		}
	}

	var timezone = "";

	//FINALLY
	callback(contactIndex, new Contact(id, displayName, name, nickname, phonenumbers, emails, addrs, ims, orgs, rev, birthday,
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
	
    USERNAME = username;
        
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
this.isLoggedIn = function(successCB, errorCB)
{
	"use strict";
    //TODO: It should be like this:
    //successCB(TOKEN !== "");
	if (TOKEN !== "")
        successCB();
    else
        errorCB();
};

/**
 * return list of all contacts through callback
 */
this.getContacts = function(successCB, errorCB)
{
	"use strict";
    // Keep the context of this function for asynchronous calls.
    var that = this;

    // Get the contact list
    var contactsGet = {
        host:"www.google.com",
        path:'/m8/feeds/contacts/' + encodeURI(USERNAME) + '/full?v=3.0&max-results=9999&alt=json',
        port:443,
        method:"GET",
        headers:{
            'Authorization':'GoogleLogin auth=' + TOKEN
        }
    };
    var get_contacts_req = https.request(contactsGet, function (res) {
        // console.log("statusCode: ", res.statusCode);
        // console.log("headers: ", res.headers);
        // TODO: Properly handle error codes from google. 401 pops some times...
        if (res.statusCode === 200) {
            var buffer = "";
            res.on('data',
                function (d) {
                    buffer += d;
                }
            );
            res.on('end', function () {
                var jsonObj = eval ("(" + buffer +")");
                
                that.processJsonContacts(jsonObj.feed.entry);
            });
        }else{
            console.log("Error getting contact list from Google. Error Code:"+ res.statusCode);
        }
    });
    get_contacts_req.end();
    get_contacts_req.on('error', function (e) {
        console.error(e);
        errorCB(e);
    });

    /**
     * This function takes the google contact list in a raw json format.
     * It will fetch the images for them if they have one.
     * @param contacts
     */
    that.processRawContacts = function(contacts) {
        var self = this;
        self.contacts = contacts;
        self.totalContacts = contacts.length;
        // make a returning contact list with the size of the fetched contacts list. We need it in order to retain the order.
        self.contact_list = new Array(contacts.length);

        /**
         * It will get the image for the give contact index id. will retry if it fails due to restriction of the service
         * More about this issue: https://groups.google.com/d/topic/google-contacts-api/qTjcz_wo68k/discussion
         * @param contactId
         */
        self.safelyGetImages = function (contactId) {
            var contact = self.contacts[contactId];
            //This is how to use it with json format.
            //if (contact.link[0] && contact.link[0]['gd$etag']) {
            //This is how to use it with xml format.
            if (contact.link[0] && contact.link[0]['gd$etag']) { // Check if the contact has photo
                var googleName = "https://www.google.com";
                //This is how to use it with json format.
                //var photo_url = contact.link[0].href.substr(googleName.length);
                //This is how to use it with xml format.
                var photo_url = contact.link[0].href.substr(googleName.length);
                var photoGet =
                {
                    host:"www.google.com",
                    path:photo_url,
                    port:443,
                    method:"GET",
                    headers:{
                        'Authorization':'GoogleLogin auth=' + TOKEN
                    }
                };
                var get_photo = https.request(photoGet, function (response) {
                    if (response.statusCode === 200) { // Check if it is ok or we have to backoff.
                        // We need the entire image in binary in order to correctly convert it to base64.
                        response.setEncoding('binary');
                        var buffer = "";
                        response.on("data", function (data) {
                            buffer += data;
                        });
                        response.on("end", function () {
                            // convert the binary image into base64 in order to place it inline
                            var photo = new Buffer(buffer, 'binary').toString('base64');
                            //Pass the contact for further processing.
                            newContact(contactId, contact, photo, self.getWebinosContact);
                        });
                        response.on("close", function () {
                        });
                    } else { // We need to backoff due to service restriction.
                        // Give some time to retry.
                        // This should work like this: http://googleappsdeveloper.blogspot.gr/2011/12/documents-list-api-best-practices.html
                        setTimeout(function () {self.safelyGetImages(contactId);}, 1000);
                    }
                });
                get_photo.end();
            }else{ // Contact doesn't have a photo.
                //Pass it on for further processing.
                newContact(contactId, contact, "", self.getWebinosContact);
            }
        };
        // This is used in    order to check when we have finished processing all the contacts so that we can return them
        var processedContacts = 0;
        /**
         * It will collect all the processed contacts and store them in the right order (the one we recieved them.
         * It will return the processed contact list to the seccussCB when all contacts are done.
         * @param contactIndex
         * @param contact
         */
        self.getWebinosContact = function(contactIndex, contact){
            self.contact_list[contactIndex] = contact;
            processedContacts++;
            if (processedContacts == self.totalContacts){ // if we collected everything, return the list to the successCB.
                successCB(self.contact_list);
            }
        };
        // Asynchronously get all the contacts' images.
        for (var k = 0; k < contacts.length; k++) {
            self.safelyGetImages(k);
        }
    };
    
    
    that.processJsonContacts = function(contacts) {
		var self = this;
        self.contacts = contacts;
        self.totalContacts = contacts.length;
        // make a returning contact list with the size of the fetched contacts list. We need it in order to retain the order.
        self.contact_list = new Array(contacts.length);

        /**
         * It will get the image for the give contact index id. will retry if it fails due to restriction of the service
         * More about this issue: https://groups.google.com/d/topic/google-contacts-api/qTjcz_wo68k/discussion
         * @param contactId
         */
        self.safelyGetImages = function (contactId) {
            var contact = self.contacts[contactId];
            //This is how to use it with json format.
            //if (contact.link[0] && contact.link[0]['gd$etag']) {
            //This is how to use it with xml format.
            if (contact.link[0] && contact.link[0]["gd$etag"]) 
            { // Check if the contact has photo
                var googleName = "https://www.google.com";
                //This is how to use it with json format.
                //var photo_url = contact.link[0].href.substr(googleName.length);
                //This is how to use it with xml format.
                var photo_url = contact.link[0].href.substr(googleName.length);
                var photoGet = {
                    host:"www.google.com",
                    path:photo_url,
                    port:443,
                    method:"GET",
                    headers:{
                        'Authorization':'GoogleLogin auth=' + TOKEN
                    }
                };
                var get_photo = https.request(photoGet, function (response) {
                    if (response.statusCode === 200) 
                    { // Check if it is ok or we have to backoff.
                        // We need the entire image in binary in order to correctly convert it to base64.
                        response.setEncoding('binary');
                        var buffer = "";
                        response.on("data", function (data) {
                            buffer += data;
                        });
                        response.on("end", function () {
                            // convert the binary image into base64 in order to place it inline
                            var photo = new Buffer(buffer, 'binary').toString('base64');
                            //Pass the contact for further processing.
                            newContact(contactId, contact, photo, self.getWebinosContact);
                        });
                        response.on("close", function () {
                        });
                    } 
                    else
                    { // We need to backoff due to service restriction.
                        // Give some time to retry.
                        // This should work like this: http://googleappsdeveloper.blogspot.gr/2011/12/documents-list-api-best-practices.html
                        setTimeout(function () {self.safelyGetImages(contactId);}, 1000);
                    }
                });
                get_photo.end();
            }
            else
            { // Contact doesn't have a photo.
                //Pass it on for further processing.
                newContact(contactId, contact, "", self.getWebinosContact);
            }
        };
        // This is used in    order to check when we have finished processing all the contacts so that we can return them
        var processedContacts = 0;
        /**
         * It will collect all the processed contacts and store them in the right order (the one we recieved them.
         * It will return the processed contact list to the seccussCB when all contacts are done.
         * @param contactIndex
         * @param contact
         */
        self.getWebinosContact = function(contactIndex, contact){
            self.contact_list[contactIndex] = contact;
            processedContacts++;
            if (processedContacts == self.totalContacts)
            { // if we collected everything, return the list to the successCB.
                successCB(self.contact_list);
            }
        };
        // Asynchronously get all the contacts' images.
        for (var k = 0; k < contacts.length; k++)
        {
            self.safelyGetImages(k);
        }
	}
};
