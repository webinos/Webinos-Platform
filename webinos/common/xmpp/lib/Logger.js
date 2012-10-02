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
*******************************************************************************/

/* Logger wrapper: currently using log4js */

(function() {
    var log4js = require('log4js');

    function getLogger(name, level) {
        var defaultLevel = 'info';

        if (!level) {
            level = defaultLevel;
        } else if (level === 'verbose') {
            level = 'trace';
        }

        var logger = log4js.getLogger(name);
        
        logger.verbose = function(str) {
            this.trace(str);
        }
        
        logger.setLevel(level.toUpperCase());
        
        return logger;
    }

    exports.getLogger = getLogger;
})();
