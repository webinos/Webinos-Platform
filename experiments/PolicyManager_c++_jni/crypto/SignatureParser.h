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

#ifndef SIGNATUREPARSER_H_
#define SIGNATUREPARSER_H_

#include <vector>
#include <map>
#include <string>
#include <algorithm>
#include <iostream>
#include <fstream>
#include <stdio.h>

#include <xmltools/tinyxml.h>
#include "ReferenceObject.h"
#include "core/BondiDebug.h"

using namespace std;

inline const bool equals(const string& s1, const string& s2) { return (s1.compare(s2)==0); }

class SignatureParser{
	
private:
	string NS;
	string sep;
	string file_path;	
	string ref_uri;
	string ref_digest_method;
	string ref_digest_value;
	string xmlns_name;
	string xmlns_value;
	vector<string> xml_vector;
	
	bool inside_tags;
	bool signature_found;
	
	string canonicalization_alg;
	string signature_method;
	string signature_value;
	string X509_certificate;
	vector<ReferenceObject*> reference_vector;
	string signedinfoC14N;
	string objectC14N;
	
	void parse(TiXmlElement *);
	void canonicalize();
	void createXMLString(TiXmlElement* element);
	void createClosingXMLString(TiXmlElement* element);

public:	
	SignatureParser(const string &);
	virtual ~SignatureParser();
	
	void startParsing();
	
	vector<ReferenceObject*> getReferences();
	string getCanonicalizationAlg();
	string getSignatureAlg();
	string getSignatureValue();
	string getCertificate();
	string getSignedInfo_c14n();
	string getObject_c14n();
	};

#endif /* SIGNATUREPARSER_H_ */
