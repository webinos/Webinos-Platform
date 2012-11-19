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

#ifndef ENVIRONMENT_H_
#define ENVIRONMENT_H_


#define EMULATOR	0	// S60 emulator
#define DEVICE		1
#define LINUX		2

#define JNI
#define ENABLE_DEBUG
#define TARGET	 	EMULATOR

//----------------------------GLOBAL DECLARATIONS--------------------------------------------------

#define INSTALL_CHECK			// if defined, enables security check at "install time"
#define LOAD_CHECK				// if defined, enables security check at "load time"
#define INVOKE_CHECK			// if defined, enables security check at "run time"
#define NETWORK_CHECK
#define ENABLE_ALERT

#define ENV_BASE64_FILE 		"base64.js"
#define ENV_JSON_FILE 			"json.js"
#define ENV_CONFIG_FILE			"config.xml"
#define POLICY_FILE				"policy.xml"
#define POLICY_VERSION			".policy_version"
//--------------------------------------------------------------------------------------------------


#ifdef JNI
	#define ENV_MAIN_PAGE_PREFIX	"/sdcard/config_files"
	#define ENV_WGT_PREFIX 		"/sdcard"
	#define POLICY_FILE_PREFIX	"/sdcard"
#endif


#endif /* ENVIRONMENT_H_ */

