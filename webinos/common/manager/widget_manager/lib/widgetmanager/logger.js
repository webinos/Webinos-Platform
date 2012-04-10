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

this.Logger = (function() {

  var LOG_NONE  = 0,
      LOG_ERROR = 1,
      LOG_MAJOR = 2,
      LOG_MINOR = 3,
      LOG_MICRO = 4;

  var LOG_DEFAULT = LOG_MINOR,
      LOG_DEBUG   = LOG_MICRO;
      
  var logLevel = LOG_DEFAULT;
  
  var logHandler = console.log;

  /* public constructor */
  function Logger(args) {
  }
  
  /* public constants */
  Logger.LOG_NONE    = LOG_NONE,
  Logger.LOG_ERROR   = LOG_ERROR,
  Logger.LOG_MAJOR   = LOG_MAJOR,
  Logger.LOG_MINOR   = LOG_MINOR,
  Logger.LOG_MICRO   = LOG_MICRO;

  Logger.LOG_DEFAULT = LOG_DEFAULT,
  Logger.LOG_DEBUG   = LOG_DEBUG;

  /* public static functions */
  Logger.logAction = function(level, action, message) {
    if(level <= logLevel) {
      logHandler('WidgetManager: ' + action + ': ' + message);
    }
  };

  Logger.setLogLevel = function(level) {
    logLevel = level;
  };
  
  Logger.setLogHandler = function(handler) {
    logHandler = handler;
  };

  return Logger;
})();
