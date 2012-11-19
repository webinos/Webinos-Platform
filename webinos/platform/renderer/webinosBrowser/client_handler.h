// Copyright (c) 2011 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#ifndef _CLIENT_HANDLER_H_
#define _CLIENT_HANDLER_H_
#pragma once

#include <map>
#include <set>
#include <string>
#include "include/cef_client.h"
#include "webinosBrowser/util.h"
#include "webinosBrowser/WidgetConfig.h"

// ClientHandler implementation.
class ClientHandler : public CefClient,
                      public CefContextMenuHandler,
                      public CefDisplayHandler,
                      public CefDownloadHandler,
                      public CefGeolocationHandler,
                      public CefKeyboardHandler,
                      public CefLifeSpanHandler,
                      public CefLoadHandler,
                      public CefRequestHandler 
{
private:
  void Construct(std::string startUrl);

public:
  ClientHandler(std::string startUrl);
  ClientHandler(std::string startUrl, webinos::WidgetConfig& cfg);
  virtual ~ClientHandler();

  // The edit window handle
  CefWindowHandle m_EditHwnd;

  // The button window handles
  CefWindowHandle m_BackHwnd;
  CefWindowHandle m_ForwardHwnd;
  CefWindowHandle m_StopHwnd;
  CefWindowHandle m_ReloadHwnd;

  // CefClient methods
  virtual CefRefPtr<CefContextMenuHandler> GetContextMenuHandler() OVERRIDE {  return this; }
  virtual CefRefPtr<CefDisplayHandler> GetDisplayHandler() OVERRIDE { return this; }
  virtual CefRefPtr<CefDownloadHandler> GetDownloadHandler() OVERRIDE { return this; }
  virtual CefRefPtr<CefGeolocationHandler> GetGeolocationHandler() OVERRIDE { return this; }
  virtual CefRefPtr<CefKeyboardHandler> GetKeyboardHandler() OVERRIDE { return this; }
  virtual CefRefPtr<CefLifeSpanHandler> GetLifeSpanHandler() OVERRIDE { return this; }
  virtual CefRefPtr<CefLoadHandler> GetLoadHandler() OVERRIDE { return this; }
  virtual CefRefPtr<CefRequestHandler> GetRequestHandler() OVERRIDE { return this; }


  // CefContextMenuHandler methods
  virtual void OnBeforeContextMenu(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, CefRefPtr<CefMenuModel> model) OVERRIDE; 
  virtual bool OnContextMenuCommand(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefContextMenuParams> params, int command_id, EventFlags event_flags) OVERRIDE;

  // CefDisplayHandler methods
  virtual void OnLoadingStateChange(CefRefPtr<CefBrowser> browser,  bool isLoading, bool canGoBack, bool canGoForward) OVERRIDE;
  virtual void OnAddressChange(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, const CefString& url) OVERRIDE;
  virtual void OnTitleChange(CefRefPtr<CefBrowser> browser, const CefString& title) OVERRIDE;
  virtual bool OnConsoleMessage(CefRefPtr<CefBrowser> browser, const CefString& message, const CefString& source, int line) OVERRIDE;
  
  // CefDownloadHandler methods
  virtual void OnBeforeDownload(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, const CefString& suggested_name, CefRefPtr<CefBeforeDownloadCallback> callback) OVERRIDE;
  virtual void OnDownloadUpdated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefDownloadItem> download_item, CefRefPtr<CefDownloadItemCallback> callback) OVERRIDE;

  // CefGeolocationHandler methods
  virtual void OnRequestGeolocationPermission(CefRefPtr<CefBrowser> browser, const CefString& requesting_url, int request_id, CefRefPtr<CefGeolocationCallback> callback) OVERRIDE;

  // CefKeyboardHandler methods
  virtual bool OnPreKeyEvent(CefRefPtr<CefBrowser> browser, const CefKeyEvent& event, CefEventHandle os_event, bool* is_keyboard_shortcut) OVERRIDE;

  // CefLifeSpanHandler methods
  virtual bool OnBeforePopup(CefRefPtr<CefBrowser> parentBrowser, const CefPopupFeatures& popupFeatures, CefWindowInfo& windowInfo, const CefString& url, CefRefPtr<CefClient>& client, CefBrowserSettings& settings) OVERRIDE;
  virtual void OnAfterCreated(CefRefPtr<CefBrowser> browser) OVERRIDE;
  virtual bool DoClose(CefRefPtr<CefBrowser> browser) OVERRIDE;
  virtual void OnBeforeClose(CefRefPtr<CefBrowser> browser) OVERRIDE;
  virtual void OnRenderProcessTerminated(CefRefPtr<CefBrowser> browser, TerminationStatus status) OVERRIDE;

  // CefLoadHandler methods
  virtual void OnLoadStart(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame) OVERRIDE;
  virtual void OnLoadEnd(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int httpStatusCode) OVERRIDE;
  virtual void OnLoadError(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, ErrorCode errorCode, const CefString& errorText, const CefString& failedUrl) OVERRIDE;

  // CefRequestHandler methods
  virtual CefRefPtr<CefResourceHandler> GetResourceHandler(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefRequest> request) OVERRIDE;
  virtual void OnProtocolExecution(CefRefPtr<CefBrowser> browser, const CefString& url, bool& allow_os_execution) OVERRIDE;

  void SetMainHwnd(CefWindowHandle hwnd);
  CefWindowHandle GetMainHwnd() { return m_MainHwnd; }
  void SetEditHwnd(CefWindowHandle hwnd);
  void SetButtonHwnds(CefWindowHandle backHwnd, CefWindowHandle forwardHwnd, CefWindowHandle reloadHwnd, CefWindowHandle stopHwnd);

  CefRefPtr<CefBrowser> GetBrowser() { return m_Browser; }
  int GetBrowserId() { return m_BrowserId; }

  std::string GetLogFile();

  void SetLastDownloadFile(const std::string& fileName);
  std::string GetLastDownloadFile();
  void Launch(CefString url);

  // Send a notification to the application. Notifications should not block the
  // caller.
  enum NotificationType 
  {
    NOTIFY_CONSOLE_MESSAGE,
    NOTIFY_DOWNLOAD_COMPLETE,
    NOTIFY_DOWNLOAD_ERROR,
  };
  void SendNotification(NotificationType type);
  void CompleteSideLoad(std::string url);
  void ShowMainWindow();
  void CloseMainWindow();

  void ShowDevTools(CefRefPtr<CefBrowser> browser);

  std::string GetStartUrl(void) { return m_startUrl; }

 protected:
  void SetLoading(bool isLoading);
  void SetNavState(bool canGoBack, bool canGoForward);

  // The child browser window
  CefRefPtr<CefBrowser> m_Browser;

  // The main frame window handle
  CefWindowHandle m_MainHwnd;

  // The child browser id
  int m_BrowserId;

  // Support for logging.
  std::string m_LogFile;

  // Support for downloading files.
  std::string m_LastDownloadFile;

  std::set<std::string> m_OpenDevToolsURLs;

  bool m_isWidget;
  webinos::WidgetConfig m_cfg;
  std::string m_startUrl;

  // Include the default reference counting implementation.
  IMPLEMENT_REFCOUNTING(ClientHandler);
  // Include the default locking implementation.
  IMPLEMENT_LOCKING(ClientHandler);
};

#endif  // _CLIENT_HANDLER_H_
