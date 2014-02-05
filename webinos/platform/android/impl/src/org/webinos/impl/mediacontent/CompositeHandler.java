package org.webinos.impl.mediacontent;

import org.webinos.api.mediacontent.SimpleCoordinates;

interface CompositeHandler {
  
  Object[] getParts(Object composite);
  Object getComposite(Object[] parts);
  
  static class GeoCompositor implements CompositeHandler {
    @Override
    public Object[] getParts(Object composite) {
      if (composite instanceof SimpleCoordinates) {
        SimpleCoordinates coordinates = (SimpleCoordinates) composite;
        Double[] result = new Double[2];
        result[0] = coordinates.latitude;
        result[1] = coordinates.longitude;
        return result;
      }
      return null;
    }

    @Override
    public Object getComposite(Object[] parts) {
      if (parts instanceof Float[]) {
        Double[] attribValues = (Double[])parts;
        SimpleCoordinates result = new SimpleCoordinates();
        result.latitude = attribValues[0];
        result.longitude = attribValues[1];
        return result;
      }
      return null;
    }
  } 
}
