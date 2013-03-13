package org.webinos.installer;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.content.DialogInterface.OnDismissListener;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

public class InstallActivity extends Activity {

	public static final String ACTION_POSTINSTALL_COMPLETE = "org.webinos.installer.POSTINSTALL_COMPLETE";
	private static final String TAG = "Apk installer: MainActivity";
	private static final String CONFIG_FILE = "config/config.properties";
	private static final String TARGET_PATH = "targets/";
	private static final String TMP_DIR = "asset_tmp";
	private static InstallActivity theActivity;
	private static Properties config;
	private static Target[] targets;

	private ProgressDialog progressDialog;
	private Target pendingTarget;

	private static class Target {
		String name;
		String packageName;
		String version;
		String file;
		String postInstallAction;
	}

	static void resumeFromPackageIntent(Context context, Intent intent, boolean postInstall) {
		String packageName = intent.getData().getSchemeSpecificPart();
		Target pendingTarget = (theActivity == null) ? null : theActivity.pendingTarget;

		/* if the package in question isn't one of ours, return */
		if(getTarget(context, packageName) == null) {
			if(pendingTarget != null) {
				/* we were in the middle of installing anyway, so don't shutdown */
				return;
			}
			/* we were woken by some other package being installed, so exit */
			System.exit(0);
		}

		Intent resumeIntent;
		if(theActivity != null) {
			resumeIntent = new Intent(theActivity, InstallActivity.class);
			/* check that it's the package we thought we were installing;
			 * if it is, it's no longer pending */
			if(pendingTarget != null && packageName.equals(pendingTarget.packageName)) {
				if(pendingTarget.postInstallAction != null) {
					/* trigger the postinstall action */
					Intent postInstallIntent = new Intent(pendingTarget.postInstallAction);
					context.sendBroadcast(postInstallIntent);
				}
				theActivity.pendingTarget = null;
			}

			/* use the activity context if we have it */
			resumeIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
			context = theActivity;
		} else {
			/* use the supplied (application) context */
			resumeIntent = new Intent(context, InstallActivity.class);
			resumeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		}
		context.startActivity(resumeIntent);
	}

	private void end(String title, String message, boolean complete) {
		final boolean hasProgress = progressDialog != null && progressDialog.isShowing();
		if(hasProgress) {
			progressDialog.dismiss();
			progressDialog = null;
		}

		AlertDialog dialog = (new AlertDialog.Builder(this)).create();
		dialog.setTitle(title);
		dialog.setMessage(message);
		dialog.setIcon(getResources().getDrawable(R.drawable.ic_launcher));
		dialog.setOnDismissListener(new OnDismissListener() {
			@Override
			public void onDismiss(DialogInterface dialog) {
				pendingTarget = null;
				theActivity = null;
				finish();
				/* force the installer to exit; otherwise it sits around indefinitely */
				System.exit(0);
			}});
		dialog.setButton(getString(R.string.ok), new OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				dialog.dismiss();
			}
		});
		dialog.show();
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
	}

	@Override
	public void onStart() {
		Log.v(TAG, "onStart()");
		super.onStart();
		boolean subsequentStart = (theActivity == this);
		theActivity = this;
		if(progressDialog != null) {
			progressDialog.dismiss();
			progressDialog = null;
		}

		if(pendingTarget != null) {
			/* the attempted installation of the pendingTarget
			 * either failed, or was cancelled by the user, so
			 * we're finished */
			end(getString(R.string.install_failed_title), getString(R.string.install_failed_cancelled), false);
			return;
		}

		/* read list of targets, and compile a list
		 * of required installs / updates */
		PackageManager pm = getPackageManager();

		/* if nothing to do, then exit */
		getTargets(this);
		if(targets == null || targets.length == 0) {
			end(getString(R.string.install_complete_title), getString(R.string.install_complete), subsequentStart);
			return;
		}

		List<Target> required = new ArrayList<Target>();
		for(Target target : targets) {
			try {
				PackageInfo targetInfo = pm.getPackageInfo(target.packageName, 0);
				String existingVersion = targetInfo.versionName;
				if(!existingVersion.equals(target.version))
					required.add(target);
			} catch (NameNotFoundException e) {
				required.add(target);
			}
		}

		/* if nothing to do, then exit */
		if(required.isEmpty()) {
			end(getString(R.string.install_complete_title), getString(R.string.install_complete), false);
			return;
		}

		int targetSdk = Integer.valueOf(config.getProperty("target.sdkVersion"));
		if(targetSdk > Build.VERSION.SDK_INT) {
			end(getString(R.string.install_failed_title), getString(R.string.incompatible_version), false);
			return;
		}

		/* we only trigger the installation of the first item in the list */
		pendingTarget = required.get(0);
		(new AsyncTask<Target, Integer, File>() {
			@Override
			protected void onPreExecute() {
				/* start progressbar */
				progressDialog = new ProgressDialog(InstallActivity.this);
				progressDialog.setCancelable(false);
				progressDialog.setMessage(getString(R.string.install_extracting) + ": " + pendingTarget.name);
				progressDialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
				progressDialog.setMax(100);
				progressDialog.show();
			}
			@Override
			protected void onProgressUpdate(Integer... progress) {
				progressDialog.setProgress(progress[0]);
			}
			@Override
			protected File doInBackground(Target... pendingTargets) {
				//File outputDir = getDir(TMP_DIR, MODE_WORLD_READABLE);
				File outputDir = new File("/sdcard");
				File apkFile = new File(outputDir, pendingTargets[0].file);
				InputStream is = null;
				OutputStream os = null;
				int read;
				byte[] buffer = new byte[128 * 1024];
				try {
					is = getAssets().open(TARGET_PATH + pendingTargets[0].file);
					long totalLen = is.available();
					long totalCopied = 0;
					os = new FileOutputStream(apkFile);
					while((read = is.read(buffer)) != -1) {
						os.write(buffer, 0, read);
						totalCopied += read;
						publishProgress(Integer.valueOf((int)(totalCopied * 100 / totalLen)));
					}
				} catch (IOException e) {
					apkFile = null;
				} finally {
					try {
						if(is != null)
							is.close();
						if(os != null) {
							os.flush();
							os.close();
						}
					} catch(IOException e) {}
				}
				return apkFile;
			}
			@Override
			protected void onPostExecute(File apkFile) {
				/* if there was an error extracting the file, exit */
				if(apkFile == null) {
					end(getString(R.string.install_failed_title), getString(R.string.install_failed), false);
					return;
				}
				/* trigger the installation of this target */
				Intent installIntent = new Intent(Intent.ACTION_VIEW);
				installIntent.setDataAndType(Uri.fromFile(apkFile), "application/vnd.android.package-archive");
				startActivity(installIntent);
			}
		}).execute(pendingTarget);
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		theActivity = null;
	}

	private static synchronized Target[] getTargets(Context ctx) {
		if(targets != null)
			return targets;

		InputStream is = null;
		config = new Properties();
		try {
			Log.v(TAG, "Loading config file from assets");
			config.load(is = ctx.getAssets().open(CONFIG_FILE));
			int count = Integer.valueOf(config.getProperty("target.count"));
			if(count > 0) {
				targets = new Target[count];
				for(int i = 0; i < count; i++) {
					String propertyBase = "target." + String.valueOf(i) + ".";
					Target target = targets[i] = new Target();
					target.name = config.getProperty(propertyBase + "name");
					target.packageName = config.getProperty(propertyBase + "package");
					target.version = config.getProperty(propertyBase + "version");
					target.file = config.getProperty(propertyBase + "file");
					target.postInstallAction = config.getProperty(propertyBase + "postinstall");
				}
			}
		} catch(IOException e) {
			Log.e(TAG, "Unable to read targets config", e);
		} finally {
			if(is != null)
				try { is.close(); } catch (IOException e) {}
		}
		return targets;
	}

	private static Target getTarget(Context ctx, String packageName) {
		getTargets(ctx);
		for(Target target : targets) {
			if(target.packageName.equals(packageName))
				return target;
		}
		return null;
	}
}
