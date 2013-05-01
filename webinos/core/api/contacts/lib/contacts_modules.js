/*******************************************************************************
*    Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*         http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2011 Istituto Superiore Mario Boella (ISMB)
******************************************************************************/


var webinos = require("find-dependencies")(__dirname);
var fs = require("fs");
var path = require("path");
var wPath = webinos.global.require (webinos.global.pzp.location).getWebinosPath();

var local_contacts = '';
try {
    if(process.platform!=='android')
    {
        local_contacts = require('./local_contacts');
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
    RemoteContacts = require('./google_contacts');
} catch (err) {console.log("Could not load remote contacts");}


if(local_contacts && process.platform!=='android') //TODO else JAVA_BRIDGE
{
    LocalContacts = new local_contacts.contacts();
}
else
{
    LocalContacts = local_contacts;
}

var contactsPath = wPath + "/userData/GContacts.json";


/**
 * returns a list of all contact TODO remove once debugging and testing are
 * successfull
 */


function createContact (property)
{
    
    return;
}

function searchAbook(directory)
{
    // TODO: Support multiple *.mab files
    var dirContent;
    try {dirContent = fs.readdirSync(directory);}
    catch(er){return null;}

    for (var i=0; i<dirContent.length; i++)
    {
        console.log(dirContent[i]);
         
        var next = dirContent[i];
         
        if (next === "abook.mab")
        {
            return directory+next;
        }
        else
        {
            var l = searchAbook(path.normalize(directory+next+"/"));
            if (l !== null)
                return l;
        }
    }

    return null;
}

/**
 * Map a native contact type array to a W3C compliant Contact one
 */
function makeW3Ccontacts(successCB, errorCB)
{
    var contacts_l;
    var rawContacts;
    var wID = webinos.global.require (webinos.global.pzp.location).getDeviceName();
    var pzpJsonPath = wPath + "/userData/" + wID + ".json";
    var pzp_json =  {};
	try{
		pzp_json = require(pzpJsonPath);
	}catch(e){
	}
	
    if ( !pzp_json.abook || pzp_json.abook === "")
    {
        // Is this the first time we search for an abook setting?
        var settingInit = (pzp_json.abook !== "");

        if (process.platform === "win32")
        {
            pzp_json.abook = searchAbook(process.env.AppData + "\\Thunderbird\\Profiles\\");
        }
        else if (process.platform === "linux")
        {
            pzp_json.abook = searchAbook(process.env.HOME + "/.thunderbird/");
        }
        // We failed to locate a mab file, let's add a place holder for manual setting.
        if (pzp_json.abook === null) {
            pzp_json.abook = "";
        }
        // Update the abook setting with the file path or an empty placeholder just the first time.
        if (pzp_json.abook !== null && (pzp_json.abook !== "" || settingInit))
        {
            fs.writeFile(pzpJsonPath, JSON.stringify(pzp_json, null, 1), function(arg){
                if(arg)
                    console.log("WRITE JSON: " + arg);
            });
        }
    }
    if (pzp_json.abook !== null && pzp_json.abook !== "")
    {
        // TODO: Support multiple *.mab files
        // TODO: Check if the file exists and update the setting

        LocalContacts.open(pzp_json.abook);
        rawContacts = LocalContacts.getAB();
        contacts_l = new Array(rawContacts.length);
        for ( var i = 0; i < rawContacts.length; i++)
        {
            contacts_l[i] = rawContact2W3CContact(rawContacts[i]);
        }
        
        if (fs.existsSync(contactsPath))
        {
            var contacts_g = fs.readFileSync(contactsPath, 'utf8');
            contacts_g = JSON.parse(contacts_g);
            
            for (var i=0; i<contacts_g.length; i++)
            {
                contacts_l.push(contacts_g[i]);
            }
        }

        contacts_l = JSON.parse(JSON.stringify(contacts_l));
        successCB(contacts_l);
    }else if (fs.existsSync(contactsPath)){ // Return google cached contacts
        var contacts_g = fs.readFileSync(contactsPath, 'utf8');
		contacts_g = JSON.parse(contacts_g);
		successCB(contacts_g);
    }
    else if (errorCB)
        errorCB(this.NOT_FOUND_ERROR);
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
            
            _photo = new Buffer(fs.readlinkSync(rawContact.photos[j]['value'].trim())).toString('base64');
        }
        else
        {
            _photo = rawContact.photos[j]['value'].trim();
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


this.syncGoogleContacts=function(params, successCB, errorCB)
{
    var that = this;
    
    if(process.platform === "android")
    {
        errorCB(this.NOT_SUPPORTED_ERROR);
        return;
    }
    
    RemoteContacts.logIn(params[0]['usr'], params[0]['pwd'], function(param){
        if (param)
        {
            RemoteContacts.getContacts(that.saveGoogleContacts, errorCB);
        }
        else
        {
            errorCB(this.INVALID_ARGUMENT_ERROR);
        }
    });
    
    that.saveGoogleContacts = function (contacts){
        fs.writeFile(contactsPath, JSON.stringify(contacts, null, 1), function(arg){
            console.log("Google contacts synched");
            //TODO look what writeFile pass as argument at the callback
        });
    };
}




///////////////////CONTACT FIND

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

/**
 * Retrieve a list of contatcs matching fields specified in field TODO should
 * type be handled by this module? TODO make this full W3C specs compliant
 */
this.findContacts = function(filters, successCB, errorCB)
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
        makeW3Ccontacts(function(c_list)
        {
            var res = c_list;
            
            
            res = filterContacts(filters[0], res);
            cb(res)
            if (res.empty && eb)
            {
                throw new ContactError(this.UNKNOWN_ERROR);
            }
        });
    }
    else //on Android
    {
        console.log("---FIND: android, local");
        var options=new Array();
        LocalContacts.find({}, successCB, function(){}, options);
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
function filterContacts(filterObj, c_array)
{
    var ret_array = new Array();
    var push;

    if(!filterObj)
    {
        console.log("filterContacts: error no filter object provided");
        return c_array;
    }
         
    for ( var i = 0; i < c_array.length; i++)
    {
        push = true;
        
        if (filterObj.id && filterObj.id!="")
        {
            if (c_array[i].id !== filterObj.id)
                push = false;
        }
        
        if (filterObj.displayName && filterObj.displayName!="")
        {
            if (c_array[i].displayName !== filterObj.displayName)
            {
                push = false;
            }
        }
        
        //Comparing the "name" complex object 
        if (filterObj.name && filterObj.name!="")
        {
            if(c_array[i].name.formatted !== filterObj.name)
                push = false;
                    
            //This part would enable a comparison between ContactsName objects
            /*
            if (filterObj.name.formatted && filterObj.name.formatted!="")
                if(c_array[i].name.formatted !== filterObj.name.formatted)
                    push = false;
            if (filterObj.name.familyName && filterObj.name.familyName!="")
                if(c_array[i].name.familyName !== filterObj.name.familyName)
                    push = false;
            if (filterObj.name.givenName && filterObj.name.givenName!="")
                if(c_array[i].name.givenName !== filterObj.name.givenName)
                    push = false;
            if (filterObj.name.middleName && filterObj.name.middleName!="")
                if(c_array[i].name.middleName !== filterObj.name.middleName)
                    push = false;        
            if (filterObj.name.honorificPrefix && filterObj.name.honorificPrefix!="")
                if(c_array[i].name.honorificPrefix !== filterObj.name.honorificPrefix)
                    push = false; 
            if (filterObj.name.honorificSuffix && filterObj.name.honorificSuffix!="")
                if(c_array[i].name.honorificSuffix !== filterObj.name.honorificSuffix)
                    push = false;
            */
        }
        
        //Comparing the "nickname"
        if (filterObj.nickname && filterObj.nickname!="")
            if(c_array[i].nickname !== filterObj.nickname)
                push = false;
                
        //Comparing the "displayName"
        if (filterObj.displayName && filterObj.displayName!="")
            if(c_array[i].displayName !== filterObj.displayName)
                push = false;
        
        if (filterObj.addresses)
        {
            if (c_array[i].addresses)
            {
                var p = false;
                for (var j=0; j<c_array[i].addresses.length; j++)
                {
                    var u = true;
                    if (filterObj.addresses.formatted    && filterObj.addresses.formatted!="")
                        if (c_array[i].addresses[j].formatted !== filterObj.addresses.formatted)
                            u = false, console.log("1\n\n");
                    if (filterObj.addresses.streetAddress && filterObj.addresses.streetAddress!="")
                        if (c_array[i].addresses[j].streetAddress !== filterObj.addresses.streetAddress)
                            u = false, console.log("2\n\n");
                    if (filterObj.addresses.locality && filterObj.addresses.locality!="")
                        if (c_array[i].addresses[j].locality !== filterObj.addresses.locality)
                            u = false, console.log("3\n\n");
                    if (filterObj.addresses.region && filterObj.addresses.region!="")
                        if (c_array[i].addresses[j].region !== filterObj.addresses.region)
                            u = false, console.log("4\n\n");
                    if (filterObj.addresses.postalCode && filterObj.addresses.postalCode!="")
                        if (c_array[i].addresses[j].postalCode !== filterObj.addresses.postalCode)
                            u = false, console.log("5\n\n");
                    if (filterObj.addresses.country && filterObj.addresses.country!="")
                        if (c_array[i].addresses[j].country !== filterObj.addresses.country)
                            u = false, console.log("6\n\n");
                    u?p=true:null;
                }
                !p?push=false:null;
            }
            else
                push=false;
        }
        
        
        //Comparing the emails array
        if (filterObj.emails && filterObj.emails!="")
        {
            if (c_array[i].emails)
            {
                var p = false
                for (var j=0; j<c_array[i].emails.length; j++)
                {
                    if (c_array[i].emails[j].value === filterObj.emails)
                        p = true;
                }
                !p?push=false:null; 
            }
            else
                push = false;
        }
        
        //Comparing the organizzations array
        if (filterObj.organizations)
        {
            if(c_array[i].organizations)
            {
                var p = false;
                for (var j=0; j<c_array[i].organizations.length; j++)
                {
                    if (c_array[i].organizations[j].name === filterObj.organizations)
                        p=true;
                }
                !p?push=false:null;
            }
            else
                push = false;
        }
        
        //TODO in order to compare the birthday property check how the json parser parse Date type
        /*if (c_array[i].birthday === filterObj.displayName)
        {
            ret_array.push(c_array[i]);
            continue;
        }*/
        
        //Comparing the phoneNumbers array
        if (filterObj.phoneNumbers)
        {
            if (c_array[i].phoneNumbers)
            {
                var p = false
                for (var j=0; j<c_array[i].phoneNumbers.length; j++)
                {
                    if (filterObj.phoneNumbers &&    filterObj.phoneNumbers!="")
                        if (c_array[i].phoneNumbers[j].value === filterObj.phoneNumbers)
                            p = true;
                }
                !p?push=false:null;
            }
            else
                push = false;
        }
        
        if (filterObj.ims && filterObj.ims!="")
        {
            if (c_array[i].ims)
            {
                var p = false;
                for (var j=0; j<c_array[i].ims.length; j++)
                {
                    if (c_array[i].ims[j].value === filterObj.ims)
                        p=true;
                }
                !p?push=false:null;
            }
            else
                push = false;
        }
        
        if (filterObj.gender && filterObj.gender!="")
            if(c_array[i].gender !== filterObj.gender)
                push = false;
                
        if (filterObj.note && filterObj.note!="")
            if(c_array[i].note !== filterObj.note)
                push = false;
                
        if (filterObj.categories && filterObj.categories!="")
        {
            if (c_array[i].categories)
            {
                var p = false;
                for (var j=0; j<c_array[i].categories.length; j++)
                {
                    if(c_array[i].categories[j] === filterObj.categories)
                        p=true;
                }
                !p?push=false:null;
            }
            else
                push = false;
        }
         
        
        if (filterObj.urls && filterObj.urls!="")
        {
            if (c_array[i].urls)
            {
                var p = false;
                for (var j=0; j<c_array[i].urls.length; j++)
                {
                    if (c_array[i].urls[j].value === filterObj.urls)
                            p=true;
                }
                !p?push=false:null;
            }
            else
                push = false;
        }
        
        if (filterObj.timezone && filterObj.timezone!="")
            if(c_array[i].timezone !== filterObj.timezone)
                push = false;
        
        
        if (push)
            ret_array.push(c_array[i]);
    }
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

this.NOT_FOUND_ERROR = 8;

this.PERMISSION_DENIED_ERROR = 20;

/**
 * code should assume one of the values above
 */
function ContactError(_code)
{
    this.code = _code; // readonly ?
};
    
