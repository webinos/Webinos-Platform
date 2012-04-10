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

import org.webinos.wrt.ui.RendererActivity;

import android.app.AlertDialog;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.JsResult;
import android.webkit.WebView;

public class WebChromeClient extends android.webkit.WebChromeClient{

	private RendererActivity activity;

	private static final String TAG = "org.webinos.wrt.renderer.WebChromeClient";

	public WebChromeClient(RendererActivity activity) {
		this.activity = activity;
	}

	@Override
    public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
        Log.d(TAG, message);
        new AlertDialog.Builder(view.getContext()).setMessage(message).setCancelable(true).show();
        result.confirm();
        return true;
    }
	
	@Override
	public void onReceivedTitle(WebView webView, String title) {
		if(title != null && !title.isEmpty())
			activity.setTitle(title);
	}

	@Override
	public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
		Log.v(TAG, consoleMessage.sourceId() + ':' + consoleMessage.lineNumber() + " " + consoleMessage.message());
		return true;
	}
}
