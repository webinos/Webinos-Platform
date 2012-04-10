/*
 AsyncTask for HTTP server as public class to allow for progress
 updates as you can't call back to a private class in another file.
*/

package org.webinos.pzp;

import android.app.Activity;
import android.os.AsyncTask;
import android.os.Vibrator;
import android.content.Context;
import android.content.res.AssetManager;
import java.io.IOException;
import java.lang.InterruptedException;

public class WebServerTask extends AsyncTask<String, String, String>
{
  public MainActivity activity;

  public WebServerTask(MainActivity activity)
  {
    this.activity = activity;
  }

  public void log(String msg)
  {
    publishProgress(msg);
  }

  public AssetManager assets()
  {
    return activity.getAssets();
  }

  public void vibrate()
  {
    try
    {
      Vibrator v = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
      v.vibrate(1000);
    }
    catch (Exception e)
    {
      log(e.toString());
    }
  }

  public void shutdown()
  {
    cancel(true);

    // wait long enough for accept timeout

    try {
      Thread.sleep(1300);
    } catch (InterruptedException e) { }
  }

  // called in new Thread (not the UI thread)
  @Override
  protected String doInBackground(String... params)
  {
    int port = Integer.parseInt(params[0]);

    try
    {
      HttpServer server = new HttpServer(port, this);
    }
    catch (Exception e)
    {
      //return e.toString();
      return activity.stackTraceToString(e);
    }

    return "";
  }

  protected void onProgressUpdate(String... values)
  {
    activity.log("web: " + values[0]);
  }

  @Override
  protected void onPostExecute(String result)
  {
    activity.log("web server exited " + result);
  }
}

