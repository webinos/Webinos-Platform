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

#ifndef MY_DEBUG_H
#define MY_DEBUG_H

#define  LOG_TAG  "POLICY_MANAGER_NATIVE"
//#define __WEBINOS_DEBUG

#ifdef __WEBINOS_DEBUG

  #ifdef ANDROID
    #include <android/log.h>
    #define  LOGD(...)  __android_log_print(ANDROID_LOG_DEBUG, LOG_TAG, __VA_ARGS__)
  #else
    #include <stdio.h>
    #define  LOGD(...) 	{ FILE* tmp = fopen("./dbg.log", "a"); fprintf(tmp, __VA_ARGS__);	fprintf(tmp, "\n");	fclose(tmp);}
  #endif  //ANDROID

#else

  #define  LOGD(...)

#endif //__WEBINOS_DEBUG

#endif  //MY_DEBUG_H
