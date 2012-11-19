// Copyright (c) 2011 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include "webinosBrowser/client_handler.h"
#include <stdio.h>
#include <sstream>
#include <string>
#include <algorithm>
#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "include/wrapper/cef_stream_resource_handler.h"
#include "webinosBrowser/webinosBrowser.h"
#include "webinosBrowser/resource_util.h"
#include "webinosBrowser/string_util.h"
#include "include/cef_runnable.h"

const std::string kWebinosRuntimeError = "webinos://runtimeerror/";
const std::string kWebinosResourceNotFoundError = "webinos://resourcenotfound/";
const std::string kWebinosSideLoadComplete = "webinos://sideloadcomplete/";
const std::string kWebinosSideLoadFailed = "webinos://sideloadfailed/";
const std::string kWebinosAboutWidget = "webinos://aboutwidget/";

// Custom menu command Ids.
enum client_menu_ids 
{
  CLIENT_ID_SHOW_DEVTOOLS   = MENU_ID_USER_FIRST,
  CLIENT_ID_ABOUT_WIDGET,
};

ClientHandler::ClientHandler(std::string startUrl)
{
  m_isWidget = false;
  Construct(startUrl);
}

ClientHandler::ClientHandler(std::string startUrl,webinos::WidgetConfig& cfg)
{
  m_cfg = cfg;
  m_isWidget = m_cfg.isLoaded();
  Construct(startUrl);
}

void ClientHandler::Construct(std::string startUrl)
{
  m_startUrl = startUrl;
  m_MainHwnd = NULL;
  m_BrowserId = 0;
  m_EditHwnd = NULL;
  m_BackHwnd = NULL;
  m_ForwardHwnd = NULL;
  m_StopHwnd = NULL;
  m_ReloadHwnd = NULL;
}

ClientHandler::~ClientHandler() 
{
}

void ClientHandler::OnBeforeContextMenu(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, CefRefPtr<CefMenuModel> model) 
{
  if ((params->GetTypeFlags() & (CM_TYPEFLAG_PAGE | CM_TYPEFLAG_FRAME)) != 0) 
  {
    // Add a separator if the menu already has items.
    if (model->GetCount() > 0)
      model->AddSeparator();

    // Add a "Show DevTools" item to all context menus.
    model->AddItem(CLIENT_ID_SHOW_DEVTOOLS, "&Show DevTools");

    CefString devtools_url = browser->GetHost()->GetDevToolsURL(true);
    if (devtools_url.empty() || m_OpenDevToolsURLs.find(devtools_url) != m_OpenDevToolsURLs.end()) 
    {
      // Disable the menu option if DevTools isn't enabled or if a window is
      // already open for the current URL.
      model->SetEnabled(CLIENT_ID_SHOW_DEVTOOLS, false);
    }

    if (m_isWidget)
    {
      model->AddSeparator();
      model->AddItem(CLIENT_ID_ABOUT_WIDGET, "About widget");
    }
  }
}

bool ClientHandler::OnContextMenuCommand(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, int command_id, EventFlags event_flags) 
{
  switch (command_id) 
  {
    case CLIENT_ID_SHOW_DEVTOOLS:
      ShowDevTools(browser);
      return true;
    case CLIENT_ID_ABOUT_WIDGET:
      AppCreateWebinosBrowser("about/" + m_cfg.GetInstallId(),true,false,NULL,320,400);
      return true;
    default:  
      return false;
  }
}

void ClientHandler::OnLoadingStateChange(CefRefPtr<CefBrowser> browser, bool isLoading, bool canGoBack, bool canGoForward) 
{
  REQUIRE_UI_THREAD();
  SetLoading(isLoading);
  SetNavState(canGoBack, canGoForward);
}

bool ClientHandler::OnConsoleMessage(CefRefPtr<CefBrowser> browser, const CefString& message, const CefString& source, int line) 
{
  REQUIRE_UI_THREAD();

  bool first_message;
  std::string logFile;

  {
    AutoLock lock_scope(this);

    first_message = m_LogFile.empty();
    if (first_message) 
    {
      std::stringstream ss;
      ss << AppGetWorkingDirectory();
#if defined(OS_WIN)
      ss << "\\";
#else
      ss << "/";
#endif
      ss << "console.log";
      m_LogFile = ss.str();
    }
    logFile = m_LogFile;
  }

  FILE* file = fopen(logFile.c_str(), "a");
  if (file) 
  {
    std::stringstream ss;
    ss << "Message: " << std::string(message) << "\r\nSource: " << std::string(source) << "\r\nLine: " << line << "\r\n-----------------------\r\n";
    fputs(ss.str().c_str(), file);
    fclose(file);

    if (first_message)
      SendNotification(NOTIFY_CONSOLE_MESSAGE);
  }

  return false;
}

void ClientHandler::OnBeforeDownload(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, const CefString& suggested_name, CefRefPtr<CefBeforeDownloadCallback> callback) 
{
  REQUIRE_UI_THREAD();

  // Save file in default temp folder, and don't prompt for 'save as'
  callback->Continue("", false);
}

void ClientHandler::OnDownloadUpdated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, CefRefPtr<CefDownloadItemCallback> callback) 
{
  REQUIRE_UI_THREAD();
  
  if (download_item->IsComplete()) 
  {
    SetLastDownloadFile(download_item->GetFullPath());
    if (download_item->GetMimeType() == "application/widget")
      SendNotification(NOTIFY_DOWNLOAD_COMPLETE);
  }
}

void ClientHandler::OnRequestGeolocationPermission(CefRefPtr<CefBrowser> browser, const CefString& requesting_url, int request_id, CefRefPtr<CefGeolocationCallback> callback) 
{
  // Allow geolocation access from all websites.
  callback->Continue(true);
}

bool ClientHandler::OnPreKeyEvent(CefRefPtr<CefBrowser> browser, const CefKeyEvent& event, CefEventHandle os_event, bool* is_keyboard_shortcut) 
{
  return false;
}

void ClientHandler::OnAfterCreated(CefRefPtr<CefBrowser> browser) 
{
  REQUIRE_UI_THREAD();

  AutoLock lock_scope(this);
  if (!m_Browser.get())   
  {
    // We need to keep the main child window, but not popup windows
    m_Browser = browser;
    m_BrowserId = browser->GetIdentifier();
  }
}

bool ClientHandler::DoClose(CefRefPtr<CefBrowser> browser) 
{
  REQUIRE_UI_THREAD();

  if (m_BrowserId == browser->GetIdentifier()) 
  {
    // Since the main window contains the browser window, we need to close
    // the parent window instead of the browser window.
    CloseMainWindow();

    // Return true here so that we can skip closing the browser window
    // in this pass. (It will be destroyed due to the call to close
    // the parent above.)
    return true;
  }

  // A popup browser window is not contained in another window, so we can let
  // these windows close by themselves.
  return false;
}

void ClientHandler::OnBeforeClose(CefRefPtr<CefBrowser> browser) 
{
  REQUIRE_UI_THREAD();

  if (m_BrowserId == browser->GetIdentifier()) 
  {
    // Free the browser pointer so that the browser can be destroyed
    m_Browser = NULL;
  } 
  else if (browser->IsPopup()) 
  {
    // Remove the record for DevTools popup windows.
    std::set<std::string>::iterator it = m_OpenDevToolsURLs.find(browser->GetMainFrame()->GetURL());
    if (it != m_OpenDevToolsURLs.end())
      m_OpenDevToolsURLs.erase(it);
  }
}

void ClientHandler::OnLoadStart(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame) 
{
  REQUIRE_UI_THREAD();

  if (m_BrowserId == browser->GetIdentifier() && frame->IsMain()) 
  {
    // We've just started loading a page
      SetLoading(true);
  }
}

void ClientHandler::OnLoadEnd(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int httpStatusCode) 
{
  REQUIRE_UI_THREAD();

  if (m_BrowserId == browser->GetIdentifier() && frame->IsMain()) 
  {
    // We've just finished loading a page
    SetLoading(false);
  }
}

void ClientHandler::OnLoadError(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, ErrorCode errorCode, const CefString& errorText, const CefString& failedUrl) 
{
  REQUIRE_UI_THREAD();

  // Don't display an error for downloaded files.
  if (errorCode == ERR_ABORTED)
    return;

  if (errorCode == ERR_CONNECTION_REFUSED)
    frame->LoadURL(kWebinosRuntimeError);
  else
  {
    // Display a load error message.
    std::stringstream ss;
    ss << "<html><body><h2>Failed to load URL " << std::string(failedUrl) << " with error " << std::string(errorText) << " (" << errorCode << ").</h2></body></html>";
    frame->LoadString(ss.str(), failedUrl);
  }
}

void ClientHandler::OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser, TerminationStatus status)
{
  // Load the startup URL if that's not the website that we terminated on.
  CefRefPtr<CefFrame> frame = browser->GetMainFrame();
  std::string url = frame->GetURL();
  std::transform(url.begin(), url.end(), url.begin(), tolower);

  std::string startupURL = GetStartUrl();
  if (url.find(startupURL) != 0)
    frame->LoadURL(startupURL);
}

CefRefPtr<CefResourceHandler> ClientHandler::GetResourceHandler(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefRequest> request) 
{
  std::string url = request->GetURL();

  if (url == kWebinosAboutWidget)
  {
    CefRefPtr<CefStreamReader> stream = GetBinaryResourceReader("webinosAboutWidget.html");
    ASSERT(stream.get());
    return new CefStreamResourceHandler("text/html", stream);
  }
  else if (url == kWebinosResourceNotFoundError) 
  {
    CefRefPtr<CefStreamReader> stream = GetBinaryResourceReader("webinos404.html");
    ASSERT(stream.get());
    return new CefStreamResourceHandler("text/html", stream);
  } 
  else  if (url == kWebinosRuntimeError) 
  {
    CefRefPtr<CefStreamReader> stream = GetBinaryResourceReader("webinos500.html");
    ASSERT(stream.get());
    return new CefStreamResourceHandler("text/html", stream);
  } 
  else if (url.substr(0,kWebinosSideLoadComplete.length()) == kWebinosSideLoadComplete) 
  {
    std::string installId(url.substr(kWebinosSideLoadComplete.length()));
    CompleteSideLoad(installId);
  } 
  else if (url == kWebinosSideLoadFailed) 
  {
    ShowMainWindow();
    CefRefPtr<CefStreamReader> stream = GetBinaryResourceReader("webinosInvalidWidget.html");
    ASSERT(stream.get());
    return new CefStreamResourceHandler("text/html", stream);
  }

  CefRefPtr<CefResourceHandler> handler;
  return handler;
}

void ClientHandler::OnProtocolExecution(CefRefPtr<CefBrowser> browser, const CefString& url, bool& allow_os_execution)
{
  std::string urlStr = url;

  // Allow OS execution of Spotify URIs.
  if (urlStr.find("spotify:") == 0)
    allow_os_execution = true;
}

void ClientHandler::SetMainHwnd(CefWindowHandle hwnd) 
{
  AutoLock lock_scope(this);
  m_MainHwnd = hwnd;
}

void ClientHandler::SetEditHwnd(CefWindowHandle hwnd) 
{
  AutoLock lock_scope(this);
  m_EditHwnd = hwnd;
}

void ClientHandler::SetButtonHwnds(CefWindowHandle backHwnd, CefWindowHandle forwardHwnd, CefWindowHandle reloadHwnd, CefWindowHandle stopHwnd) 
{
  AutoLock lock_scope(this);
  m_BackHwnd = backHwnd;
  m_ForwardHwnd = forwardHwnd;
  m_ReloadHwnd = reloadHwnd;
  m_StopHwnd = stopHwnd;
}

std::string ClientHandler::GetLogFile() 
{
  AutoLock lock_scope(this);
  return m_LogFile;
}

void ClientHandler::SetLastDownloadFile(const std::string& fileName) 
{
  AutoLock lock_scope(this);
  m_LastDownloadFile = fileName;
}

std::string ClientHandler::GetLastDownloadFile() 
{
  AutoLock lock_scope(this);
  return m_LastDownloadFile;
}

void ClientHandler::ShowDevTools(CefRefPtr<CefBrowser> browser) 
{
  std::string devtools_url = browser->GetHost()->GetDevToolsURL(true);

  if (!devtools_url.empty() && m_OpenDevToolsURLs.find(devtools_url) == m_OpenDevToolsURLs.end()) 
  {
    m_OpenDevToolsURLs.insert(devtools_url);
    browser->GetMainFrame()->ExecuteJavaScript("window.open('" +  devtools_url + "');", "about:blank", 0);
  }
}

bool ClientHandler::OnBeforePopup(CefRefPtr<CefBrowser> parentBrowser, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo, const CefString& url, CefRefPtr<CefClient>& client, CefBrowserSettings& settings) 
{
  REQUIRE_UI_THREAD();

  webinos::WidgetConfig cfg;
  if (cfg.LoadFromURL(url))
  {
    AppCreateWebinosBrowser(url, false, false, NULL);
    return true;
  }

  return false;
}

void ClientHandler::CompleteSideLoad(std::string installId)
{
  CefPostTask(TID_UI, NewCefRunnableFunction(AppCreateWebinosBrowser,installId,true,false,m_MainHwnd,0,0));
}

