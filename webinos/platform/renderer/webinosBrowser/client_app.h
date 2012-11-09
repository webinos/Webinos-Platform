// Copyright (c) 2012 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#ifndef _CLIENT_APP_H_
#define _CLIENT_APP_H_
#pragma once

#include <map>
#include <set>
#include <string>
#include <utility>
#include <vector>
#include "include/cef_app.h"
#include "webinosBrowser/WidgetConfig.h"

class ClientApp : public CefApp,
                  public CefBrowserProcessHandler,
                  public CefProxyHandler,
                  public CefRenderProcessHandler 
{
public:
  ClientApp();

  // Set the proxy configuration. Should only be called during initialization.
  void SetProxyConfig(cef_proxy_type_t proxy_type, const CefString& proxy_config) { proxy_type_ = proxy_type; proxy_config_ = proxy_config; }

  int GetWebinosWRTPort();
  std::string GetStartUrl(std::string url, bool sideLoading, bool isWidget, webinos::WidgetConfig& cfg);

  bool WebinosShowChrome(void) { return m_webinosShowChrome; }
  void WebinosShowChrome(bool show) { m_webinosShowChrome = show; }
  
private:
  // CefApp methods.
  virtual void OnRegisterCustomSchemes( CefRefPtr<CefSchemeRegistrar> registrar) OVERRIDE 
  {
    registrar->AddCustomScheme("wgt", true, false, false);
    registrar->AddCustomScheme("webinos", true, false, false);
  }

  virtual CefRefPtr<CefBrowserProcessHandler> GetBrowserProcessHandler() OVERRIDE { return this; }
  virtual CefRefPtr<CefRenderProcessHandler> GetRenderProcessHandler() OVERRIDE { return this; }

  // CefBrowserProcessHandler methods.
  virtual CefRefPtr<CefProxyHandler> GetProxyHandler() OVERRIDE { return this; }
  virtual void OnContextInitialized();

  // CefProxyHandler methods.
  virtual void GetProxyForUrl(const CefString& url, CefProxyInfo& proxy_info) OVERRIDE;

  void InjectWebinos(CefRefPtr<CefFrame> frame);

  // CefRenderProcessHandler methods.
  virtual void OnWebKitInitialized() OVERRIDE;
  virtual void OnContextCreated(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context) OVERRIDE;
  virtual void OnContextReleased(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, CefRefPtr<CefV8Context> context) OVERRIDE;

  // Proxy configuration.
  cef_proxy_type_t proxy_type_;
  CefString proxy_config_;

  // Schemes that will be registered with the global cookie manager.
  std::vector<CefString> cookieable_schemes_;

  bool m_webinosShowChrome;

  IMPLEMENT_REFCOUNTING(ClientApp);
};

#endif  // _CLIENT_APP_H_
