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

this.WidgetProcessor = (function() {
  var crypto = require('crypto');
  var fs = require('fs');
  var util = require('util');
  var config = Config.get();
  
  var fileTypes = {
    'html' : 'text/html',
    'htm'  : 'text/html',
    'txt'  : 'text/plain',
    'xhtml': 'application/xhtml+xml',
    'xht'  : 'application/xhtml+xml',
    'svg'  : 'image/svg+xml',
    'ico'  : 'image/vnd.microsoft.icon',
    'png'  : 'image/png',
    'gif'  : 'image/gif',
    'jpg'  : 'image/jpeg'
  };

  var CONFIG_NAME      = 'config.xml',
      DEFAULT_ENCODING = 'UTF-8';

  var STARTFILE_NAMES = [
    'index.htm',
    'index.html',
    'index.svg',
    'index.xhtml',
    'index.xht'
  ];
	
  var ICON_NAMES = [
    'icon.png',
    'icon.gif',
    'icon.jpg',
    'icon.ico',
    'icon.svg'
  ];

  /* (approximately) implements
   * http://dev.w3.org/2006/waf/widgets/Overview.html#rule-for-identifying-the-media-type-of-a */
  var getFileType = function(res, fileName) {
    var result;
    var x = fileName.lastIndexOf('.');
    if(x == 0) x = -1;
    if(x != -1)
      result = fileTypes[fileName.substr(x + 1).toLowerCase()];
    if(!result) {
      /* try sniffing */
      try {
        var buf = res.readFileSync(localisedFileMapping.map(fileName));
        var expectedDoctype = "<!DOCTYPE html";
        var sniffedDoctype = buf.toString('utf8', 0, expectedDoctype.length);
        if(expectedDoctype == sniffedDoctype.toUpperCase())
          result = "text/html";
      } catch(e) {/* silently fail */}
    }
    return result;
  };

  var getParameterEncoding = function(type) {
    var result;
    var hasParameter = type.lastIndexOf(';');
    if(hasParameter != -1) {
      var parameter = type.substr(hasParameter + 1);
      if(parameter.substr(0, 'charset='.length) == 'charset=')
        result = parameter.substr(parameter.lastIndexOf('=') + 1);
    }
    return result;
  };

  var isSupportedStartType = function(type) {
    var hasParameter = type.indexOf(';');
    if(hasParameter != -1) type = type.substr(0, hasParameter);
    for(var i in config.capabilities.startfileTypes) {
      if(config.capabilities.startfileTypes[i] == type) return true;
    }
    return false;
  };

  var isSupportedIconType = function(type) {
    for(var i in config.capabilities.iconTypes) {
      if(config.capabilities.iconTypes[i] == type) return true;
    }
    return false;
  };

  var isSupportedEncoding = function(encoding) {
    for(var i in config.capabilities.encodings) {
      if(config.capabilities.encodings[i].toLowerCase() == encoding) return true;
    }
    return false;
  };

  /* public constructor */
  function WidgetProcessor(wgtFile, constraints) {
    this.wgtFile           = wgtFile;
    this.res               = undefined;
    this.constraints       = constraints;
    this.widgetValidator   = undefined;
    this.userAgentLocales  = [];
    this.asyncDependencies = [];
    this.processingResult  = undefined;
  }

  WidgetProcessor.HASH_LEN    = 40;
  WidgetProcessor.CONFIG_NAME = CONFIG_NAME;
  WidgetProcessor.DEFAULT_ENCODING = DEFAULT_ENCODING;

  /* public static functions */
  WidgetProcessor.getWidgetIdHash = function(id) {
    var result;
    try {
      var hash = crypto.createHash('sha1');
      hash.update(id, 'utf8');
      result = hash.digest('hex');
    } catch(e) {}
    return result;
  };

  WidgetProcessor.getWidgetResourceHash = function(res) {
    var result;
    try {
      var hash = crypto.createHash('sha1');
      var fd = fs.openSync(res.getWgtFile(), 'r');
      var read;
      var buf = new Buffer(1024);
      while((read = fd.readSync(buf, 0, 1023)) > 0) {
        hash.update(buf.slice(0, read), 'binary');
      }
      result = hash.digest('hex');
    } catch(e) {}
    return result;
  };
  
  WidgetProcessor.getParameterEncoding = getParameterEncoding;
  WidgetProcessor.getFileType = getFileType;
  WidgetProcessor.isSupportedStartType = isSupportedStartType;
  WidgetProcessor.isSupportedIconType = isSupportedIconType;
  WidgetProcessor.isSupportedEncoding = isSupportedEncoding;
  
  /* public instance methods */
  WidgetProcessor.prototype.onError = function() {
    if(this.processListener)
      this.processListener(this.processingResult);
  };

  WidgetProcessor.prototype.setError = function(errorArtifact) {
    Logger.logAction(Logger.LOG_ERROR, errorArtifact.reason, errorArtifact.getStatusText());
    //console.log('status: ' + errorArtifact.status);
    this.processingResult.setError(errorArtifact);
    this.onError();
  };

  WidgetProcessor.prototype.setInvalid = function(msg) {
    this.processingResult.setInvalid(msg);
    if(this.processListener)
      this.processListener(this.processingResult);
  };
  
  WidgetProcessor.prototype.setWarning = function(warning) {
    this.warnings.push(warning);
  };

  /* for remotely setting status from async dependency processors */
  WidgetProcessor.prototype.setStatus = function(remoteStatus) {
    /* only update the status if it is currently OK
     * so errors do not get lost */
    if(this.status == WidgetConfig.STATUS_OK)
      this.status = remoteStatus;
  };
  
  WidgetProcessor.prototype.getWidgetResource = function() { return this.res; };

  WidgetProcessor.prototype.compareTo = function(existingConfig, existingValidation, existingHasUserdata) {
    return this.processingResult.comparisonResult = new ComparisonResult(existingConfig, existingValidation, existingHasUserdata, this.processingResult);
  };

  WidgetProcessor.prototype.dispose = function() {
	  if(this.res)
		  this.res.dispose();
  };

  WidgetProcessor.prototype.process = function(reprocess, processListener) {
    var processingResult = this.processingResult = new ProcessingResult();
    this.processListener = processListener;
    var that = this;
    var step1, step2, step3, step4, step5, step6, step7, onStep7, step8, step9;
    
    var finishProcess = function() {
    	var widgetConfig = that.processingResult.widgetConfig;
        if(widgetConfig.id) {
          widgetConfig.installId = WidgetProcessor.getWidgetIdHash(widgetConfig.id);
        } else {
          widgetConfig.installId = WidgetProcessor.getWidgetResourceHash(that.res);
		}
      //console.log(util.inspect(widgetConfig));
      if(that.processListener)
        that.processListener(that.processingResult);
    };
  
    step1 = function() {
      /*
       * ASSERTION # ta-qxLSCRCHlN
       * If the result of the user agent applying the rule
       * for determining if a potential Zip archive is a Zip
       * archive is true, meaning that the potential Zip
       * archive is a Zip archive, then the user agent MUST
       * proceed to Step 2. Otherwise, if an error is returned,
       * the user agent MUST treat the potential Zip archive
       * as an invalid widget package.
       */
      var header = new Buffer(4);
      var fd;
      try {
        var fd = fs.openSync(that.wgtFile, 'r');
        fs.readSync(fd, header, 0, 4);
      } catch(e) {
    	that.setError(new Artifact(WidgetConfig.STATUS_IO_ERROR, Artifact.CODE_MALFORMED, "Unable to read widget resource", undefined));
        return;
      } finally {
        if(fd) fs.closeSync(fd);
      }
      if(header[0] != 0x50
          || header[1] != 0x4B
          || header[2] != 0x03
          || header[3] != 0x04) {
        that.setInvalid("ta-qxLSCRCHlN");
        return;
      }
      process.nextTick(step2);
    };

    step2 = function() {
      /*
       * ASSERTION # ta-uLHyIMvLwz
       * To verify that a Zip archive and its file entries conform
       * to this specification, a user agent MUST apply the rule
       * for verifying a zip archive. If the rule for verifying a
       * zip archive returns true, then the user agent MUST go to
       * Step 3. Otherwise, if the rule for verifying a zip archive
       * returns an error, then the user agent MUST treat the Zip
       * archive as an invalid widget package.
       */
      try {
        that.processingResult.widgetResource = that.res = new ZipWidgetResource(that.wgtFile);
      } catch (e) {
        that.setInvalid("ta-uLHyIMvLwz");
	    return;
      }
      process.nextTick(step3);
    };

    step3 = function() {
      /* nothing to do */
      process.nextTick(step4);
    };

    step4 = function() {
      if(config.processSignatures) {
        /* perform the signature validation, reject if not valid */
        var widgetValidator = that.widgetValidator = new WidgetValidator(that.res, config.certMgr);
        var validationResult = processingResult.validationResult = widgetValidator.validate();
        var digsigStatus = validationResult.status;
        switch(digsigStatus) {
        case 101: /* WidgetConfig.STATUS_VALID */
          if(config.processAsyncDependencies) {
            that.asyncDependencies.add(new OcspInstallCheck(that, validationResult));
          }
        case 100: /* WidgetConfig.STATUS_UNSIGNED */
          result = WidgetConfig.STATUS_OK;
          break;
        case 3: /* WidgetConfig.STATUS_REVOKED */
          if(config.allowRevoked) {
            that.processingResult.setWarning(new Artifact(digsigStatus, Artifact.CODE_BLOCKED_REVOKED, "Revoked signature", null));
            result = WidgetConfig.STATUS_OK;
          } else {
            result = digsigStatus;
            that.setError(new Artifact(digsigStatus, Artifact.CODE_BLOCKED_REVOKED, "Revoked signature", null));
          }
          break;
        default:
          result = digsigStatus;
          that.setError(validationResult.errorArtifact);
        }
      }
      if(result == WidgetConfig.STATUS_OK)
        process.nextTick(step5);
    };

    step5 = function() {
      var locales = config.locales;
      if(locales) {
        for(var i in locales) {
          var subTags = LanguageTag.getSubTags(locales[i]);
          if(subTags)
            that.userAgentLocales = that.userAgentLocales.concat(subTags);
        }
      }
      process.nextTick(step6);
    };

    step6 = function() {
      /*
       * ASSERTION # ta-ZjcdAxFMSx
       * In Step 6, a user agent MUST apply the algorithm to locate
       * the configuration document.
       */
      if(!that.res.contains(CONFIG_NAME)) {
        that.setInvalid("ta-ZjcdAxFMSx");
	    return;
      }
      process.nextTick(step7);
    };
    
    onStep7 = function(configProcessor) {
      if(processingResult.status == WidgetConfig.STATUS_OK)
        process.nextTick(step8);
      else
        that.onError();
    };

    step7 = function() {
      /* process the configuration document */
      var proc = new WidgetConfigProcessor(that);
      return proc.processConfigurationDocument(that.res, that.userAgentLocales, processingResult, onStep7);
    };

    step8 = function() {
      /*
       * ASSERTION # ta-BnWPqNvNVo
       * If widget start file of the table of configuration defaults contains
       * a file (i.e. widget start file is not null), then a user agent MUST
       * skip Step 8 and go to Step 9.
       */
      var widgetConfig = processingResult.widgetConfig;
      if('startFile' in widgetConfig) {
        Logger.logAction(Logger.LOG_MINOR, "ta-BnWPqNvNVo", "explicit start file set, skipping step 8");
        process.nextTick(step9);
        return;
      }

      /*
       * ASSERTION # ta-RGNHRBWNZV
       * If widget start file does not contain a file, the user agent MUST
       * apply the algorithm to locate a default start file.
       * 1. For each file name in the default start files table (from top to
       *    bottom) that has a media type that is supported by the user agent:
       *    A. Let potential-start-file be the result of applying the rule for
       *       finding a file within a widget package to file name.
       *    B. If potential-start-file is null or in error, ignore this file
       *       name and move onto the next file name in the default start files
       *       table.
       *    C. If potential-start-file is a file, then:
       *       i   Let widget start file be the value of potential-start-file.
       *       ii  Let start file content-type be the media type given in the
       *           media type column of the default start files table.
       *       iii Terminate this algorithm and go to Step 9.
       * 2. If after searching for every file in the default start files table
       *    no default start file is found, then treat this widget as an invalid
       *    widget package.
       */
      for(var i in STARTFILE_NAMES) {
        var potential = STARTFILE_NAMES[i];
        var potentialType = getFileType(that.res, potential);
        if(isSupportedStartType(potentialType) && processingResult.localisedFileMapping.contains(potential)) {
          Logger.logAction(Logger.LOG_MINOR, "ta-RGNHRBWNZV", "set widgetStartFile from default " + potential);
          widgetConfig.startFile = {path: potential, contentType: potentialType, encoding: DEFAULT_ENCODING};
          process.nextTick(step9);
          return;
        }
      }
      that.setInvalid("ta-RGNHRBWNZV"); 
    };

    step9 = function() {
      /*
       * ASSERTION # ta-FAFYMEGELU
       * In Step 9, a user agent MUST apply the algorithm to locate the default
       * icons.
       * 1. For each file name in the default icons table (from top to bottom)
       *    that has a media type that is supported by the user agent:
       *    A. Let potential-icon be the result of applying the rule for finding
       *       a file within a widget package to file name.
       *    B. If the potential-icon is a processable file, determined by the
       *       media type given in the media type column of the default icons
       *       table, and the potential-icon does not already exist in the icons
       *       list of the table of configuration defaults, then append the
       *       value of potential-icon to the icons list of the table of
       *       configuration defaults.
       *    C. Move onto the next file name in the default icons table.
       */
      var widgetConfig = processingResult.widgetConfig;
      var icons = {};
      var configIcons = widgetConfig.icons || [];
      if(configIcons) {
        for(var i in configIcons){
          icons[configIcons[i].path] = configIcons[i];
        }
      }

      if(ManagerUtils.isEmpty(icons)) {
        for (var i in ICON_NAMES) {
          var potential = ICON_NAMES[i];
          if(isSupportedIconType(getFileType(that.res, potential))
              && !(potential in icons)
              && processingResult.localisedFileMapping.contains(potential)) {
            Logger.logAction(Logger.LOG_MINOR, "ta-FAFYMEGELU", "adding icon from default icons table " + potential);
            var potentialIcon = new Icon(potential);
            icons[potential] = potentialIcon;
            configIcons.push(potentialIcon);
          }
        }
      }

      /* select prefIcon */
      var targetDimension = config.iconSize;
      if(!targetDimension) {
        /* choose the first listed compatible icon */
        if(configIcons.length)
          widgetConfig.prefIcon = configIcons[0];
      } else {
        /* choose the most appropriately sized icon */
        var undersizePreference,
            oversizePreference,
            undersizeVariance = 0,
            oversizeVariance = 0;

        for(var candidate in icons) {
          var oversize =
              (targetDimension.width > 0 && candidate.width > targetDimension.width)
              || (targetDimension.height > 0 && candidate.height > targetDimension.height);
          var variance = 0;
          if(targetDimension.width > 0 && candidate.width > 0) variance += Math.abs(targetDimension.width - candidate.width);
          if(targetDimension.height > 0 && candidate.height > 0) variance += Math.abs(targetDimension.height - candidate.height);
          if(oversize) {
            if(variance < oversizeVariance || !oversizeVariance) {
              oversizePreference = candidate;
              oversizeVariance = variance;
            }
          } else {
            if(variance < undersizeVariance || !undersizeVariance) {
              undersizePreference = candidate;
              undersizeVariance = variance;
            }
          }
        }
        /* choose an undersize icon in preference to an oversize one */
        if(undersizePreference) widgetConfig.prefIcon = undersizePreference;
        else if (oversizePreference) widgetConfig.prefIcon = oversizePreference;
      }
      finishProcess();
    };
    
    if(reprocess)
      step5();
    else
      step1();
  };

  return WidgetProcessor;
})();
