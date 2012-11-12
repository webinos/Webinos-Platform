#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class WiFiNetwork : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static WiFiNetwork * getInstance();

		
		string ssid(string);
                string signalStrength(string);
 		string networkStatus(string);
 		string ipAddress(string);
 		string macAddress(string);

		
	private:
		WiFiNetwork(){};
		~WiFiNetwork(){};

		static WiFiNetwork * wifiNetwork;
		static AspectsRegister aspectsRegister;
};
