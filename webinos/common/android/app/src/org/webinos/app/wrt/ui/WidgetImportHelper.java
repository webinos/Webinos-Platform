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

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;

import org.webinos.app.R;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Environment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.ListAdapter;
import android.widget.ListView;

public class WidgetImportHelper {
	
	private Activity activity;
	private String[] wgtNames;
	ArrayList<String> wgtFiles = new ArrayList<String>();
	HashMap<String, Boolean> checkedState = new HashMap<String, Boolean>();

	WidgetImportHelper(Activity activity) {
		this.activity = activity;
	}

	private void addWgtFilesFromDir(File dir, ArrayList<String> wgtFiles) {
		String[] dirEntries = dir.list();
		if(dirEntries != null) {
			for(String entry : dirEntries) {
				File file = new File(dir, entry);
				if(file.isDirectory()) {
					addWgtFilesFromDir(file, wgtFiles);
				} else if(file.isFile() && entry.endsWith(".wgt")) {
					wgtFiles.add(file.getAbsolutePath());
				}
			}
		}
	}
	
	ImportListAdapter getListAdapter() {
		ImportListAdapter result = null;
		if(wgtNames != null)
			result = new ImportListAdapter();
		return result;
}

	private class ImportListAdapter extends ArrayAdapter<String> implements OnCheckedChangeListener {
		public ImportListAdapter() {
			super(activity, R.layout.importrowlayout, wgtNames);
		}

		@Override
		public View getView(int position, View convertView, ViewGroup parent) {
			LayoutInflater inflater = (LayoutInflater) activity
					.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
			View rowView = inflater.inflate(R.layout.importrowlayout, parent, false);
			CheckBox checkBox = (CheckBox)rowView.findViewById(R.id.checkBox);
			checkBox.setText(wgtNames[position]);
			checkBox.setChecked(false);
			checkBox.setOnCheckedChangeListener(this);
			checkBox.setTag(wgtFiles.get(position));
			return rowView;
		}

		@Override
		public void onCheckedChanged(CompoundButton view,
				boolean isChecked) {
			checkedState.put(((String)view.getTag()), new Boolean(isChecked));
		}
	}

	void scan() {
		(new AsyncTask<Void, Void, Void>() {
			@Override
			protected void onPreExecute() {
				activity.showDialog((WidgetListActivity.SCANNING_DIALOG));
			}

			@Override
			protected Void doInBackground(Void... params) {
				File rootDir = Environment.getExternalStorageDirectory();
				addWgtFilesFromDir(rootDir, wgtFiles);
				wgtNames = new String[wgtFiles.size()];
				int nameIdx = rootDir.getAbsolutePath().length() + 1;
				for(int i = 0; i < wgtFiles.size(); i++)
					wgtNames[i] = wgtFiles.get(i).substring(nameIdx);
				return null;
			}

			@Override
			protected void onPostExecute(Void v) {
				activity.dismissDialog(WidgetListActivity.SCANNING_DIALOG);
				if(wgtNames.length == 0) {
					activity.showDialog(WidgetListActivity.NO_WIDGETS_DIALOG);
				} else {
					activity.showDialog(WidgetListActivity.FOUND_WIDGETS_DIALOG);					
				}
			}
		}).execute();		
	}

	Dialog createDialog(int id) {
		if(id == WidgetListActivity.SCANNING_DIALOG) {
			ProgressDialog progressDialog = new ProgressDialog(activity);
			progressDialog.setMessage(activity.getString(R.string.scanning_storage_card));
			return progressDialog;
		}
		if(id == WidgetListActivity.NO_WIDGETS_DIALOG) {
			AlertDialog.Builder builder = new AlertDialog.Builder(activity);
			builder.setMessage("No widgets found")
			.setCancelable(false)
			.setPositiveButton("Scan again", new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int id) {
					dialog.cancel();
					scan();
				}
			})
			.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int id) {
					dialog.cancel();
				}
			});
			return builder.create();
		}
		if(id == WidgetListActivity.FOUND_WIDGETS_DIALOG) {
			AlertDialog.Builder builder = new AlertDialog.Builder(activity);
			builder.setMessage("Available widgets")
			.setCancelable(false)
			.setPositiveButton("Install", new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int id) {
					ArrayList<String> selected = new ArrayList<String>();
					for(int i = 0; i < wgtFiles.size(); i++) {
						String wgtPath = wgtFiles.get(i);
						Boolean isChecked = checkedState.get(wgtPath);
						if(isChecked != null && isChecked.booleanValue()) {
							selected.add(wgtPath);
						}
					}
					Intent installIntent = new Intent(activity, WidgetInstallActivity.class);
					installIntent.putExtra("path", selected.toArray(new String[selected.size()]));
					activity.startActivity(installIntent);
					dialog.cancel();
				}
			})
			.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int id) {
					dialog.cancel();
				}
			});
			ListView foundList = new ListView(activity);
			final ListAdapter adapter = getListAdapter();
			foundList.setAdapter(adapter);
			builder.setView(foundList);
			return builder.create(); 
		}
		return null;
	}

	public void onPrepareDialog(int id, Dialog dialog) {
	}

}
