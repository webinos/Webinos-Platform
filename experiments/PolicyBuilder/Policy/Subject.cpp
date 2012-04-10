#include "PolicySystem.h"
#include "Subject.h"

CSubject::CSubject(xml_node& node) : CCondition(node)
{
	assert(UseCombineAnd() == true);
}
