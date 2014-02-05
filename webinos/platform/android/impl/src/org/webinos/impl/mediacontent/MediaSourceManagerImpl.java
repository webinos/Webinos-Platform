package org.webinos.impl.mediacontent;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;
import org.webinos.api.mediacontent.MediaSource;
import org.webinos.api.mediacontent.MediaSourceManager;
import org.webinos.impl.mediacontent.LocalMediaSource.GetFoldersStrategy;

import android.content.Context;
import android.util.Log;

public class MediaSourceManagerImpl extends MediaSourceManager implements IModule {
  
  private static String TAG = MediaSourceManager.class.getName();
  
  private IModuleContext moduleContext;
  private Context androidContext;

  public MediaSource getLocalMediaSource() {
    return new LocalMediaSource(androidContext, "external", GetFoldersStrategy.ALL);
  }

  @Override
  public Object startModule(IModuleContext ctx) {
    Log.v(TAG, "startModule");
    this.moduleContext = ctx;
    this.androidContext = ((AndroidContext) ctx).getAndroidContext();
    
    Mapping.init();

    return this;
  }

  @Override
  public void stopModule() {
    Log.v(TAG, "stopModule");
  }
}
