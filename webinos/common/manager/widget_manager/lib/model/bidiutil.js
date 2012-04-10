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

this.BidiUtil = (function() {

  /* private static variables */
  var DIR_LTR  = 0;
  var DIR_RTL  = 1;
  var DIR_LRO  = 2;
  var DIR_RLO  = 3;
  var DIR_PDF  = 4;
  var DIR_NONE = 99;

  var ATTR_LTR = 'ltr';
  var ATTR_RTL = 'rtl';
  var ATTR_LRO = 'lro';
  var ATTR_RLO = 'rlo';

  var CODE_LTR = '\u202A'; // LEFT-TO-RIGHT EMBEDDING
  var CODE_RTL = '\u202B'; // RIGHT-TO-LEFT EMBEDDING
  var CODE_LRO = '\u202D'; // LEFT-TO-RIGHT OVERRIDE
  var CODE_RLO = '\u202E'; // RIGHT-TO-LEFT OVERRIDE
  var CODE_PDF = '\u202C'; // POP DIRECTIONAL FORMATTING

  var CODE_MIN = '\u202A';
  var CODE_MAX = '\u202F';

  var mirroredChars = [
	'\u0028', // LEFT PARENTHESIS
	'\u0029', // RIGHT PARENTHESIS
	'\u003C', // LESS-THAN SIGN
	'\u003E', // GREATER-THAN SIGN
	'\u005B', // LEFT SQUARE BRACKET
	'\u005D', // RIGHT SQUARE BRACKET
	'\u007B', // LEFT CURLY BRACKET
	'\u007D', // RIGHT CURLY BRACKET
	'\u00AB', // LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
	'\u00BB'  // RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK
  ];
	
  var MIRROR_MIN = mirroredChars[0];
  var MIRROR_MAX = mirroredChars[mirroredChars.length - 1];

  var attrs = {
	'ltr': CODE_LTR,
	'rtl': CODE_RTL,
	'lro': CODE_LRO,
	'rlo': CODE_RLO
  };

  var directionalCodes = [
	CODE_LTR,
	CODE_RTL,
	CODE_LRO,
	CODE_RLO,
	CODE_PDF
  ];

  /* public constructor */
  function BidiUtil(args) {
  }

  /* public static variables */
  ManagerUtils.addProperties(BidiUtil, {
    DIR_LTR:DIR_LTR,
    DIR_RTL:DIR_RTL,
    DIR_LRO:DIR_LRO,
    DIR_RLO:DIR_RLO,
    DIR_PDF:DIR_PDF,
    DIR_NONE:DIR_NONE,
    ATTR_LTR:ATTR_LTR,
    ATTR_RTL:ATTR_RTL,
    ATTR_LRO:ATTR_LRO,
    ATTR_RLO:ATTR_RLO,
    CODE_LTR:CODE_LTR,
    CODE_RTL:CODE_RTL,
    CODE_LRO:CODE_LRO,
    CODE_RLO:CODE_RLO,
    CODE_PDF:CODE_PDF
  });

  /* public static functions */
  BidiUtil.getDirectionalCode = function(dir) {
	if(dir > CODE_PDF) throw new Error("BidiUtil.getDirectionalCode(): Invalid direction");
	  return directionalCodes[dir];
  };
	
  BidiUtil.isDirectionalChar = function(c) {
	return (c >= CODE_MIN && c < CODE_MAX);
  };

  BidiUtil.getDirForAttribute = function(attr) {
	return (attr in attrs) ? attrs[attr] : DIR_NONE;
  };

  BidiUtil.getMirror = function(c) {
    if(c >= MIRROR_MIN && c <= MIRROR_MAX) {
      for(var i = 0; i < mirroredChars.length; i += 2) {
        if(c == mirroredChars[i]) {c = mirroredChars[i+1]; break;}
        if(c == mirroredChars[i+1]) {c = mirroredChars[i]; break;}
      }
    }
    return c;
  };

  return BidiUtil;
})();
