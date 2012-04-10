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
import org.webinos.app.wrt.mgr.WidgetManagerImpl;
import org.webinos.app.wrt.mgr.WidgetManagerService;

import android.app.Dialog;
import android.app.ListActivity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.ContextMenu;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView.AdapterContextMenuInfo;
import android.widget.ListView;
import android.widget.Toast;

public class WidgetListActivity extends ListActivity implements WidgetManagerService.LaunchListener, WidgetManagerImpl.EventListener {
	static final String ACTION_START = "org.webinos.wrt.START";
	static final String ACTION_STOP = "org.webinos.wrt.STOP";
	static final String ACTION_STOPALL = "org.webinos.wrt.STOPALL";
	static final String CMD = "cmdline";
	static final String INST = "instance";
	static final String ID = "id";
	static final String OPTS = "options";

	static final int SCAN_MENUITEM_ID     = 0;
	static final int CONTEXT_MENUITEM_ID  = 1;
	static final int SCANNING_DIALOG      = 0;
	static final int NO_WIDGETS_DIALOG    = 1;
	static final int FOUND_WIDGETS_DIALOG = 2;

	private WidgetManagerImpl mgr;
	private WidgetImportHelper scanner;
	private Handler asyncRefreshHandler;
	private String[] ids;

	@Override
	public void onCreate(Bundle bundle) {
		super.onCreate(bundle);
		registerForContextMenu(getListView());
		asyncRefreshHandler = new Handler() {
			@Override
			public void handleMessage(Message msg) {
				initList();
			}
		};
		mgr = WidgetManagerService.getInstance(this, this);
		if(mgr != null) {
			mgr.addEventListener(this);
			initList();
		}
		scanner = new WidgetImportHelper(this);
	}

	@Override
	public void onPause() {
		super.onPause();
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
	}

	@Override
	public void onCreateContextMenu(ContextMenu menu, View v, ContextMenu.ContextMenuInfo menuInfo) {
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.widget_list_context_menu, menu);
	}

	@Override
	public boolean onContextItemSelected(MenuItem item) {
		AdapterContextMenuInfo info = (AdapterContextMenuInfo) item.getMenuInfo();
		String installId = ids[(int)info.id];
		switch(item.getItemId()) {
		case R.id.menu_uninstall:
			Intent intent = new Intent(this, WidgetUninstallActivity.class);
			intent.putExtra("installId", installId);
			startActivity(intent);
			return true;
		case R.id.menu_check_for_updates:
			Toast.makeText(this, "Not yet implemented", Toast.LENGTH_SHORT).show();
			return true;
		case R.id.menu_details:
			Toast.makeText(this, "Not yet implemented", Toast.LENGTH_SHORT).show();
			return true;
		default:
			return super.onContextItemSelected(item);
		}
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		super.onCreateOptionsMenu(menu);
		menu.setQwertyMode(true);
		menu.add(0, SCAN_MENUITEM_ID, 0, "Scan SD card");
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		if(item.getItemId() != SCAN_MENUITEM_ID)
			return false;

		scanner.scan();
		return true;    
	}

	@Override
	protected void onListItemClick(ListView l, View v, int position, long id) {
		String item = (String) getListAdapter().getItem(position);
		Context ctx = getApplicationContext();
		Intent wrtIntent = new Intent(ACTION_START);
		wrtIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); /* Intent.FLAG_INCLUDE_STOPPED_PACKAGES */
		wrtIntent.putExtra(ID, item);
		ctx.startActivity(wrtIntent);
	}

	public void onLaunch(final WidgetManagerImpl mgr) {
		this.mgr = mgr;
		mgr.addEventListener(this);
		asyncRefreshHandler.sendEmptyMessage(0);
	}

	private void initList() {
		ids = mgr.getInstalledWidgets();
		setListAdapter(new WidgetListAdapter(this, ids));
	}

	@Override
	public Dialog onCreateDialog(int id) {
		Dialog result = scanner.createDialog(id);
		if(result == null)
			result = super.onCreateDialog(id);
		return result;
	}

	@Override
	public void onPrepareDialog(int id, Dialog dialog) {
		scanner.onPrepareDialog(id, dialog);
		super.onPrepareDialog(id, dialog);
	}

	@Override
	public void onWidgetChanged(String installId, int event) {
		asyncRefreshHandler.sendEmptyMessage(0);
	}
}
