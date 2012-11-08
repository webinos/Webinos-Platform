#include "webinosBrowser/webinosBrowser.h"
#include "WidgetConfig.h"
#include <string>
#include <algorithm>
#include "googleurl/src/gurl.h"

namespace webinos
{

WidgetConfig::WidgetConfig(void) : m_loaded(false)
{
}

WidgetConfig::~WidgetConfig(void)
{
}

bool WidgetConfig::LoadFromURL(std::string url)
{
  m_loaded = false;

  // 
  // URLs are of the form wgt://<install id>/path or http://localhost:xxxxx/widget/<installId> 
  // (the latter is to support loading widgets through the browser).
  //
  GURL parsed(url.c_str());
  
  std::string scheme = parsed.scheme();
  const std::string p = parsed.path();
  
  std::string::const_iterator it = p.end();

  // Parse wgt:// URLS - move past the // (always present in path).
  if (scheme == "wgt" && p.substr(0,2) == "//")
  {
    it = p.begin() + 2;
  }
  else
  {
    // Try and parse url path - assuming of the form http://localhost:xxxxx/widget/<installId>
    const std::string widgetRoute = "/widget/";

    if (p.substr(0,widgetRoute.length()) == widgetRoute)
      it = p.begin() + widgetRoute.length();
  }

  if (it != p.end())
  {
    // Find the next / character.
    std::string::const_iterator idEnd = std::find(it,p.end(),'/');

    // Get the widget install id.
    m_installId = std::string(it,idEnd);

    // Create the path to the widget.
    m_widgetPath = AppGetWidgetStoreDirectory() + m_installId;

    // Move past trailing slash.
    if (idEnd != p.end() && *idEnd == '/')
      idEnd++;

    std::string widgetConfigPath = m_widgetPath + "/.config";
    m_loaded = Load(widgetConfigPath);

    m_urlPath = std::string(idEnd,p.end());
  }

  return m_loaded;
}

std::string WidgetConfig::author(void) const
{
  std::string val;
  GetProperty("widget.author.name.unicode",val);
  return val;
}

std::string WidgetConfig::description(void) const
{
  std::string val;
  GetProperty("widget.description.unicode",val);
  return val;
}

std::string WidgetConfig::name(void) const
{
  std::string val;
  GetProperty("widget.name.unicode",val);
  return val;
}

std::string WidgetConfig::shortName(void) const
{
  std::string val;
  GetProperty("widget.shortName.unicode",val);
  return val;
}

std::string WidgetConfig::version(void) const
{
  std::string val;
  GetProperty("widget.version.unicode",val);
  return val;
}

std::string WidgetConfig::id(void) const
{
  std::string val;
  GetProperty("widget.id",val);
  return val;
}

std::string WidgetConfig::authorEmail(void) const
{
  std::string val;
  GetProperty("widget.author.email",val);
  return val;
}

std::string WidgetConfig::authorHref(void) const
{
  std::string val;
  GetProperty("widget.author.href",val);
  return val;
}

int WidgetConfig::width(void) const
{
  int width;
  if (!GetProperty("widget.width",width))
    width = 0;

  return width;
}

int WidgetConfig::height(void) const
{
  int height;
  if (!GetProperty("widget.height",height))
    height = 0;

  return height;
}

std::string WidgetConfig::startFile(void) const
{
  std::string val;
  
  if (false == GetProperty("widget.startFile.path",val))
    val = "!!!missing start file!!!";

  return val;
}

}
