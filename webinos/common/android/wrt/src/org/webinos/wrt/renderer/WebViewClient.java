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

import java.io.IOException;

import org.webinos.wrt.channel.ClientSocket;
import org.webinos.wrt.core.WrtManager;
import org.webinos.wrt.ui.RendererActivity;
import org.webinos.wrt.util.AssetUtils;

import android.graphics.Bitmap;
import android.util.Log;

public class WebViewClient extends android.webkit.WebViewClient {
	
	@SuppressWarnings("unused")
	private RendererActivity activity;

	private static final String TAG = "org.webinos.wrt.renderer.WebViewClient";
	
	public WebViewClient(RendererActivity activity) {
		this.activity = activity;
	}

	@Override
	public void onPageStarted(android.webkit.WebView webView, String url, Bitmap favicon) {
		WebView wgtView = (WebView)webView;
		try {
			wgtView.injectScript(AssetUtils.getAssetAsString(WrtManager.getInstance(), ClientSocket.SOCKETJS_ASSET));
			wgtView.injectScript(AssetUtils.getAssetAsString(WrtManager.getInstance(), ClientSocket.WEBINOSJS_ASSET));
		} catch(IOException ioe) {
			Log.v(TAG, "Unable to inject scripts; exception: ", ioe);
		}
	}

	@Override
	public void onPageFinished(android.webkit.WebView webView, String url) {
	}
}
