package org.webinos.impl.mediacontent;

public class CompositeFilter extends AbstractFilter {
  
  public static String COMPOSITE_TYPE_UNION = "UNION";
  public static String COMPOSITE_TYPE_INTERSECTION = "INTERSECTION";
  
  public String type;
  public AbstractFilter[] filters;
  
  public CompositeFilter(String type, AbstractFilter[] filters) {
    super();
    this.type = type;
    this.filters = filters;
  }
}
