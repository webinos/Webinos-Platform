#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class InputControl : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static InputControl * getInstance();

		string touchscreen(string);
		string touchpad(string);
		string mouse(string);
		string scrollwheel(string);
		string keyboard(string);
		string cursorkeyboard(string);

	private:
		InputControl(){};
		~InputControl(){};

		static InputControl * inputControl;
		static AspectsRegister aspectsRegister;
};
