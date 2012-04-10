#pragma once

#include <vector>
#include "PolicyBase.h"

class CRule;
class CQuery;

class CPolicy : public CPolicyBase
{
private:
	std::string m_description;
	typedef std::vector<CRule*> RULE_VEC;
	RULE_VEC m_rules;

public:
	CPolicy(xml_node& node);
	virtual ~CPolicy(void);

	virtual int Evaluate(CQuery& query,bool& targetMatched);
};
