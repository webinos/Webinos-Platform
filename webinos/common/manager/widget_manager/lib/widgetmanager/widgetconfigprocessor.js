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

this.WidgetConfigProcessor = (function() {
	var config = Config.get();
	var url = require('url');
	var Parser = require('expat2').Parser;

	var WIDGETS_NS = 'http://www.w3.org/ns/widgets';

	/* implements
	 * http://www.w3.org/TR/widgets/#rule-for-getting-a-single-attribute-value */
	var processTextAttr = function(str) {
		var result = '', i = 0;
		while(i < str.length) {
			var c = str[i++];
			if(TextUtil.isSpaceChar(c)) {
				result += ' ';
				while(TextUtil.isSpaceChar(str[i])) i++;
			} else {
				result += c;
			}
		}
		return result.trim();
	};

	/* implements unicode whitespace requirements of
	 * http://www.w3.org/TR/widgets/#rule-for-getting-text-content-with-normalized-white-space */
	var normaliseUnicodeWhitespace = function(str, dir) {
		var result = '', i = 0;
		while(i < str.length) {
			var c = str[i++];
			if(TextUtil.isWhitespace(c) || TextUtil.isSpaceChar(c)) {
				result += ' ';
				while(TextUtil.isWhitespace(str[i]) || TextUtil.isSpaceChar(str[i])) i++;
			} else {
				result += c;
			}
		}
		return new LocalisableString(result.trim(), dir);
	};

	/* implements
	 * http://www.w3.org/TR/widgets/#rule-for-getting-a-single-attribute-value */
	var processLocalisableTextAttr = function(str, dir) {
		str = processTextAttr(str);
		return new LocalisableString(str, dir);
	};

	var processUriAttr = function(str) {
		str = processTextAttr(str);
		var result = url.parse(str);
		if(result.href != str)
			result = undefined;
		return result;
	};

	/* implements
	 * http://www.w3.org/TR/widgets/#rule-for-parsing-a-non-negative-integer */
	var isDigit = function(c) { return c >= '0' && c <= '9'; };
	var processNonNegativeIntAttr = function(str) {
		var result = -1;
		for(var i in str) {
			var c = str[i];
			if(TextUtil.isSpaceChar(c)) continue;
			if(result == -1) result = 0;
			if(!isDigit(c)) break;
			result = result*10 + (c-'0');
		}
		return result;
	};

	/* implements
	 * http://www.w3.org/TR/widgets/#rule-for-getting-a-list-of-keywords-from-an-attribute */
	var processKeywordListAttr = function(str) {
		return processTextAttr(str).split(' ');
	};

	/* public constructor */
	function WidgetConfigProcessor(widgetProcessor) {
		this.processor = widgetProcessor;
	}

	/* public instance methods */
	WidgetConfigProcessor.prototype.processConfigurationDocument = function(res, userAgentLocales, processingResult, processListener) {
		this.userAgentLocales = userAgentLocales;
		this.processingResult = processingResult;
		this.processListener = processListener;
		var that = this;
		var widgetConfig = this.widgetConfig = new WidgetConfig();

		var error = function() {
			/* throw to exit the parser */
			throw 'WidgetConfigProcessor.processConfigurationDocument: error';
		};

		/********************
		 * Widget DOM state
		 ********************/

		/* dictionaries of value elements, indexed by locale, or 'none' for none */
		var nameElements        = {};
		var descriptionElements = {};
		var licenseElements     = {};

		/* single-element types */
		var authorElement;
		var contentElement;

		/* collections */
		var icons       = {}; /* indexed by path (src attribute) */
		var preferences = {}; /* indexed by name */
		var features    = []; 
		var accesses    = {}; /* indexed by origin */

		var processDirAttr = function(elt) {
			var maybeDir = attrVal.toLowerCase();
			var dirCode = BidiUtil.getDirForAttribute(maybeDir);
			if(dirCode != BidiUtil.DIR_NONE)
				elt.inheritableAttr.dir = {ns:'', name: 'dir', qName: attr, value: dirCode};
		};

		/* start an element whose text content requires processing as localisable */
		var beginLocalisableElement = function(elt, parent, collection) {
			var isValid = elt.isWidget && parent.isRoot;
			if(isValid) {
				var xmlLang = elt.hasLang ? elt.xmlLang : 'none';
				if(xmlLang in collection) {
					isValid = false;
				} else {
					collection[xmlLang] = elt;
					beginDirectionalElement(elt, parent);
				}
			}
			elt.isValid = isValid;
		};

		/* end an element whose text content requires processing as localisable */
		var endLocalisableElement = function(elt, parent, collection) {
			endDirectionalElement(elt, parent);
		};

		/* start an element whose text content may be subject to direction attributes */
		var beginDirectionalElement = function(elt, parent) {
			elt.isValid = elt.isWidget && parent.isValid;
			elt.unicode = '';
			if(elt.inheritableAttr.hasOwnProperty('dir'))
				elt.unicode += BidiUtil.getDirectionalCode(nsAttrs.dir.value);
		};

		/* end an element whose text content may be subject to direction attributes */
		var endDirectionalElement = function(elt, parent) {
			if(elt.isValid) {
				if(elt.inheritableAttr.hasOwnProperty('dir'))
					elt.unicode += BidiUtil.getDirectionalCode(BidiUtil.DIR_PDF);
				if(parent.unicode)
					parent.unicode += elt.unicode;
			}
		};

		var configBuffer = res.readFileSync(WidgetProcessor.CONFIG_NAME);
		if(configBuffer) {
			var parser = this.parser = new Parser('UTF-8');

			var startDocument = function(elt) {
				var isWidget = elt.isWidget = (elt.nsUri == WIDGETS_NS);
				var name = elt.name;
				var attrs = elt.attrs;
				/*
				 * ASSERTION # ta-ACCJfDGwDQ
				 * If the root element is not a widget element in the widget namespace,
				 * then the user agent MUST terminate this algorithm and treat this
				 * widget package as an invalid widget package.
				 */
				if(name != 'widget' || !isWidget) {
					parser.emit('error', new Error('ta-ACCJfDGwDQ'));
					return;
				}
				elt.isValid = true;

				/* do widget attrs */
				if('dir' in attrs) {
					processDirAttr(elt);
				}
				var dir = elt.nsAttrs.dir ?  elt.nsAttrs.dir.value : BidiUtil.DIR_NONE;

				if('defaultlocale' in attrs) {
					/*
					 * ASSERTION # ta-defaultlocale-ignore
					 * If the default locale is in error or an empty string or already
					 * contained by the user agent locales list, then the user agent MUST
					 * ignore the defaultlocale attribute.
					 *
					 * ASSERTION # ta-defaultlocale-process
					 * If potential default locale is a valid language tag and the user
					 * agent locales does not contain the value of default locale, the
					 * user agent MUST prepend the value of potential default locale into
					 * the the user agent locales list as the second-last item (i.e., at
					 * position length - 1).
					 */
					var defaultLocale = processTextAttr(attrs.defaultlocale);
					if(defaultLocale.length == 0) {
						Logger.logAction(Logger.LOG_MINOR, "ta-defaultlocale-ignore#empty", "discarding empty defaultlocale");
					} else if(ManagerUtils.containsValue(userAgentLocales, defaultLocale)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-defaultlocale-ignore#duplicate", "discarding defaultlocale, already included");
					} else if(!LanguageTag.getSubTags(defaultLocale)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-defaultlocale-ignore#invalid", "ignoring invalid defaultlocale");
					} else {
						Logger.logAction(Logger.LOG_MINOR, "ta-defaultlocale-process", "adding defaultlocale");
						userAgentLocales.push(defaultLocale);
						widgetConfig.defaultLocale = defaultLocale;
					}
				}
				processingResult.localisedFileMapping = new LocalisedFileMapping(res, userAgentLocales);

				if('id' in attrs) {
					/*
					 * ASSERTION # ta-RawAIWHoMs
					 * If the id attribute is used, then let id be the result of applying
					 * the rule for getting a single attribute value to the id attribute.
					 * If id is a valid IRI, then let widget id be the value of the id.
					 * If the id is in error, then the user agent MUST ignore the attribute.
					 */
					var id = processUriAttr(attrs.id);
					if(id) {
						Logger.logAction(Logger.LOG_MINOR, "ta-RawAIWHoMs", "set widgetId");
						widgetConfig.id = id.href;
					} else {
						Logger.logAction(Logger.LOG_MINOR, "ta-RawAIWHoMs", "ignoring missing or invalid id");
					}
				}

				if('version' in attrs) {
					/*
					 * ASSERTION # ta-VerEfVGeTc
					 * If the version attribute is used, then let version value be the
					 * result of applying the rule for getting a single attribute value
					 * to the version attribute. If the version is an empty string, then
					 * the user agent MUST ignore the attribute; otherwise, let widget
					 * version be the value of version value.
					 */
					var str = processTextAttr(attrs.version);
					if(str) {
						Logger.logAction(Logger.LOG_MINOR, "ta-VerEfVGeTc", "set version");
						widgetConfig.version = new VersionString(str, dir);
					} else {
						Logger.logAction(Logger.LOG_MINOR, "ta-VerEfVGeTc", "ignoring empty version string");							
					}
				}

				if('height' in attrs) {
					/*
					 * ASSERTION # ta-BxjoiWHaMr
					 * If the height attribute is used, then let normalized height be the
					 * result of applying the rule for parsing a non-negative integer to
					 * the value of the attribute. If the normalized height is not in error
					 * and greater than 0, then let widget height be the value of normalized
					 * height. If the height attribute is in error, then the user agent MUST
					 * ignore the attribute.
					 */
					var height = processNonNegativeIntAttr(attrs.height);
					if(height == -1) {
						Logger.logAction(Logger.LOG_MINOR, "ta-BxjoiWHaMr", "ignoring invalid widgetHeight");
					} else {
						Logger.logAction(Logger.LOG_MINOR, "ta-BxjoiWHaMr", "set widgetHeight");
						widgetConfig.height = height;
					}
				}

				if('width' in attrs) {
					/*
					 * ASSERTION # ta-BxjoiWHaMr
					 * If the height attribute is used, then let normalized height be the
					 * result of applying the rule for parsing a non-negative integer to
					 * the value of the attribute. If the normalized height is not in error
					 * and greater than 0, then let widget height be the value of normalized
					 * height. If the height attribute is in error, then the user agent MUST
					 * ignore the attribute.
					 */
					var width = processNonNegativeIntAttr(attrs.width);
					if(width == -1) {
						Logger.logAction(Logger.LOG_MINOR, "ta-UScJfQHPPy", "ignoring invalid widgetWidth");
					} else {
						Logger.logAction(Logger.LOG_MINOR, "ta-UScJfQHPPy", "set widgetWidth");
						widgetConfig.width = width;
					}
				}

				if('viewmodes' in attrs) {
					/*
					 * ASSERTION # ta-viewmodes
					 * If the viewmodes attribute is used, then the user agent MUST let
					 * viewmodes list be the result of applying the rule for getting a
					 * list of keywords from an attribute:
					 */
					var viewmodes = processKeywordListAttr(attrs.viewmodes);
					if(viewmodes) {
						var allSupportedModes = config.capabilities.viewModes;
						var supportedModes = [];
						for(var i in viewmodes) {
							if(ManagerUtils.containsValue(allSupportedModes, viewmodes[i]))
								supportedModes.push(viewmodes[i]);
						}
						Logger.logAction(Logger.LOG_MINOR, "ta-viewmodes", "set widgetWindowModes");
						widgetConfig.viewmodes = supportedModes;
					}
				}
			};

			var startElement = function(elt) {
				/* console.log('startElement: name: ' + elt.nsName); */
				var isWidget = elt.isWidget = (elt.nsUri == WIDGETS_NS);
				var eltName = elt.nsName;
				var attrs = elt.attrs;
				var parent = elt.parent;

				if('dir' in attrs) {
					processDirAttr(elt);
				}
				var dir = elt.nsAttrs.dir ?  elt.nsAttrs.dir.value : BidiUtil.DIR_NONE;

				if(isWidget && eltName == 'name') {
					/*
					 * ASSERTION # ta-LYLMhryBBT
					 * If this is not the first name element encountered by the user agent,
					 * then the user agent MUST ignore this element.
					 *
					 * ASSERTION # ta-AYLMhryBnD
					 * If this is the first name element encountered by the user agent,
					 * then the user agent MUST:
					 * 1. Record that an attempt has been made by the user agent to process
					 *    a name element.
					 * 2. Let widget name be the result of applying the rule for getting
					 *    text content with normalized white space to this element.
					 * 3. If the short attribute is used, then let widget short name be
					 *    the result of applying the rule for getting a single attribute
					 *    value to the short attribute.
					 */
					beginLocalisableElement(elt, parent, nameElements);
					if(elt.isValid && 'short' in attrs)
						elt.shortName = processLocalisableTextAttr(attrs['short'] , dir);

				} else if(isWidget && eltName == 'description') {
					/*
					 * ASSERTION # ta-UEMbyHERkI
					 * If this is not the first description element encountered by the user
					 * agent, then the user agent MUST ignore this element.
					 *
					 * ASSERTION # ta-VdCEyDVSA
					 * If this is the first description element encountered by the user agent,
					 * then the user agent MUST:
					 * 1. Record that an attempt has been made by the user agent to process
					 *    a description element.
					 * 2. let widget description be the result of applying the rule for
					 *    getting text content to this element.
					 */
					beginLocalisableElement(elt, parent, descriptionElements);

				} else if(isWidget && eltName == 'author') {
					/*
					 * ASSERTION # ta-sdwhMozwIc
					 * If this is not the first author element encountered by the user
					 * agent, then the user agent MUST ignore this element.
					 */
					if(authorElement) {
						elt.isValid = false;
						return;
					}
					/*
					 * ASSERTION # ta-argMozRiC
					 * If this is the first author element used, then the user agent MUST:
					 * 1. Record that an attempt has been made by the user agent to process
					 *    a author element.
					 * 2. If the href attribute is used, then let href-value be the value
					 *    of applying the rule for getting a single attribute value to the
					 *    href attribute.
					 * 3. If href-value is a valid IRI, then let author href be the value
					 *    of the href attribute. Otherwise, if href-value is not a valid IRI,
					 *    then ignore the href attribute.
					 * 4. If the email attribute is used, then let author email be the
					 *    result of applying the rule for getting a single attribute value to
					 *    the email attribute.
					 * 5. Let author name be the result of applying the rule for getting
					 *    text content with normalized white space to this element.
					 */
					authorElement = elt;
					elt.isValid = parent.isRoot;
					if(elt.isValid) {
						var email, href;
						if('href' in attrs)
							href = processUriAttr(attrs.href).href;
						if('email' in attrs)
							href = processTextAttr(attrs.email);
						widgetConfig.author = {href: href, email: email};
						beginDirectionalElement(elt, parent);
					}

				} else if(isWidget && eltName == 'license') {
					/*
					 * ASSERTION # ta-vcYJAPVEym
					 * If this is not the first license element encountered by the user
					 * agent, then the user agent MUST ignore this element.
					 *
					 * ASSERTION # ta-YUMJAPVEgI
					 * If this is the first license element encountered by the user agent,
					 * then the user agent MUST:
					 * 1. Record that an attempt has been made by the user agent to process
					 *    a license element.
					 * 2. Let license text be the result of applying the rule for getting
					 *    text content to this element. Associate license text with widget
					 *    license.
					 * 3. If the href attribute is used, then let potential license href
					 *    be the result of applying the rule for getting a single attribute
					 *    value to the href attribute.
					 * 4. If potential license href is not a valid IRI or a valid path,
					 *    then the href attribute is in error and the user agent MUST
					 *    ignore the attribute.
					 * 5. If potential license href is a valid IRI, then let widget license
					 *    href be the value of potential license href.
					 * 6. If license href is a valid path, then let file be the result of
					 *    applying the rule for finding a file within a widget package to
					 *    license href.
					 * 7. If file is not a processable file, as determined by applying the
					 *    rule for identifying the media type of a file, then ignore this
					 *    element.
					 * 8. Otherwise, let widget license file be the value of file.
					 */
					beginLocalisableElement(elt, parent, licenseElements);
					if(elt.isValid) {
						var license = elt.license = {};
						if('href' in attrs) {
							ref = processUriAttr(attrs.href);
							if(ref.protocol)
								license.href = ref.href;
							else if(processingResult.localisedFileMapping.contains(ref.pathname))
								license.file = ref.pathname;
						}
					}

				} else if(isWidget && eltName == 'icon') {
					if(!parent.isRoot) {
						elt.isValid = false;
						return;
					}
					/*
					 * ASSERTION # ta-iipTwNshRg
					 * If the src attribute of this icon element is absent, then the user
					 * agent MUST ignore this element.
					 *
					 * ASSERTION # ta-roCaKRxZhS
					 * Let path be the result of applying the rule for getting a single
					 * attribute value to the src attribute of this icon element. If path
					 * is not a valid path or is an empty string, then the user agent MUST
					 * ignore this element.
					 *
					 * ASSERTION # ta-iuJHnskSHq
					 * Let file be the result of applying the rule for finding a file within
					 * a widget package to path. If file is not a processable file, as
					 * determined by applying the rule for identifying the media type of a
					 * file, or already exists in the icons list, then the user agent MUST
					 * ignore this element.
					 *
					 * ASSERTION # ta-eHUaPbgfKg
					 * If the height attribute is used, then let potential height be the
					 * result of applying the rule for parsing a non-negative integer to
					 * the attribute's value. If the potential height is not in error and
					 * greater than 0, then associate the potential height with file.
					 * Otherwise, the height attribute is in error and the user agent MUST
					 * ignore the attribute.
					 *
					 * ASSERTION # ta-nYAcofihvj
					 * If the width attribute is used, then let potential width be the
					 * result of applying the rule for parsing a non-negative integer to
					 * the attribute's value. If the potential width is not in error and
					 * greater than 0, then associate the potential width with file.
					 * Otherwise, the width attribute is in error and the user agent MUST
					 * ignore the attribute.
					 */
					if(!('src' in attrs)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-roCaKRxZhS", "ignoring icon with invalid path");
						elt.isValid = false;
						return;
					}
					var path = processTextAttr(attrs.src);
					if(path.length == 0) {
						Logger.logAction(Logger.LOG_MINOR, "ta-roCaKRxZhS", "ignoring icon with invalid path");
						elt.isValid = false;
						return;
					}
					if(path in icons) {
						Logger.logAction(Logger.LOG_MINOR, "ta-iuJHnskSHq", "ignoring icon with duplicate path");
						elt.isValid = false;
						return;
					}
					if(!processingResult.localisedFileMapping.contains(path)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-iuJHnskSHq", "ignoring icon with nonexistent path");
						elt.isValid = false;
						return;
					}
					if(!WidgetProcessor.isSupportedIconType(WidgetProcessor.getFileType(that.processor.res, path))) {
						Logger.logAction(Logger.LOG_MINOR, "ta-iuJHnskSHq", "ignoring icon of unsupported type");
						elt.isValid = false;
						return;
					}
					elt.isValid = true;
					var icon = new Icon(path);
					icons[path] = icon;
					/* get height/width */
					if(attrs.height) {
						var height = processNonNegativeIntAttr(attrs.height);
						if(height == -1) {
							Logger.logAction(Logger.LOG_MINOR, "ta-eHUaPbgfKg", "ignoring invalid icon height");
						} else {
							Logger.logAction(Logger.LOG_MINOR, "ta-eHUaPbgfKg", "set icon height");
							icon.height = height;
						}
					}
					if(attrs.width) {
						var width = processNonNegativeIntAttr(attrs.width);
						if(width == -1) {
							Logger.logAction(Logger.LOG_MINOR, "ta-nYAcofihvj", "ignoring invalid icon width");
						} else {
							Logger.logAction(Logger.LOG_MINOR, "ta-nYAcofihvj", "set icon width");
							icon.width = width;
						}
					}

				} else if(isWidget && eltName == 'content') {
					if(contentElement) {
						/*
						 * ASSERTION # ta-hkWmGJgfve
						 * If this is not the first content element encountered by the user agent,
						 * then the user agent MUST ignore this element.
						 */
						Logger.logAction(Logger.LOG_MINOR, "ta-hkWmGJgfve", "ignoring duplicate content element");
						return;
					}
					contentElement = elt;
					elt.isValid = parent.isRoot;
					if(!elt.isValid) {
						/*
						 * ASSERTION # ta-hkWmGJgfve
						 * If this is not the first content element encountered by the user agent,
						 * then the user agent MUST ignore this element.
						 */
						Logger.logAction(Logger.LOG_MINOR, "ta-hkWmGJgfve", "ignoring out of place content element");
						return;
					}
					/*
					 * ASSERTION # ta-LTUJGJFCOU
					 * If the src attribute of the content element is absent or an empty
					 * string, then the user agent MUST ignore this element.
					 *
					 * ASSERTION # ta-pIffQywZin
					 * If path is not a valid path, then the user agent MUST ignore this
					 * element.
					 *
					 * ASSERTION # ta-LQcjNKBLUZ
					 * If path is a valid path, then let file be the result of applying the
					 * rule for finding a file within a widget package to path. If file is
					 * null or in error, then the user agent MUST ignore this element.
					 */
					if(!('src' in attrs)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-LTUJGJFCOU", "ignoring content with invalid path");
						elt.isValid = false;
						return;
					}
					var path = processTextAttr(attrs.src);
					if(path.length == 0) {
						Logger.logAction(Logger.LOG_MINOR, "ta-pIffQywZin", "ignoring content with invalid path");
						elt.isValid = false;
						return;
					}
					if(!processingResult.localisedFileMapping.contains(path)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-pIffQywZin, ta-LQcjNKBLUZ", "ignoring content with nonexistent path");
						elt.isValid = false;
						return;
					}
					var contentType;
					if('type' in attrs) {
						contentType = processTextAttr(attrs.type);
					} else {
						/*
						 * ASSERTION ta-content-defaulttype
						 * If the type attribute of the content element is absent, then check if
						 * file is supported by the user agent by applying the rule for identifying
						 * the media type of a file. If the file is supported, then let the widget
						 * start file be the file referenced by the src attribute and let start
						 * file content-type be the supported media type as was derived by applying
						 * the rule for identifying the media type of a file.
						 */
						Logger.logAction(Logger.LOG_MINOR, "ta-content-defaulttype", "missing content type attrbute, inferring from file");
						contentType = WidgetProcessor.getFileType(res, path);
					}
					/*
					 * ASSERTION # ta-paIabGIIMC
					 * If the type attribute is used, then let content-type be the result of
					 * applying the rule for getting a single attribute value to the value of
					 * the type attribute. If the value of content-type is a media type
					 * supported by the user agent, then let the start file content-type be
					 * the value of content type. If value of content-type is invalid or
					 * unsupported by the user agent, then a user agent MUST treat the widget
					 * package as an invalid widget package.
					 */
					if(WidgetProcessor.isSupportedStartType(contentType)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-paIabGIIMC", "setting widgetStartFile and startFileContentType");
						widgetConfig.startFile = {path: path, contentType: contentType};
					} else {
						processingResult.setError(new Artifact(WidgetConfig.STATUS_CAPABILITY_ERROR, Artifact.CODE_INCOMPATIBLE_CONTENT, 'ta-paIabGIIMC', null));
						parser.emit('error', new Error('ta-paIabGIIMC'));
						return;
					}
					/*
					 * ASSERTION # ta-dPOgiLQKNK
					 * If the encoding attribute is used, then let content-encoding be the
					 * result of applying the rule for getting a single attribute value to
					 * the value of the encoding attribute. If the character encoding
					 * represented by the value of content-encoding is supported by the user
					 * agent, then let the start file encoding be the value of
					 * content-encoding. If content-encoding is an empty string or
					 * unsupported by the user agent, then a user agent MUST ignore the
					 * encoding attribute.
					 * */
					var candidateEncoding;
					if('encoding' in attrs) {
						candidateEncoding = processTextAttr(attrs.encoding);
						if(WidgetProcessor.isSupportedEncoding(candidateEncoding)) {
							Logger.logAction(Logger.LOG_MINOR, "ta-dPOgiLQKNK", "setting explicit startFileEncoding");
							widgetConfig.startFile.encoding = candidateEncoding;
						}
					}
					/*
					 * ASSERTION # ta-aaaaaaaaaa
					 * If the start file encoding was set in step 7 of this algorithm as a
					 * result of processing a valid and supported value for the content
					 * element's encoding attribute, then the user agent MUST skip this step
					 * in this algorithm. Otherwise, if the value of content-type is a media
					 * type supported by the user agent and if content-type contains one or
					 * more [MIME] parameter components whose purpose is to declare the
					 * character encoding of the start file (e.g., the value
					 * "text/html;charset=Windows-1252", where charset is a parameter
					 * component whose purpose is to declare the character encoding of the
					 * start file), then let start file encoding be the value of the last
					 * supported parameter components whose purpose is to declare the
					 * character encoding of the start file.
					 */
					if(!('encoding' in widgetConfig.startFile)) {
						candidateEncoding = WidgetProcessor.getParameterEncoding(contentType);
						if(candidateEncoding) {
							Logger.logAction(Logger.LOG_MINOR, "ta-aaaaaaaaaa", "setting inferred startFileEncoding");
						} else {
							Logger.logAction(Logger.LOG_MINOR, "#default-encoding", "setting default startFileEncoding");
							candidateEncoding = WidgetProcessor.DEFAULT_ENCODING;
						}
						widgetConfig.startFile.encoding = candidateEncoding;
					}

				} else if(isWidget && eltName == 'feature') {
					/*
					 * ASSERTION # ta-rZdcMBExBX
					 * The user agent MUST process a feature element in the following manner:
					 * 1. If the name attribute of this feature element is absent, then the
					 *    user agent MUST ignore this element.
					 * 2. Let feature-name be the result of applying the rule for getting a
					 *    single attribute value to the value of the name attribute.
					 * 3. If a required attribute is used, then let required-feature be the
					 *    result of applying the rule for getting a single attribute value
					 *    to the required attribute. If the required attribute is not used
					 *    or if required-feature is not a valid boolean value, then let the
					 *    value of required-feature be the value 'true'.
					 */
					elt.isValid = parent.isRoot;
					if(!elt.isValid) {
						Logger.logAction(Logger.LOG_MINOR, "ta-rZdcMBExBX", "ignoring out of place feature element");
						return;
					}
					if(!('name' in attrs)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-rZdcMBExBX", "ignoring feature with invalid name");
						elt.isValid = false;
						return;
					}
					var name = processTextAttr(attrs.name);
					if(name.length == 0) {
						Logger.logAction(Logger.LOG_MINOR, "ta-rZdcMBExBX", "ignoring feature with invalid name");
						elt.isValid = false;
						return;
					}
					elt.isValid = true;
					var required;
					if('required' in attrs)
						required = "false" != processTextAttr(attrs.required);

					var feature = new FeatureRequest(name, required);
					features.push(feature);
					elt.feature = feature;

					var featureNames = FeatureSupport.isSupported(name);
					if(ManagerUtils.isEmpty(featureNames)) {
						/*
						 * ASSERTION # ta-paWbGHyVrG
						 * If feature-name is not a valid IRI, and required-feature is true, then
						 * the user agent MUST treat this widget as an invalid widget package.
						 *
						 * ASSERTION # ta-vOBaOcWfll
						 * If feature-name is not supported by the user agent, and
						 * required-feature is true, then the user agent MUST treat this widget
						 * as an invalid widget package.
						 */
						if(required) {
							Logger.logAction(Logger.LOG_ERROR, 'ta-vOBaOcWfll', 'rejecting unsupported required feature: ' + name);
							processingResult.setError(new Artifact(
									WidgetConfig.STATUS_CAPABILITY_ERROR,
									Artifact.CODE_INCOMPATIBLE_FEATURE,
									"ta-paWbGHyVrG, ta-vOBaOcWfll",
									[feature]));
							parser.emit('error', 'ta-paWbGHyVrG, ta-vOBaOcWfll');
							return;
						}
						/*
						 * ASSERTION # ta-ignore-unrequired-feature-with-invalid-name
						 * If feature-name is not a valid IRI, and required-feature is false,
						 * then the user agent MUST ignore this element.
						 *
						 * ASSERTION # ta-luyKMFABLX
						 * If feature-name is not supported by the user agent, and
						 * required-feature is false, then the user agent MUST ignore this
						 * element.
						 */
						Logger.logAction(Logger.LOG_MINOR, "ta-ignore-unrequired-feature-with-invalid-name, ta-luyKMFABLX", "ignoring invalid or unsupported not-required feature");
					}

				} else if(isWidget && eltName == 'param') {
					if(!parent.feature) {
						Logger.logAction(Logger.LOG_MINOR, "ta-jjjjjjjj", "ignoring out of place param element");
						elt.isValid = false;
						return;
					}
					var feature = parent.feature;
					/*
					 * ASSERTION # ta-EGkPfzCBOz
					 * If a value attribute is used, but the name attribute is absent,
					 * then this param element is in error and the user agent MUST ignore
					 * this element.
					 *
					 * ASSERTION # ta-xlgUWUVzCY
					 * If a name attribute is used, but the value attribute is absent, then
					 * this param element is in error and the user agent MUST ignore this
					 * element.
					 *
					 * ASSERTION # ta-CEGwkNQcWo
					 * Let param-name be the result of applying the rule for getting a single
					 * attribute value to the name attribute. If the param-name is an empty
					 * string, then this param element is in error and the user agent MUST
					 * ignore this element.
					 */
					if(!('name' in attrs)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-xlgUWUVzCY", "ignoring param with no name");
						elt.isValid = false;
						return;
					}
					var name = processTextAttr(attrs.name);
					if(name.length == 0) {
						Logger.logAction(Logger.LOG_MINOR, "ta-CEGwkNQcWo", "ignoring param with empty name");
						elt.isValid = false;
						return;
					}
					if(!('value' in attrs)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-EGkPfzCBOz", "ignoring param with no value");
						elt.isValid = false;
						return;
					}
					elt.isValid = true;
					var value = processTextAttr(attrs.value);
					feature.params.push(new Param(name, value));

				} else if(isWidget && eltName == 'preference') {
					/*
					 * ASSERTION # ta-DwhJBIJRQN
					 * If a value attribute of the preference element is used, but the name
					 * attribute is absent, then this preference element is in error and the
					 * user agent MUST ignore this element. Otherwise, the user agent MUST:
					 * 1.  Let name be the result of applying the rule for getting a single
					 *     attribute value to the name attribute.
					 * 2.  If the name is an empty string, then this element is in error;
					 *     ignore this element.
					 * 3.  If widget preferences already contains a preference whose name
					 *     case-sensitively matches the value of name, then this element is
					 *     in error; ignore this element.
					 * 4.  If name was not in error, let preference be an empty object.
					 * 5.  Associate name with preference.
					 * 6.  Let value be the result of applying the rule for getting a single
					 *     attribute value to the value attribute.
					 * 7.  Associate value with preference.
					 * 8.  If a readonly attribute is used, then let readonly be the result
					 *     of applying the rule for getting a single attribute value to the
					 *     readonly attribute. If readonly is not a valid boolean value, then
					 *     let the value of readonly be the value 'false'.
					 * 9.  Associate readonly with the preference.
					 * 10. Add the preference and the associated name, value and readonly
					 *     variables the list of widget preferences.
					 */
					if(!('name' in attrs)) {
						Logger.logAction(Logger.LOG_MINOR, "DwhJBIJRQN", "ignoring preference with invalid name");
						return;
					}
					var name = processTextAttr(attrs.name), value, readonly;
					if(name in preferences) {
						Logger.logAction(Logger.LOG_MINOR, "DwhJBIJRQN", "ignoring preference with duplicate name");
						return;
					}
					if('value' in attrs)
						value = processTextAttr(attrs.value);
					if('readonly' in attrs)
						readonly = (processTextAttr(attrs.readonly) == 'true');
					Logger.logAction(Logger.LOG_MINOR, "DwhJBIJRQN", "adding preference " + name + ": " + value);
					preferences[name] = new Preference(name, value, readonly);

				} else if(isWidget && eltName == 'span') {
					beginDirectionalElement(elt, parent);

				} else if(isWidget && eltName == 'access') {
					/*
					 * ASSERTION # ta-4
					 * Firstly, a user agent MUST behave as if the following had been defined in the
					 * Table of Configuration Defaults in Step 3 of the [[!WIDGETS]] specification.
					 *
					 * ASSERTION # ta-5
					 * Secondly, a user agent MUST apply the rule for processing an access element at the
					 * appropriate point in the algorithm to process a configuration document: the
					 * appropriate point is where the algorithm allows for processing 'any other type of
					 * element' [[!WIDGETS]].
					 */
					elt.isValid = parent.isRoot;
					if(!elt.isValid) {
						Logger.logAction(Logger.LOG_MINOR, "ta-4", "ignoring out of place access element");
						return;
					}
					/*
					 * ASSERTION # ta-6
					 * If the origin attribute is absent, then this element is in error and the user agent
					 * MUST ignore this element.
					 */
					if(!('origin' in attrs)) {
						Logger.logAction(Logger.LOG_MINOR, "ta-6", "ignoring access with missing or empty origin");
						elt.isValid = false;
						return;
					}
					var origin = processTextAttr(attrs.origin);
					if(origin.length == 0) {
						Logger.logAction(Logger.LOG_MINOR, "ta-6", "ignoring access with missing or empty origin");
						elt.isValid = false;
						return;
					}
					/*
					 * ASSERTION # ta-7
					 * Let origin be the result of applying the rule for getting a single attribute value to
					 * the value of the origin attribute. If the result is a single U+002A ASTERISK (*)
					 * character, then the user agent MUST prepend the U+002A ASTERISK to the access-request
					 * list and skip all steps below.
					 */
					if(origin == '*') {
						Logger.logAction(Logger.LOG_MINOR, "ta-7", "adding wildcard origin");
						accesses[origin] = AccessRequest.createWildcard();
						elt.isValid = true;
						return;
					}
					if(origin in accesses) {
						Logger.logAction(Logger.LOG_MINOR, "ta-duplicate-origin", "ignoring access with duplicate origin");
						elt.isValid = false;
						return;
					}
					/*
					 * ASSERTION # ta-8
					 * If origin is not a valid IRI, if it has components other than scheme and iauthority,
					 * if it has no host component, or if it has a iuser info component, then this element
					 * is in error and the user agent MUST ignore this element.
					 */
					var access = AccessRequest.create(origin);
					if(!access) {
						Logger.logAction(Logger.LOG_MINOR, "ta-8", "ignoring access with invalid origin");
						elt.isValid = false;
						return;
					}
					/*
					 * ASSERTION # ta-9
					 * Let subdomains be the result of applying the rule for getting a single attribute
					 * value to the value of the subdomains attribute. If the value of sub domains is not
					 * a valid boolean value, then this element is in error and the user agent MUST ignore
					 * this element.
					 */
					if('subdomains' in attrs) {
						var subdomains = processTextAttr(attrs.subdomains).toLowerCase();
						var isFalse = (subdomains  == 'false');
						var isTrue = (subdomains  == 'true');
						if(!isFalse && !isTrue) {
							Logger.logAction(Logger.LOG_MINOR, "ta-9", "ignoring access with invalid subdomains");
							elt.isValid = false;
							return;
						}
						access.subdomains = isTrue;
					}
					/*
					 * ASSERTION # ta-13
					 * The user agent MUST append an item inside the access-request list that is the tuple:
					 * scheme, host, port, subdomains.
					 */
					Logger.logAction(Logger.LOG_MINOR, "ta-13", "adding access request " + origin);
					accesses[origin] = access;
				}
			};

			var endElement = function(elt) {
				/* console.log('endElement: ' + elt.nsName); */
				var name = elt.nsName;
				var dir = elt.nsAttrs.dir ?  elt.nsAttrs.dir.value : BidiUtil.DIR_NONE;
				var parent = elt.parent;
				if(name == 'name') {
					endLocalisableElement(elt, parent, nameElements);
					if(elt.unicode)
						elt.nameText = normaliseUnicodeWhitespace(elt.unicode, dir);
				} else if(name == 'description') {
					endLocalisableElement(elt, parent, descriptionElements);
					if(elt.unicode)
						elt.descriptionText = normaliseUnicodeWhitespace(elt.unicode, dir);
				} else if(name == 'author') {
					endDirectionalElement(elt, parent);
					if(elt.unicode)
						widgetConfig.author.name = normaliseUnicodeWhitespace(elt.unicode, dir);
				} else if(name == 'license') {
					endLocalisableElement(elt, parent, licenseElements);
					if(elt.unicode)
						elt.license.text = normaliseUnicodeWhitespace(elt.unicode, dir);

			/*	} else if(name == 'icon') {
				} else if(name == 'content') {
				} else if(name == 'feature') {
				} else if(name == 'param') {
				} else if(name == 'access') {
				} else if(name == 'preference') { */

				} else if(name == 'span') {
					endDirectionalElement(elt, parent);
				}
			};

			var text = function(elt, string) {
				/* console.log('text: ' + string); */
				if('unicode' in elt) elt.unicode += string;
			};

			var chooseLocalisedElement = function(collection) {
				for(var i in userAgentLocales) {
					if(userAgentLocales[i] in collection)
						return collection[userAgentLocales[i]];
				}
				if('none' in collection)
					return collection.none;
			};

			var endDocument = function() {
				/* console.log('end document'); */
				if(processingResult.status == WidgetConfig.STATUS_OK) {
					/* choose name element */
					var nameElt = chooseLocalisedElement(nameElements);
					if(nameElt) {
						widgetConfig.name = nameElt.nameText;
						widgetConfig.shortName = nameElt.shortName;
					}
					/* choose description element */
					var descriptionElt = chooseLocalisedElement(descriptionElements);
					if(descriptionElt)
						widgetConfig.description = descriptionElt.descriptionText;
					/* choose license element */
					var licenseElt = chooseLocalisedElement(licenseElements);
					if(licenseElt)
						widgetConfig.license = licenseElt.license;

					/* setup other collections */
					var collection;
					if(features.length)
						widgetConfig.features = features;
					if((collection = ManagerUtils.valuesArray(accesses)))
						widgetConfig.accessRequests = collection;
					if((collection = ManagerUtils.valuesArray(icons)))
						widgetConfig.icons = collection;
					if((collection = ManagerUtils.valuesArray(preferences)))
						widgetConfig.preferences = collection;
				}
				processingResult.widgetConfig = widgetConfig;
				if(processListener)
					processListener(processingResult);
			};

			parser.on('startDocument', startDocument);
			parser.on('startElement', startElement);
			parser.on('endElement', endElement);
			parser.on('endDocument', endDocument);
			parser.on('text', text);
			parser.on('error', error);

			try {
				parser.parse(configBuffer, {isFinal:true});
			} catch(e) {
				if(processListener)
					processListener(processingResult);
			}
		}
	};

	return WidgetConfigProcessor;
})();
