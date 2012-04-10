#pragma once

#include <map>

class CPolicyDoc;
class CRequestContext;

enum decisionResult
{
	permit =		0x00000001,
	deny =			0x00000010,
	promptOneShot =	0x00000100,
	promptSession =	0x00001000,
	promptBlanket =	0x00010000,
	undetermined =	0x00100000,
	inapplicable =	0x01000000
};

class CQuery
{
private:
	typedef std::map<std::string, CRequestContext*> CONTEXT_MAP;
	CONTEXT_MAP m_contexts;

    void CommonConstruct();

public:
	CQuery(void);
	CQuery(std::string requestXML);
	virtual ~CQuery(void);

	CRequestContext& GetContext(const std::string& name);
	CRequestContext& GetEnvironmentCtx();
	CRequestContext& GetSubjectCtx();
	CRequestContext& GetResourceCtx();

	decisionResult GetDecision(CPolicyDoc& policyDoc);

	static const std::string environment;
	static const std::string subject;
	static const std::string resource;
	static const std::string literalContext;
};
