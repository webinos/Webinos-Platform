package org.webinos.api.mediacontent;

import org.meshpoint.anode.idl.Dictionary;

public class FilterValues implements Dictionary {
  public String attributeName;
  public String matchFlag;
  public Object matchValue;
  public Object initialValue;
  public Object endValue;
  public String type;
  public FilterValues[] filters; 
}
