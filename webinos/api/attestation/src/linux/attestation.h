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
*******************************************************************************/

/*
 * attestation.h
 *
 *  Created on: 25 Oct 2011
 *  Author: John Lyle
 *
 *  This header is for the attestation library for webinos, and will be used by a
 *  NodeJS C++ module to access a limited subset of TPM functionality.
 *
 *
 */

#ifndef ATTESTATION_H_
#define ATTESTATION_H_

#include <stdio.h>
#include <string.h>
#include <memory.h>
#include <openssl/pem.h>
#include <openssl/x509.h>
#include <openssl/sha.h>
#include <openssl/rsa.h>

#include <trousers/tss.h>
#include <tss/tss_defines.h>



TSS_RESULT getTpm(TSS_HCONTEXT context, TSS_HTPM * tpm);
TSS_RESULT createContext(TSS_HCONTEXT * context);
TSS_RESULT closeContext(TSS_HCONTEXT context);
TSS_RESULT connectContext(TSS_HCONTEXT context);
TSS_RESULT loadKeyByUUID(TSS_HCONTEXT context, TSS_UUID id, TSS_HKEY * key);
TSS_RESULT getPcrs(TSS_HTPM tpm, UINT32 pcrNumber, UINT32 *pcrSize, BYTE **pcrValue);
TSS_RESULT createTSSObject(TSS_HCONTEXT context, TSS_FLAG objectType, TSS_FLAG attributes, TSS_HOBJECT * obj);
TSS_RESULT createTpmKey(TSS_HKEY key, TSS_HKEY wrapKey, TSS_HPCRS pcrs);
TSS_RESULT getSrk(TSS_HCONTEXT context, UINT32 secretMode, char* secret, UINT32 secretLen, TSS_HKEY* key);
TSS_RESULT getKeyFromFile(TSS_HCONTEXT context, TSS_HKEY srk, char* filename, TSS_HKEY* key);
TSS_RESULT createTpmKey2(TSS_HCONTEXT context, TSS_FLAG keyFlags, TSS_HKEY srk, TSS_HKEY * key );
UINT32 pcrRead(int pcrNumber, BYTE* pcrRes);
TSS_RESULT quote(char* srkPwd, char* aikfile, long pcrs[], int npcrs,BYTE nonce[], TSS_VALIDATION* valid, TPM_QUOTE_INFO* quoteInfo);

/* The following method has this copyright notice */
/*
 * Copyright (c) 2009 Hal Finney
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* nonce is 20 in length */

TSS_RESULT createQuote(long pcrs[], int npcrs, BYTE nonce[], TSS_HCONTEXT context, TSS_HTPM	tpm, TSS_HKEY srk, TSS_HKEY	aik, TSS_VALIDATION* valid, TPM_QUOTE_INFO* quoteInfo);



#endif /* ATTESTATION_H_ */
