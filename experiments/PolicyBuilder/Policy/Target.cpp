#include "PolicySystem.h"
#include "Target.h"
#include "Subject.h"

CTarget::CTarget(xml_node& node) : m_subjects(NULL)
{
	xpath_node_set query = node.select_nodes("subject");

	for (xpath_node_set::const_iterator it = query.begin(); it != query.end(); it++)
	{
		m_subjects.push_back(new CSubject(it->node()));
	}
}

CTarget::~CTarget(void)
{
	for (SUBJECT_VEC::iterator it = m_subjects.begin(); it != m_subjects.end(); it++)
	{
		delete *it;
	}

	m_subjects.clear();
}

int CTarget::Evaluate(CQuery& query)
{
	int decision = undeterminedMatch;

	for (SUBJECT_VEC::iterator it = m_subjects.begin(); it != m_subjects.end(); it++)
	{
		CSubject* subject = *it;
		decision = subject->IsMatch(query);

		// A target specification is evaluated as follows:
		// -  has value TRUE if at least one of the subject specifications has value TRUE
		// -  otherwise has value FALSE
		if (decision == determinedMatch)
			break;
	}

	if (decision != determinedMatch)
		decision = determinedNoMatch;

	return decision;
}
