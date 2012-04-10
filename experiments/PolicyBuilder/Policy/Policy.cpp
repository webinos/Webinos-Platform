#include "PolicySystem.h"
#include "Policy.h"
#include "Target.h"
#include "Rule.h"

CPolicy::CPolicy(xml_node& policyNode) : CPolicyBase(policyNode)
{
	xml_attribute attr = policyNode.attribute("description");
	if (!attr.empty())
		m_description = attr.value();

	xpath_node_set rules_query = policyNode.select_nodes("rule");
	for (xpath_node_set::const_iterator it = rules_query.begin(); it != rules_query.end(); it++)
	{
		m_rules.push_back(new CRule(it->node()));
	}
}

CPolicy::~CPolicy(void)
{
	for (RULE_VEC::iterator it = m_rules.begin(); it != m_rules.end(); it++)
	{
		delete *it;
	}

	m_rules.clear();
}

int CPolicy::Evaluate(CQuery& query,bool& targetMatched)
{
	int decision = 0;
	
	targetMatched = CPolicyBase::EvaluateTarget(query);

	if (targetMatched)
	{
		int effect = 0;

		for (RULE_VEC::iterator it = m_rules.begin(); it != m_rules.end(); it++)
		{
			CRule* rule = *it;
			int ruleEffect = rule->Evaluate(query);

			if (m_combineMode == firstApplicable)
			{
				// firstApplicable => Stop at the first applicable decision.
				if (ruleEffect != inapplicable)
				{
				    effect = ruleEffect;
					break;
				}
			}
            else
            {
                effect |= ruleEffect;
			}
		}

		decision = Combine(m_combineMode,effect);
	}
	else
		decision = inapplicable;

	return decision;
}

