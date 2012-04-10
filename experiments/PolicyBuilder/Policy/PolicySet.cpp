#include "PolicySystem.h"
#include "PolicySet.h"
#include "Policy.h"

CPolicySet::CPolicySet(xml_node& node) : CPolicyBase(node)
{
	xml_node child = node.child_w("policy*");
	while (!child.empty())
	{
		std::string name = child.name();
		if (name == "policy")
			m_policies.push_back(new CPolicy(child));
		else if (name == "policy-set")
			m_policies.push_back(new CPolicySet(child));

		child = child.next_sibling_w("policy*");
	}
}

CPolicySet::~CPolicySet(void)
{
	for (POLICY_VEC::iterator it = m_policies.begin(); it != m_policies.end(); it++)
	{
		delete *it;
	}

	m_policies.clear();
}

int CPolicySet::Evaluate(CQuery& query,bool& targetMatched)
{
	int decision = 0;
	
	targetMatched = CPolicyBase::EvaluateTarget(query);

	if (targetMatched)
	{
		int effect = 0;
		for (POLICY_VEC::iterator it = m_policies.begin(); it != m_policies.end(); it++)
		{
			CPolicyBase* policy = *it;
			bool policyTargetMatched = false;

			int policyEffect = policy->Evaluate(query,policyTargetMatched);

			if (m_combineMode == firstApplicable)
			{
				// firstApplicable => Stop at the first applicable decision.
				if (policyEffect != inapplicable)
				{
				    effect = policyEffect;
					break;
				}
			}
			else 
			{
				effect |= policyEffect;

			    if (m_combineMode == firstMatchingTarget && policyTargetMatched && policyEffect != inapplicable)
			    {
				    // firstMatchingTarget => use whatever the resulting effect.
				    effect = policyEffect;
				    break;
			    }
			}
		}	

		decision = Combine(m_combineMode,effect);
	}
	else
		decision = inapplicable;
	
	return decision;
}
