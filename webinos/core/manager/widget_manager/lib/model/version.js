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

this.VersionString = (function() {
	var util = require('util');

	/* Parse a version string maj.min[.mic] into (major, minor, micro) format
	 * defines those properties if valid */
	var isDigit = function(c) { return c >= '0' && c <= '9'; };
	var parse = function(inst, str) {
		var maj=0, min=0, mic=0, end=str.length;
		var c=0;
		var i1=0, i2, i3;

		for(i1 = 0; i1 < end && isDigit((c = str[i1])); i1++)
			maj = 10 * maj + (c-'0');
		if(i1 > 0 && i1 < 16) {
			if(c == '.') {
				for(i2 = ++i1; i2 < end && isDigit((c = str[i2])); i2++)
					min = 10 * min + c-'0';
				inst.major = maj;
				inst.minor = min;
				if(i2 > i1) {
					if(c == '.') {
						for(i3 = ++i2; i3 < end && isDigit((c = str[i3])); i3++)
							mic = 10 * mic + c-'0';
						inst.micro = mic;
					}
				}
			}
		}
	};

	/* public constructor */
	function VersionString(string, dir) {
		if(!arguments.length) {
			/* we were called with no arguments; probably because
			 * we're being instantiated by deserialising persistent
			 * data. So it's ok and the properties will be set for us */
			LocalisableString.call(this);
			return;
		}

		LocalisableString.call(this, string, dir);
		parse(this, this.visual);
	}
	util.inherits(VersionString, LocalisableString);
	
	/* compare two version strings
	 * +1: other version is greater than this;
	 *  0: this version is equal to other;
	 * -1: other version is less than this.
	 * undefined: one or other version is not comparable */
	VersionString.prototype.compareTo = function(other) {
		if('major' in this && 'major' in other) {
			if(this.major == other.major) {
				if(this.minor == other.minor) {
					var thisMic = ('micro' in this) ? this.micro : 0;
					var otherMic = ('micro' in other) ? other.micro : 0;
					if(thisMic == otherMic) {
						return 0;
					} else {
						return (thisMic > otherMic) ? -1 : 1;
					}
				} else {
					return (this.minor > other.minor) ? -1 : 1;
				}
			} else {
				return (this.major > other.major) ? -1 : 1;
			}
		}
	};

	/* public static functions */
	VersionString.serialize = ManagerUtils.prototypicalClone(
		LocalisableString.serialize,
		{major: 'number', minor: 'number', micro: 'number'}
	);

	return VersionString;
})();
