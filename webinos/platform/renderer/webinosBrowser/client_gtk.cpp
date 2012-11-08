// Copyright (c) 2011 The Chromium Embedded Framework Authors. All rights
// reserved. Use of this source code is governed by a BSD-style license that
// can be found in the LICENSE file.

#include <gtk/gtk.h>
#include <stdlib.h>
#include <unistd.h>
#include <string>
#include "webinosBrowser/webinosBrowser.h"
#include "include/cef_app.h"
#include "include/cef_browser.h"
#include "include/cef_frame.h"
#include "include/cef_runnable.h"
#include "base/at_exit.h"
#include "webinosBrowser/client_handler.h"
#include "webinosBrowser/string_util.h"
#include "webinosBrowser/client_switches.h"
#include "webinosBrowser/WidgetSchemeHandler.h"
#include "webinosBrowser/WebinosSchemeHandler.h"
#include "webinosBrowser/WidgetConfig.h"
#include "webinosBrowser/WebinosConstants.h"

char szWorkingDir[512];  // The current working directory

void TerminationSignalHandler(int signatl) {
  //destroy();
}

int m_browsers = 0;

void destroy(void) {
	m_browsers--;
	if (m_browsers == 0)
		CefQuitMessageLoop();
}

// Callback for when you click the back button.
void BackButtonClicked(GtkButton* button) {  
  GtkWidget *toplevel = gtk_widget_get_toplevel(GTK_WIDGET(button));
  ClientHandler* handler = (ClientHandler*)g_object_get_data(G_OBJECT(toplevel),"clientHandler");
    if (handler->GetBrowserId()) {
      handler->GetBrowser()->GoBack();
    }
}

// Callback for when you click the forward button.
void ForwardButtonClicked(GtkButton* button) {
  GtkWidget *toplevel = gtk_widget_get_toplevel(GTK_WIDGET(button));
  ClientHandler* handler = (ClientHandler*)g_object_get_data(G_OBJECT(toplevel),"clientHandler");
    if (handler->GetBrowserId()) {
      handler->GetBrowser()->GoForward();
    }
}

// Callback for when you click the stop button.
void StopButtonClicked(GtkButton* button) {
  GtkWidget *toplevel = gtk_widget_get_toplevel(GTK_WIDGET(button));
  ClientHandler* handler = (ClientHandler*)g_object_get_data(G_OBJECT(toplevel),"clientHandler");
    if (handler->GetBrowserId()) {
      handler->GetBrowser()->StopLoad();
    }
}

// Callback for when you click the reload button.
void ReloadButtonClicked(GtkButton* button) {
  GtkWidget *toplevel = gtk_widget_get_toplevel(GTK_WIDGET(button));
  ClientHandler* handler = (ClientHandler*)g_object_get_data(G_OBJECT(toplevel),"clientHandler");
    if (handler->GetBrowserId()) {
      handler->GetBrowser()->Reload();
    }
}

// Callback for when you press enter in the URL box.
void URLEntryActivate(GtkEntry* entry) {
  GtkWidget *toplevel = gtk_widget_get_toplevel(GTK_WIDGET(entry));
  ClientHandler* handler = (ClientHandler*)g_object_get_data(G_OBJECT(toplevel),"clientHandler");
  if (handler->GetBrowserId()) {
    const gchar* url = gtk_entry_get_text(entry);
    handler->GetBrowser()->GetMainFrame()->LoadURL(std::string(url).c_str());
  }
}

// WebViewDelegate::TakeFocus in the test webview delegate.
static gboolean HandleFocus(GtkWidget* widget, GdkEventFocus* focus) {
  GtkWidget *toplevel = gtk_widget_get_toplevel(widget);
  ClientHandler* handler = (ClientHandler*)g_object_get_data(G_OBJECT(toplevel),"clientHandler");
  if (handler->GetBrowserId())
    handler->GetBrowser()->GetHost()->SetFocus(true);    
  return TRUE;
}

int main(int argc, char* argv[]) 
{  
  base::AtExitManager exit_manager;

  CefMainArgs main_args(argc, argv);
  CefRefPtr<ClientApp> app(new ClientApp);

  if (!getcwd(szWorkingDir, sizeof (szWorkingDir)))
    return -1;

  gtk_init(&argc, &argv);

  // Parse command line arguments.
  AppInitCommandLine(argc, argv);

  // Execute the secondary process, if any.
  int exit_code = CefExecuteProcess(main_args, app.get());
  if (exit_code >= 0)
    return exit_code;

  CefSettings settings;

  // Enable remote debugging by default.
  settings.remote_debugging_port = 9222;

  // Populate the settings based on command line arguments.
  AppGetSettings(settings, app);

  // Initialize CEF.
  CefInitialize(main_args, settings, app.get());

  // Register the scheme handlers.
  CefRegisterSchemeHandlerFactory("wgt", "",new webinos::WidgetSchemeHandlerFactory());
  CefRegisterSchemeHandlerFactory("webinos", "",new webinos::WebinosSchemeHandlerFactory());

  std::string url;
  if (AppGetCommandLine()->HasArguments())
  {
    CefCommandLine::ArgumentList alist;
    AppGetCommandLine()->GetArguments(alist);
    url = alist[0];
  }

  AppCreateWebinosBrowser(url, AppGetCommandLine()->HasSwitch(webinosRenderer::kWebinosWidget), AppGetCommandLine()->HasSwitch(webinosRenderer::kWebinosSideLoad), NULL);

  // Install an signal handler so we clean up after ourselves.
  signal(SIGINT, TerminationSignalHandler);
  signal(SIGTERM, TerminationSignalHandler);

  CefRunMessageLoop();

  CefShutdown();

  return 0;
}

// Global functions

std::string AppGetWorkingDirectory() 
{
  return szWorkingDir;
}

void AppCreateWindow(CefRefPtr<ClientHandler> clientHandler, bool sideLoading, CefWindowHandle closeParent, int width, int height)
{
  GtkWidget* window = gtk_window_new(GTK_WINDOW_TOPLEVEL);
  m_browsers++;

  gtk_window_set_default_size(GTK_WINDOW(window), width ? width : 650, height ? height : 600);

  g_signal_connect(window, "focus", G_CALLBACK(&HandleFocus), NULL);

  GtkWidget* vbox = gtk_vbox_new(FALSE, 0);

  GtkWidget* menu_bar = gtk_menu_bar_new();

  gtk_box_pack_start(GTK_BOX(vbox), menu_bar, FALSE, FALSE, 0);

  clientHandler->SetMainHwnd(vbox);

  if (AppGetCommandLine()->HasSwitch(webinosRenderer::kWebinosShowChrome))
  {
    GtkWidget* toolbar = gtk_toolbar_new();

    // Turn off the labels on the toolbar buttons.
    gtk_toolbar_set_style(GTK_TOOLBAR(toolbar), GTK_TOOLBAR_ICONS);

    GtkToolItem* back = gtk_tool_button_new_from_stock(GTK_STOCK_GO_BACK);
    g_signal_connect(back, "clicked", G_CALLBACK(BackButtonClicked), NULL);
    gtk_toolbar_insert(GTK_TOOLBAR(toolbar), back, -1 /* append */);

    GtkToolItem* forward = gtk_tool_button_new_from_stock(GTK_STOCK_GO_FORWARD);
    g_signal_connect(forward, "clicked", G_CALLBACK(ForwardButtonClicked), NULL);
    gtk_toolbar_insert(GTK_TOOLBAR(toolbar), forward, -1 /* append */);

    GtkToolItem* reload = gtk_tool_button_new_from_stock(GTK_STOCK_REFRESH);
    g_signal_connect(reload, "clicked", G_CALLBACK(ReloadButtonClicked), NULL);
    gtk_toolbar_insert(GTK_TOOLBAR(toolbar), reload, -1 /* append */);

    GtkToolItem* stop = gtk_tool_button_new_from_stock(GTK_STOCK_STOP);
    g_signal_connect(stop, "clicked",G_CALLBACK(StopButtonClicked), NULL);
    gtk_toolbar_insert(GTK_TOOLBAR(toolbar), stop, -1 /* append */);

    GtkWidget* m_editWnd = gtk_entry_new();
    g_signal_connect(G_OBJECT(m_editWnd), "activate", G_CALLBACK(URLEntryActivate), NULL);

    GtkToolItem* tool_item = gtk_tool_item_new();
    gtk_container_add(GTK_CONTAINER(tool_item), m_editWnd);
    gtk_tool_item_set_expand(tool_item, TRUE);
    gtk_toolbar_insert(GTK_TOOLBAR(toolbar), tool_item, -1);  // append

    gtk_box_pack_start(GTK_BOX(vbox), toolbar, FALSE, FALSE, 0);

    clientHandler->SetEditHwnd(m_editWnd);
    clientHandler->SetButtonHwnds(GTK_WIDGET(back), GTK_WIDGET(forward), GTK_WIDGET(reload), GTK_WIDGET(stop));
  }

  g_signal_connect(G_OBJECT(window), "destroy", G_CALLBACK(gtk_widget_destroyed), &window);
  g_signal_connect(G_OBJECT(window), "destroy", G_CALLBACK(destroy), NULL);

  g_object_set_data(G_OBJECT(window), "clientHandler", clientHandler);

  // Create the browser view.
  CefWindowInfo window_info;
  CefBrowserSettings browserSettings;

  // Populate the settings based on command line arguments.
  AppGetBrowserSettings(browserSettings);

  window_info.SetAsChild(vbox);

  CefBrowserHost::CreateBrowserSync(window_info, static_cast<CefRefPtr<CefClient> >(clientHandler), clientHandler->GetStartUrl(), browserSettings);

  gtk_container_add(GTK_CONTAINER(window), vbox);

  if (!sideLoading)
  {
    gtk_widget_show_all(GTK_WIDGET(window));
  }

  if (closeParent != NULL)
  {
    // ToDo - investigate - this doesn't appear to work as expected (i.e. close the instance that is created to perform the widget
    // installation during side-loading.
    //m_browsers++;
    //gtk_widget_destroy(GTK_WIDGET(closeParent));
    //m_browsers--;
  }
}
