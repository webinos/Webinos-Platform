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

/**
 * Empty Constructor for ContactName Implements W3C ContactName as in
 * http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactName()
{
	"use strict";
}

ContactName.prototype.formatted = "";
ContactName.prototype.familyName = "";
ContactName.prototype.givenName = "";
ContactName.prototype.middleName = "";
ContactName.prototype.honorificPrefix = "";
ContactName.prototype.honorificSuffix = "";

//ContactName.prototype.toString = function()
//{
//	"use strict";
//  return name.formatted + "";
//};

/**
 * Constructor for ContactName with type checks. Implements W3C ContactName as
 * in http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactName(_formatted, _family, _given, _middle, _pre, _suf)
{
	"use strict";
  if (_formatted)
  {
    this.formatted = _formatted["$t"];
  }
  if (_family)
  {
    this.familyName = _family["$t"];
  }
  if (_given)
  {
    this.givenName = _given["$t"];
  }
  if (_middle)
  {
    this.middleName = _middle["$t"];
  }
  if (_pre)
  {
    this.honorificPrefix = _pre["$t"];
  }
  if (_suf)
  {
    this.honorificSuffix = _suf["$t"];
  }
}

/**
 * Empty Constructor for ContactField. Implements W3C ContactField as in
 * http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactField()
{
  "use strict";
}

ContactField.prototype.type = "";
ContactField.prototype.value = "";
ContactField.prototype.pref = false;

//ContactField.prototype.toString = function()
//{
//  if (!this.isEmpty())
//    return this.type + ": " + this.value + (this.pref ? " *" : "") + "";
//  else
//    return "";
//};

ContactField.prototype.isEmpty = function()
{
	"use strict";
  return (this.value === "");
};

/**
 * Constructor for ContactField with type checks. Implements W3C ContactField as
 * in http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactField(_value, _type, _pref)
{
  "use strict";
  if (_value)
  {
    this.value = String(_value);
  }
  if (_type)
  {
    this.type = String(_type);
  }
  if (_pref)
  {
    this.pref = Boolean(_pref);
  }
}

/**
 * Empty Constructor for ContactAddress. Implements W3C ContactAddress as in
 * http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactAddress()
{
 "use strict";
}

ContactAddress.prototype.pref = false;
ContactAddress.prototype.type = "";
ContactAddress.prototype.formatted = "";
ContactAddress.prototype.streetAddress = "";
ContactAddress.prototype.locality = "";
ContactAddress.prototype.region = "";
ContactAddress.prototype.postalCode = "";
ContactAddress.prototype.country = "";

/**
 * Constructor for ContactAddress with type checks. Implements W3C
 * ContactAddress as in
 * http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactAddress(_formatted, _type, _street, _pref, _locality, _region, _postalCode, _country)
{
  "use strict";
  if (_pref)
  {
    this.pref = Boolean(_pref);
  }
  if (_type)
  {
    this.type = _type;
  }
  if (_formatted)
  {
    this.formatted = _formatted;
  }
  if (_street)
  {
    this.streetAddress = _street;
  }
  if (_locality)
  {
    this.locality = _locality;
  }
  if (_region)
  {
    this.region = _region;
  }
  if (_postalCode)
  {
    this.postalCode = _postalCode;
  }
  if (_country)
  {
    this.country = _country;
  }
}

//ContactAddress.prototype.toString = function()
//{
//  if (!this.isEmpty())
//    return (this.type == "" ? "other" : this.type) + ": " + this.formatted + (this.pref ? " *" : "") + "";
//  else
//    return "";
//};

ContactAddress.prototype.isEmpty = function()
{
  "use strict";
  return (this.formatted === "");
};

/**
 * Empty Constructor for ContactOrganization. Implements W3C ContactOrganization
 * as in http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactOrganization()
{
 "use strict";
}
ContactOrganization.prototype.pref = false;
ContactOrganization.prototype.type = "";
ContactOrganization.prototype.name = "";
ContactOrganization.prototype.department = "";
ContactOrganization.prototype.title = "";

/**
 * Constructor for ContactOrganization with type checks. Implements W3C
 * ContactOrganization as in
 * http://dev.webinos.org/specifications/draft/contacts.html
 */
function ContactOrganization(_name, _type, _pref, _title, _department)
{
  "use strict";
  if (_pref)
  {
    this.pref = Boolean(_pref);
  }
  if (_type)
  {
    this.type = _type.substr(('http://schemas.google.com/g/2005#').length);
  }
  if (_name)
  {
    this.name = _name;
  }
  if (_department)
  {
    this.department = _department;
  }
  if (_title)
  {
    this.title = _title;
  }
}

//ContactOrganization.prototype.toString = function()
//{
//  if (!this.isEmpty())
//    return (this.type == "" ? "other" : this.type) + ": " + this.name + (this.pref ? " *" : "") + "";
//  else
//    return "";
//};

ContactOrganization.prototype.isEmpty = function()
{
	"use strict";
  return (this.name === "");
};

/**
 * Empty Constructor for Contact Implements W3C Contact as in
 * http://dev.webinos.org/specifications/draft/contacts.html
 */
function Contact()
{
	"use strict";
}

Contact.prototype.id = "";
Contact.prototype.displayName = "";
Contact.prototype.name = new ContactName();
Contact.prototype.nickname = "";
Contact.prototype.phoneNumbers = [];
Contact.prototype.emails = [];
Contact.prototype.addresses = [];
Contact.prototype.ims = [];
Contact.prototype.organizations = [];
Contact.prototype.revision = "";
Contact.prototype.birthday = "";
Contact.prototype.gender = "";
Contact.prototype.note = "";
Contact.prototype.photos = [];
Contact.prototype.categories = [];
Contact.prototype.urls = [];
Contact.prototype.timezone = "";

/**
 * Constructor for Contact with type checks Implements W3C Contact as in
 * http://dev.webinos.org/specifications/draft/contacts.html
 */
function Contact(_id, _displayName, _name, _nickname, _phonenumbers, _emails, _addrs, _ims, _orgs, _rev, _birthday,
  _gender, _note, _photos, _catgories, _urls, _timezone)
{
 "use strict";
  if (_id)
  {
    this.id = _id;
  }
  if (_displayName)
  {
    this.displayName = _displayName;
  }
  if (_name && _name instanceof ContactName)
  {
    this.name = _name;
  }
  if (_nickname)
  {
    this.nickname = _nickname;
  }
  if (_phonenumbers && _phonenumbers instanceof Array &&
    (_phonenumbers.length > 0 && (_phonenumbers[0] instanceof ContactField)))
  {
    this.phoneNumbers = _phonenumbers;
  }
  if (_emails && _emails instanceof Array && (_emails.length > 0 && (_emails[0] instanceof ContactField)))
  {
    this.emails = _emails;
  }
  if (_addrs && _addrs instanceof Array && (_addrs.length > 0 && (_addrs[0] instanceof ContactAddress)))
  {
    this.addresses = _addrs;
  }
  if (_ims && _ims instanceof Array && (_ims.length > 0 && (_ims[0] instanceof ContactField)))
  {
    this.ims = _ims;
  }
  if (_orgs && _orgs instanceof Array && (_orgs.length > 0 && (_orgs[0] instanceof ContactOrganization)))
  {
    this.organizations = _orgs;
  }
  if (_rev && _rev instanceof Date)
  {
    this.revision = _rev;
  }
  if (_birthday && _birthday instanceof Date)
  {
    this.birthday = _birthday;
  }
  if (_gender)
  {
    this.gender = _gender;
  }
  if (_note)
  {
    this.note = _note;
  }
  if (_photos && _photos instanceof Array)
  {
    this.photos = _photos;
  }
  if (_catgories && _catgories instanceof Array && (_catgories.length > 0 && (_catgories[0] instanceof String)))
  {
    this.categories = _catgories;
  }
  if (_urls)
  {
    this.urls = _urls;
  }
  if (_timezone)
  {
    this.timezone = _timezone;
  }
}


//Export classes
this.Contact=Contact;
this.ContactField=ContactField;
this.ContactName=ContactName;
this.ContactAddress=ContactAddress;
this.ContactOrganization=ContactOrganization;
