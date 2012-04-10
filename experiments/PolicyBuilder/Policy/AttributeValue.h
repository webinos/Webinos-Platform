#pragma once

class CQuery;

class CAttributeValue
{
private:
	const std::string& m_context;
	std::string m_name;

	std::string GetName() const { return m_name; }

public:
	CAttributeValue(const std::string& ctx);
	CAttributeValue(xml_node& attr, const std::string& ctx);
	virtual ~CAttributeValue(void);

	virtual std::string GetValue(CQuery&);
};
