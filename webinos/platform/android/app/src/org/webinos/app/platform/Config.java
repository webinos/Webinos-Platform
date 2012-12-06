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

package org.webinos.app.platform;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import android.content.Context;
import android.util.Log;

public class Config extends Properties {
	private static final long serialVersionUID = -8197098352324968523L;
	private static Config theConfig;
	private static final String CONFIG_FILE = "config/platform.properties";
	private static final String TAG = "org.webinos.app.platform.Config";

	static synchronized void init(Context ctx) {
		if(theConfig == null)
			theConfig = new Config(ctx);
	}

	public static Config getInstance() {
		return theConfig;
	}
	
	private Config(Context ctx) {
		InputStream is = null;
		try {
			Log.v(TAG, "Attempting to load config file from assets");
			load(is = ctx.getAssets().open(CONFIG_FILE));
		} catch(IOException e) {
			Log.v(TAG, "Attempting to load config file from filesystem");
			try {
				is.close();
				String resourcePath = "/data/data/" + this.getClass().getPackage().getName();
				load(is = new FileInputStream(resourcePath + '/' + CONFIG_FILE));
			} catch(IOException ioe) {
				Log.v(TAG, "Unable to load config file", e);
			}
		} finally {
			if(is != null)
				try { is.close(); } catch (IOException e) {}
		}
	}
}
