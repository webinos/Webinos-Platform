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

#include "Globals.h"


string modFunction(const string& func, const string& val){
	// func = {scheme, host, authority, scheme-authority, path}
	int pos = val.find(":");
	int pos1 = val.find_last_of("/",pos+2);
	int pos2 = val.find("/",pos1+1);
	
	if(func == "scheme"){
		if(pos != string::npos)
			return val.substr(0,pos);
	}
	else if(func == "authority" || func == "host"){	
		string authority = val.substr(pos1+1, pos2-pos1-1);
		if(func == "authority")
			return authority;
		else{
			int pos_at = authority.find("@")+1;
			int pos3 = authority.find(":");
			if(pos_at == string::npos)
				pos_at = 0;
			if(pos3 == string::npos)
				pos3 = authority.length();
			return authority.substr(pos_at, pos3-pos_at);
		}
	}
	else if(func == "scheme-authority"){
		if(pos2-pos1 == 1)
			return "";
		return val.substr(0, pos2);
	}
	else if(func == "path"){
		int pos4 = val.find("?");
		if(pos4 == string::npos)
			pos4 = val.length();
		return val.substr(pos2, pos4-pos2);
	}
	return "";
}

