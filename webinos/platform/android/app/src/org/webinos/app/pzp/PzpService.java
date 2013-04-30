package org.webinos.app.pzp;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;

import org.meshpoint.anode.Isolate;
import org.meshpoint.anode.Runtime;
import org.meshpoint.anode.Runtime.IllegalStateException;
import org.meshpoint.anode.Runtime.InitialisationException;
import org.meshpoint.anode.Runtime.NodeException;
import org.meshpoint.anode.Runtime.StateListener;
import org.webinos.app.anode.AnodeService;
import org.webinos.app.platform.Config;
import org.webinos.app.platform.PlatformInit;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class PzpService extends Service implements StateListener {

	private static final String TAG = PzpService.class.getCanonicalName();

	/**
	 * Listener for asynchronous indications of service availability
	 */
	interface PzpServiceListener {
		public void onServiceAvailable(PzpService service);
	}

	public enum PzpState {
		STATE_UNINITIALISED,
		STATE_CREATED,
		STATE_STARTED,
		STATE_STOPPING,
		STATE_STOPPED
	}

	/**
	 * Listener for asynchronous indications of service availability
	 */
	interface PzpStateListener {
		public void onStateChanged(PzpState state);
	}

	/**
	 * Listeners waiting for service availability
	 */
	private static List<PzpServiceListener> serviceListeners = new ArrayList<PzpServiceListener>();

	/**
	 * The singleton service
	 */
	private static PzpService theService;

	/**
	 * Synchronously obtain the service instance, if it already exists.
	 * This will not trigger the service being started; only use in contexts
	 * where it is known that the service will already have been started.
	 * @return the service instance if available
	 */
	static synchronized PzpService getService() { return theService; }

	/**
	 * Get the service instance, registering a callback for the case that
	 * the service is not currently avaiable. If not available, the service
	 * will be started.
	 * @param ctx a context to use to start the service if required.
	 * @param listener a listener to call with the service instance, in the case that
	 * the service was not available already. If the service was available at the time
	 * the call was made, then the instance will be returned directly and the listener
	 * will NOT be called.
	 * @return the service instance if available; or null otherwise
	 */
	static PzpService getService(Context ctx, PzpServiceListener listener) {
		PzpService foundService = null;
		/* synchronously check, and add listener if necessary */
		synchronized(PzpService.class) {
			if(theService == null) {
				serviceListeners.add(listener);
			}
			foundService = theService;
		}
		/* start service if necessary */
		if(foundService == null) {
			ctx.startService(new Intent(ctx, PzpService.class));
		}
		/* return synchronously obtained instance */
		return foundService;
	}

	/*******************
	 * private state
	 *******************/

	private List<PzpStateListener> stateListeners = new ArrayList<PzpStateListener>();
	private ConfigParams configParams;
	private String instance;
	private Isolate isolate;
	private PzpState state = PzpState.STATE_UNINITIALISED;
	private static final String LASTCONFIG = "lastconfig";

	/*******************
	 * service prerequisites
	 *******************/

	@Override
	public void onCreate() {
		super.onCreate();
		/* init config */
		initConfig();
		/* synchronously set ourselves as the singleton instance, and notify
		 * and pending listeners */
		synchronized(PzpService.class) {
			theService = this;
			for(PzpServiceListener listener : serviceListeners)
				listener.onServiceAvailable(theService);
			serviceListeners = null;
		}

		/* if the platform is not yet initialised, wait until that
		 * has completed and retry */
		if(PlatformInit.onInit(this, new Runnable() {
			@Override
			public void run() {
				/* init (deferred case) */
				onPlatformInit();
			}
		})) {
			/* init (no wait) */
			onPlatformInit();
		}
	}

	private void onPlatformInit() {
		if("true".equals(getConfig().autoStart))
			startPzp();
	}

	@Override
	public IBinder onBind(Intent intent) {
		// TODO Auto-generated method stub
		return null;
	}

	/*******************
	 * Config
	 *******************/

	public class ConfigParams {
		String autoStart;

		void readConfig() {
			BufferedReader reader = null;
			try {
				reader = new BufferedReader(new InputStreamReader(openFileInput(LASTCONFIG)));
				autoStart = reader.readLine();
			} catch (IOException e) {
			} finally {
				try {
					if(reader != null)
						reader.close();
				} catch (IOException e) {}
			}
		}
		
		void writeConfig() {
			BufferedWriter writer = null;
			try {
				writer = new BufferedWriter(new OutputStreamWriter(openFileOutput(LASTCONFIG, MODE_PRIVATE)));
				writer.write(autoStart + '\n');
			} catch (IOException e) {
			} finally {
				try {
					if(writer != null)
						writer.close();
				} catch (IOException e) {}
			}
		}

		String getCmd() {
            try{
			    return Config.getInstance().getProperty("pzp.cmd");
            }catch (Exception ex){
                Log.e(TAG, "FAILED TO READ CONFIG CMD",ex);
                return "data/data/org.webinos.app/node_modules/webinos/wp4/webinos_pzp.js";
            }
		}
	}

	private void initConfig() {
		/* read last config */
		configParams = new ConfigParams();
		configParams.readConfig();

		/* set defaults if not already set */
		Config config = Config.getInstance();
		if(configParams.autoStart == null)
            if (config!=null)
			    configParams.autoStart = config.getProperty("pzp.autoStart");
            else{
                configParams.autoStart = "false";
                Log.e(TAG, "FAILED TO READ CONFIG autoStart");
            }
	}

	/*******************
	 * public API
	 *******************/

	public ConfigParams getConfig() {
		return configParams;
	}

	public void updateConfig() {
		configParams.writeConfig();
	}

	public void startPzp() {
		String cmd = configParams.getCmd();
		Log.v(TAG, "PZP start: starting with cmd: " + cmd);

		try {
			Runtime.initRuntime(this, new String[]{});
			isolate = Runtime.createIsolate();
			isolate.addStateListener(this);
			this.instance = AnodeService.addInstance(instance, isolate);
			isolate.start(cmd.split("\\s"));
		} catch (IllegalStateException e) {
			Log.v(TAG, "isolate start: exception: " + e + "; cause: " + e.getCause());
		} catch (NodeException e) {
			Log.v(TAG, "isolate start: exception: " + e);
		} catch (InitialisationException e) {
			Log.v(TAG, "runtime init: exception: " + e);
		}
	}

	public void stopPzp() {
		if(instance == null) {
			Log.v(TAG, "AnodeReceiver.onReceive::stop: no instance currently running for this activity");
			return;
		}
		try {
			isolate.stop();
		} catch (IllegalStateException e) {
			Log.v(TAG, "isolate stop : exception: " + e + "; cause: " + e.getCause());
		} catch (NodeException e) {
			Log.v(TAG, "isolate stop: exception: " + e);
		}
	}

	/*******************
	 * PZP state management
	 *******************/

	@Override
	public void stateChanged(int anodeState) {
		PzpStateListener[] iterator;
		PzpState updatedState = PzpState.STATE_UNINITIALISED;

		/* convert the isolate state to a PzpState */
		switch(anodeState) {
		case Runtime.STATE_CREATED:
			updatedState = PzpState.STATE_CREATED;
			break;
		case Runtime.STATE_STARTED:
			updatedState = PzpState.STATE_STARTED;
			break;
		case Runtime.STATE_STOPPING:
			updatedState = PzpState.STATE_STOPPING;
			break;
		case Runtime.STATE_STOPPED:
			updatedState = PzpState.STATE_STOPPED;
			break;
		}

		/* synchronously update the state, and get a
		 * snapshot of the current listeners */
		synchronized(this) {
			state = updatedState;
			iterator = stateListeners.toArray(new PzpStateListener[stateListeners.size()]);
		}

		/* notify listeners */
		for(PzpStateListener listener : iterator)
			listener.onStateChanged(updatedState);
	}

	/**
	 * Get the current PZP state
	 * @return the current state
	 */
	public synchronized PzpState getPzpState() {
		return state;
	}

	/**
	 * Add a listener for PZP state changes
	 * @param listener the listener
	 */
	public synchronized void addPzpStateListener(PzpStateListener listener) {
		stateListeners.add(listener);
	}

	/**
	 * Remove an existing PZP state listener
	 * @param listener the listener
	 */
	public synchronized void removePzpStateListener(PzpStateListener listener) {
		stateListeners.remove(listener);
	}

}
