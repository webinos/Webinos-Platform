#pragma once

#include <string>
#include <vector>

using namespace std;

class Aspect {
	public:
		virtual vector<string> getComponents() = 0;
		virtual bool isSupported(string * = 0) = 0;
		virtual string getPropertyValue(string * = 0, string * = 0) = 0;
};
