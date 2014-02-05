package org.webinos.impl.mediacontent;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.webinos.api.DeviceAPIError;
import org.webinos.impl.mediacontent.Mapping.CompositeDbField;
import org.webinos.impl.mediacontent.Mapping.DbField;
import org.webinos.impl.mediacontent.Mapping.SingleDbField;

public class QueryBuilder {

  private static Map<String, String> selectStrings = new HashMap<String, String>();
  static {
    selectStrings.put(AttributeFilter.FILTER_MATCH_EXACTLY, "%s = ?");
    selectStrings.put(AttributeFilter.FILTER_MATCH_FULLSTRING, "%s LIKE ?");
    selectStrings.put(AttributeFilter.FILTER_MATCH_CONTAINS, "%s LIKE %?%");
    selectStrings.put(AttributeFilter.FILTER_MATCH_STARTSWITH, "%s LIKE ?%");
    selectStrings.put(AttributeFilter.FILTER_MATCH_ENDSWITH, "%s LIKE %?");
    selectStrings.put(AttributeFilter.FILTER_MATCH_EXISTS, "%s NOT NULL");
  }
  
  public static SelectStatement getSelect(AbstractFilter filter) {
    if (filter instanceof AttributeFilter) {
      return getSelect((AttributeFilter)filter);
    } else if (filter instanceof AttributeRangeFilter) {
      return getSelect((AttributeRangeFilter)filter);
    } else if (filter instanceof CompositeFilter) { 
      return getSelect((CompositeFilter)filter);
    }
    return null;
  }
  
  public static SelectStatement getSelect(AttributeFilter filter) {
    
    DbField dbField = Mapping.getDbField(filter.attributeName);
    
    if ((filter.matchFlag.equals(AttributeFilter.FILTER_MATCH_FULLSTRING) || 
        filter.matchFlag.equals(AttributeFilter.FILTER_MATCH_CONTAINS) ||
        filter.matchFlag.equals(AttributeFilter.FILTER_MATCH_STARTSWITH) ||
        filter.matchFlag.equals(AttributeFilter.FILTER_MATCH_ENDSWITH)) && !dbField.getAttributeType().equals(String.class)) {
      throw new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR);
    }
    
    SelectStatement resultStmt = null;
    
    if (dbField instanceof SingleDbField) {
      SingleDbField singleDbField = (SingleDbField) dbField;
      String stmtStr = String.format(selectStrings.get(filter.matchFlag),
          singleDbField.getName());
      String dbMatchValue = null;
      if (singleDbField.getTranslator() != null) {
        dbMatchValue = singleDbField.getTranslator().getDbValue(filter.matchValue)
            .toString();
      } else {
        dbMatchValue = filter.matchValue.toString();
      }
      resultStmt = new SelectStatement(stmtStr, new String[] { dbMatchValue });
    } else if (dbField instanceof CompositeDbField) {
      CompositeDbField compositeDbField = (CompositeDbField) dbField;
      if (compositeDbField.getCompositeHandler() != null) {      
        String stmtStr = null;
        Object[] parts = (Object[]) compositeDbField.getCompositeHandler().getParts(filter.matchValue);     
        String[] dbMatchValues = new String[parts.length];
        for (int i = 0; i < compositeDbField.getDbFields().length; i++) {
          SingleDbField singleDbField = compositeDbField.getDbFields()[i];
          if (i > 0) {
            stmtStr += " AND ";
          }
          stmtStr  += String.format(selectStrings.get(filter.matchFlag), singleDbField);
          if (singleDbField.getTranslator() != null) {
            dbMatchValues[i] = singleDbField.getTranslator().getDbValue(parts[i]).toString();
          } else {
            dbMatchValues[i] = parts[i].toString();
          }
        }
        resultStmt = new SelectStatement(stmtStr, dbMatchValues);
      } else {
        throw new DeviceAPIError(DeviceAPIError.INVALID_ERROR);
      }
    }

    return resultStmt;
  }
  
  public static SelectStatement getSelect(CompositeFilter filter) {
    SelectStatement resultStmt = null;

    String operator = null;
    if (CompositeFilter.COMPOSITE_TYPE_UNION.equals(filter.type)) {
      operator = " OR ";
    } else if (CompositeFilter.COMPOSITE_TYPE_INTERSECTION.equals(filter.type)) {
      operator = " AND ";
    } else {
      throw new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR);
    }

    List<String> stmtArgs = new ArrayList<String>();

    if (filter.filters.length > 0) {
      String stmtStr = getSelect(filter.filters[0]).getStatement();
      for (String arg : getSelect(filter.filters[0]).getArgs()) {
        stmtArgs.add(arg);
      }
      for (int i = 1; i < filter.filters.length; i++) {
        stmtStr += operator + getSelect(filter.filters[i]);
        for (String arg : getSelect(filter.filters[i]).getArgs()) {
          stmtArgs.add(arg);
        }
      }
      resultStmt = new SelectStatement(stmtStr,
          stmtArgs.toArray(new String[stmtArgs.size()]));
    }

    return resultStmt;
  }
  
  public static SelectStatement getSelect(AttributeRangeFilter filter) {

    DbField dbField = Mapping.getDbField(filter.attributeName);
    
    if (!dbField.getAttributeType().isAssignableFrom(Number.class)) {
      throw new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR);
    }
    
    if (dbField instanceof SingleDbField) {
      SingleDbField singleDbField = (SingleDbField) dbField;
      String stmtStr = String.format("%s >= ? AND %s <= ?",
          singleDbField.getName(), singleDbField.getName());
      
      String dbStartValue = null;
      String dbEndValue = null;
      if (singleDbField.getTranslator() != null) {
        dbStartValue = singleDbField.getTranslator().getDbValue(filter.initialValue)
            .toString();
        dbEndValue = singleDbField.getTranslator().getDbValue(filter.endValue)
            .toString();
      } else {
        dbStartValue = filter.initialValue.toString();
        dbEndValue = filter.endValue.toString();
      }
      return new SelectStatement(stmtStr, new String[] { dbStartValue,  dbEndValue});
      
    } else {
      throw new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR);
    }
  }

}
