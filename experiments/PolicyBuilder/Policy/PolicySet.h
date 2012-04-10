#pragma once

#include <vector>
#include "PolicyBase.h"

class CPolicy;
class CQuery;

class CPolicySet : public CPolicyBase
{
private:
	typedef std::vector<CPolicyBase*> POLICY_VEC;
	POLICY_VEC m_policies;

public:
	CPolicySet(xml_node& node);
	virtual ~CPolicySet(void);

	virtual int Evaluate(CQuery& query,bool& targetMatched);
};
