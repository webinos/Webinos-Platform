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

#ifndef ENVIRONMENT_H_
#define ENVIRONMENT_H_


#define EMULATOR	0	// S60 emulator
#define DEVICE		1
#define LINUX		2

#define JNI
//#define QT
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
#define ENV_ADAPTER_FILE		"Qt-adapter.js"
#define ENV_CONFIG_FILE			"config.xml"
#define POLICY_FILE				"policy.xml"
#define POLICY_VERSION			".policy_version"
#define WIDGETINFO_FILE			"widgetinfo.xml"
//--------------------------------------------------------------------------------------------------


#ifdef QT
	#include <QDir>
	#include <QString>
	
	#if TARGET == EMULATOR
		#define SYMBIAN
		#define QT_MOBILITY
		#define ENV_WGT_PREFIX 		QString("C:")
		#define ENV_CONFIG_PREFIX 	":/"	//path for qrc archive
		#define ENV_MAIN_PAGE		ENV_MAIN_PAGE_PREFIX + QString("/launch.html")
	#elif TARGET == LINUX
		#define ENV_WGT_PREFIX 		QDir::currentPath()+"/virtualFS"
		#define ENV_CONFIG_PREFIX	QDir::currentPath()+ "/config_files"
		#define ENV_MAIN_PAGE		ENV_CONFIG_PREFIX  + "/launch.html"
	//	#define ENV_CONFIG_PREFIX 	":/"	//path for qrc archive
	//	#define ENV_MAIN_PAGE		"qrc:/config_files/launch.html"
	#elif TARGET == DEVICE
		#define SYMBIAN
		#define QT_MOBILITY
		#define ENV_WGT_PREFIX 		QString("E:") //sdcard
		#define ENV_CONFIG_PREFIX 	":/"	//path for qrc archive
		#define ENV_MAIN_PAGE		ENV_MAIN_PAGE_PREFIX + QString("/launch.html")
	#endif
			
	#define ENV_MAIN_PAGE_PREFIX	"qrc:/config_files"
	#define ENV_WM_MAIN_PAGE		ENV_WGT_PREFIX + "/widget/widget_manager/launch.html"
	#define ENV_WM_MAIN_JS_PAGE		ENV_WGT_PREFIX + "/widget/widget_manager/launch.js"
	#define POLICY_FILE_PREFIX		QDir::currentPath()
	#define WIDGETINFO_FILE_PREFIX	QDir::currentPath().toStdString()

#else 
#ifdef JNI
	#define ENV_MAIN_PAGE_PREFIX	"/sdcard/config_files"
	#define ENV_WGT_PREFIX 		"/sdcard"
	#define POLICY_FILE_PREFIX	"/sdcard"
	#define WIDGETINFO_FILE_PREFIX	"/sdcard"
#endif
#endif


#endif /* ENVIRONMENT_H_ */

