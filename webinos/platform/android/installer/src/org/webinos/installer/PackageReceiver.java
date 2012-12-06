package org.webinos.installer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PackageReceiver extends BroadcastReceiver {
	@Override
	public void onReceive(Context context, Intent intent) {
		InstallActivity.resumeFromPackageIntent(context, intent, false);
	}
}
