#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class Camera : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static Camera * getInstance();

		string model(string);
		string vendor(string);
		string status(string);
		string resolutionHeight(string);
		string resolutionWidth(string);
		string maxZoom(string);
		string minZoom(string);
		string currentZoom(string);
		string hasFlash(string);
		string flashOn(string);
		
	private:
		Camera(){};
		~Camera(){};

		static Camera * camera;
		static AspectsRegister aspectsRegister;
};
