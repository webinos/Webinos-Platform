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

this.LanguageTag = (function() {

  /* private static variables */
  var deprecatedRanges = {
    'in'          : undefined,
    'iw'          : undefined,
    'ji'          : undefined,
    'jw'          : undefined,
    'mo'          : undefined,
    'agp'         : undefined,
    'bhk'         : undefined,
    'bkb'         : undefined,
    'btb'         : undefined,
    'cjr'         : undefined,
    'cmk'         : undefined,
    'drh'         : undefined,
    'drw'         : undefined,
    'gav'         : undefined,
    'mof'         : undefined,
    'mst'         : undefined,
    'myt'         : undefined,
    'rmr'         : undefined,
    'sgl'         : undefined,
    'sul'         : undefined,
    'sum'         : undefined,
    'tnf'         : undefined,
    'wgw'         : undefined,
    'AN'          : undefined,
    'BU'          : undefined,
    'CS'          : undefined,
    'DD'          : undefined,
    'FX'          : undefined,
    'NT'          : undefined,
    'SU'          : undefined,
    'TP'          : undefined,
    'YD'          : undefined,
    'YU'          : undefined,
    'ZR'          : undefined,
    'heploc'      : undefined,
    'art-lojban'  : undefined,
    'no-bok'      : undefined,
    'no-nyn'      : undefined,
    'sgn-BE-FR'   : undefined,
    'sgn-BE-NL'   : undefined,
    'sgn-CH-DE'   : undefined,
    'zh-guoyu'    : undefined,
    'zh-hakka'    : undefined,
    'zh-min'      : undefined,
    'zh-min-nan'  : undefined,
    'zh-xiang'    : undefined,
    'sgn-BR'      : undefined,
    'sgn-CO'      : undefined,
    'sgn-DE'      : undefined,
    'sgn-DK'      : undefined,
    'sgn-ES'      : undefined,
    'sgn-FR'      : undefined,
    'sgn-GB'      : undefined,
    'sgn-GR'      : undefined,
    'sgn-IE'      : undefined,
    'sgn-IT'      : undefined,
    'sgn-JP'      : undefined,
    'sgn-MX'      : undefined,
    'sgn-NI'      : undefined,
    'sgn-NL'      : undefined,
    'sgn-NO'      : undefined,
    'sgn-PT'      : undefined,
    'sgn-SE'      : undefined,
    'sgn-US'      : undefined,
    'sgn-ZA'      : undefined,
    'zh-cmn'      : undefined,
    'zh-cmn-Hans' : undefined,
    'zh-cmn-Hant' : undefined,
    'zh-gan'      : undefined,
    'zh-wuu'      : undefined,
    'zh-yue'      : undefined
  };

  var validRanges = {};

  /* public constructor */
  function LanguageTag(args) {}

  /* public static functions */
  LanguageTag.getSubTags = function(range) {
    /* return with result if already cached */
    if(range in validRanges)
      return validRanges[range];

    /* discard if starts with "i-", contains spaces, or is deprecated */
    if(range.substr(0, 2) == 'i-'|| range.indexOf(' ') != -1 || range == '*' || range in deprecatedRanges)
      return;

    /* discard if language part is greater than 3 characters */
    var dashIdx = range.indexOf('-');
    if(dashIdx > 3 || (dashIdx == -1 && range.length > 3))
      return;

    /* split into subtags */
    var subTags = [];
    var pos = 0;
    while((dashIdx = range.indexOf('-', pos)) != -1) {
      if(dashIdx-pos == 2 && range[pos+1] == '*') {
        /* remove this component */
        range = range.substr(0, pos) + range.substr(dashIdx);
      }
      subTags.unshift(range.substr(0, dashIdx));
      pos = dashIdx + 1;
    }
    subTags.unshift(range);
		
    /* cache and return */
    validRanges[range] = subTags;
    return subTags;
  };

  return LanguageTag;
})();
