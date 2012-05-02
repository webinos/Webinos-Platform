#pragma once
#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class WiredNetwork : Aspect {	
	public:

		vector<string> getComponents();	
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static WiredNetwork * getInstance();

 		string networkStatus(string);
 		string ipAddress(string);
 		string macAddress(string);

	private:
	
		WiredNetwork(){};
		~WiredNetwork(){};
		
		static WiredNetwork * wiredNetwork;
		static AspectsRegister aspectsRegister;
};