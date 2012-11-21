#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class WiFiHardware : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static WiFiHardware * getInstance();

		string status(string);

	private:
		WiFiHardware(){};
		~WiFiHardware(){};
		
		static WiFiHardware * wifiHardware;
		static AspectsRegister aspectsRegister;
};
