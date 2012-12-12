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
* Copyright 2011 University of Oxford
* Copyright 2011 Habib Virji, Samsung Electronics (UK) Ltd
*******************************************************************************/

int genRsaKey(const int bits, char * privkey);
int createCertificateRequest(char* result, char* keyToCertify, char * country, char* state, char* loc, char* organisation, char *organisationUnit, char* cname, char* email);
int selfSignRequest(char* pemRequest, int days, char* pemCAKey, int certType, char *url, char* result);
int signRequest(char* pemRequest, int days, char* pemCAKey, char* pemCaCert,  int certType, char *url, char* result);
int createEmptyCRL(char* pemSigningKey, char* pemCaCert, int crldays, int crlhours, char* result);
int addToCRL(char* pemSigningKey, char* pemOldCrl, char* pemRevokedCert, char* result);
int getHash(char* filename, char *pointer);

