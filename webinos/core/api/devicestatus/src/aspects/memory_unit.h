#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class MemoryUnit : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static MemoryUnit * getInstance();

		string size(string);
		string removable(string);
		string availableSize(string);
		string volatil(string);

	private:
		MemoryUnit(){};
		~MemoryUnit(){};

		static MemoryUnit * memoryUnit;
		static AspectsRegister aspectsRegister;
};
