package org.webinos.impl.mediacontent;

public class AttributeRangeFilter extends AbstractFilter {
  public String attributeName;
  public Object initialValue;
  public Object endValue;
  
  public AttributeRangeFilter(String attributeName, Object initialValue,
      Object endValue) {
    super();
    this.attributeName = attributeName;
    this.initialValue = initialValue;
    this.endValue = endValue;
  }
}
