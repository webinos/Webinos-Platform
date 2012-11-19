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

this.LocalisableString = (function() {
	var Bidi;// = require('bidi');

	/* public constructor */
	function LocalisableString(string, dir) {
		/* public instance variables */
		this.unicode = undefined;
		this.visual = undefined;

		if(!arguments.length) {
			/* we were called with no arguments; probably because
			 * we're being instantiated by deserialising persistent
			 * data. So it's ok and the properties will be set for us */
			return;
		}

		var isBidi = false;
		switch(dir) {
		case BidiUtil.DIR_NONE: {
			for(var i in string) {
				if(BidiUtil.isDirectionalChar(string[i])) {
					isBidi = true;
					break;
				}
			}
			this.unicode = string;
			if(!isBidi)
				this.visual = string;
			break;
		}
		case BidiUtil.DIR_LTR:
		case BidiUtil.DIR_RTL:
		case BidiUtil.DIR_LRO:
		case BidiUtil.DIR_RLO: {
			isBidi = true;
			var directionalCode = BidiUtil.getDirectionalCode(dir);
			this.unicode = directionalCode + string + BidiUtil.CODE_PDF;
			break;
		}
		default:
			throw new Error('LocalisableString.buildUnicodeString(): Invalid direction: ' + dir);
		}

		if(!this.visual) {
			var bidi = new Bidi(this.unicode, BidiUtil.DIRECTION_LEFT_TO_RIGHT);
			var runCount = bidi.getRunCount();
			var levels = new Array(runCount);
			var segments = new Array(runCount);

			for (var i in levels) {
				var runLevel = bidi.getRunLevel(i);
				levels[i] = runLevel;
				segments[i] = {
						start: bidi.getRunStart(i),
						limit: bidi.getRunLimit(i),
						level: bidi.getRunLevel(i)
				};
			}

			Bidi.reorderVisually(levels, 0, segments, 0, runCount);
			var result = '';
			for(var i in segments) {
				var segment = segments[i];
				if(segment) {
					var start = segment.start;
					var limit = segment.limit;
					if(limit > start) {
						if(segment.level % 2 == 0) {
							for(var j = start; j < limit; j++) {
								if(BidiUtil.isDirectionalChar(this.unicode[j])) continue;
								result += this.unicode[j];
							}
						} else {
							/* visually reverse */
							for(var j = limit - 1; j >= start; j--) {
								if(BidiUtil.isDirectionalChar(this.unicode[j])) continue;
								result.append(BidiUtil.getMirror(this.unicode[j]));
							}
						}
					}
				}
			}
			this.visual = result;
		}
	}

	/* public instance methods */
	LocalisableString.prototype.isBidi = function() { return this.unicode == this.visual; };

	LocalisableString.prototype.getUnicodeString = function() { return this.unicode; };

	LocalisableString.prototype.getVisualString = function() { return this.visual; };

	LocalisableString.serialize = {
		unicode: 'string',
		visual: 'string'
	};

	return LocalisableString;
})();
