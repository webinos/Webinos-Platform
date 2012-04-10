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

#include "Rule.h"
#include "../../debug.h"

Rule::Rule(TiXmlElement* rule){
	effect = (rule->Attribute("effect") != NULL) ? string2effect(rule->Attribute("effect")) : UNDETERMINED;
	if(rule->FirstChild("condition")){
		condition = new Condition((TiXmlElement*)rule->FirstChild("condition"));
	}
	else
		condition = NULL;
}

Rule::~Rule()
	{
	// TODO Auto-generated destructor stub
	}


Effect Rule::string2effect(const string & effect_str){
	if(effect_str == "permit")
		return PERMIT;
	else if(effect_str == "deny")
		return DENY;
	else if(effect_str == "prompt-oneshot")
		return PROMPT_ONESHOT;
	else if(effect_str == "prompt-session")
		return PROMPT_SESSION;
	else if(effect_str == "prompt-blanket")
		return PROMPT_BLANKET;
	else
		return UNDETERMINED;
}

Effect Rule::evaluate(Request* req){
	
	if(condition){
		ConditionResponse cr = condition->evaluate(req);
//		LOGD("[RULE EVAL] %d",cr); 
		if(cr==MATCH)
			return effect;
		else if (cr==NO_MATCH)
			return INAPPLICABLE;
		else
			return UNDETERMINED;
	}
	else
		return effect;
}
