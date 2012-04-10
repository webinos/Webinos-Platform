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

import org.webinos.app.wrt.mgr.WidgetManagerImpl;
import org.webinos.app.wrt.mgr.WidgetManagerService;
import org.webinos.app.R;

import android.app.Activity;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.os.AsyncTask;
import android.os.Bundle;

public class WidgetUninstallActivity extends Activity {

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		final WidgetManagerImpl widgetMgr = WidgetManagerService.getInstance();
		if(widgetMgr == null)
			throw new RuntimeException("WidgetUninstallActivity.onCreate(): unable to get WidgetManager");

		Bundle extras = getIntent().getExtras();
		if(extras == null)
			throw new RuntimeException("WidgetUninstallActivity.onCreate(): unable to get Intent extras");

		final String installId = extras.getString("installId");

		(new AsyncTask<String, Void, String>() {
			@Override
			protected void onPreExecute() {
				showDialog(0);
			}

			@Override
			protected String doInBackground(String... params) {
				final String installId = params[0];
				widgetMgr.uninstall(installId);
				return installId;
			}

			@Override
			protected void onPostExecute(String result) {
				dismissDialog(0);
				setResult(Activity.RESULT_OK);
				finish();
			}
		}).execute(installId);
	}

	@Override
	protected Dialog onCreateDialog(int id) {
		if(id != 0)
			return super.onCreateDialog(id);
		ProgressDialog progressDialog = new ProgressDialog(this);
		progressDialog.setMessage(getString(R.string.uninstalling_widget));
		return progressDialog;
	}
}
