#pragma once

#include <vector>

class CSubject;
class CQuery;

class CTarget
{
private:
	typedef std::vector<CSubject*> SUBJECT_VEC;
	SUBJECT_VEC m_subjects;

public:
	CTarget(xml_node& node);
	virtual ~CTarget(void);

	int Evaluate(CQuery& query);
};
