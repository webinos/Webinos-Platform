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

#include <cstdio>
#include <cstring>
#include <cassert>
#include "common.h"
#include "../../contrib/xmltools/slre.h"


using namespace std;
/*
 * Useful common functions
 */

/* Regular expression matching
 * -----------------------------------------------------------
 * BONDI specification refers to ECMAScript 3 regular expression, that
 * is perl-like stype, not POSIX-like such as (BRE,ERE).  
 * The chosen SLRE library (http://slre.sourceforge.net/) is a reduced
 * Perl-like style of regular expression, like the same ECMAScript is.
 * */

const bool compare_regexp(const string& target,const string& expression) {
    struct slre slre;
    struct cap  captures[MAX_CAPTURES];

//    cout << "\n matching "  << target << " in expression " << expression << endl;

    if (!slre_compile(&slre,expression.c_str())) {
//	    printf("Error compiling RE: %s\n", slre.err_str);
    	return false;
    } 
    else
	if (!slre_match(&slre, target.c_str(),strlen(target.c_str()), captures)) { 
//	    printf("Not matching!\n" ); 
	    return false;
	} 
	else { 
//	    printf("Capture: %.*s\n", captures[0].len, captures[0].ptr);
	    return true;
	}
    return false;
}

string glob2regexp (const string& glob) {
    string result = "";
//    cout << "\n Converting " << glob << " with size " << glob.size();
    for (int i = 0;i<glob.size();++i)
    {
	if (glob[i]=='?')
	    result+=".";
	else
	    if (glob[i]=='*')
		result+=".*";
	    else
		result+=glob[i];
    }
	// ABOT Commented the following line because I was getting an xstring assert fail "string subscript out of range"
    //result[glob.size()] = 0;
//    cout  << "\n Converted " << glob << " to " << result << endl;
    return result;
}

const bool compare_globbing (const string& target,const string& expression) {
    // TODO: implementation
   
    return compare_regexp(target,glob2regexp(expression));
}

const bool equals(const string& s1, const string& s2, const int mode) { 
    // TODO: string bag (remove spaces)
    // check regular expression according to BONDI spec
    switch (mode)
    {
	case STRCMP_NORMAL:
	    return (s1.compare(s2)==0); 
	case STRCMP_REGEXP:
	    return compare_regexp(s1,s2);
	case STRCMP_GLOBBING:
	    return compare_globbing(s1,s2);
	default:
	    assert(false);
    }
}

const bool contains(const strings& container, const strings& contained) {
  for(strings::const_iterator it=contained.begin(); it!=contained.end(); it++) {
    if(!contains(container, *it)) return false;
  }
  return true;
}

const int string2strcmp_mode(const string& s){
	if(s == "glob")
		return STRCMP_GLOBBING;
	if(s == "equal")
		return STRCMP_NORMAL;
	if(s == "regexp")
		return STRCMP_REGEXP;
	return -1;
}
