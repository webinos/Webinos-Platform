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


// var path = require('path');
// var moduleRoot = require(path.resolve(__dirname, '../dependencies.json'));
// var dependencies = require(path.resolve(__dirname, '../' + moduleRoot.root.location + '/dependencies.json'));
// var webinosRoot = path.resolve(__dirname, '../' + moduleRoot.root.location);
// var binaryRoot = path.resolve(__dirname, '../src/build/Release');
//var localcontacts = require(path.resolve(binaryRoot,'localcontacts'));
var localcontacts =  process.binding('localcontacts');
//Pass methods to the above levels using this
//TODO here we can remap names, if desired

///Constructor
this.contacts = localcontacts.contacts;

///Open open(<path-to-mab-addressbook>) - returns true if opening the address book was succesfull
this.open = localcontacts.open;

///true if a valid mab file has been loaded
this.isOpen = localcontacts.isOpen;

///get all address book contacts
this.getAB= localcontacts.getAB;

//TODO continue exposing other C++ methods here
