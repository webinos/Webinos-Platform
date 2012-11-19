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

package org.webinos.app.wrt.ui;

import org.webinos.app.R;
import org.webinos.app.wrt.mgr.PrepareCallback;
import org.webinos.app.wrt.mgr.ProcessingResult;
import org.webinos.app.wrt.mgr.WidgetConfig;
import org.webinos.app.wrt.mgr.WidgetManagerImpl;
import org.webinos.app.wrt.mgr.WidgetManagerService;

import android.app.Activity;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Looper;
import android.util.Log;

public class WidgetInstallActivity extends Activity implements WidgetManagerService.LaunchListener {
	
	private static final int INSTALL_PROGRESS_DIALOG = 1;
	private static final String TAG = "org.webinos.app.wrt.ui.WidgetInstallActivity";

	private Dialog pendingDialog;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		final WidgetManagerImpl widgetMgr = WidgetManagerService.getInstance(this, this);
		if(widgetMgr != null)
			onWidgetManagerAvailable(widgetMgr);
	}

	@Override
	public void onLaunch(WidgetManagerImpl mgr) {
		Log.e(TAG, "WidgetInstallActivity: WidgetManagerService must be running");
		finish();
	}

	public void onWidgetManagerAvailable(final WidgetManagerImpl widgetMgr) {
		Bundle extras = getIntent().getExtras();
		if(extras == null)
			throw new RuntimeException("WidgetInstallActivity.onCreate(): unable to get Intent extras");

		final String[] wgtPaths = extras.getStringArray("path");
		
		final PrepareCallback listener = new PrepareCallback() {
			@Override
			public void onPrepareComplete(ProcessingResult processingResult) {
				if(processingResult.status != WidgetConfig.STATUS_OK) {
					Log.e(TAG, "WidgetInstallActivity: unable to install: code: " + processingResult.error.code + "; reason: " + processingResult.error.reason);
					if(processingResult.widgetConfig != null && processingResult.widgetConfig.installId != null) {
						widgetMgr.abortInstall(processingResult.widgetConfig.installId);
					}
				} else {
					/* FIXME: add install prompt */
					widgetMgr.completeInstall(processingResult.widgetConfig.installId);

					/* since the install was successful, go to the widget list */
					Intent listIntent = new Intent();
					listIntent.setClass(WidgetInstallActivity.this, WidgetListActivity.class);
					startActivity(listIntent);
				}
				clearDialog();
				Intent resultIntent = new Intent();
				resultIntent.putExtra("path", wgtPaths);
				setResult(Activity.RESULT_OK, resultIntent);
				finish();
			}
		};

		(new AsyncTask<String[], Void, String>() {
			@Override
			protected void onPreExecute() {
				showDialog(INSTALL_PROGRESS_DIALOG);
			}

			@Override
			protected String doInBackground(String[]... params) {
				final String[] wgtPaths = params[0];
				for(String wgtPath : wgtPaths) {
					try {
						widgetMgr.prepareInstall(wgtPath, null, listener);
					} catch(Exception e) {
						Log.e(TAG, "WidgetInstallActivity: exception thrown in prepareInstall(); error: " + e);
					}
				}
				return null;
			}

			@Override
			protected void onPostExecute(String result) {
				clearDialog();
			}
		}).execute(wgtPaths);
	}

	@Override
	protected Dialog onCreateDialog(int id) {
		if(id == INSTALL_PROGRESS_DIALOG) {
			ProgressDialog progressDialog = new ProgressDialog(this);
			progressDialog.setMessage(getString(R.string.installing_widget));
			return (pendingDialog = progressDialog);
		}
		return super.onCreateDialog(id);
	}

	@Override
	public void onDestroy() {
		clearDialog();
		super.onDestroy();
	}

	private void clearDialog() {
		if(pendingDialog != null) {
			pendingDialog.dismiss();
			pendingDialog = null;
		}
	}
}
