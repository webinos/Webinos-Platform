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

package org.webinos.wrt.renderer;

import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;

public class WebView extends android.webkit.WebView {

	public WebView(Context context, AttributeSet as) {
		super(context, as);
		getSettings().setJavaScriptEnabled(true);
	}

	public void injectScript(String script) {
		try {
			String functionBody = "var s=document.createElement('script');"
					+ "s.text=" + script + ";"
					+ "var target = document.head || document;"
					+ "target.appendChild(s);"
					+ "console.log('injected script');";
			loadUrl("javascript:(function(){" + functionBody + "})()");
		} catch (Throwable t) {
			Log.v("org.webinos.wrt.renderer.WebView",
					"Error in injecting script", t);
		}
	}

	public void injectScripts(String[] scripts) {
		try {
			String functionBody = "var target = document.getElementsByTagName('head')[0] || document.firstChild || document;"
					+ "var child = target.firstChild;"
					+ "console.log('target = ' + target + ', document = ' + document + ', head = ' + document.head + ', child = ' + child);"
					+ "var insert = child ? function(x){target.insertBefore(x, child);} : function(x){target.appendChild(x);};";
			for (String script : scripts) {
				functionBody += "var s=document.createElement('script');"
						+ "s.text=" + script + ";"
						+ "console.log('injecting script...');" + "insert(s);"
						+ "console.log('injected script');" + "";
			}
			loadUrl("javascript:(function(){" + functionBody + "})()");
		} catch (Throwable t) {
			Log.v("org.webinos.wrt.renderer.WebView",
					"Error in injecting script", t);
		}
	}

	public void callScript(final String script) {
		Log.v("org.webinos.wrt.renderer.WebView.callScript()", script);
		try {
			getHandler().post(new Runnable() {
				public void run() {
					loadUrl("javascript:(function(){" + script + "})()");
				}
			});
		} catch (Throwable t) {
			Log.v("org.webinos.wrt.renderer.WebView",
					"Error in JavaScript callback", t);
		}
	}
}
