#pragma once

#include "../aspect.h"
#include "../aspects.h"

using namespace std;

class ParentalRating : Aspect {
	public:
		vector<string> getComponents();
		bool isSupported(string * = 0);
		string getPropertyValue(string *, string * = 0);

		static ParentalRating * getInstance();

		
		string name(string);
		string scheme(string);
		string region(string);
		
	private:
		ParentalRating(){};
		~ParentalRating(){};

		static ParentalRating * parentalRating;
		static AspectsRegister aspectsRegister;
};
