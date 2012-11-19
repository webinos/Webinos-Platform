#pragma once
#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class InputDevice : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);
		static InputDevice * getInstance();

		string type(string);

	private:

		InputDevice(){};
		~InputDevice(){};
		
		static InputDevice * inputDevice;
		static AspectsRegister aspectsRegister;
};