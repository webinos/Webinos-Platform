package org.webinos.api.mediacontent;

import org.meshpoint.anode.idl.Dictionary;

public class SimpleCoordinates implements Dictionary {
    public double latitude;
    public double longitude;
    
    public SimpleCoordinates() {
      
    }
    
    public SimpleCoordinates(double latitude, double longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
    }   
}
