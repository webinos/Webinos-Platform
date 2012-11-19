// Copyright (c) 2010 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include <stdio.h>
#include <cstdlib>
#include <sstream>
#include <string>
#include "include/cef_app.h"
#include "include/cef_browser.h"
#include "include/cef_command_line.h"
#include "include/cef_frame.h"
#include "include/cef_runnable.h"
#include "include/cef_web_plugin.h"
#include "base/file_path.h"
#include "base/file_util.h"
#include "base/path_service.h"
#include "base/values.h"
#include "base/json/json_reader.h"
#include "base/environment.h"
#include "base/logging.h"
#include "net/base/escape.h"

#include "webinosBrowser/webinosBrowser.h"
#include "webinosBrowser/WebinosConstants.h"
#include "webinosBrowser/client_handler.h"
#include "webinosBrowser/client_switches.h"
#include "webinosBrowser/string_util.h"
#include "webinosBrowser/util.h"

namespace 
{
  // Return the int representation of the specified string.
  int GetIntValue(const CefString& str) 
  {
    if (str.empty())
      return 0;

    std::string stdStr = str;
    return atoi(stdStr.c_str());
  }
} 

CefRefPtr<CefCommandLine> g_command_line;

void AppInitCommandLine(int argc, const char* const* argv) 
{
  g_command_line = CefCommandLine::CreateCommandLine();
#if defined(OS_WIN)
  g_command_line->InitFromString(::GetCommandLineW());
#else
  g_command_line->InitFromArgv(argc, argv);
#endif
}

// Returns the application command line object.
//
CefRefPtr<CefCommandLine> AppGetCommandLine() 
{
  return g_command_line;
}

// Get the widget store folder. This may be specified in the WRT_HOME environment
// variable or will default to <config-folder>/wrt/widgetStore
//
std::string AppGetWidgetStoreDirectory() 
{
  base::Environment* environment = base::Environment::Create();

  // Get the widget store path from environment.
  std::string wrtHomePath;
  environment->GetVar("WRT_HOME",&wrtHomePath);

  if (wrtHomePath.length() == 0)
  {
    // No environment variable found => use default.
#if defined(OS_WIN)
    environment->GetVar("AppData",&wrtHomePath);
    wrtHomePath += "/webinos/wrt/widgetStore";
#else
    FilePath fpHome;
    PathService::Get(base::DIR_HOME,&fpHome);
    wrtHomePath = fpHome.value() + "/.webinos/wrt/widgetStore";
#endif
  }

  delete environment;
    
  std::string widgetStorePath;

  // Make sure there is a trailing separator on the path.
  if (wrtHomePath.length() > 0) {
    if (wrtHomePath.find_last_of('/') == wrtHomePath.length()-1 || wrtHomePath.find_last_of('\\') == wrtHomePath.length()-1)
      widgetStorePath = wrtHomePath;  
    else
      widgetStorePath = wrtHomePath + "/";
  }

  return widgetStorePath;
}

// Returns the application settings based on command line arguments.
//
void AppGetSettings(CefSettings& settings, CefRefPtr<ClientApp> app) 
{
  ASSERT(app.get());
  ASSERT(g_command_line.get());
  if (!g_command_line.get())
    return;

  CefString str;

  // webinos-specific settings.
  app->WebinosShowChrome(g_command_line->HasSwitch(webinosRenderer::kWebinosShowChrome));

#if defined(OS_WIN)
  settings.multi_threaded_message_loop = g_command_line->HasSwitch(webinosRenderer::kMultiThreadedMessageLoop);
#endif

  CefString(&settings.cache_path) = g_command_line->GetSwitchValue(webinosRenderer::kCachePath);
  CefString(&settings.log_file) = g_command_line->GetSwitchValue(webinosRenderer::kLogFile);

  {
    std::string str = g_command_line->GetSwitchValue(webinosRenderer::kLogSeverity);
    bool invalid = false;
    if (!str.empty()) 
    {
      if (str == webinosRenderer::kLogSeverity_Verbose)
        settings.log_severity = LOGSEVERITY_VERBOSE;
      else if (str == webinosRenderer::kLogSeverity_Info)
        settings.log_severity = LOGSEVERITY_INFO;
      else if (str == webinosRenderer::kLogSeverity_Warning)
        settings.log_severity = LOGSEVERITY_WARNING;
      else if (str == webinosRenderer::kLogSeverity_Error)
        settings.log_severity = LOGSEVERITY_ERROR;
      else if (str == webinosRenderer::kLogSeverity_ErrorReport)
        settings.log_severity = LOGSEVERITY_ERROR_REPORT;
      else if (str == webinosRenderer::kLogSeverity_Disable)
        settings.log_severity = LOGSEVERITY_DISABLE;
      else
        invalid = true;
    }
    if (str.empty() || invalid) 
    {
#ifdef NDEBUG
      // Only log error messages and higher in release build.
      settings.log_severity = LOGSEVERITY_ERROR;
#endif
    }
  }

  // Retrieve command-line proxy configuration, if any.
  bool has_proxy = false;
  cef_proxy_type_t proxy_type = CEF_PROXY_TYPE_DIRECT;
  CefString proxy_config;

  if (g_command_line->HasSwitch(webinosRenderer::kProxyType)) 
  {
    std::string str = g_command_line->GetSwitchValue(webinosRenderer::kProxyType);
    if (str == webinosRenderer::kProxyType_Direct) 
    {
      has_proxy = true;
      proxy_type = CEF_PROXY_TYPE_DIRECT;
    } 
    else if (str == webinosRenderer::kProxyType_Named || str == webinosRenderer::kProxyType_Pac) 
    {
      proxy_config = g_command_line->GetSwitchValue(webinosRenderer::kProxyConfig);
      if (!proxy_config.empty()) 
      {
        has_proxy = true;
        proxy_type = (str == webinosRenderer::kProxyType_Named ? CEF_PROXY_TYPE_NAMED : CEF_PROXY_TYPE_PAC_STRING);
      }
    }
  }

  if (has_proxy) 
  {
    // Provide a ClientApp instance to handle proxy resolution.
    app->SetProxyConfig(proxy_type, proxy_config);
  }
}

// Returns the application browser settings based on command line arguments.
//
void AppGetBrowserSettings(CefBrowserSettings& settings) 
{
  ASSERT(g_command_line.get());
  if (!g_command_line.get())
    return;

  settings.remote_fonts_disabled = g_command_line->HasSwitch(webinosRenderer::kRemoteFontsDisabled);

  CefString(&settings.default_encoding) = g_command_line->GetSwitchValue(webinosRenderer::kDefaultEncoding);

  settings.encoding_detector_enabled = g_command_line->HasSwitch(webinosRenderer::kEncodingDetectorEnabled);
  settings.javascript_disabled = g_command_line->HasSwitch(webinosRenderer::kJavascriptDisabled);
  settings.javascript_open_windows_disallowed = g_command_line->HasSwitch(webinosRenderer::kJavascriptOpenWindowsDisallowed);
  settings.javascript_close_windows_disallowed = g_command_line->HasSwitch(webinosRenderer::kJavascriptCloseWindowsDisallowed);
  settings.javascript_access_clipboard_disallowed = g_command_line->HasSwitch(webinosRenderer::kJavascriptAccessClipboardDisallowed);
  settings.dom_paste_disabled = g_command_line->HasSwitch(webinosRenderer::kDomPasteDisabled);
  settings.caret_browsing_enabled = g_command_line->HasSwitch(webinosRenderer::kCaretBrowsingDisabled);
  settings.java_disabled = g_command_line->HasSwitch(webinosRenderer::kJavaDisabled);
  settings.plugins_disabled = g_command_line->HasSwitch(webinosRenderer::kPluginsDisabled);
  settings.universal_access_from_file_urls_allowed = g_command_line->HasSwitch(webinosRenderer::kUniversalAccessFromFileUrlsAllowed);
  settings.file_access_from_file_urls_allowed = g_command_line->HasSwitch(webinosRenderer::kFileAccessFromFileUrlsAllowed);
  settings.web_security_disabled = g_command_line->HasSwitch(webinosRenderer::kWebSecurityDisabled);
  settings.xss_auditor_enabled = g_command_line->HasSwitch(webinosRenderer::kXssAuditorEnabled);
  settings.image_load_disabled = g_command_line->HasSwitch(webinosRenderer::kImageLoadingDisabled);
  settings.shrink_standalone_images_to_fit = g_command_line->HasSwitch(webinosRenderer::kShrinkStandaloneImagesToFit);
  settings.site_specific_quirks_disabled = g_command_line->HasSwitch(webinosRenderer::kSiteSpecificQuirksDisabled);
  settings.text_area_resize_disabled = g_command_line->HasSwitch(webinosRenderer::kTextAreaResizeDisabled);
  settings.page_cache_disabled = g_command_line->HasSwitch(webinosRenderer::kPageCacheDisabled);
  settings.tab_to_links_disabled = g_command_line->HasSwitch(webinosRenderer::kTabToLinksDisabled);
  settings.hyperlink_auditing_disabled = g_command_line->HasSwitch(webinosRenderer::kHyperlinkAuditingDisabled);
  settings.user_style_sheet_enabled = g_command_line->HasSwitch(webinosRenderer::kUserStyleSheetEnabled);

  CefString(&settings.user_style_sheet_location) = g_command_line->GetSwitchValue(webinosRenderer::kUserStyleSheetLocation);

  settings.author_and_user_styles_disabled = g_command_line->HasSwitch(webinosRenderer::kAuthorAndUserStylesDisabled);
  settings.local_storage_disabled = g_command_line->HasSwitch(webinosRenderer::kLocalStorageDisabled);
  settings.databases_disabled = g_command_line->HasSwitch(webinosRenderer::kDatabasesDisabled);
  settings.application_cache_disabled = g_command_line->HasSwitch(webinosRenderer::kApplicationCacheDisabled);
  settings.webgl_disabled = g_command_line->HasSwitch(webinosRenderer::kWebglDisabled);
  settings.accelerated_compositing_disabled = g_command_line->HasSwitch(webinosRenderer::kAcceleratedCompositingDisabled);
  settings.accelerated_layers_disabled = g_command_line->HasSwitch(webinosRenderer::kAcceleratedLayersDisabled);
  settings.accelerated_video_disabled = g_command_line->HasSwitch(webinosRenderer::kAcceleratedVideoDisabled);
  settings.accelerated_2d_canvas_disabled = g_command_line->HasSwitch(webinosRenderer::kAcceledated2dCanvasDisabled);
  settings.accelerated_painting_enabled = g_command_line->HasSwitch(webinosRenderer::kAcceleratedPaintingEnabled);
  settings.accelerated_filters_enabled = g_command_line->HasSwitch(webinosRenderer::kAcceleratedFiltersEnabled);
  settings.accelerated_plugins_disabled = g_command_line->HasSwitch(webinosRenderer::kAcceleratedPluginsDisabled);
  settings.developer_tools_disabled = g_command_line->HasSwitch(webinosRenderer::kDeveloperToolsDisabled);
  settings.fullscreen_enabled = g_command_line->HasSwitch(webinosRenderer::kFullscreenEnabled);
}

// Read the configuration (port) data from webinos_runtime.json
//
void AppGetWebinosWRTConfig(int* pzpPort, int* webPort)
{
  CefString wrtConfigFilePath(WRT_CONFIG_FILE);

  FilePath wrtConfig;
#if defined (OS_WIN)
  PathService::Get(base::DIR_APP_DATA,&wrtConfig);
  wrtConfig = wrtConfig.Append(wrtConfigFilePath.ToWString());
#else
  PathService::Get(base::DIR_HOME,&wrtConfig);
  wrtConfig = wrtConfig.Append(wrtConfigFilePath);
#endif

  if (pzpPort != NULL)
    *pzpPort = 8081;
  if (webPort != NULL)
    *webPort = 53510;

  // Get the size of the config file.
  int64 runtimeConfigDataSize;
  if (file_util::GetFileSize(wrtConfig, &runtimeConfigDataSize))
  {
    // Allocate storage and read config data.
    char* runtimeConfigData = new char[runtimeConfigDataSize+1];
    file_util::ReadFile(wrtConfig, runtimeConfigData, runtimeConfigDataSize);
    runtimeConfigData[runtimeConfigDataSize] = 0;

    // Parse JSON.
    base::Value* v = base::JSONReader::Read(runtimeConfigData);
    delete[] runtimeConfigData;

    if (v->IsType(base::Value::TYPE_DICTIONARY))
    {
      base::DictionaryValue* dv = static_cast<base::DictionaryValue*>(v);
      base::Value* portVal;

      // Read the port the widget server is running on.
      if (webPort != NULL)
      {
        dv->Get("runtimeWebServerPort",&portVal);

        if (portVal->IsType(base::Value::TYPE_STRING))
        {
          std::string sPort;
          portVal->GetAsString(&sPort);
          *webPort = atoi(sPort.c_str());
        }
        else
          portVal->GetAsInteger(webPort);
      }

      // Read the port the pzp socket is listening on.
      if (pzpPort != NULL)
      {
        dv->Get("pzpWebSocketPort",&portVal);

        if (portVal->IsType(base::Value::TYPE_STRING))
        {
          std::string sPort;
          portVal->GetAsString(&sPort);
          *pzpPort = atoi(sPort.c_str());
        }
        else
          portVal->GetAsInteger(pzpPort);
      }
    }
  }
  else
  {
    LOG(ERROR) << "webinos_runtime.json missing";
  }
}

// Get the URL the renderer should use based on command line parameters
// assigning the correct port where necessary.
//
std::string GetWebinosStartParameters(std::string url, bool sideLoading, bool isExplicitWidget, webinos::WidgetConfig& cfg)
{
  // Get the port the widget server is listening on.
  int wrtServerPort;
  AppGetWebinosWRTConfig(NULL,&wrtServerPort);

  char startUrl[MAX_URL_LENGTH+1];
  if (url.length() > 0)
  {
    // There is a command line parameter => determine if it is a running widget or a side-load request.
    if (isExplicitWidget)
      sprintf(startUrl, "http://localhost:%d/widget/%s",wrtServerPort,url.c_str());
    else
      strcpy(startUrl,url.c_str());

    if (false == cfg.LoadFromURL(startUrl))
    {
        // The start URL is not a valid widget.
        if (sideLoading)
        {
          // Side-loading => attempt to install the passed widget file.
          std::string escaped = net::EscapeQueryParamValue(url,false);
          sprintf(startUrl,"http://localhost:%d/sideLoad/%s",wrtServerPort,escaped.c_str());
        } 
        else
        {
          // Not side loading => treat the command line argument as a URL to navigate to.
          if (!isExplicitWidget)
            strcpy(startUrl,url.c_str());
        }
    }
  }
  else
  {
    // No command line arguments => navigate to the widget server front-end.
    sprintf(startUrl, "http://localhost:%d",wrtServerPort);
  }

  return startUrl;
}

// Create a browser instance.
//
void AppCreateWebinosBrowser(std::string url, bool isWidget, bool sideLoading, CefWindowHandle closeParent, int width, int height)
{
  // Get the start URL based on command-line input.
  webinos::WidgetConfig cfg;
  std::string startUrl = GetWebinosStartParameters(url,sideLoading,isWidget,cfg);

  CefRefPtr<ClientHandler> clientHandler;
  if (cfg.isLoaded())
  {
    // We are loading a valid widget.
    width = cfg.width();
    height = cfg.height();

    clientHandler = new ClientHandler(startUrl,cfg);
  }
  else
  {
    // Not a widget...
    clientHandler = new ClientHandler(startUrl);
  }

  // Create the platform-specific window.
  AppCreateWindow(clientHandler,sideLoading,closeParent,width,height);
}
