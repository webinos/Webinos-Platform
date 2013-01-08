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

//var webinosRoot=process.env.WEBINOS_PATH; //TODO a try/catch block?
//var moduleRoot=webinosRoot+'/api/contacts/lib';

var webinos = require("find-dependencies")(__dirname);

var local_contacts = '';
try {
	if(process.platform!=='android')
	{
		local_contacts = require('./local_contacts');;
	}
	else //on android
	{
		local_contacts = require('bridge').load('org.webinos.impl.ContactManagerImpl', this);
	}
} catch (err) {console.log("err1" + err)}

var c_def_path;
try{
	c_def_path = require('./contacts_def');
} catch (err) {console.log("Could not load contacts_def");}

var Contact = c_def_path.Contact;
var ContactField = c_def_path.ContactField;
var ContactName = c_def_path.ContactName;
var ContactAddress = c_def_path.ContactAddress;
var ContactOrganization = c_def_path.ContactOrganization;

/**
 * Instances of remote contacts and local contacts
 */

var RemoteContacts;
try{
	RemoteContacts = require('./google_contacts');//new remote_contacts.contacts();
} catch (err) {console.log("Could not load remote contacts");}


if(local_contacts && process.platform!=='android') //TODO else JAVA_BRIDGE
{
	LocalContacts = new local_contacts.contacts();
}
else
{
	LocalContacts = local_contacts;
}


/**
 * Either open a local address book or perform login into GMail account TODO
 * this method has to be removed when user profile will handle authentication
 */
this.authenticate=function(params, successCB, errorCB)
{
    //ACCESS TO ANDROID CONTACTS
    if (params[0].type === 'local') {
        if (process.platform === 'android') {
            successCB();
        }
        else //on other platforms
        {
            console.log("---contacts: opening address book");
            if (LocalContacts.open(params[0]['addressBookName'])){
                successCB(true);
            }
            else {
                errorCB(false);
            }
        }
    }
    //ACCESS TO REMOTE CONTACTS
    else if (params[0].type === 'remote') {
        if (process.platform === 'android') {
            //TODO Access through device always granted until P.M. get fixed
            RemoteContacts.logIn(params[0]['usr'], params[0]['pwd'], successCB, errorCB);
        }
        else //on other platforms
        {
            console.log("---contacts: logging in");
            RemoteContacts.logIn(params[0]['usr'], params[0]['pwd'], successCB, errorCB);
        }
    }
    else //wrong type
    {
        console.error("contacts.authenticate: wrong contact type");
        errorCB(new ContactError(this.INVALID_ARGUMENT_ERROR));
    }
}


/**
 * returns true if contacts service is already authenticated with GMail or a
 * valid address book file is aready open TODO this method has to be removed
 * when user profile will handle authentication
 *
 */
this.isAlreadyAuthenticated = function(params, successCB, errorCB)
{
	if (params)
	{
		if (params[0]['type'] == "local" && process.platform!=='android')
		{
            if (LocalContacts.isOpen())
                successCB();
            else
                errorCB(new ContactError(this.PERMISSION_DENIED_ERROR));
		}
		else if (params[0]['type'] == "remote")
		{
			RemoteContacts.isLoggedIn(successCB, errorCB);
		}
		else if (params[0]['type'] == "local" && process.platform==='android')
		{
			//Always
			successCB();
		}
	}
};

/**
 * returns a list of all contact TODO remove once debugging and testing are
 * successfull
 */
this.getAllContacts = function(params, successCB, errorCB)
{
	if(params!==undefined){
		if (process.platform!=='android')
		{
			console.log("in contacts: other platform - remote");
			makeW3Ccontacts(params[0]['type'], successCB, errorCB);
		}
		else // on android
		{
			if (params[0]['type']==='remote')
			{
				console.log("in contacts: android - remote");
				makeW3Ccontacts(params[0]['type'], successCB, errorCB);
			}
			else //local contacts from the phone
			{
				console.log("in contacts: android - local");
				var opt = new Array();
				var fields = {};
				LocalContacts.find(fields, successCB, function(){}, opt);
			}
		}
	}
};

/**
 * Map a native contact type array to a W3C compliant Contact one
 */
function makeW3Ccontacts(type, successCB, errorCB)
{
	var contacts_l;
	var rawContacts;

	if (type == "local")
	{
		// get an array of local contacts
		rawContacts = LocalContacts.getAB();
		contacts_l = new Array(rawContacts.length);
		for ( var i = 0; i < rawContacts.length; i++)
		{
			contacts_l[i] = rawContact2W3CContact(rawContacts[i]);
		}

		successCB(contacts_l);
	}
	else if (type == "remote")
	{
		// get an array of remote contacts
		RemoteContacts.getContacts(successCB, errorCB);
	}

}

/**
 * map a raw (c++ like) contact to a w3c typed contact
 */
function rawContact2W3CContact(rawContact)
{
	//Fill Contact Name
	var _contactName = new ContactName(rawContact.name['formatted'], rawContact.name['familyName'],
		rawContact.name['givenName'], rawContact.name['middleName'], rawContact.name['honorificPrefix'],
		rawContact.name['honorificSuffix']);

	//Phone Numbers
	var _contactPhoneNumbers = new Array(rawContact.phoneNumbers.length);
	for ( var j = 0; j < rawContact.phoneNumbers.length; j++)
	{
		_contactPhoneNumbers[j] = new ContactField(rawContact.phoneNumbers[j]['value'], rawContact.phoneNumbers[j]['type'],
		Boolean(rawContact.phoneNumbers[j]['pref'] == "true"));
	}

	//Email Addresses
	var _contactEmails = new Array(rawContact.emails.length);
	for ( var j = 0; j < rawContact.emails.length; j++)
	{
		_contactEmails[j] = new ContactField(rawContact.emails[j]['value'], rawContact.emails[j]['type'],
		Boolean(rawContact.emails[j]['pref'] == "true"));
	}

	//Post Addresses _formatted
	var _contactAddresses = new Array(rawContact.addresses.length);
	for ( var j = 0; j < rawContact.addresses.length; j++)
	{
		_contactAddresses[j] = new ContactAddress(rawContact.addresses[j]['formatted'], rawContact.addresses[j]['type'],
		rawContact.addresses[j]['streetAddress'], Boolean(rawContact.addresses[j]['pref'] == "true"));
	}

	//Instant Messengers
	var _contactIms = new Array(rawContact.ims.length);
	for ( var j = 0; j < rawContact.ims.length; j++)
	{
		_contactIms[j] = new ContactField(rawContact.ims[j]['value'], rawContact.ims[j]['type'],
		Boolean(rawContact.ims[j]['pref'] == "true"));
	}

	//Organizations
	var _contactOrgs = new Array(rawContact.organizations.length);
	for ( var j = 0; j < rawContact.organizations.length; j++)
	{
		_contactOrgs[j] = new ContactOrganization(rawContact.organizations[j]['name'], rawContact.organizations[j]['type'],
		Boolean(rawContact.organizations[j]['pref'] == "true"), rawContact.organizations[j]['title']);
	}

	//Urls
	var _contactUrls = new Array(rawContact.urls.length);
	for ( var j = 0; j < rawContact.urls.length; j++)
	{
		_contactUrls[j] = new ContactField(rawContact.urls[j]['value'], rawContact.urls[j]['type'],
		Boolean(rawContact.urls[j]['pref'] == "true"));
	}

	//Photos (always 1, with libGCal)
	var _contactPhotos = new Array(rawContact.photos.length);
	for ( var j = 0; j < rawContact.photos.length; j++)
	{
		//Constructor ContactField(_value, _type, _pref)
		var _photo = "";
		if (rawContact.photos[j]['value'].trim().indexOf('file:') === 0)
		{
			var fs = require('fs');
			var Buffer = require('buffer').Buffer;
			//var constants = require('constants');
			
			_photo = new Buffer(fs.readlinkSync(rawContact.photos[j]['value'].trim())).toString('base64')
		}
		else
		{
			_photo = rawContact.photos[j]['value'].trim()
		}
		
		_contactPhotos[j] = new ContactField(_photo, rawContact.photos[j]['type'],
		Boolean(rawContact.photos[j]['pref'] == "true"));
	}

	//Fill Contact
	/*
	 * _id, _displayName, _name, _nickname, _phonenumbers, _emails, _addrs, _ims,
	 * _orgs, _rev, _birthday, _gender, _note, _photos, _catgories, _urls,
	 * _timezone
	 *
	 */

	var _contact = new Contact(rawContact.id, rawContact.displayName, _contactName, rawContact.nickname,
		_contactPhoneNumbers, _contactEmails, _contactAddresses, _contactIms, _contactOrgs, new Date(rawContact.revision),
		new Date(rawContact.birthday), rawContact.gender, rawContact.note, _contactPhotos, rawContact.categories,
		_contactUrls, rawContact.timezone);

	return _contact;
}

// /////////////////CONTACT FIND

function ContactFindOptions()
{

}
ContactFindOptions.prototype.filter = "";
ContactFindOptions.prototype.multiple = false;
ContactFindOptions.prototype.updatedSince = ""; //is a Date

/**
 * callback used to internally retrieve some data
 *
 * @param par
 */
function simpleCallback(par)
{
	return par;
}

/**
 * Call find() according to the type specified in params TODO remove once
 * authentication is handled somewhere else
 */
//this.findContacts = function(params, callback)
//{
//	if (params)
//		this.find(params[0]['type'], params[0]['fields'], callback);
//}
/*
 * caller void find( DOMString [] fields, ContactFindCB successCB, optional
 * ContactErrorCB errorCB, optional ContactFindOptions options);
 */

/**
 * Retrieve a list of contatcs matching fields specified in field TODO should
 * type be handled by this module? TODO make this full W3C specs compliant
 */
this.find = function(type, fields, successCB, errorCB, options)
{
	var cb = successCB;
	if (cb == null || cb == undefined)
		throw TypeError("Please provide a success callback");

	var eb = errorCB;

	if( process.platform !== 'android')
	{
		/*
		* TODO how to do the following? If there is a task from the device task
		* source in one of the task queues (e.g. an existing find() operation is
		* still pending a response), run these substeps:
		*
		* If errorCallback is not null, let error be a ContactError object whose code
		* attribute has the value PENDING_OPERATION_ERROR and queue a task to invoke
		* errorCallback with error as its argument.
		*
		* Abort this operation. Return, and run the remaining steps asynchronously.
		*/

		// initialize contacs_l with all contacts
		//TODO should we cache the contact list somewhere in this module for speed up?
		makeW3Ccontacts(type, function(params)
		{
			//var contacts_l = params;
			(function(c_list)
			{
				var res = c_list;

				if (res.length >0)
				{
					for ( var key in fields) //split key if necessary
					{
						res = filterContacts(key, fields[key], res);
					}
					cb(res);
				}
				else if (res.empty && eb)
				{
					throw new ContactError(this.UNKNOWN_ERROR);
				}
			})(params);
		});
	}
	else //on Android
	{
		if(type==='remote')
		{
			console.log("---FIND: android, remote");
			makeW3Ccontacts(type, function(params)
			{
			//var contacts_l = params;
				(function(c_list)
				{
					var res = c_list;

					if (res.length >0)
					{
						for ( var key in fields) //split key if necessary
						{
							res = filterContacts(key, fields[key], res);
						}
						cb(res);
					}
					else if (res.empty && eb)
					{
						throw new ContactError(this.UNKNOWN_ERROR);
					}
				})(params);
			});
		}
		else
		{
			console.log("---FIND: android, local");
			if(!options)
				options=new Array();
			LocalContacts.find(fields, successCB, function(){}, options);
		}
	}
};

/**
 * Filter contacts by checking their attributes key and values are always string
 *
 * c_array array of Contacts to filter key = Contact property name value = value
 * to be checked
 *
 * returns a filtered array of Contacts or an empty array
 */
function filterContacts(key, value, c_array)
{
	var ret_array = new Array();

	for ( var i = 0; i < c_array.length; i++)
	{
		//TODO decomment following if only if we want to add more search options
//		if (typeCheck(key, String) || typeCheck(key, "string")) //TODO if we allow user to use dot notation, check if key is a single string or a string array
//		{
		//Check String type Contact fields
		if (typeCheck(c_array[i][key], String) || typeCheck(c_array[i][key], "string")) // string types like displayName, nickname and so on
		{
			var rex = new RegExp("\\b" + value + "\\b", "gim");
			if (rex.test(c_array[i][key])) //TODO use ->(c_array[i][key] == value) if we wan exact case sensitive match
				ret_array.push(c_array[i]);
		}
		//Check Date type Contact fields
		else if (typeCheck(c_array[i][key], Date))
		{
			if (stringEqDate(value, c_array[i][key]))
				ret_array.push(c_array[i]);
		}
		else if (typeCheck(c_array[i][key], ContactName)) // query type "name":"Paolo"
		{
			for ( var f in c_array[i][key])
			{
				var rex = new RegExp("\\b" + value + "\\b", "gim");
				if (rex.test(c_array[i][key][f])) //TODO use ->(c_array[i][key][f] == value) if we wan exact case sensitive match
				{
					ret_array.push(c_array[i]);
					break;
				}
			}
		}
		else if (typeCheck(c_array[i][key], Array))
		{
			if (c_array[i][key].length > 0) //Supposing Array is uniform, which is not granted in JS!
			{
				if (typeCheck(c_array[i][key][0], ContactField)) //if ContactField, we check only the "value" field
				{
					for ( var j = 0; j < c_array[i][key].length; j++)
					{
						if (c_array[i][key][j]["value"] == value)
						{
							ret_array.push(c_array[i]);
							break;
						}
					}
				}
				else if (typeCheck(c_array[i][key][0], ContactAddress))
				{
					for ( var j = 0; j < c_array[i][key].length; j++)
					{
						//use of regular expression to search into formatted address string
						var rex = new RegExp("\\b" + value + "\\b", "gim");
						if (rex.test(c_array[i][key][j]["formatted"]))
						{
							ret_array.push(c_array[i]);
							break;
						}
					}
				}
				else if (typeCheck(c_array[i][key][0], ContactOrganization))
				{
					for ( var j = 0; j < c_array[i][key].length; j++)
					{
						//use of regular expression to search into formatted address string
						var rex = new RegExp("\\b" + value + "\\b", "gim");
						if (rex.test(c_array[i][key][j]["type"]) || rex.test(c_array[i][key][j]["name"]) ||
							rex.test(c_array[i][key][j]["department"]) || rex.test(c_array[i][key][j]["title"]))
						{
							ret_array.push(c_array[i]);
							break;
						}
					}
				}
			}
		}
	}
//		else if (typeCheck(key, Array)) //Key is in format ["name" "familyName"] //TODO only if we want to add more search options
//		{
//
//		}
//	}
	return ret_array;
}

/**
 * Check types of object obj Tries to uniform typeof and instanceof, literals
 * and Objects e.g. String or string type may be either a string or a function
 */
function typeCheck(obj, type)
{
	var res = false;
	if (typeof (type) == "string")
	{
		if (typeof (obj) == type)
			res = true;
	}
	else if (typeof (type) == "function")
	{
		if (obj instanceof type)
			res = true;
	}
	return res;
}

/**
 * Compare a string with a date to a Date obj Needed to compare only Year, Month
 * and Date without making a mess with hours and timezones e.g. birthdays
 */
function stringEqDate(dateStr, date)
{
	var tmp = new Date(dateStr);
	return (tmp.getFullYear() == date.getFullYear() && tmp.getMonth() == date.getMonth() && tmp.getDate() == date.getDate())
}

// //////////////////////ERROR HANDLING
this.UNKNOWN_ERROR = 0;

this.INVALID_ARGUMENT_ERROR = 1;

this.TIMEOUT_ERROR = 2;

this.PENDING_OPERATION_ERROR = 3;

this.IO_ERROR = 4;

this.NOT_SUPPORTED_ERROR = 5;

this.PERMISSION_DENIED_ERROR = 20;

/**
 * code should assume one of the values above
 */
function ContactError(_code)
{
	this.code = _code; // readonly ?
};
	
