#include "aspects.h"

AspectsMap * Aspects::aspectsMap = 0;

Aspect * Aspects::get(const string & aspectName) {
	AspectsMap::iterator it = getAspectsMap()->find(aspectName);

	if(it == getAspectsMap()->end())
		return 0;

	return it->second;
}

AspectsMap * Aspects::getAspectsMap() {
	if(aspectsMap == 0) 
		aspectsMap = new AspectsMap();
	return aspectsMap; 
}
