#pragma once

#include <vector>
#include "Query.h"

class CCondition;
class CQuery;

class CRule
{
private:
	decisionResult m_effect;
	CCondition* m_condition;

public:
	CRule(xml_node& node);
	virtual ~CRule(void);

	int Evaluate(CQuery& query);
};
