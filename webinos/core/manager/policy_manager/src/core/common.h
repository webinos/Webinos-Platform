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
 * Copyright 2011 Telecom Italia SpA
 * 
 ******************************************************************************/

#ifndef COMMON_HEADER_DEFINED
#define	COMMON_HEADER_DEFINED
#include "../../contrib/xmltools/slre.h"
#include <string>
#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

typedef vector<string> strings;
const int STRCMP_NORMAL = 0;
const int STRCMP_REGEXP = 1;
const int STRCMP_GLOBBING = 2;
const int MAX_CAPTURES = 4;

string glob2regexp (const string& glob);

bool compare_regexp(const string& target,const string& expression);
bool compare_globbing (const string& target,const string& expression);
bool equals(const string& s1, const string& s2, const int mode=STRCMP_NORMAL);

inline bool contains(const strings& ss, const string& s) { return (find(ss.begin(), ss.end(), s)!=ss.end()); }
bool contains(const strings& container, const strings& contained);

int string2strcmp_mode(const string& s);

#endif /* COMMON_HEADER_DEFINED */
