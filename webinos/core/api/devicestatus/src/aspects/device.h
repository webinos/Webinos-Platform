#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class Device : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static Device * getInstance();

		string imei(string);
		string model(string);
		string vendor(string);
		string version(string);
		
	private:
		Device(){};
		~Device(){};

		static Device * device;
		static AspectsRegister aspectsRegister;
};
