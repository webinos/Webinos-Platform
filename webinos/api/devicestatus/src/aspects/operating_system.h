#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class OperatingSystem : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static OperatingSystem * getInstance();

		
		string language(string);
		string version(string);
		string name(string);
		string vendor(string);
		
	private:
		OperatingSystem(){};
		~OperatingSystem(){};

		static OperatingSystem * operatingSystem;
		static AspectsRegister aspectsRegister;
};
