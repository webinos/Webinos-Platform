package org.webinos.impl.mediacontent;

public class AttributeFilter extends AbstractFilter {
 
  public static String FILTER_MATCH_EXACTLY = "EXACTLY";
  public static String FILTER_MATCH_FULLSTRING = "FULLSTRING";
  public static String FILTER_MATCH_CONTAINS = "CONTAINS";
  public static String FILTER_MATCH_STARTSWITH = "STARTSWITH";
  public static String FILTER_MATCH_ENDSWITH = "ENDSWITH";
  public static String FILTER_MATCH_EXISTS = "EXISTS";
 
  public String attributeName;
  public String matchFlag;
  public Object matchValue;
  
  public AttributeFilter(String attributeName, String matchFlag,
      Object matchValue) {
    super();
    this.attributeName = attributeName;
    this.matchFlag = matchFlag;
    this.matchValue = matchValue;
  }
}
