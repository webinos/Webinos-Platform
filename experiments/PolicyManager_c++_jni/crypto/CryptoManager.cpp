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
#include "CryptoManager.h"
#include "crypto/crypto.h"
#include "crypto/keys.h"
#include "debug.h"

string CryptoManager::CANONICALIZATION_ALGORITHM_C14N	= "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";	
string CryptoManager::SIGNATURE_ALGORITHM_RSA_SHA256	= "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
string CryptoManager::SIGNATURE_ALGORITHM_DSA_SHA1		= "http://www.w3.org/2000/09/xmldsig#dsa-sha1";	
string CryptoManager::DIGEST_ALGORITHM_SHA256			= "http://www.w3.org/2001/04/xmlenc#sha256";

CryptoManager::CryptoManager(){}

CryptoManager::~CryptoManager(){}


bool file_exists(string filename)
{
    if (FILE * file = fopen(filename.data(), "r"))
    {
        fclose(file);
        return true;
    }
    return false;
}

bool CryptoManager::validateAllSignatures(const vector<string> & signaturePathList){		
	LOGD("Validating all signatures");
	if(signaturePathList.size() == 0){
		LOGD("But there are not signatures...");
		return false;
	}
	bool evaluation_ok = true;
	for(int i=signaturePathList.size()-1; i>=0 && evaluation_ok; i--)
		evaluation_ok &= validateSignature(signaturePathList[i]);
	return evaluation_ok;
}


bool CryptoManager::validateSignature(const string & signaturePath){
//	LOG("[CryptoManager] : Evaluating signature "<<signaturePath.data());
	SignatureParser p(signaturePath);
	p.startParsing();
	
	bool validate_signature = false;
	char signedinfo_dgst[32];
	char signaturevalue_bin[8192];
	char inkey[8192];
	char signature_hash[1024];
	int  signedinfo_dgst_len;
	bool result = false, phase1 = false, phase2 = true;
	bool authorSignature = (signaturePath.find("author-signature") != string::npos) ? true : false;
	
	// 1. Calculate digest of signatureinfo_c14n
	if(p.getSignatureAlg() == CryptoManager::SIGNATURE_ALGORITHM_RSA_SHA256){
		sha256(p.getSignedInfo_c14n().data(), p.getSignedInfo_c14n().length(), signedinfo_dgst);
		signedinfo_dgst_len = 32;
	}
	else if(p.getSignatureAlg() == CryptoManager::SIGNATURE_ALGORITHM_DSA_SHA1){
		sha1(p.getSignedInfo_c14n().data(), p.getSignedInfo_c14n().length(), signedinfo_dgst);
		signedinfo_dgst_len = 20;
	}
		
	// 2. Calculate binary value of signature_value (which is in base64)
	int signaturevalue_bin_len = fromBase64((unsigned char *)p.getSignatureValue().data(), p.getSignatureValue().length(), signaturevalue_bin);
	
	// 3. Verify the signature
	int inkey_len = X509_PEM_decorator(p.getCertificate().data(), p.getCertificate().length(), inkey);						
	
	phase1 = rsa_verify(inkey, inkey_len, KEY_CERT, signaturevalue_bin, signaturevalue_bin_len, signedinfo_dgst, signedinfo_dgst_len) == 0;
	
	// 4. Verify all widget's references
	if(phase1){
		ReferenceObject* tmp;
		char digest[32];
		int digest_b64_len = 0;
		char digest_b64[44];
		string ref;
		int ref_len = 0;
		string widgetRootPath = signaturePath.substr(0,signaturePath.rfind('/', signaturePath.length()));
		bool propObject = false;
		
		resourcesInfo.clear();	//FIX
		subjectInfo.clear();
		
		for(int i=0; i < p.getReferences().size() && phase2; i++){
			tmp = p.getReferences().at(i);
			if(tmp->getURI().rfind('#',tmp->getURI().length()) == -1){
				ref = widgetRootPath + '/' + tmp->getURI();
				ref_len = 0;
				propObject = false;
				for(int j=0;j<ref.length();j++){
					if(ref[j] == '\\')
						ref[j] = '/';
				}
			}
			else{
				ref = p.getObject_c14n();
				ref_len = ref.length();
				propObject = true;
			}
			
			
			sha256(ref.data(), ref_len, digest);
			digest_b64_len = toBase64((unsigned char *)digest, 32, digest_b64);
			phase2 &= compareHashes(digest_b64, 44, tmp->getDigestValue().data(),44);
			
			if(phase2){
				//printLog(ref);
				if(!propObject)
					resourcesInfo.push_back(new pair<string,string>(tmp->getURI(),tmp->getDigestValue()));
			}
			else{
//				printLog("Not verified : " + ref);
				resourcesInfo.clear();
			}
			
//			LOG("[CryptoManager] : Reference : "<<ref.data());
//			LOG("[CryptoManager] : Digest Value : "<<tmp->getDigestValue().data());
//			LOG("[CryptoManager] : Calculated digest : "<<QString(digest_b64).left(44));
//			LOG("[CryptoManager] : Phase2 : "<<phase2);
		}
	}
	if(phase2){
		vector<string> certInfo = X509_info(inkey, inkey_len);
		if(authorSignature){
			subjectInfo.push_back(new pair<string,string>("author-key-cn", certInfo[0]));
			subjectInfo.push_back(new pair<string,string>("author-key-fingerprint", certInfo[1]));
			subjectInfo.push_back(new pair<string,string>("author-key-root-cn", certInfo[2]));
			subjectInfo.push_back(new pair<string,string>("author-key-root-fingerprint", certInfo[3]));
		}
		else{
			subjectInfo.push_back(new pair<string,string>("distributor-key-cn", certInfo[0]));
			subjectInfo.push_back(new pair<string,string>("distributor-key-fingerprint", certInfo[1]));
			subjectInfo.push_back(new pair<string,string>("distributor-key-root-cn", certInfo[2]));
			subjectInfo.push_back(new pair<string,string>("distributor-key-root-fingerprint", certInfo[3]));
		}
	}
	
	return phase1 & phase2;
}


bool CryptoManager::validateAllReferences(const string & widgetRootPath, vector<pair<string,string>*>& resourcesInfo){
	bool result = resourcesInfo.size()>0;
	char digest[32];
	int digest_b64_len = 0;
	char digest_b64[44];
	
	for(int i=0; i<resourcesInfo.size() && result; i++){
		string ref = resourcesInfo[i]->first;
		for(int j=0;j<ref.length();j++){
			if(ref[j] == '\\')
				ref[j] = '/';
		}
		sha256((widgetRootPath+"/"+ref).data(), 0, digest);
		digest_b64_len = toBase64((unsigned char *)digest, 32, digest_b64);
		result &= compareHashes(digest_b64, 44, resourcesInfo[i]->second.data(),44);
	}
	return result;
}


vector<pair<string,string>* > CryptoManager::getSubjectInfo(){
	return subjectInfo;
}


vector<pair<string,string>* > CryptoManager::getResourcesInfo(){
	return resourcesInfo;
}


int CryptoManager::calculateSHA256(const char* in,int len, char* out){
	return sha256(in, len , out);
}


int CryptoManager::calculateSHA256(const char* in, char* out){
	char digest[32];
	int digest_b64_len = 0;
	
	sha256(in, 0 , digest);
	digest_b64_len = toBase64((unsigned char *)digest, 32, out);
	out[digest_b64_len] = '\0';
	return digest_b64_len;
}


void CryptoManager::sign(const string & fileToSign){
	char tosign_dgst[32];
	LOGD("filetosign : %s",fileToSign.data());
	int tosign_dgst_len = sha256(fileToSign.data(), 0, tosign_dgst);
	rsa_sign(privatekey, privatekey_len, KEY_PRIVKEY, tosign_dgst, 32, NULL,(fileToSign + signaturesuffix).data());
}


bool CryptoManager::verifyOnLoad(const string & widgetInfoFile){	
	string signatureFile = widgetInfoFile + signaturesuffix;
	if (file_exists(widgetInfoFile) && file_exists(signatureFile))
		return verify(widgetInfoFile);
	else
		return false;
}


bool CryptoManager::verify(const string & widgetInfoFile){
	char signature_hash[32];
	char signed_dgst[32];	
	string signatureFile = widgetInfoFile + signaturesuffix;
	int signed_dgst_len = sha256(widgetInfoFile.data(), 0, signed_dgst);
	return rsa_verify(publickey, publickey_len, KEY_PUBKEY, signatureFile.data(), 0, signed_dgst, signed_dgst_len) == 0;
}


bool CryptoManager::verifyOnSave(const string & widgetInfoFile){	
	string signatureFile = widgetInfoFile + signaturesuffix;
	if (!file_exists(widgetInfoFile))
	{
		remove(signatureFile.data());
		return true;
	}
	else if(!file_exists(signatureFile))
		return false;
	else
		return verify(widgetInfoFile);
}
