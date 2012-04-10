#pragma once

#include <vector>

class CPolicySet;
class CPolicy;
class CQuery;

class CPolicyDoc
{
private:
	CPolicySet* m_policySet;
	CPolicy* m_policy;

public:
	CPolicyDoc(std::string path, bool isFile=true);
	virtual ~CPolicyDoc(void);

	int Evaluate(CQuery& query);
};
