#pragma once

#include <string>
#include <vector>
#include "Query.h"

class CTarget;
class CQuery;

class CPolicyBase
{
private:
	std::string m_id;
	CTarget* m_target;

protected:
	combineMode m_combineMode;
	bool EvaluateTarget(CQuery& query);

public:
	CPolicyBase(xml_node& node);
	virtual ~CPolicyBase(void);

	virtual int Evaluate(CQuery& query,bool& targetMatched) = 0;

	static int Combine(combineMode mode,int effect);
};
