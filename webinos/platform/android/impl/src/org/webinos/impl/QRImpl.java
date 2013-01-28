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
 * Copyright 2012 Ziran Sun Samsung Electronics(UK) Ltd
 ******************************************************************************/
package org.webinos.impl;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.FileOutputStream;
import android.content.Context;
import android.util.Log;
import android.graphics.Bitmap;

import org.webinos.api.qrencoder.EncodeCallback;
import org.webinos.api.qrencoder.QRManager;

public class QRImpl extends QRManager implements IModule {

  private Context androidContext;
  private static final String LABEL = "org.webinos.impl.QRImpl";

  private static final int WHITE = 0xFFFFFFFF;
  private static final int BLACK = 0xFF000000;

/*****************************
* QRManager methods
*****************************/

  @Override
  public void enCode(String data, int width, int height, String filename, EncodeCallback encodeCallBack) {
    
    Log.v(LABEL, "QREncoder - Starts enCode function");

    BitMatrix matrix = null;
    com.google.zxing.Writer writer = new QRCodeWriter();

    try {
      matrix = writer.encode(data, BarcodeFormat.QR_CODE, width, height);
    } catch (com.google.zxing.WriterException e) {
      System.out.println(e.getMessage());
    }

    int[] pixels = new int[width * height];
    for (int y = 0; y < height; y++) {
      int offset = y * width;
      for (int x = 0; x < width; x++) {
        pixels[offset + x] = matrix.get(x, y) ? BLACK : WHITE;
      }
    }
    Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
    bitmap.setPixels(pixels, 0, width, 0, 0, width, height);

    try {
      FileOutputStream out = new FileOutputStream(filename);
      bitmap.compress(Bitmap.CompressFormat.PNG, 90, out);
      encodeCallBack.onSuccess(filename);
    } catch (Exception e) {
      e.printStackTrace();
      //encodeCallBack.onError();
    }
  }	
/*****************************
	 * IModule methods
	 *****************************/
	@Override
  public Object startModule(IModuleContext ctx) {
    androidContext = ((AndroidContext)ctx).getAndroidContext();
    Log.v(LABEL, "QREncoder - startModule");
    return this;
  }

	@Override
  public void stopModule() {
    Log.v(LABEL, "QREncoder - stopModule");
  }
}
