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

#ifndef GLOBALS_H_
#define GLOBALS_H_

#include <string>
using namespace std;

enum PolicyType {POLICY_SET, POLICY};
enum Effect {PERMIT, DENY, PROMPT_ONESHOT, PROMPT_SESSION, PROMPT_BLANKET, UNDETERMINED, INAPPLICABLE};
enum Action {ALLOW_THIS_TIME, DENY_THIS_TIME, ALLOW_THIS_SESSION, DENY_THIS_SESSION, ALLOW_ALWAYS, DENY_ALWAYS, NO_ACTION};
enum Combine {AND, OR};
enum ConditionResponse {NOT_DETERMINED=-1, NO_MATCH=0, MATCH=1};
enum EvalResponse {WGINFO_ERR, REF_ERR, POLICY_ERR, EVAL_OK};

#define first_matching_target_algorithm 	"first-matching-target"
#define deny_overrides_algorithm			"deny-overrides"
#define permit_overrides_algorithm		"permit-overrides"
#define first_applicable_algorithm  		"first-applicable"

#define API_FEATURE			"api-feature"
#define DEVICE_CAPABILITY 		"device-cap"

string modFunction(const string& func, const string& val);

#endif /* GLOBALS_H_ */
