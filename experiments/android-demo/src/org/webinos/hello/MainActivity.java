package org.webinos.pzp;

import android.app.Activity;
import android.os.Bundle;
import android.os.AsyncTask;
import android.os.Environment;
import android.content.res.AssetManager;
import android.content.res.Configuration;
import android.content.pm.ActivityInfo;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.net.Uri;
import android.text.format.Formatter;
import android.text.method.ScrollingMovementMethod;
import android.view.View;
import android.widget.TextView;
import android.media.MediaPlayer;
import android.media.AudioManager;
import android.hardware.Camera;
import android.hardware.Camera.PictureCallback;
import android.hardware.Camera.ShutterCallback;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.FrameLayout;
import android.util.Log;

import java.lang.Exception;
import java.io.*;
import java.net.*;

public class MainActivity extends Activity
{
  AdvertiseTask upnp;
  WebServerTask server;
  Preview preview;

  /** Called when the activity is first created. */
  @Override
  public void onCreate(Bundle savedInstanceState)
  {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.main);
    log("on create ...");

    try
    {
      // enable scrolling of textview pane
      TextView t=new TextView(this);
      t = (TextView)findViewById(R.id.console); 
      t.setMovementMethod(new ScrollingMovementMethod());

      log("started okay");
    }
    catch (Exception e)
    {
      log("failed to start");
      log(stackTraceToString(e));
    }
  }

  // force portrait mode
  @Override
  public void onConfigurationChanged(Configuration newConfig)
  {
    super.onConfigurationChanged(newConfig);
    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
  }

  /** activity is "visible" although not necessarily in foreground */
  public void onStart()
  {
    String address = "127.0.0.1";
    String port = "8888";

    super.onStart();
    log("on start ...");

    // prepare multicast socket and send advertisements
    try
    {
      WifiManager wifiManager = (WifiManager) getSystemService(WIFI_SERVICE);
      WifiInfo wifiInfo = wifiManager.getConnectionInfo();
      int ipAddress = wifiInfo.getIpAddress();
      address = Formatter.formatIpAddress(ipAddress);

      upnp = new AdvertiseTask();
      upnp.execute(new String[] { address, port });
      log("enabled multicast socket for UPnP");
    }
    catch (Exception e)
    {
      log("couldn't prepare multicast socket: " + e.toString());
      upnp = null;
    }

    try
    {
      server = new WebServerTask(this); 
      server.execute(new String[] { port });
      log("enabled server at http://"+ address + ":"+port+"/");
    }
    catch (Exception e)
    {
      log("couldn't prepare web server: " + e.toString());
      server = null;
    }

    try
    {
      // initialize camera preview
      preview = new Preview(this);
      ((FrameLayout) findViewById(R.id.preview)).addView(preview);
    }
    catch (Exception e)
    {
      log("couldn't prepare camera preview: " + e.toString());
      preview = null;
    }
  }

  /** activity is now visible again, followed by call to onStart() */
  public void onRestart()
  {
    super.onRestart();
    log("on restart ...");
  }

  /** activity is now in the foreground and can interact with user */
  public void onResume()
  {
    super.onResume();
    log("on resume ...");
    preview.resume();
  }

  /** activity is no longer in the foreground */
  public void onPause()
  {
    super.onPause();
    log("on pause ...");
    preview.suspend();
  }

  /** activity is no longer "visible" */
  public void onStop()
  {
    super.onStop();
    log("on stop ...");

    upnp.cancel(true);
    log("cancelled UPnP task");

    ((FrameLayout) findViewById(R.id.preview)).removeView(preview);
    preview = null;

    // ensure server is shut down
    if (server != null)
    {
      server.shutdown();
      server = null;
    }
  }

  /** could be used to make camera shutter sound */
  ShutterCallback shutterCallback = new ShutterCallback()
  {
    public void onShutter()
    {
      AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE);
      int volume = am.getStreamVolume( AudioManager.STREAM_NOTIFICATION);
      MediaPlayer player;

      if (volume != 0)
      {
        Uri uri = Uri.parse("file:///system/media/audio/ui/camera_click.ogg");
        player = MediaPlayer.create(MainActivity.this, uri);

        if (player != null)
            player.start();
      }
    }
  };

  /** Handles data for raw picture */
  PictureCallback rawCallback = new PictureCallback()
  {
    public void onPictureTaken(byte[] data, Camera camera)
    {
    }
  };

  /** Handles data for jpeg picture */
  PictureCallback jpegCallback = new PictureCallback()
  {
    public void onPictureTaken(byte[] data, Camera camera)
    {
    }
  };

  // sends periodic SSDP advertisements over multicast
  // needs to be extended to listen for SSDP queries
  private class AdvertiseTask extends AsyncTask<String, Void, String>
  {
    private MulticastSocket socket;
    private InetAddress group;

    public AdvertiseTask() throws UnknownHostException, SocketException, IOException
    {
      super();

      group = InetAddress.getByName("239.255.255.250");
      socket = new MulticastSocket(1900);
      socket.setReuseAddress(true);
      socket.setSoTimeout(1000);
      socket.setTimeToLive(1);
      socket.joinGroup(group);
    }

    // called in new Thread (not the UI thread)
    @Override
    protected String doInBackground(String... params)
    {
      String address = params[0];
      String port = params[1];

      String msg =
            "NOTIFY * HTTP/1.1\r\n" + 
            "HOST: 239.255.255.250:1900\r\n" + 
            "CACHE-CONTROL: max-age=60\r\n" + 
            "LOCATION: http://" + address + ":" + port + "/phone.xml\r\n" + 
            "USN: uuid:Nexus-S_Phone-PZP-Dave\r\n" +
            "\r\n";

      DatagramPacket advertisement = 
        new DatagramPacket(msg.getBytes(), msg.length(), group, 1900);

      // now send advertisement every 4 seconds until cancelled

      while (true)
      {
        if (upnp.isCancelled())
          break;

        try 
        {
          socket.send(advertisement);
          Thread.sleep(4000);
        }
        catch (Exception e)
        {
          return e.toString();
        }
      }

      return "";
    }

    protected void onPostExecute(Long result)
    {
      // finish with multicast socket
      try
      {
        socket.leaveGroup(group);
        socket = null;
      }
      catch (IOException e)
      {
        log("couldn't leave multicast group: " + e.toString());
      }
    }
  }

  public String stackTraceToString(Throwable e)
  {
    String trace = null;
    StringWriter sw = null;
    PrintWriter pw = null;

    try 
    {
      sw = new StringWriter();
      pw = new PrintWriter(sw);
      e.printStackTrace(pw);
      trace = sw.toString();
    }
    finally
    {
      try
      {
        if(pw != null)  pw.close();
        if(sw != null)  sw.close();
      } catch (IOException ignore) {}
   }
   return trace;
  }

  public void log(String msg)
  {
    TextView t=new TextView(this);
    t = (TextView)findViewById(R.id.console); 
    t.append("\n");
    t.append(msg);

    // sadly this doesn't work :-(
    // and scroll to bottom to ensure new text is visible
    int delta = t.getMeasuredHeight() - t.getHeight();

    if (delta > 0)
      t.scrollTo(0, delta);
  }

  public void logException(String msg, Exception e)
  {
    log(msg + "\n" + stackTraceToString(e));
  }
}
