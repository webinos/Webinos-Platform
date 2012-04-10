#include "PolicySystem.h"
#include "Rule.h"
#include "Condition.h"

CRule::CRule(xml_node& node) : m_condition(NULL), m_effect(permit)
{
	xml_attribute attr = node.attribute("effect");
	if (!attr.empty())
	{
		std::string effect = attr.value();
		if (effect == "permit")
			m_effect = permit;
		else if (effect == "deny")
			m_effect = deny;
		else if (effect == "prompt-oneshot")
			m_effect = promptOneShot;
		else if (effect == "prompt-session")
			m_effect = promptSession;
		else if (effect == "prompt-blanket")
			m_effect = promptBlanket;
		else
		{
			throw "unknown rule effect: " + effect;
		}
	}
	else
		m_effect = permit;

	xpath_node query = node.select_single_node("condition");
	if (!query.node().empty())
		m_condition = new CCondition(query.node());
}

CRule::~CRule(void)
{
	delete m_condition;
}

int CRule::Evaluate(CQuery& query)
{
	int result = 0;

	if (m_condition != NULL)
	{
		int conditionResult = m_condition->IsMatch(query);

		if (conditionResult == determinedMatch)
			result = m_effect;
		else
			result = inapplicable;
	}
	else
		result = m_effect;

	return result;
}

