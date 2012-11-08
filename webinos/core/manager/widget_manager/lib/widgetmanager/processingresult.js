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

this.ProcessingResult = (function() {
  
  /* public constructor */
  function ProcessingResult() {
    this.status = WidgetConfig.STATUS_OK;
    this.error = undefined;
    this.warnings = undefined;
    this.comparisonResult = undefined;
    this.validationResult = undefined;
    this.widgetConfig = undefined;
    this.localisedFileMapping = undefined;
  }

  /* public instance methods */
  ProcessingResult.prototype.getInstallId = function() { return this.widgetConfig ? this.widgetConfig.installId : undefined; };

  ProcessingResult.prototype.setStatus = function(status) {
  if(this.status == WidgetConfig.STATUS_OK)
    this.status = status;
  };

  ProcessingResult.prototype.setError = function(error) {
    Logger.logAction(Logger.LOG_ERROR, error.reason, error.getStatusText());
    this.error = error;
    this.status = error.status;
  };

  ProcessingResult.prototype.setInvalid = function(msg) {
    this.setError(new Artifact(WidgetConfig.STATUS_INVALID, Artifact.CODE_MALFORMED, msg, undefined));
  };
	  
  ProcessingResult.prototype.setWarning = function(warning) {
    if(!this.warnings) this.warnings = [];
    this.warnings.push(warning);
  };

  return ProcessingResult;
})();
