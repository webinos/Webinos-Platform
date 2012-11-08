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

package org.webinos.api.mediacapture;

import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.java.Base;
import org.w3c.dom.ObjectArray;
import org.webinos.api.PendingOperation;

public abstract class MediacaptureManager extends Base {
	private static short classId = Env.getInterfaceId(MediacaptureManager.class);
	protected MediacaptureManager() { super(classId); }

	public ObjectArray<MediaFileData> supportedImageFormats;
	public ObjectArray<MediaFileData> supportedVideoFormats;
	public ObjectArray<MediaFileData> supportedAudioFormats;
	public abstract PendingOperation captureImage (CaptureCB successCB, CaptureErrorCB errorCB, CaptureMediaOptions options);
	public abstract PendingOperation captureVideo (CaptureCB successCB, CaptureErrorCB errorCB, CaptureVideoOptions options);
	public abstract PendingOperation captureAudio (CaptureCB successCB, CaptureErrorCB errorCB, CaptureMediaOptions options);
}
