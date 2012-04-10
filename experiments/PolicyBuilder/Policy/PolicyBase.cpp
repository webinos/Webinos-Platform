#include "PolicySystem.h"
#include "PolicyBase.h"
#include "Target.h"

CPolicyBase::CPolicyBase(xml_node& policyNode) : m_target(NULL), m_combineMode(denyOverrides)
{
	xml_attribute attr = policyNode.attribute("combine");
	if (!attr.empty())
	{
		std::string combine = attr.value();
		if (combine == "deny-overrides")
			m_combineMode = denyOverrides;
		else if (combine == "permit-overrides")
			m_combineMode = permitOverrides;
		else if (combine == "first-applicable")
			m_combineMode = firstApplicable;
		else if (combine == "first-matching-target")
			m_combineMode = firstMatchingTarget;
		else
		{
			throw "combine mode not known: " + combine;
		}
	}
	else
		m_combineMode = denyOverrides;

	attr = policyNode.attribute("id");
	if (!attr.empty())
		m_id = attr.value();

	xpath_node query = policyNode.select_single_node("target");
	if (!query.node().empty())
		m_target = new CTarget(query.node());

}

CPolicyBase::~CPolicyBase(void)
{
	delete m_target;
}

bool CPolicyBase::EvaluateTarget(CQuery& query)
{
	bool targetMatched = false;

	if (m_target != NULL)
	{
		int decision = m_target->Evaluate(query);
		targetMatched = decision == determinedMatch;
	}
	else
	{
		// No target => treat as matched.
		targetMatched = true;
	}

	return targetMatched;
}

int CPolicyBase::Combine(combineMode mode,int effect)
{
	int decision = 0;

	switch (mode)
	{
		case denyOverrides:
		{
			if ((effect & deny) == deny)
				decision = deny;
			else if ((effect & undetermined) == undetermined)
				decision = undetermined;
			else if ((effect & promptOneShot) == promptOneShot)
				decision = promptOneShot;
			else if ((effect & promptSession) == promptSession)
				decision = promptSession;
			else if ((effect & promptBlanket) == promptBlanket)
				decision = promptBlanket;
			else if ((effect & permit) == permit)
				decision = permit;
			else
				decision = inapplicable;
			break;
		}
		case permitOverrides:
		{
			if ((effect & permit) == permit)
				decision = permit;
			else if ((effect & undetermined) == undetermined)
				decision = undetermined;
			else if ((effect & promptBlanket) == promptBlanket)
				decision = promptBlanket;
			else if ((effect & promptSession) == promptSession)
				decision = promptSession;
			else if ((effect & promptOneShot) == promptOneShot)
				decision = promptOneShot;
			else if ((effect & deny) == deny)
				decision = deny;
			else
				decision = inapplicable;
			break;
		}
		case firstApplicable:
		default:
		{
			decision = effect > 0 ? effect : inapplicable;
			break;
		}
	}

	return decision;
}