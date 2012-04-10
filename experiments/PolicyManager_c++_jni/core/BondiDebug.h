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

#ifndef BONDIDEBUG_H_
#define BONDIDEBUG_H_

#include "core/Environment.h"
#define debug_token "@[QtBondi] "

#ifdef ENABLE_DEBUG
	#ifdef QT
		#include <QDebug>
		#define LOG(mess)	qDebug() << debug_token << mess 
	#endif
	#ifdef JNI
		#define LOG(mess)
	#endif
#else
	#define LOG(mess)
#endif

#endif /* BONDIDEBUG_H_ */
