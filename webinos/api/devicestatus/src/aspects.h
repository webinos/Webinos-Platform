#pragma once

#include <map>
#include <string>
#include "aspect.h"

using namespace std;

typedef map<string, Aspect * > AspectsMap;

class Aspects {
	public:
		static AspectsMap * aspectsMap;
		static AspectsMap * getAspectsMap();

		static Aspect * get(const string & aspectName);
};

struct AspectsRegister : Aspects {
	AspectsRegister(const string & aspectName, Aspect * aspect) {
		getAspectsMap()->insert(make_pair(aspectName, aspect));
	}
};

