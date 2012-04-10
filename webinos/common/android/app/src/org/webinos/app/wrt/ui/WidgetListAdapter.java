/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

package org.webinos.app.wrt.ui;

import org.webinos.app.R;
import org.webinos.app.wrt.mgr.WidgetConfig;
import org.webinos.app.wrt.mgr.WidgetManagerService;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

public class WidgetListAdapter extends ArrayAdapter<String> {
	private final Context context;
	private final String[] values;

	public WidgetListAdapter(Context context, String[] values) {
		super(context, R.layout.rowlayout, values);
		this.context = context;
		this.values = values;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {
		LayoutInflater inflater = (LayoutInflater) context
				.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
		View rowView = inflater.inflate(R.layout.rowlayout, parent, false);
		TextView labelView = (TextView) rowView.findViewById(R.id.label);
		TextView detailView = (TextView) rowView.findViewById(R.id.detail);
		ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
		
		String installId = values[position];
		
		/* decide what to show as the main label text */
		String labelText = null;
		WidgetConfig widgetConfig = WidgetManagerService.getInstance().getWidgetConfig(installId);
		if(widgetConfig == null) {
			labelText = "widgetConfig is null - widget not properly installed";
			return rowView;
		}
		if(widgetConfig.name != null)
			labelText = widgetConfig.name.visual;
		if(labelText == null || labelText.isEmpty()) {
			if(widgetConfig.shortName != null)
				labelText = widgetConfig.shortName.visual;
			if(labelText == null || labelText.isEmpty()) {
				labelText = widgetConfig.id;
				if(labelText == null || labelText.isEmpty()) {
					labelText = "Untitled";	
				}
			}
		}
		labelView.setText(labelText);

		/* decide what to show as the detail label text */
		String descriptionText = null;
		if(widgetConfig.description != null)
			descriptionText = widgetConfig.description.visual;
		if(descriptionText == null) descriptionText = "";
		String authorText = null;
		if(widgetConfig.author != null) {
			if(widgetConfig.author.name != null)
				authorText = widgetConfig.author.name.visual;
			if(authorText == null || authorText.isEmpty()) {
				authorText = widgetConfig.author.href;
				if(authorText == null) authorText = "";
			}
		}
		String versionText = null;
		if(widgetConfig.version != null)
			versionText = widgetConfig.version.visual;
		if(versionText == null) versionText = "";

		String detailText = authorText;
		if(!versionText.isEmpty()) {
			if(!detailText.isEmpty()) detailText += " ";
			detailText += versionText;
		}
		if(!descriptionText.isEmpty()) {
			if(!detailText.isEmpty()) detailText += " ";
			detailText += descriptionText;
		}
		detailView.setText(detailText);

		/* decide what to show as the icon */
		String prefIcon = widgetConfig.prefIcon;
		if(prefIcon == null || prefIcon.isEmpty()) {
			imageView.setImageResource(R.drawable.webinos_icon);
		} else {
			String iconPath = WidgetManagerService.getInstance().getWidgetDir(installId) + '/' + prefIcon;
			imageView.setImageDrawable(Drawable.createFromPath(iconPath));
		}

		return rowView;
	}
}
