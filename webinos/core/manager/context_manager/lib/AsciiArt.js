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
* Copyright 2011 EPU - National Technical University of Athens
******************************************************************************/
// Based on http://en.wikipedia.org/wiki/ANSI_escape_code
// SQR matrix
var AnsiSgrCodes = {
  "off": 0,
  "bold": 1,
  "italic": 3,
  "underline": 4,
  "blink": 5,
  "inverse": 7,
  "hidden": 8,
  "black": 30,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "black_bg": 40,
  "red_bg": 41,
  "green_bg": 42,
  "yellow_bg": 43,
  "blue_bg": 44,
  "magenta_bg": 45,
  "cyan_bg": 46,
  "white_bg": 47
};

// Override the default console.log function
// Keep a backup of the current lof function to use it internally
console._webinos_log = console.log;

//TODO: Test if this works
console.clear = function(){
  console._webinos_log('\033[2J\033[0;0H');
};

// Write string adding the ASCII modifiers
console.logcolor = function(str, color) {
  if(!color) {console._webinos_log(str); return;}

  var color_attrs = color.split("+");
  var ansi_str = "";
  for(var i=0, attr; attr = color_attrs[i]; i++) {
    ansi_str += "\033[" + AnsiSgrCodes[attr] + "m";
  }
  ansi_str += str + "\033[" + AnsiSgrCodes["off"] + "m";
  console._webinos_log(ansi_str);
};

// An array of available ASCII arts
var AsciiArts = {
  "finger": function(str,color){
		console.logcolor("          ____________",color);
		console.logcolor("....-''``'._ _________) " + str,color);
		console.logcolor("        ,_  '-.___)",color);
		console.logcolor("          `'-._)_)",color);
		console.logcolor("-----'``\"-,__(__)",color);
	},
  "fire": function(str,color){
		console.logcolor("     (     ",color);
		console.logcolor("   .) )    ",color);
		console.logcolor("  `(,' (,  ",color);
		console.logcolor("  ). (, (' " + str,color);
		console.logcolor(" ( ) ; ' ) ",color);
		console.logcolor(" ')_,_)_(` ",color);
  }
};

// Do the console.log override
console.log = function(str, color, art){
  if (!art) {console.logcolor(str,color); return;}
  if(AsciiArts[art])
	AsciiArts[art](str,color);
  else
    console.logcolor(str,color);
};