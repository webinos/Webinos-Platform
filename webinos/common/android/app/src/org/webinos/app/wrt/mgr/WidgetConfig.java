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
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

package org.webinos.app.wrt.mgr;

import org.meshpoint.anode.idl.Dictionary;

public class WidgetConfig implements Dictionary {

	public static final int STATUS_TRANSIENT_ERROR  =  -4;
	public static final int STATUS_IO_ERROR         =  -3;
	public static final int STATUS_CAPABILITY_ERROR =  -2;
	public static final int STATUS_INTERNAL_ERROR   =  -1;
	public static final int STATUS_OK               =   0;
	public static final int STATUS_INVALID          =   1;
	public static final int STATUS_DENIED           =   2;
	public static final int STATUS_REVOKED          =   3;
	public static final int STATUS_UNSIGNED         = 100;
	public static final int STATUS_VALID            = 101;
	
	public Author author;
	public String prefIcon;
	public String[] icons;
	public Document startFile;
	public LocalisableString description;
	public int height;
	public int width;
	public String id;
	public License license;
	public LocalisableString name;
	public LocalisableString shortName;
	public VersionString version;
	public String defaultLocale;
	public String installId;
	public Origin origin;
	public FeatureRequest[] features;
	public AccessRequest[] accessRequests;
	public Preference[] preferences;
}
