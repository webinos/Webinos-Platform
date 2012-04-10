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

#define BONDI_API_FEATURE				"api-feature"
#define BONDI_DEVICE_CAPABILITY 		"device-cap"
#define BONDI_LOAD_WIDGET 			"http://bondi.omtp.org/lifecycle/widget-instantiate"
#define BONDI_PACKAGE_FILESYSTEM 		"http://bondi.omtp.org/api/1.1/filesystem"
#define BONDI_PACKAGE_APPCONFIG 		"http://bondi.omtp.org/api/1.1/appconfig"
#define BONDI_PACKAGE_MESSAGING 		"http://bondi.omtp.org/api/1.1/messaging"
#define BONDI_PACKAGE_GEOLOCATION 	"http://bondi.omtp.org/api/1.1/geolocation"
#define BONDI_PACKAGE_CONTACT 		"http://bondi.omtp.org/api/1.1/pim.contact"
#define BONDI_PACKAGE_DEVICESTATUS	"http://bondi.omtp.org/api/1.1/devicestatus"
#define BONDI_PACKAGE_UI				"http://bondi.omtp.org/api/1.1/ui"
#define BONDI_PACKAGE_GALLERY		"http://bondi.omtp.org/api/1.1/gallery"
#define BONDI_PACKAGE_CALENDAR		"http://bondi.omtp.org/api/1.1/pim.calendar"

#define FILESYSTEM_READ				"http://bondi.omtp.org/api/1.1/filesystem.read"
#define FILESYSTEM_WRITE				"http://bondi.omtp.org/api/1.1/filesystem.write"
#define GEOLOCATION_POSITION 			"http://bondi.omtp.org/api/1.1/geolocation.position"
#define MESSAGING_SMS_SEND			"http://bondi.omtp.org/api/1.1/messaging.sms.send"
#define MESSAGING_SMS_GET			"http://bondi.omtp.org/api/1.1/messaging.sms.get"
#define MESSAGING_SMS_SUBSCRIBE 		"http://bondi.omtp.org/api/1.1/messaging.sms.subscribe"
#define PIM_CONTACT_READ				"http://bondi.omtp.org/api/1.1/pim.contact.read"
#define PIM_CONTACT_WRITE			"http://bondi.omtp.org/api/1.1/pim.contact.write"
#define PIM_CALENDAR_READ			"http://bondi.omtp.org/api/1.1/pim.calendar.read"
#define PIM_CALENDAR_WRITE			"http://bondi.omtp.org/api/1.1/pim.calendar.write"

string modFunction(const string& func, const string& val);

#endif /* GLOBALS_H_ */
