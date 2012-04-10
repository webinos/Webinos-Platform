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

package org.webinos.wrt.core;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import android.content.ContentResolver;
import android.net.Uri;

public class WidgetConfig {
	
	private String installId;
	private String wgtDir;
	private Properties config;
	private String startUrl;

	public WidgetConfig(ContentResolver resolver, String installId) throws IOException {
		this.installId = installId;
		String installDir = WrtManager.getInstance().getWrtDir() + '/' + installId;
		wgtDir = installDir + "/wgt";
		config = new Properties();
		InputStream is = null;
		try {
			config.load(is = resolver.openInputStream(Uri.parse("content://org.webinos.wrt/" + installId + "/.config")));
		} finally {
			if(is != null) is.close();
		}
		String startFile = config.getProperty("widget.startFile.path");
		startUrl = "content://org.webinos.wrt/" + installId + "/wgt/" + startFile;
	}
	
	public String getInstallId()  { return installId; }
	public String getWidgetDir()  { return wgtDir; }
	public Properties getConfig() { return config; }
	public String getStartUrl()   { return startUrl; }
}
