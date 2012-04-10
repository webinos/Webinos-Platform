/* very simple http server */

package org.webinos.pzp;

import java.io.*;
import java.util.*;
import java.lang.*;
import java.net.*;
import java.text.SimpleDateFormat;

import android.os.Environment;
import android.content.res.AssetManager;

public class HttpServer
{
  WebServerTask task;
  ServerSocket serverSocket = null;
  Socket clientSocket = null;
  File sdcard;

  public enum HttpMethod
  {
    HEAD, GET, PUT, POST, UNKNOWN
  }

  // task is used for publishing updates and testing for cancellation
  HttpServer(int port, WebServerTask task) throws HttpException, IOException
  {
    String prolog = "untidy ";
    serverSocket = null;
    clientSocket = null;
    this.task = task;
    this.sdcard = Environment.getExternalStorageDirectory();

    try
    {
      serverSocket = new ServerSocket(port);
      serverSocket.setReuseAddress(true);
      serverSocket.setSoTimeout(1000);

      // limited to serving one request at a time!

      while (!task.isCancelled())
      {
        // wait for up to one second for a client request
        try
        {
          clientSocket = serverSocket.accept();
        }
        catch (SocketTimeoutException e)
        {
          // to test if task has been cancelled
          continue;
        }

        HttpConnection httpConnection = new HttpConnection(clientSocket, task);
        clientSocket = null;
      }

      prolog = "tidy ";
    }
    catch (Exception e)
    {
      task.log(e.toString());
    }
    finally
    {
      if (clientSocket != null)
      {
        clientSocket.close();
        task.log("closed client socket");
      }

      if (serverSocket != null)
        serverSocket.close();

      serverSocket = null;
      clientSocket = null;
      task.log(prolog + "server shutdown");
    }
  }

  private class HttpException extends Exception
  {
    String description;

    public HttpException()
    {
      super();
      description = "unknown error";
    }

    public HttpException(String error)
    {
      super(error);
      description = error;
    }

    public String getError()
    {
      return description;
    }
  }

  private class HttpConnection
  {
    Socket socket;
    BufferedReader in = null;
    PrintWriter out = null;
    OutputStream out_stream = null;
    HttpMethod method = HttpMethod.UNKNOWN;
    String path;
    String query;
    TreeMap<String, String> requestHeaders;

    HttpConnection(Socket socket, WebServerTask task) throws IOException, HttpException
    {
      boolean first = true;
      String line = null;
      out_stream = socket.getOutputStream();
      in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
      out = new PrintWriter(out_stream, true);

      requestHeaders = new TreeMap<String, String>();

      do
      {
        line = in.readLine();

        if (first)
        {
          // recover from null lines, why do we get these?
          try
          {
            parseHttpMethod(line);
          }
          catch (HttpException e)
          {
            out.close();
            task.log("request with null method");
            return;
          }

          first = false;
          String address = socket.getInetAddress().getHostAddress();

          task.log(address + " " + method + " " + path + (query != null ? "?" + query : ""));
        }
        else if (line.length() > 0)
          parseHttpRequestHeader(line);
      }
      while (line.length() > 0);

      if (method == HttpMethod.GET)
      {
        if (path.equals("/"))
          sendAsset("index.html");
        else if (path.equals("/favicon.ico"))
          sendAsset("favicon.ico");
        else if (path.equals("/phone.xml"))
          sendAsset("phone.xml");
        else if (path.equals("/photo"))
          sendPhoto();
        else
          sendFile(path);
      }
      else if (method == HttpMethod.PUT)
      {
      }
      else if (method == HttpMethod.POST)
      {
        if (path.equals("/photo"))
          sendPhoto();
        else if (path.equals("/vibrate"))
          vibrate();
      }
      else
      {
        out.print(
           "HTTP/1.1 501 Not Implemented\r\n" + httpDate() + "\r\n" +
           "Content-Type: text/plain; charset=UTF-8\r\n" +
           "Connection: close\r\n" +
           "\r\n501 Not Implemented: " + method + " " + path + "\r\n");
      } 

      out.flush();
      socket.close();
/*
      Iterator it = requestHeaders.entrySet().iterator();

      while (it.hasNext())
      {
        Map.Entry field = (Map.Entry)it.next();
        System.out.println("Field: " + field.getKey() + " = " + field.getValue());
        it.remove();
      }
*/
    }

    // you need to place assets in the ant project asset folder
    private void sendAsset(String assetPath)
    {
      try
      {
        InputStream is = task.assets().open(assetPath);
        int size = is.available(); 
        byte[] bytes = new byte[size]; 
        is.read(bytes); 
        is.close(); 

        httpResponsePreamble("200 Okay");
        out.print("Content-Length: " + size + "\r\n");
        out.print("Content-Type: " + getFileType(assetPath) + "\r\n");
        out.print("Connection: close\r\n\r\n");
        out.flush();
        out_stream.write(bytes, 0, size);
      }
      catch (Exception e)
      {
        httpResponsePreamble("404 Not Found");
        out.print(
           "Content-Type: text/plain; charset=UTF-8\r\n" +
           "Connection: close\r\n\r\n" +
           "404 File not found: " + assetPath + "\r\n");
      }
    }

    // place web resources in sdcard/web/
    private void sendFile(String filePath)
    {
      try
      {
        File file = new File(sdcard+"/web"+filePath);
        long length = file.length();

        if (length > Integer.MAX_VALUE)
          throw new IOException("file is too big: " + file.getName());

        byte[] bytes = new byte[(int)length];
        int offset = 0;
        int numRead = 0;
        FileInputStream is = new FileInputStream(file);

        while (offset < bytes.length &&
            (numRead=is.read(bytes, offset, bytes.length-offset)) >= 0)
          offset += numRead;

        if (offset < bytes.length)
          throw new IOException("file incompletely read: " + file.getName());

        httpResponsePreamble("200 Okay");
        out.print("Content-Length: " + length + "\r\n");
        out.print("Content-Type: " + getFileType(filePath) + "\r\n");
        out.print("Connection: close\r\n\r\n");
        out.flush();
        out_stream.write(bytes, 0, (int)length);
      }
      catch (Exception e)
      {
        task.log(e.toString());
        httpResponsePreamble("404 Not Found");
        out.print(
           "Content-Type: text/plain; charset=UTF-8\r\n" +
           "Connection: close\r\n\r\n" +
           "404 File not found: " + filePath + "\r\n");
      }
    }

    private void sendPhoto()
    {
      try
      {
        httpResponsePreamble("200 Okay");
        out.print("Content-Type: image/jpeg\r\n");
        out.print("Connection: close\r\n");
        out.print("Pragma: no-cache\r\n");
        out.print("\r\n");
        out.flush();
        task.activity.preview.sendFrame(out_stream);
      }
      catch (Exception e)
      {
        httpResponsePreamble("500 Internal Server Error");
        out.print(
           "Content-Type: text/plain; charset=UTF-8\r\n" +
           "Connection: close\r\n\r\n" +
           "500 Internal Server Error\r\n");
      }
    }

    private void vibrate()
    {
      try
      {
        httpResponsePreamble("200 Okay");
        out.print("Content-Type: text/plain\r\n");
        out.print("Connection: close\r\n");
        out.print("Pragma: no-cache\r\n");
        out.print("\r\n");
        out.print("vibrate command acccepted\r\n");

        task.vibrate();
      }
      catch (Exception e)
      {
        httpResponsePreamble("500 Internal Server Error");
        out.print(
           "Content-Type: text/plain; charset=UTF-8\r\n" +
           "Connection: close\r\n\r\n" +
           "500 Internal Server Error\r\n");
      }
    }
    // CORS header to allow access by scripts from other sites
    private void httpResponsePreamble(String status)
    {
      out.print("HTTP/1.1 " + status + "\r\n" +
                httpDate() + "\r\n" + 
                "Access-Control-Allow-Origin: *\r\n");
    }

    private String getFileType(String filePath)
    {
      String ctype = "application/octet-stream";  // fallback
      int dot = filePath.lastIndexOf(".");

      if (dot < 0)
        return ctype;

      String ext = filePath.substring(dot+1, filePath.length());

      if (ext.equals("html") || ext.equals("htm"))
        ctype = "text/html; charset=UTF-8";
      else if (ext.equals("xml"))
        ctype = "application/xml; charset=UTF-8";
      else if (ext.equals("ico"))
        ctype = "image/x-icon";

      return ctype;
    }

    private void parseHttpMethod(String line) throws HttpException
    {
      if (line == null || line.length() == 0 || line.lastIndexOf(".") < 0)
        throw new HttpException("invalid HTTP request line: " +
             (line != null ? line : "<null>") );

      String parts[] = line.split("\\s+");

      if (parts[0].equals("GET"))
        method = HttpMethod.GET;
      else if (parts[0].equals("PUT"))
        method = HttpMethod.GET;
      else if (parts[0].equals("POST"))
        method = HttpMethod.POST;

      path = parts[1];
      query = null;

      int q = path.indexOf("?");

      if (q == 0)
         throw new HttpException("missing path \"" + path + "\"");

      if (q > 0)
      {
        query = path.substring(q+1);
        path = path.substring(0, q);
      }
    }

    private void parseHttpRequestHeader(String line)
    {

      String parts[] = line.split(":", 2);
      String name = parts[0].trim();
      String value = parts[1].trim();
      requestHeaders.put(name, value);
    }

    private Date parseHttpDate(String dateString) throws java.text.ParseException
    {
      SimpleDateFormat format = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
      format.setTimeZone(TimeZone.getTimeZone("GMT"));
      return format.parse(dateString);
    }

    private String httpDate()
    {
      SimpleDateFormat format = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz");
      format.setTimeZone(TimeZone.getTimeZone("GMT"));
      return new String(format.format(new Date()));
    }
  }
}
