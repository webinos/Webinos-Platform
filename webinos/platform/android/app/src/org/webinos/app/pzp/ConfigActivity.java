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

package org.webinos.app.pzp;

import org.webinos.app.R;
import org.webinos.app.platform.PlatformInit;
import org.webinos.app.pzp.PzpService.ConfigParams;
import org.webinos.app.pzp.PzpService.PzpServiceListener;
import org.webinos.app.pzp.PzpService.PzpState;
import org.webinos.app.pzp.PzpService.PzpStateListener;

import android.app.Activity;
import android.content.res.Resources;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

public class ConfigActivity extends Activity implements PzpServiceListener, PzpStateListener {
	private static String TAG = "org.webinos.app.pzp.ConfigActivity";
	private PzpService pzpService;
	private Button startButton;
	private Button stopButton;
	private EditText pzhHost;
	private EditText pzhName;
	private EditText pzpName;
	private EditText authCode;
	private TextView stateText;
	private Handler viewHandler = new Handler();
	private long uiThread;
	
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		Log.v(TAG, "onCreate()");
		super.onCreate(savedInstanceState);
		setContentView(R.layout.pzp);
		uiThread = viewHandler.getLooper().getThread().getId();
		pzpService = PzpService.getService(this, this);
		if(pzpService != null) {
			Log.v(TAG, "onCreate(): service already running");
			initUI();
			return;
		}
	}

	@Override
	public void onServiceAvailable(PzpService service) {
		Log.v(TAG, "onServiceAvailable(): service running");
		pzpService = service;
		initUI();
	}

	private void initUI() {
		pzpService.addPzpStateListener(this);
		ConfigParams configParams = pzpService.getConfig();
		startButton = (Button)findViewById(R.id.start_button);
		startButton.setEnabled(false);
		startButton.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				Log.v(TAG, "startButton.onClick(): requesting PZP start");
				updateConfigFromEditText();
				pzpService.startPzp();
			}
		});

		stopButton = (Button)findViewById(R.id.stop_button);
		stopButton.setEnabled(false);
		stopButton.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				Log.v(TAG, "stopButton.onClick(): requesting PZP stop");
				pzpService.stopPzp();
			}
		});

		pzhHost = (EditText)findViewById(R.id.args_pzhHost);
		String pzhHostText = configParams.pzhHost;
		if(pzhHostText != null)
			pzhHost.setText(pzhHostText);

		pzhName = (EditText)findViewById(R.id.args_pzhName);
		String pzhNameText = configParams.pzhName;
		if(pzhNameText != null)
			pzhName.setText(pzhNameText);

		pzpName = (EditText)findViewById(R.id.args_pzpName);
		String pzpNameText = configParams.pzpName;
		if(pzpNameText != null)
			pzpName.setText(pzpNameText);

		authCode = (EditText)findViewById(R.id.args_authCode);
		String authCodeText = configParams.authCode;
		if(authCodeText != null)
			authCode.setText(authCodeText);

		/* if the platform is not yet initialised, wait until that
		 * has completed and retry */
		if(PlatformInit.onInit(this, new Runnable() {
			@Override
			public void run() {
				/* init buttons (deferred case) */
				stateText = (TextView)findViewById(R.id.args_stateText);
				__stateChanged(pzpService.getPzpState());
			}
		})) {
			/* init buttons (no wait) */
			stateText = (TextView)findViewById(R.id.args_stateText);
			__stateChanged(pzpService.getPzpState());
		}
	}

	private void updateConfigFromEditText() {
		ConfigParams configParams = pzpService.getConfig();
		configParams.pzhHost = pzhHost.getText().toString();
		configParams.pzhName = pzhName.getText().toString();
		configParams.pzpName = pzpName.getText().toString();
		configParams.authCode = authCode.getText().toString();
		pzpService.updateConfig();
	}

	private String getStateString(PzpState state) {
		Resources res = getResources();
		String result = null;
		switch(state) {
		case STATE_UNINITIALISED:
			result = res.getString(R.string.uninitialised);
			break;
		case STATE_CREATED:
			result = res.getString(R.string.created);
			break;
		case STATE_STARTED:
			result = res.getString(R.string.started);
			break;
		case STATE_STOPPING:
			result = res.getString(R.string.stopping);
			break;
		case STATE_STOPPED:
			result = res.getString(R.string.stopped);
			break;
		}
		return result;
	}

	@Override
	public void onStateChanged(final PzpState state) {
		if(Thread.currentThread().getId() == uiThread) {
			__stateChanged(state);
		} else {
			viewHandler.post(new Runnable() {
				public void run() {
					__stateChanged(state);
				}
			});
		}
	}

	private void __stateChanged(final PzpState state) {
		stateText.setText(getStateString(state));
		startButton.setEnabled(state == PzpState.STATE_UNINITIALISED || state == PzpState.STATE_CREATED || state == PzpState.STATE_STOPPED);
		stopButton.setEnabled(state == PzpState.STATE_STARTED);
	}
}
