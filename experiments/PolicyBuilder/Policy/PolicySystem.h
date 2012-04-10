#ifndef POLICY_SYSTEM_H
#define POLICY_SYSTEM_H

#include "assert.h"
#include "pugixml.hpp"

using namespace pugi;

enum matchResult
{
	determinedMatch =	0x0001,
	determinedNoMatch =	0x0010,
	undeterminedMatch =	0x0100
};

enum combineMode
{
	denyOverrides,
	permitOverrides,
	firstApplicable,
	firstMatchingTarget
};

#endif
