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

package org.webinos.wrt.util;

import java.io.IOException;
import java.io.InputStream;

import android.content.Context;

public class AssetUtils {
	public static byte[] getAssetAsBuffer(Context ctx, String assetName) throws IOException {
		InputStream is = ctx.getAssets().open(assetName);
		int read, available, offset = 0;
		byte[] result = new byte[available = is.available()];
		while(available > 0 && (read = is.read(result, offset, available)) != -1) {
			offset += read;
			available = is.available();
			if(offset + available > result.length) {
				byte[] newResult = new byte[offset + available];
				System.arraycopy(result, 0, newResult, 0, offset);
				result = newResult;
			}
		}
		return result;
	}

	public static String getAssetAsString(Context ctx, String assetName) throws IOException {
		return getAssetAsString(ctx, assetName, "UTF8");
	}

	public static String getAssetAsString(Context ctx, String assetName, String encoding) throws IOException {
		return new String(getAssetAsBuffer(ctx, assetName), encoding);
	}
}
