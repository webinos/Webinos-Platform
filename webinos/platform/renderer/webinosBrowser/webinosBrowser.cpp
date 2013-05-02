// Copyright (c) 2010 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include <stdio.h>
#include <cstdlib>
#include <sstream>
#include <string>
#include <algorithm>
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

base::DictionaryValue* LoadFileAsJSON(CefString path);
base::DictionaryValue* LoadFileAsJSON(FilePath filePath);

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
  std::string pzpPath = AppGetWebinosWRTConfig(NULL,NULL);
  std::string widgetStorePath;

  // Make sure there is a trailing separator on the path.
  if (pzpPath.length() > 0) 
  {
    if (pzpPath.find_last_of('/') == pzpPath.length()-1 || pzpPath.find_last_of('\\') == pzpPath.length()-1)
      widgetStorePath = pzpPath + "wrt/widgetStore/";
    else
      widgetStorePath = pzpPath + "/wrt/widgetStore/";
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

bool AppParseLaunchFile(FilePath launchFile, std::string& installId, std::string& params)
{
  bool ok = false;

  base::DictionaryValue* dv = LoadFileAsJSON(launchFile);
  if (dv != NULL)
  {
    base::Value* dataVal;

    // Read the installId of the widget to be launched.
    if (dv->Get("installId",&dataVal) && dataVal->IsType(base::Value::TYPE_STRING))
    {
      dataVal->GetAsString(&installId);
      ok = true;
    }
    else
    {
      LOG(ERROR) << launchFile.value() << " launch file installId data missing";
    }

    // Read any arguments of the widget to be launched.
    if (dv->Get("params",&dataVal) && dataVal->IsType(base::Value::TYPE_STRING))
    {
      dataVal->GetAsString(&params);
    }

    delete dv;
  }

  return ok;
}

// Read the configuration (port) data from webinos_runtime.json
//
std::string AppGetWebinosWRTConfig(int* pzpPort, int* webPort)
{
  if (pzpPort != NULL)
    *pzpPort = 8081;
  if (webPort != NULL)
    *webPort = 53510;

  std::string pzpPath;

  CefString wrtConfigFilePath(WRT_CONFIG_FILE);

  base::DictionaryValue* dv = LoadFileAsJSON(wrtConfigFilePath);

  if (dv != NULL)
  {
    base::Value* dataVal;

    // Read the port the widget server is running on.
    if (webPort != NULL)
    {
      if (dv->Get("runtimeWebServerPort",&dataVal))
      {
        if (dataVal->IsType(base::Value::TYPE_STRING))
        {
          std::string sPort;
          dataVal->GetAsString(&sPort);
          *webPort = atoi(sPort.c_str());
        }
        else
          dataVal->GetAsInteger(webPort);
      }
      else
      {
        LOG(ERROR) << "webinos_runtime.json runtimeWebServerPort data missing";
      }
    }

    // Read the port the pzp socket is listening on.
    if (pzpPort != NULL)
    {
      if (dv->Get("pzpWebSocketPort",&dataVal))
      { 
        if (dataVal->IsType(base::Value::TYPE_STRING))
        {
          std::string sPort;
          dataVal->GetAsString(&sPort);
          *pzpPort = atoi(sPort.c_str());
        }
        else
          dataVal->GetAsInteger(pzpPort);
      }
      else
      {
        LOG(ERROR) << "webinos_runtime.json pzpWebSocketPort data missing";
      }
    }

    // Read the pzp path.
    if (dv->Get("pzpPath",&dataVal))
    {
      if (dataVal->IsType(base::Value::TYPE_STRING))
      {
        dataVal->GetAsString(&pzpPath);
      }
      else
      {
        LOG(ERROR) << "webinos_runtime.json pzpPath data invalid type";
      }
    }
    else
    {
      LOG(ERROR) << "webinos_runtime.json pzpPath data missing";
    }

    delete dv;
  }
  else
  {
    LOG(ERROR) << "webinos_runtime.json missing";
  }

  return pzpPath;
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
      sprintf(startUrl, "http://localhost:%d/boot/%s",wrtServerPort,url.c_str());
    else
      strcpy(startUrl,url.c_str());

    if (sideLoading || false == cfg.LoadFromURL(startUrl))
    {
        // The start URL is not a valid widget.
        if (sideLoading)
        {
          LOG(INFO) << "side loading " << url.c_str();

          // Side-loading => attempt to install the passed widget file.
          // First check for dummy 'launch' widget files (these files are created by the applauncher api
          // to fool the OS into launching the widget).
#if defined (OS_WIN)
          FilePath launchPath(CefString(url).ToWString());
#else
          FilePath launchPath(CefString(url).ToString());
#endif
          // Get the filename portion of the path.
          std::string launchFileName = CefString(launchPath.BaseName().value());

          // Check for well-known 'launch' files.
          const std::string launchPrefix = ".__webinosLaunch.";
          if (launchFileName.substr(0,launchPrefix.length()) == launchPrefix)
          {
            // This is an applauncher api request
            std::string installId;
            std::string launchArguments;
            if (AppParseLaunchFile(launchPath,installId,launchArguments))
            {
              LOG(INFO) << "side loading applauncher request " << installId.c_str();
              sprintf(startUrl,"http://localhost:%d/boot/%s%s",wrtServerPort,installId.c_str(),launchArguments.c_str());
              cfg.LoadFromURL(startUrl);
              file_util::Delete(launchPath,false);
            }
            else
            {
              LOG(ERROR) << "applaunch failed - invalid launch request";
            }
          }
          else 
          {
            // This is a normal side-load request - pass it on to the pzp.
            std::string escaped = net::EscapeQueryParamValue(url,false);
            sprintf(startUrl,"http://localhost:%d/sideLoad/%s",wrtServerPort,escaped.c_str());
          }
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

base::DictionaryValue* LoadFileAsJSON(CefString path)
{
  FilePath filePath;

#if defined (OS_WIN)
  PathService::Get(base::DIR_APP_DATA,&filePath);
  filePath = filePath.Append(path.ToWString());
#else
  PathService::Get(base::DIR_HOME,&filePath);
  filePath = filePath.Append(path);
#endif

  return LoadFileAsJSON(filePath);
}

base::DictionaryValue* LoadFileAsJSON(FilePath filePath)
{
  base::DictionaryValue* dv = NULL;

  int64 dataSize;
  if (file_util::GetFileSize(filePath, &dataSize))
  {
    // Allocate storage and read config data.
    char* fileData = new char[dataSize+1];
    file_util::ReadFile(filePath, fileData, dataSize);
    fileData[dataSize] = 0;

    // Parse JSON.
    base::Value* v = base::JSONReader::Read(fileData);
    delete[] fileData;

    if (v->IsType(base::Value::TYPE_DICTIONARY))
    {
      dv = static_cast<base::DictionaryValue*>(v);
    }
    else
    {
      delete v;
    }
  }

  return dv;
}

bool AppGetWidgetArgs(std::string sessionId, std::string& args)
{
  bool ok = false;

#if defined(OS_WIN)
  CefString sessionFile("webinos/wrt/sessions/" + sessionId + ".json");
#else
  CefString sessionFile(".webinos/wrt/sessions/" + sessionId + ".json");
#endif

  base::DictionaryValue* dv = LoadFileAsJSON(sessionFile);

  if (dv != NULL)
  {
    base::Value* dataVal;

    // Read the installId of the widget to be launched.
    if (dv->Get("params",&dataVal) && dataVal->IsType(base::Value::TYPE_STRING))
    {
      dataVal->GetAsString(&args);

      std::string::const_iterator it = args.begin();

      // Remove leading ?
      if (*it == '?')
      {
        args = args.substr(1);
      }

      // Un-escape URL encoding
      args = net::UnescapeURLComponent(args,net::UnescapeRule::NORMAL);

      // Replace separators to emulate JSON format.
      std::replace(args.begin(),args.end(),'&',',');
      std::replace(args.begin(),args.end(),'=',':');

      ok = true;
    }

    delete dv;
  }

  return ok;
}
