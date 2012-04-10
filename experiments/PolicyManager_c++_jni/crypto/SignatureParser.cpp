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

#include "SignatureParser.h"

SignatureParser::SignatureParser(const string & path){
//	NS = "ds";
//	NS = "";
//	sep = (NS!="") ? ":" : "";
	file_path = path;
	xmlns_name = "";
	xmlns_value = "";
	canonicalization_alg = "";
	signature_method = "";
	signature_value = "";
	X509_certificate = "";	
	ref_uri = "";
	ref_digest_method = "";
	ref_digest_value = "";
	signedinfoC14N = "";
	objectC14N = "";	
	inside_tags = false;
	signature_found = false;
}

SignatureParser::~SignatureParser(){}

vector<ReferenceObject*> SignatureParser::getReferences(){
	return reference_vector;
}

void SignatureParser::startParsing(){
	TiXmlDocument doc(file_path);
	if(doc.LoadFile()){ 
		
	//	TiXmlElement* el=doc.FirstChildElement(NS + sep +"Signature");
		TiXmlElement* el=doc.FirstChildElement();
		LOG("[SignatureParser] tagNAME : "<<el->ValueStr().data());
		if(el != NULL){
			LOG("[SignatureParser] : START");
			parse(el);
			LOG("[SignatureParser] : Parsing... FINISHED");
			canonicalize();
			LOG("[SignatureParser] : Canonicalization... FINISHED");
		}
		else
			LOG("[SignatureParser] : Parsing... INCOMPLETE");
	}
	else	
		LOG("[SignatureParser] : ERROR: Unable to load file "<<file_path.data());

//	for(int i=0; i<xml_vector.size(); i++)
//		LOG([SignatureParser] : " << xml_vector.at(i).data()); 
}

void SignatureParser::canonicalize(){
	int length;
	char * buffer;

	ifstream is;
	is.open (file_path.data(), ios::binary );
	// get length of file:
	is.seekg (0, ios::end);
	length = is.tellg();
	is.seekg (0, ios::beg);
	// allocate memory:
	buffer = new char [length];
	// read data as a block:
	is.read (buffer,length);
	is.close();
	string file_str = buffer;
	
	int start_signedinfo = file_str.find('<' + NS + sep + "SignedInfo");
	int end_signedinfo   = file_str.rfind("</" + NS + sep + "SignedInfo");
	
	int start_object = file_str.find('<' + NS + sep + "Object");
	int end_object   = file_str.rfind("</" + NS + sep + "Object");
	
//	LOG("[SignatureParser] : indexes : s_si = "<<start_signedinfo<<" e_si = "<<end_signedinfo<<" s_o = "<<start_object<<" e_o = "<<end_object);
	char c,c_prec='\0';
	bool inside_tag = false;
	int j=0;
	for(int i=start_signedinfo; i<=end_signedinfo; i++){
		c = *(buffer+i);
		if(c == '<'){
			inside_tag = true;
			signedinfoC14N += xml_vector.at(j++);
		}
		else if(c == '>'){
			if(c_prec == '/')
				signedinfoC14N += xml_vector.at(j++);
			inside_tag = false;
		}
		else if(!inside_tag && c != '\x0d')
			signedinfoC14N += c;
		c_prec = c;
	}
	
	for(int i=start_object; i<=end_object; i++){
		c = *(buffer+i);
		if(c == '<'){
			inside_tag = true;
			objectC14N += xml_vector.at(j++);
		}
		else if(c == '>'){
			if(c_prec == '/')
				objectC14N += xml_vector.at(j++);
			inside_tag = false;
		}
		else if(!inside_tag && c != '\x0d')
			objectC14N += c;
		c_prec = c;
	}	
}

void SignatureParser::parse(TiXmlElement* elem){
	createXMLString(elem);	
	string tagName = elem->ValueStr();
//	LOG("[SignatureParser] : tagName :"<<tagName.data());
	size_t found =tagName.find("Signature");
	if(!signature_found && found != string::npos){
		signature_found = true;
		for(TiXmlAttribute* attr = elem->FirstAttribute();attr; attr = attr->Next()) {
			if(attr->NameTStr().find("xmlns") != string::npos){
				xmlns_name = attr->NameTStr();
				xmlns_value = attr->ValueStr();
				int start = xmlns_name.find(":");
				if(start > -1){
					NS = xmlns_name.substr(start+1, xmlns_name.length()-start-1);
					sep = ":";
				}
				else{
					NS = "";
					sep= "";
				}	
			}	
		}		
		for(TiXmlElement* pElem = elem->FirstChildElement();
			pElem; pElem = pElem->NextSiblingElement()) {
			parse(pElem);
		}	
	}
	
	else if(equals(tagName, NS + sep + "SignedInfo")) {
	    for(TiXmlElement* pElem = elem->FirstChildElement();
	    	pElem; pElem = pElem->NextSiblingElement()) {
			parse(pElem);	      
	    }
	}
	
	else if(equals(tagName, NS + sep + "CanonicalizationMethod")) {
		if(elem->Attribute("Algorithm") != NULL)
			canonicalization_alg = elem->Attribute("Algorithm");
	}
	
	else if(equals(tagName, NS + sep + "SignatureMethod")) {
		if(elem->Attribute("Algorithm") != NULL)
			signature_method = elem->Attribute("Algorithm");
	}
	
	else if(equals(tagName, NS + sep + "SignatureValue")) {
		if(elem->GetText() != NULL)
			signature_value = elem->GetText();
	}
	
	else if(equals(tagName, NS + sep + "KeyInfo")) {
		TiXmlElement* el = elem->FirstChildElement(NS + sep + "X509Data"); 
		if(el != NULL)
			parse(el);
	}
	
	else if(equals(tagName, NS + sep + "X509Data")) {
		TiXmlElement* el = elem->FirstChildElement(NS + sep + "X509Certificate"); 
		if(el != NULL)
			parse(el);
	}
	
	else if(equals(tagName, NS + sep + "X509Certificate")) {
		if(elem->GetText() != NULL)
			X509_certificate = elem->GetText();
	}
	
	else if(equals(tagName, NS + sep + "Reference")) {
		if(elem->Attribute("URI") != NULL)
			ref_uri = elem->Attribute("URI");
		for(TiXmlElement* pElem = elem->FirstChildElement();
			pElem; pElem = pElem->NextSiblingElement()) {
			parse(pElem);	      
		}		
		reference_vector.push_back(new ReferenceObject(ref_digest_method, ref_digest_value, ref_uri));
	}
	
	else if(equals(tagName, NS + sep + "Object")) {
		for(TiXmlElement* pElem = elem->FirstChildElement();
			pElem; pElem = pElem->NextSiblingElement()) {
			parse(pElem);  
		}
	}
	
	else if(equals(tagName, NS + sep + "DigestMethod")) {
		if(elem->Attribute("Algorithm") != NULL)
			ref_digest_method = elem->Attribute("Algorithm");
	}
	
	else if(equals(tagName, NS + sep + "DigestValue")) {
		if(elem->GetText() != NULL)
			ref_digest_value = elem->GetText();
	}
	
	else if(equals(tagName, NS + sep + "SignatureProperties")) {
		for(TiXmlElement* pElem = elem->FirstChildElement();
			pElem; pElem = pElem->NextSiblingElement()) {
			parse(pElem);  
		}
	}
	
	else if(equals(tagName, NS + sep + "SignatureProperty")) {
		for(TiXmlElement* pElem = elem->FirstChildElement();
			pElem; pElem = pElem->NextSiblingElement()) {
			parse(pElem);  
		}
	}
	createClosingXMLString(elem);
}

void SignatureParser::createXMLString(TiXmlElement* element){
	string tmp="";
	map<string,string>  attributes;
	
	if (element->ValueStr() == NS+sep + "SignedInfo" || element->ValueStr() == NS+sep + "Object")
		inside_tags = true;
	
	if(inside_tags){
		tmp += '<' + element->ValueStr();
		if(xmlns_name != "" && (element->ValueStr() == NS+sep + "SignedInfo" || element->ValueStr() == NS+sep + "Object"))
			tmp += ' ' + xmlns_name + "=\"" + xmlns_value + '"';
		for(TiXmlAttribute* attr = element->FirstAttribute();attr; attr = attr->Next()) {
			if(attr->NameTStr() != xmlns_name)
				attributes[attr->NameTStr()] = attr->ValueStr();
		}
			
		map<string,string>::iterator it;
		for(it=attributes.begin(); it != attributes.end(); it++)
			tmp += ' ' + it->first + "=\"" + it->second + '"';
		
		tmp += '>';
		xml_vector.push_back(tmp);
	}
}

void SignatureParser::createClosingXMLString(TiXmlElement* element){
	if(element->ValueStr() == NS+sep + "SignedInfo" || element->ValueStr() == NS+sep + "Object"){
		xml_vector.push_back("</"+element->ValueStr() + ">");
		inside_tags = false;
	}
	else if(inside_tags)
		xml_vector.push_back("</"+element->ValueStr()+">");
}

string SignatureParser::getCanonicalizationAlg(){
	return this->canonicalization_alg;
}

string SignatureParser::getSignatureAlg(){
	return this->signature_method;
}

string SignatureParser::getSignatureValue(){
	string s ="";
	char c;
	for(int i=0; i<signature_value.length(); i++){
		c = signature_value[i];
		if(c != '\x0d' && c != '\x0a' && c != '\x20')
			s += c;
	}
	return s;
}

string SignatureParser::getCertificate(){
	string s ="";
	char c;
	for(int i=0; i<X509_certificate.length(); i++){
		c = X509_certificate[i];
		if(c != '\x20')
			s += c;
		else
			s += "\x0d\x0a";
	}
	return s;
}

string SignatureParser::getSignedInfo_c14n(){
	return this->signedinfoC14N;
}

string SignatureParser::getObject_c14n(){
	return this->objectC14N;
}
