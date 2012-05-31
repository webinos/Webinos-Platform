/*******************************************************************************
*	Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*		 http://www.apache.org/licenses/LICENSE-2.0
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

this.WidgetManager = (function() {
	var path = require('path');
	var fs   = require('fs');
	var nPathV = parseFloat(process.versions.node);
	if (nPathV >= 0.7) { nPathV = fs;} else { nPathV = path;}

	var MODE_INSTALL = 0,
	    MODE_UPDATE  = 1;

	var callPrepareListener = function(listener, processingResult) {
		if(listener) {
			if(typeof(listener) == 'function')
				listener(processingResult);
			else if(listener.onPrepareComplete)
				listener.onPrepareComplete(processingResult);
		}
	};

	function PendingInstall(processor, resource, processingResult, widgetConfig, listener) {
		this.processor = processor;
		this.resource = resource;
		this.processingResult = processingResult;
		this.widgetConfig = widgetConfig;
		this.listener = listener;
		this.pendingAsyncCount = 0;
	}

	PendingInstall.prototype.onStatusChange = function(status) {
		if(status >= 0) {
			/* a terminal state */
			var complete = (--this.pendingAsyncCount == 0);
			if(complete) {
				processor.postAsync(this);
				callPrepareListener(this.listener, this.processingResult);
			}
		}
	};

	/* public constructor */
	function WidgetManager(storage) {
		this.storage = storage;
		this.cachedConfigs = new CacheMap();
		this.pendingInstalls = {};
	}

	/* public static variables */
	WidgetManager.MODE_INSTALL = MODE_INSTALL;
	WidgetManager.MODE_UPDATE = MODE_UPDATE;

	/*
	 * Permanently remove the specified widget from the widgetmanager
	 */
	WidgetManager.prototype.uninstall = function(installId) {
		try {
			this.cachedConfigs.remove(installId);
			this.storage.deleteItem(installId);
		} catch (e) {}
	};

	/*
	 * List all currently installed and enabled widgets
	 */
	WidgetManager.prototype.getInstalledWidgets = function() {
		var result;
		try {
			result = this.storage.listItems();
		} catch (e) {}
		return result;
	};

	/*
	 * Get the directory into which the widget content has been extracted
	 * @param installId the installId of the widget
	 * @return fully qualified path to the widget's content directory
	 */
	WidgetManager.prototype.getWidgetDir = function(installId) {
		var result;
		try {
			result = this.storage.getWidgetDir(installId);
		} catch (e) {}
		return result;
	};

	/*
	 * Get the configuration for the named widget
	 * @param installId the installId of the widget
	 * @return the WidgetConfig
	 */
	WidgetManager.prototype.getWidgetConfig = function(installId) {
		var result = this.cachedConfigs.get(installId);
		if(!result) {
			try {
				result = WidgetPersistence.readWidgetMetadata(this.storage, installId);
				if(result)
					this.cachedConfigs.put(installId, result);
			} catch(e){}
		}
		if(result)
			result.installId = installId;
		return result;
	};

	/*
	 * Prepare a widget resource for installation
	 * This processes the widget resource and performs digsig validation,
	 * assigns an installID and places the widget in a disabled state.
	 * It is expected that with the processing results, the user will
	 * be prompted, and then either completeInstall or abortInstall will
	 * be called to complete the operation.
	 * 
	 * This method is asynchronous - all asynchronous dependencies of widget
	 * processing are scheduled, and the supplied listener is called when all
	 * are complete.
	 * 
	 * @param resourcePath - fully qualified path to the widget resource file
	 * @param constraints  - the constraints to be used for the processing
	 * @param listener     - the listener to be notified when processing is complete
	 * @return the IProcessingResult with the results
	 */
	WidgetManager.prototype.prepareInstall = function(resource, constraints, listener) {
		try {
			/* perform the widget processing */
			if(!nPathV.existsSync(resource)) throw new Error("Widget resource file does not exist");
			var processor = new WidgetProcessor(resource, constraints);
			var that = this;
			var storage = this.storage;
	
			var onProcess = function(processingResult) {
				if(processingResult.status != WidgetConfig.STATUS_OK) {
					callPrepareListener(listener, processingResult);
				}
	
				/* basic processing was successful, so determine status of any existing
				 * version of this widget */
				var existingConfig, existingValidation;
				var installId = processingResult.widgetConfig.installId;
				if(storage.containsItem(installId)) {
					/* generate comparison */
					existingConfig = that.getWidgetConfig(installId);
					if(existingConfig) {
						existingValidation = WidgetPersistence.readWidgetPolicy(storage, installId);
						var comparisonResult = processor.compareTo(existingConfig, existingValidation, storage.hasUserdata(installId));
						if(comparisonResult.getError()) {
							callPrepareListener(listener, processingResult);
						}
					}
				}
	
				/* allocate space in the storage if necessary */
				storage.createItem(installId);
	
				/* extract icon */
				var widgetConfig = processingResult.widgetConfig;
				if(widgetConfig.prefIcon)
					WidgetPersistence.extractFile(that.storage.getWidgetDir(installId), processingResult.widgetResource, processingResult.localisedFileMapping, widgetConfig.prefIcon);
	
				/* if all OK, this pending install is ready for async dependencies */
				var pendingInstall = new PendingInstall(processor, processor.getWidgetResource(), processingResult, widgetConfig, listener);
				that.pendingInstalls[installId] = pendingInstall;
	
				/* process pending async dependencies, if any */
				var hasAsync = false;
				if(constraints && constraints.processAsyncDependencies) {
					var dependencies = processor.asyncDependencies;
					if(dependencies) {
						for(var i in dependencies) {
							dependencies[i].resolve(storage, installId, pendingInstall);
							pendingInstall.pendingAsyncCount++;
							hasAsync = true;
						}
					}
				}
	
				/* if nothing pending, complete now */
				if(!hasAsync) {
					/* complete now */
					that.postAsync(pendingInstall);
					callPrepareListener(listener, processingResult);
				}
			};
	
			processor.process(false, onProcess);
			return WidgetConfig.STATUS_OK;
		} catch(e) {
			Logger.logAction(Logger.LOG_ERROR, "WidgetManager.prepareInstall() exception", e.stack);
			var processingResult = new ProcessingResult();
			e.status = WidgetConfig.STATUS_IO_ERROR;
			processingResult.setError(e);
			callPrepareListener(processingResult, listener);
			return e.status;
		}
	};

	/*
	 * Finish widget processing and enable the installed widget
	 * @param installId the widget installId
	 * @param preserveUserdata true if existing userdata is preserved
	 * @return the status
	 */
	WidgetManager.prototype.completeInstall = function(installId, preserveUserdata) {
		try {
			var pendingInstall = this.pendingInstalls[installId];
			if(pendingInstall) {
				/* finalise the installation processing */
				var processingResult = pendingInstall.processingResult;
				WidgetPersistence.writeWidgetMetadata(this.storage, installId, pendingInstall.widgetConfig);

				WidgetPersistence.extractWidget(this.storage, installId, pendingInstall.resource, processingResult.localisedFileMapping);
				this.storage.setItemEnabled(installId, true, preserveUserdata);
				this.cachedConfigs.put(installId, pendingInstall.widgetConfig);
				delete this.pendingInstalls[installId];
				pendingInstall.processor.dispose();
			}
			return WidgetConfig.STATUS_OK;
		} catch(e) {
			Logger.logAction(Logger.LOG_ERROR, "WidgetManager.completeInstall()", e);
			return WidgetConfig.STATUS_IO_ERROR;
		}
	};

	/*
	 * Abort the pending installation of the widget
	 * @param installId the widget installId
	 * @return the status
	 */
	WidgetManager.prototype.abortInstall = function(installId) {
		try {
			var pendingInstall = pendingInstalls[installId];
			if(pendingInstall) {
				delete this.pendingInstalls[installId];
				this.storage.deleteItem(installId);
				pendingInstall.processingResult.dispose();
			}
			return WidgetConfig.STATUS_OK;
		} catch(e) {
			return WidgetConfig.STATUS_IO_ERROR;
		}
	};

	/*
	 * Re-perform widget processing to adjust for changes in the processing constraints.
	 * This will react to the following changes in constraints:
	 * - locales;
	 * - security policy;
	 * The widget might remain enabled but with changes to configuration, or it may become
	 * disabled, or it may become re-enabled.
	 * @param installId the installId
	 * @param constraints the new constraints
	 * @return the status
	 */
	WidgetManager.prototype.reinstall = function(installId, constraints) {
		this.storage.setItemEnabled(installId, false, false);

		/* redo only the required parts of re-processing */
		var wgtFile = this.storage.getMetaFile(installId, WidgetStorage.WGT_FILE);
		var processor = new WidgetProcessor(wgtFile, constraints);
		var processingResult = processor.process(true);
		var status = processingResult.status;
		if(status != WidgetConfig.STATUS_OK )
			return status;

		var widgetConfig = processingResult.widgetConfig;
		WidgetPersistence.writeWidgetMetadata(storage, installId, widgetConfig);
		var res = new ZipWidgetResource(wgtFile);
		WidgetPersistence.extractWidget(storage, installId, res, processingResult.localisedFileMapping);
		this.storage.setItemEnabled(installId, true, true);
		this.cachedConfigs.put(installId, widgetConfig);
		processingResult.dispose();
		return WidgetConfig.STATUS_OK;
	};

	var processFeatureRequests = function(processor, securityContext, features) {
		/*
		 * ASSERTION (BONDI A&S)
		 *
		 * The WRT MUST take the following device capability mediation actions prior
		 * to launching widgets, as specified in [BONDI A&S]:
		 * AS-0390: The WRT MUST resolve all dependencies of Features referenced statically
		 *          at install time, or at instantiation time for Widget Resources that are
		 *          instantiated without prior installation.
		 * AS-0430: As part of the resolution of each statically referenced Feature, the WRT
		 *          MUST evaluate an access control Query that determines whether or not the
		 *          Widget is authorised to access the requested Feature. If the evaluated
		 *          Decision of that Query is Deny, and the dependency is marked as required,
		 *          the WRT MUST abort installation and it MUST not be possible to instantiate
		 *          that Widget.
		 * AS-0440: If permission is not granted for that Widget to access that Feature, and
		 *          the dependency is marked as optional, the WRT MUST continue installation.
		 *          The WRT MUST fail access to any associated JavaScript API at runtime if
		 *          the dependency remains unsatisfied at the time the Widget is instantiated.
		 */
		for(var i in features) {
			var feature = features[i];
			if(securityContext) {
				var access = new FeatureAccess(securityContext, feature);
				access.getAccess();
				access.dispose();
				if(access.maxEffect == SecurityContext.EFFECT_DENY) {
					if(feature.required) {
						// the widget cannot be installed
						Logger.logAction('AS-0440', 'unable to install widget because of denied required feature (' + feature.name + ')');
						processor.setError(new Artifact(WidgetConfig.STATUS_DENIED, Artifact.CODE_DENIED_FEATURE, 'AS-0440', [feature]));
						processor.setStatus(WidgetConfig.STATUS_DENIED);
						break;
					}
					Logger.logAction('AS-0440', 'continue installation with denied nonrequired feature (' + feature.name + ')');
				}
			}
		}
	};

	var processAccessRequests = function(processor, securityContext, accessRequests) {
		/*
		 * Process the requested accesses, and eliminate those that are unconditionally denied
		 */
		var filteredRequests = [];
		for(var i in accessRequests) {
			var accessRequest = accessReauests[i];
			if(securityContext) {
				var access = new NetworkAccess(securityContext, accessRequest);
				access.getAccess();
				if(access.xhrEffect == SecurityContext.EFFECT_DENY && access.domEffect == SecurityContext.EFFECT_DENY)
					continue;
				accessRequest.xhrEffect = access.xhrEffect;
				accessRequest.domEffect = access.domEffect;
			}
			filteredRequests.push(accessRequest);
		}
		return filteredRequests;
	};

	WidgetManager.prototype.postAsync = function(pendingInstall) {
		/* save policy attributes and run security queries */
		var widgetConfig = pendingInstall.widgetConfig;
		var installId = widgetConfig.installId;
		var processingResult = pendingInstall.processingResult;
		var processor = pendingInstall.processor;
		var securityContext;
		try {
			WidgetPersistence.writeWidgetPolicy(this.storage, installId, widgetConfig, processingResult.validationResult);
			var attrFile = this.storage.getMetaFile(installId, WidgetStorage.POLICY_FILE);
			securityContext;// = Security.createContext(installId, attrFile);
			processFeatureRequests(processor, securityContext, widgetConfig.featureList);
			widgetConfig.accessRequestList = processAccessRequests(processor, securityContext, widgetConfig.accessRequestList);
		} catch (e) {
			Logger.logAction("postAsync.exception", e);
			processor.setError(
				new Artifact(WidgetConfig.STATUS_IO_ERROR,
					0,
					"postAsync.exception",
					null));
		} finally {
			if(securityContext)
				securityContext.dispose();		
		}
	};

	return WidgetManager;
})();
