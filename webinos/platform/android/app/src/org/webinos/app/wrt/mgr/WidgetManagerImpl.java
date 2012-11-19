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

package org.webinos.app.wrt.mgr;

import java.util.ArrayList;
import java.util.HashMap;

import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

public class WidgetManagerImpl extends WidgetManager implements IModule {
	
	private WidgetProcessor processor;
	
	/*****************************
	 * WidgetManager change events
	 *****************************/

	public interface EventListener {
		public static final int WIDGET_ADDED   =  0;
		public static final int WIDGET_UPDATED =  1;
		public static final int WIDGET_REMOVED =  2;
		public void onWidgetChanged(String installId, int event);
	}
	
	public void addEventListener(EventListener listener) {
		if(!eventListeners.contains(listener))
			eventListeners.add(listener);
	}
	
	public void removeEventListener(EventListener listener) {
		if(eventListeners.contains(listener))
			eventListeners.remove(listener);
	}
	
	private ArrayList<EventListener> eventListeners = new ArrayList<EventListener>();
	
	private void notifyListeners(String installId, int event) {
		for(EventListener listener : eventListeners)
			listener.onWidgetChanged(installId, event);
	}

	private HashMap<String, ComparisonResult> pendingInstalls = new HashMap<String, ComparisonResult>();

	/*****************************
	 * WidgetManager methods
	 *****************************/

	@Override
	public void setWidgetProcessor(WidgetProcessor processor) {
		this.processor = processor;
		WidgetManagerService.onStarted(this);
	}

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		return this;
	}

	@Override
	public void stopModule() {
		processor = null;
	}

	/*****************************
	 * WidgetProcessor methods
	 *****************************/
	
	public String[] getInstalledWidgets() {
		if(processor == null)
			throw new RuntimeException("WidgetManager: native widget processor not available");
		return processor.getInstalledWidgets();
	}

	public String getWidgetDir(String installId) {
		if(processor == null)
			throw new RuntimeException("WidgetManager: native widget processor not available");
		return processor.getWidgetDir(installId);
	}

	public WidgetConfig getWidgetConfig(String installId) {
		if(processor == null)
			throw new RuntimeException("WidgetManager: native widget processor not available");
		return processor.getWidgetConfig(installId);
	}

	public void prepareInstall(String widgetResource, Constraints constraints,
			final PrepareCallback callback) {
		if(processor == null)
			throw new RuntimeException("WidgetManager: native widget processor not available");
		PrepareListener listener = new PrepareListener(getEnv()) {
			@Override
			public void onPrepareComplete(ProcessingResult processingResult) {
				if(processingResult.widgetConfig != null && processingResult.comparisonResult != null)
					pendingInstalls.put(processingResult.widgetConfig.installId, processingResult.comparisonResult);
				callback.onPrepareComplete(processingResult);
			}
		};
		processor.prepareInstall(widgetResource, constraints, listener);
	}

	public void completeInstall(String installId) {
		if(processor == null)
			throw new RuntimeException("WidgetManager: native widget processor not available");
		int mode = -1;
		ComparisonResult comparison = pendingInstalls.get(installId);
		if(comparison != null) {
			mode = (comparison.existingConfig == null) ? EventListener.WIDGET_ADDED : EventListener.WIDGET_UPDATED;
			pendingInstalls.remove(installId);
		}
		processor.completeInstall(installId);
		notifyListeners(installId, mode);
	}

	public void abortInstall(String installId) {
		if(processor == null)
			throw new RuntimeException("WidgetManager: native widget processor not available");
		pendingInstalls.remove(installId);
		processor.abortInstall(installId);
	}

	public void uninstall(String installId) {
		if(processor == null)
			throw new RuntimeException("WidgetManager: native widget processor not available");
		processor.uninstall(installId);
		notifyListeners(installId, EventListener.WIDGET_REMOVED);
	}

}
