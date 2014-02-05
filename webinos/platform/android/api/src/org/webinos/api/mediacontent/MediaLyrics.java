package org.webinos.api.mediacontent;

public class MediaLyrics {
  
  public static String LYRICS_TYPE_SYNCHRONIZED = "SYNCHRONIZED";
  public static String LYRICS_TYPE_UNSYNCHRONIZED = "UNSYNCHRONIZED";
  
  public String type;
  public long[] timestamps;
  public String[] texts;
}
