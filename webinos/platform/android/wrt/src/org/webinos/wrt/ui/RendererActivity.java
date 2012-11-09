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

package org.webinos.wrt.ui;

import org.webinos.wrt.R;
import org.webinos.wrt.channel.ClientSocket;
import org.webinos.wrt.core.WidgetConfig;
import org.webinos.wrt.core.WrtManager;
import org.webinos.wrt.core.WrtReceiver;
import org.webinos.wrt.renderer.WebChromeClient;
import org.webinos.wrt.renderer.WebView;
import org.webinos.wrt.renderer.WebViewClient;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

public class RendererActivity extends Activity implements WrtManager.LaunchListener {

	private static int nextId = 0;

	private WebView webView;
	private String installId;
	public String instanceId;
	private ClientSocket socket;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);

		WrtManager wrtManager = WrtManager.getInstance(this, this);
		if(wrtManager != null)
			initRenderer();
	}

	public void onLaunch(WrtManager service) {
		initRenderer();
	}

	private void initRenderer() {
		String id = getIntent().getStringExtra(WrtReceiver.ID);
		if(id == null || id.isEmpty())
			throw new IllegalArgumentException("WrtActivity.onCreate(): missing installId");

		installId = id;
		Log.v("Wrt", id);
		WidgetConfig widgetConfig = WrtManager.getInstance().getWidgetConfig(installId);
		if(widgetConfig == null)
			throw new RuntimeException("WrtActivity.onCreate(): unable to get widget config");

		String inst = getIntent().getStringExtra(WrtReceiver.INST);
		if(inst == null || inst.isEmpty()) {
			synchronized(RendererActivity.class) {
				inst = String.valueOf(nextId++);
			}
		}
		instanceId = inst;

		webView = (WebView) findViewById(R.id.webview);
		webView.setWebViewClient(new WebViewClient(this));
		webView.setWebChromeClient(new WebChromeClient(this));
		socket = new ClientSocket(webView, widgetConfig, instanceId);
		/* Inject the socket object */
		webView.addJavascriptInterface(socket, "__webinos");
		/* Load the widget start document */
		webView.loadUrl(widgetConfig.getStartUrl());		

		WrtManager.getInstance().put(instanceId, this);
	}

	public ClientSocket getClientSocket() {
		return socket;
	}

	@Override
	public void onDestroy() {
		if(socket != null)
			socket.dispose();
		super.onDestroy();
	}

}