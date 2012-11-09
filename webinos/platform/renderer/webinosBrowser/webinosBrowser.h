// Copyright (c) 2011 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#ifndef _WEBINOS_RENDERER_H_
#define _WEBINOS_RENDERER_H_
#pragma once

#include <string>
#include "include/cef_base.h"
#include "webinosBrowser/client_app.h"

#define MAX_URL_LENGTH  2000

class CefApp;
class CefBrowser;
class CefCommandLine;
class ClientHandler;

// Returns the application working directory.
std::string AppGetWorkingDirectory();

// Returns the path to the widget storage folder (defined in WRT_HOME environment variable)
std::string AppGetWidgetStoreDirectory();

// Initialize the application command line.
void AppInitCommandLine(int argc, const char* const* argv);

// Returns the application command line object.
CefRefPtr<CefCommandLine> AppGetCommandLine();

// Returns the application settings based on command line arguments.
void AppGetSettings(CefSettings& settings, CefRefPtr<ClientApp> app);

// Returns the application browser settings based on command line arguments.
void AppGetBrowserSettings(CefBrowserSettings& settings);

void AppGetWebinosWRTConfig(int* pzpPort, int* webPort);

void AppCreateWebinosBrowser(std::string url, bool isWidget, bool sideLoading, CefWindowHandle closeParent, int width = 0, int height = 0);

void AppCreateWindow(CefRefPtr<ClientHandler> clientHandler, bool sideLoading, CefWindowHandle closeParent, int width, int height);

#endif  // _WEBINOS_RENDERER_H_
