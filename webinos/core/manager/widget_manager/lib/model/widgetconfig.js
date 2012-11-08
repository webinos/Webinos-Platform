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

this.WidgetConfig = (function() {
	
  /* public constructor */
  function WidgetConfig() {}

  /* public static variables */
  WidgetConfig.STATUS_TRANSIENT_ERROR  =  -4;
  WidgetConfig.STATUS_IO_ERROR         =  -3;
  WidgetConfig.STATUS_CAPABILITY_ERROR =  -2;
  WidgetConfig.STATUS_INTERNAL_ERROR   =  -1;
  WidgetConfig.STATUS_OK               =   0;
  WidgetConfig.STATUS_INVALID          =   1;
  WidgetConfig.STATUS_DENIED           =   2;
  WidgetConfig.STATUS_REVOKED          =   3;
  WidgetConfig.STATUS_UNSIGNED         = 100;
  WidgetConfig.STATUS_VALID            = 101;
  
  WidgetConfig.serialize = {
    author            : { name : LocalisableString, email: 'string', href: 'string' },
    prefIcon          : 'string',
    icons             : [ Icon ],
    startFile         : { path: 'string', encoding: 'string', contentType: 'string' },
    description       : LocalisableString,
    height            : 'number',
    width             : 'number',
    id                : 'string',
    license           : { text: LocalisableString, file: 'string', href: 'string' },
    name              : LocalisableString,
    shortName         : LocalisableString,
    version           : VersionString,
    windowModes       : [ 'string' ],
    defaultLocale     : 'string',
    installId         : 'string',
    origin            : Origin
  };

  return WidgetConfig;
})();
