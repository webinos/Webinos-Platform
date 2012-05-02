#pragma once

#include "../aspect.h"
#include "../aspects.h"

#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

class Battery : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static Battery * getInstance();

		
		string batteryLevel(string);
		string batteryBeingCharged(string);
		
	private:
		Battery(){};
		~Battery(){};

		static Battery * battery;
		static AspectsRegister aspectsRegister;
};
