package org.webinos.impl.mediacontent;

import org.webinos.api.DeviceAPIError;
import org.webinos.api.mediacontent.FilterValues;

public class AbstractFilter {

  static AbstractFilter getFilter(FilterValues filterValues) {
    AbstractFilter result = null;
    if (filterValues != null) {
      if (filterValues.attributeName != null && filterValues.matchFlag != null
          && filterValues.matchValue != null) {
        result = new AttributeFilter(filterValues.attributeName,
            filterValues.matchFlag, filterValues.matchValue);
      } else if (filterValues.attributeName != null
          && filterValues.initialValue != null && filterValues.endValue != null) {
        result = new AttributeRangeFilter(filterValues.attributeName,
            filterValues.initialValue, filterValues.endValue);
      } else if (filterValues.filters != null && filterValues.type != null) {
        AbstractFilter[] filters = new AbstractFilter[filterValues.filters.length];
        int i = 0;
        for (FilterValues values : filterValues.filters) {
          filters[i++] = getFilter(values);
        }
        result = new CompositeFilter(filterValues.type, filters);
      } else {
        throw new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR);
      }
    }
    return result;
  }
}
