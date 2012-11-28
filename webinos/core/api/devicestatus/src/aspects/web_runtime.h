#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class WebRuntime : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static WebRuntime * getInstance();

		string version(string);
		string name(string);
		string vendor(string);
		string webinosVersion(string);

	private:
		WebRuntime(){};
		~WebRuntime(){};
		
		static WebRuntime * webRuntime;
		static AspectsRegister aspectsRegister;
};
