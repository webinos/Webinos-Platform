#pragma once

#include "../aspect.h"
#include "../aspects.h"

#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

class CPU : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static CPU * getInstance();

		
		string model(string);
		string currentLoad(string);
		
	private:
		CPU(){};
		~CPU(){};

		static CPU * cpu;
		static AspectsRegister aspectsRegister;
};
