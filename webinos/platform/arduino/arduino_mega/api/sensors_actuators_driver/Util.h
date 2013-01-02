#define ASCII_HEX_START_CHAR  65  //Index of ascii char 'A'

// On the Ethernet Shield, CS is pin 4. Note that even if it's not
// used as the CS pin, the hardware CS pin (10 on most Arduino boards,
// 53 on the Mega) must be left as an output or the SD library
// functions will not work.
const int chipSelect = 4;

int hexString2dec(String str){
	int strLen = str.length(),
    tmpNumber;
	double result = 0;
	char tmpChar;
	str.toUpperCase();
	for (int i = 0; i < strLen; ++i){
    	tmpChar = str.charAt(i);
    	if (isDigit(tmpChar))
            tmpNumber = atoi(&tmpChar);
    	else if (isHexadecimalDigit(tmpChar))
            tmpNumber = tmpChar - ASCII_HEX_START_CHAR + 10;
        else
            return -1;
    	result += pow(16, strLen - i - 1) * tmpNumber;
	}
	if ((result*10-((int)result*10)) >= 5)
    	return result+1;
	else
    	return result;
}

byte * strIp2byteVect(String str){
	String tmpStr;
	int bytesCount, i; 
	byte *ipVect = (byte *) malloc(4);
	i = 0;
	for (bytesCount = 0; bytesCount < 4; bytesCount++){
    	for ( ; (str.charAt(i) != '.') && (str.charAt(i) != '\0'); i++)
        	tmpStr += str.charAt(i);
    		ipVect[bytesCount] = tmpStr.toInt();
    		tmpStr = "";
    		++i;
	}
	if (bytesCount != 4){
    	free(ipVect);
    	return NULL;
	}
	return ipVect;
}

byte * strMac2byteVect(String str){
	byte *macVect = (byte *) malloc(6);
	str.replace(":", "");
	for (int i = 0; i < 12; i += 2){
    	macVect[i/2] = hexString2dec(str.substring(i, i+2));
    	if (macVect[i/2] == -1){
        	free(macVect);
        	return NULL;
    	}
	}
	return macVect;
}