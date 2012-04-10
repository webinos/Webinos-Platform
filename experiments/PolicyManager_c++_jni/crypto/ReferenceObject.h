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

#ifndef REFERENCEOBJECT_H_
#define REFERENCEOBJECT_H_

#include <string>

using namespace std;
class ReferenceObject
	{
	
private:
	string digestMethod;
	string digestValue;
	string URI;
	
public:
	ReferenceObject(string,string,string);
	virtual ~ReferenceObject();
	
	bool checkDigest();
	string getDigestMethod();
	string getDigestValue();
	string getURI();
	};

#endif /* REFERENCEOBJECT_H_ */
