#pragma once
#include "../aspect.h"
#include "../aspects.h"
#include <iostream>
#include <fstream>
#include <sstream>
using namespace std;

class Display : Aspect {
	
	public:

		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);
		static Display * getInstance();
		
		string resolutionHeight(string);
		string pixelAspectRatio(string);
		string dpiY(string);
		string resolutionWidth(string);
        string dpiX(string);
                string colorDepth(string);
		
	private:
		Display(){};
		~Display(){};

		static Display * display;
		static AspectsRegister aspectsRegister;
};