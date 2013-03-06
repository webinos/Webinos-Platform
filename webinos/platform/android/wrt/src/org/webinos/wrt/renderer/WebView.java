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

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.AttributeSet;
import android.util.Log;
import android.webkit.WebSettings;

@SuppressLint("SetJavaScriptEnabled")
public class WebView extends android.webkit.WebView {

	private static final String TAG = "org.webinos.wrt.renderer.WebView";
	public WebView(Context context, AttributeSet as) {
		super(context, as);
		WebSettings settings = getSettings();
		settings.setJavaScriptEnabled(true);
		/* temporary: until we have the widget API */
		settings.setDomStorageEnabled(true);
		/* TO avoid the scrollbar issue
		 * http://forum.jquery.com/topic/extra-vertical-white-space-at-right-on-screen-for-android-phone */
		setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
	}

	public void injectScript(String script) {
		Log.i(TAG,"inject script called:"+ script);
		try {
			String functionBody = "var s=document.createElement('script');"
					+ "s.text=" + script + ";"
					+ "var target = document.head || document;"
					+ "target.appendChild(s);"
					+ "console.log('injected script');";
			loadUrl("javascript:(function(){" + functionBody + "})()");
		} catch (Throwable t) {
			Log.e(TAG, "Error in injecting script", t);
		}
	}

	public void injectScripts(String[] scripts) {
		Log.i(TAG,"inject scripts called");
		try {
			for (String script : scripts)
				loadUrl("javascript:(function(){" + script + "})()");
		} catch (Throwable t) {
			Log.e(TAG, "Error in injecting script", t);
		}
	}

	public void callScript(final String script) {
		Log.i(TAG,"call script called:" + script);
		Log.v("org.webinos.wrt.renderer.WebView.callScript()", script);
		try {
			getHandler().post(new Runnable() {
				public void run() {
					loadUrl("javascript:(function(){" + script + "})()");
				}
			});
		} catch (Throwable t) {
			Log.e(TAG, "Error in JavaScript callback", t);
		}
	}
}
