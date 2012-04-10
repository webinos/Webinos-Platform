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

var fs   = require('fs');
var path = require('path');
var vm   = require('vm');

(function(wm) {
  var env = {
    require:require,
    console:console,
    process:process,
    Buffer:Buffer
  };
  var context = vm.createContext(env);
  var includeScript = function(name) {
    var filename = path.resolve(__dirname, name);
    return vm.runInContext(fs.readFileSync(filename, 'utf8'), context, filename);
  };

  /* include libraries */
  wm.CacheMap = includeScript('./lib/cachemap.js');
  wm.ManagerUtils = includeScript('./lib/managerutils.js');
  wm.Origin = includeScript('./lib/model/origin.js');
  wm.AccessRequest = includeScript('./lib/model/accessrequest.js');
  wm.Artifact = includeScript('./lib/model/artifact.js');
  wm.BidiUtil = includeScript('./lib/model/bidiutil.js');
  wm.DirectoryWidgetResource = includeScript('./lib/model/directorywidgetresource.js');
  wm.Param = includeScript('./lib/model/param.js');
  wm.FeatureRequest= includeScript('./lib/model/featurerequest.js');
  wm.Icon = includeScript('./lib/model/icon.js');
  wm.LocalisableString = includeScript('./lib/model/localisablestring.js');
  wm.Preference = includeScript('./lib/model/preference.js');
  wm.Version = includeScript('./lib/model/version.js');
  wm.WidgetConfig = includeScript('./lib/model/widgetconfig.js');
  wm.ZipWidgetResource = includeScript('./lib/model/zipwidgetresource.js');
  wm.Certificate = includeScript('./lib/digsig/certificate.js');
  wm.CertificateManager = includeScript('./lib/digsig/certificatemanager.js');
  wm.Signature = includeScript('./lib/digsig/signature.js');
  wm.SignatureValidator = includeScript('./lib/digsig/signaturevalidator.js');
  wm.ValidationPolicy = includeScript('./lib/digsig/validationpolicy.js');
  wm.ValidationResult = includeScript('./lib/digsig/validationresult.js');
  wm.WidgetValidator = includeScript('./lib/digsig/widgetvalidator.js');
  wm.Comparisonresult = includeScript('./lib/widgetmanager/comparisonresult.js');
  wm.Config = includeScript('./lib/widgetmanager/config.js');
  wm.FeatureSupport = includeScript('./lib/widgetmanager/featuresupport.js');
  wm.LanguageTag = includeScript('./lib/widgetmanager/languagetag.js');
  wm.LocalisedFileMapping = includeScript('./lib/widgetmanager/localisedfilemapping.js');
  wm.Logger = includeScript('./lib/widgetmanager/logger.js');
  wm.ProcessingResult = includeScript('./lib/widgetmanager/processingresult.js');
  wm.TextUtil = includeScript('./lib/widgetmanager/textutil.js');
  wm.WidgetConfigProcessor = includeScript('./lib/widgetmanager/widgetconfigprocessor.js');
  wm.WidgetManager = includeScript('./lib/widgetmanager/widgetmanager.js');
  wm.WidgetPersistence = includeScript('./lib/widgetmanager/widgetpersistence.js');
  wm.WidgetProcessor = includeScript('./lib/widgetmanager/widgetprocessor.js');
  wm.WidgetStorage = includeScript('./lib/widgetmanager/widgetstorage.js');

  /* init widgetmanager instance */
  wm.widgetmanager = includeScript('./lib/main.js');
})(module.exports);
