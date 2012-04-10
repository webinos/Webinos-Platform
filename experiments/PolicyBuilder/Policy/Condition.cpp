#include "PolicySystem.h"
#include "Condition.h"
#include "AttributeMatch.h"
#include "Query.h"

CCondition::CCondition(xml_node& node) : m_combineAnd(true)
{
	xml_attribute attr = node.attribute("combine");
	if (!attr.empty())
		m_combineAnd = attr.value() == std::string("and");

	xpath_node_set query = node.select_nodes("resource-match");
	for (xpath_node_set::const_iterator it = query.begin(); it != query.end(); it++)
	{
		m_matches.push_back(new CAttributeMatch(it->node(),CQuery::resource));
	}

	query = node.select_nodes("environment-match");
	for (xpath_node_set::const_iterator it = query.begin(); it != query.end(); it++)
	{
		m_matches.push_back(new CAttributeMatch(it->node(),CQuery::environment));
	}

	query = node.select_nodes("subject-match");
	for (xpath_node_set::const_iterator it = query.begin(); it != query.end(); it++)
	{
		m_matches.push_back(new CAttributeMatch(it->node(),CQuery::subject));
	}

	query = node.select_nodes("condition");
	for (xpath_node_set::const_iterator it = query.begin(); it != query.end(); it++)
	{
		m_matches.push_back(new CCondition(it->node()));
	}
}

CCondition::~CCondition(void)
{
	for (MATCH_VEC::iterator it = m_matches.begin(); it != m_matches.end(); it++)
	{
		delete *it;
	}

	m_matches.clear();
}

int CCondition::IsMatch(CQuery& query)
{
    if (m_matches.size() == 0)
        return determinedMatch;
        
	int result = 0;

	for (MATCH_VEC::iterator it = m_matches.begin(); it != m_matches.end(); it++)
	{
		CDecisionNode* match = *it;
		result |= match->IsMatch(query);
	}

	// The AND operator is evaluated as follows:
	// -  is determined and has value “no match” if any input is “no match”;
	// -  otherwise is undetermined if any input is undetermined;
	// -  otherwise is determined and has value “match”.
	//
	// The OR operator is evaluated as follows:
	// -  is determined and has value “match” if any input is “match”;
	// -  otherwise is undetermined if any input is undetermined;
	// -  otherwise is determined and has value “no match”.
	if ((result & undeterminedMatch) == undeterminedMatch)
	{
		// Undetermined.
		result = undeterminedMatch;
	}
	else if (m_combineAnd)
	{
		// AND operator => any noMatch is a noMatch overall.
		result = (result & determinedNoMatch) == determinedNoMatch ? determinedNoMatch : result;
	}
	else
	{
		// OR operator => any match is a match overall.
		result = (result & determinedMatch) == determinedMatch ? determinedMatch : result;
	}

	return result;
}

