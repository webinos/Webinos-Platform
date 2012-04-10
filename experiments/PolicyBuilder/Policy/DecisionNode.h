#pragma once

class CQuery;

class CDecisionNode
{
public:
	CDecisionNode(void);
	virtual ~CDecisionNode(void);

	virtual int IsMatch(CQuery& query) = 0;
};
