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

package org.webinos.api.gallery;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.webinos.api.PendingOperation;

public abstract class GalleryManager extends Base {
	private static short classId = Env.getInterfaceId(GalleryManager.class);
	protected GalleryManager() { super(classId); }

	public static final int AUDIO_TYPE = 0;
	public static final int VIDEO_TYPE = 1;
	public static final int IMAGE_TYPE = 2;
	public static final int SORT_BY_FILENAME = 3;
	public static final int SORT_BY_FILEDATE = 4;
	public static final int SORT_BY_MEDIATYPE = 5;
	public static final int SORT_BY_TITLE = 6;
	public static final int SORT_BY_AUTHOR = 7;
	public static final int SORT_BY_ALBUM = 8;
	public static final int SORT_BY_DATE = 9;
	public static final int SORT_BY_ASCENDING = 10;
	public static final int SORT_BY_DESCENDING = 11;

	public int length;

	public abstract PendingOperation find (String[] fields, GalleryFindCB successCB, GalleryErrorCB errorCB, GalleryFindOptions options);
	public abstract PendingOperation getGalleries (GalleryInfoCB successCB, GalleryErrorCB errorCB);
}
