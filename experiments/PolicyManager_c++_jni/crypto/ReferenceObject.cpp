/*******************************************************************************
 * Copyright 2010 Telecom Italia SpA
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
 ******************************************************************************/

#include "ReferenceObject.h"

ReferenceObject::ReferenceObject(string method, string value, string uri){
	this->digestMethod = method;
	this->digestValue = value;
	this->URI = uri;
}

ReferenceObject::~ReferenceObject(){}

bool ReferenceObject::checkDigest(){
	return true;
}

string ReferenceObject::getDigestMethod(){
	return digestMethod;
}

string ReferenceObject::getDigestValue(){
	return digestValue;
}

string ReferenceObject::getURI(){
	return URI;
}
