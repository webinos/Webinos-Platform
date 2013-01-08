#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class CellularNetwork : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static CellularNetwork * getInstance();

		string isInRoaming(string);
		string mcc(string);
		string mnc(string);
		string signalStrength(string);
		string operatorName(string);
		string ipAddress(string);
		string macAddress(string);

	private:
		CellularNetwork(){};
		~CellularNetwork(){};
		
		static CellularNetwork * cellularNetwork;
		static AspectsRegister aspectsRegister;
};
