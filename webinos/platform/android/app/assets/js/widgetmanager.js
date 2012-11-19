/* widgetmanager.js: starts the widgetmanager in a separate isolate */
var widgetmanager = require('webinos/wp4/webinos/core/manager/widget_manager');
process.env.WRT_HOME = '/data/data/org.webinos.app/wrt';
var bridgewm = require('bridge').load('org.webinos.app.wrt.mgr.WidgetManagerImpl', this);
bridgewm.setWidgetProcessor(widgetmanager.widgetmanager);
