/**
 * Licensed to OMTP Ltd. (OMTP) under one or more contributor license agreements. 
 * See the NOTICE file distributed with this work for additional information regarding 
 * copyright ownership. 
 * 
 * The Reference Implementation (save for such parts of the reference implementation made 
 * available under separate terms and conditions) is made available under the terms of the 
 * Apache License, version 2.0, subject to the condition that any "Works" and "Derivative 
 * Works" used or distributed for commercial purposes must be and remain compliant with the
 * BONDI specification as promulgated by OMTP in each release. Your implementation of the 
 * Reference Implementation (whether object or source) must maintain these conditions, and 
 * you must notify any recipient of this condition in a conspicuous way.
 * 
 * You may not use this BONDI Reference Implementation except in compliance with the License. 
 * 
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 or at 
 * http://bondi.omtp.org/BONDI LICENSE-2.0 
 * 
 */

#ifndef WIDGET_CONSTANTS_H
#define WIDGET_CONSTANTS_H

#define WIDGET_LEFT_SOFTKEY 0x3001
#define WIDGET_RIGHT_SOFTKEY 0x3002
#define WIDGET_MENU_ID_OFFSET 0x2000
#define WIDGET_MENU_ID_MAX (WIDGET_LEFT_SOFTKEY-1)

#define WIDGET_MENU_RANGE_START WIDGET_MENU_ID_OFFSET
#define WIDGET_MENU_RANGE_END WIDGET_RIGHT_SOFTKEY

#define WIDGET_INSTALL_FOLDER _T("Install")

#define WM_WIDGET_ACTIVATE (WM_USER + 0x0001)
#define WM_WIDGET_DEACTIVATE (WM_USER + 0x0002)

#endif
