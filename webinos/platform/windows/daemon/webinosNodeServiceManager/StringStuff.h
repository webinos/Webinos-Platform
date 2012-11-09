#pragma once

#include <vector>
#include <string>

namespace webinos
{
  std::string& rtrim(std::string& str, const std::string& trim);
  std::string& ltrim(std::string& str, const std::string& trim);
  std::string trim(std::string& str, const std::string& trim);

  std::vector<std::string> split(const char *str, char c);

  std::string replace(std::string& str, const std::string& find, const std::string& replace);
}