#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class CellularHardware : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static CellularHardware * getInstance();

		string status(string);

	private:
		CellularHardware(){};
		~CellularHardware(){};
		
		static CellularHardware * cellularHardware;
		static AspectsRegister aspectsRegister;
};
