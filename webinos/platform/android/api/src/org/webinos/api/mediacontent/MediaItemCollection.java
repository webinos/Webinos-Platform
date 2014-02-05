package org.webinos.api.mediacontent;

import org.meshpoint.anode.idl.Dictionary;

public class MediaItemCollection implements Dictionary {
  
  public int size;
  
  public MediaAudio[] audios;
  public MediaImage[] images;
  public MediaVideo[] videos;
}
