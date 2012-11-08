#pragma once

#include <map>

namespace webinos
{

class KeyValueProperties : public std::map<std::string,std::string>
{
public:
  KeyValueProperties(void);
  ~KeyValueProperties(void);

protected:
  bool Load(std::string path);
  bool GetProperty(std::string name, int& val) const;
  bool GetProperty(std::string name, std::string& val) const;

private:
  bool AddProperty(std::string prop);
};

}
