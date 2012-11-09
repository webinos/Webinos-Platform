#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include "KeyValueProperties.h"

namespace webinos
{

KeyValueProperties::KeyValueProperties(void)
{
}


KeyValueProperties::~KeyValueProperties(void)
{
}

// Read a collection of name-value pair settings from file.
bool KeyValueProperties::Load(std::string path)
{
  bool ok = true;

  std::ifstream f(path.c_str());
  if (f.is_open())
  {
    std::string line;

    while (ok && f.good())
    {
      std::getline(f,line);
      if (line.length() > 0)
        ok = AddProperty(line);
    }

    f.close();
  }
  else
    ok = false;
  
  return ok;
}

bool KeyValueProperties::AddProperty(std::string prop)
{
  bool ok = false;

  std::string::iterator it = std::find(prop.begin(),prop.end(),':');

  if (it != prop.end())
  {
    std::string key(prop.begin(),it);
    std::string val(it+1,prop.end());

    // Trim leading spaces from value.
    size_t valStart = val.find_first_not_of(" \t");
    if (std::string::npos != valStart)
        val = val.substr(valStart);

    (*this)[key] = val;

    ok = true;
  }
  
  return ok;
}

bool KeyValueProperties::GetProperty(std::string name, int& val) const
{
  val = 0;
  const_iterator it = find(name);
  if (it != end())
    val = atoi(it->second.c_str());

  return it != end();
}

bool KeyValueProperties::GetProperty(std::string name, std::string& val) const
{
  val.clear();

  const_iterator it = find(name);
  if (it != end())
    val = it->second;

  return it != end();
}

}
