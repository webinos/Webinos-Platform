#pragma once

#include <vector>
#include "DecisionNode.h"

class CAttributeMatch;

class CCondition : public CDecisionNode
{
private:
	typedef std::vector<CDecisionNode*> MATCH_VEC;
	MATCH_VEC m_matches;

	bool m_combineAnd;

public:
	CCondition(xml_node& node);
	virtual ~CCondition(void);

	bool UseCombineAnd() const { return m_combineAnd; }

	virtual int IsMatch(CQuery& query);
};
