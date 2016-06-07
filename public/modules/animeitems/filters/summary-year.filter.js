(function() {
  'use strict';
  angular.module('animeitems')
  .filter('summaryYear', summaryYear);

  function summaryYear() {
      return function(array, year, type) {
          if (array !== undefined) {
              return array.filter(function(item) {
                if (type === 'months' && item.end !== undefined && item.end !== null) {
                    if (item.end.substring(0,4) === year) {
                        return item;
                    }
                } else if (type === 'seasons') {
                    if (item.season.year === year) {
                        return item;
                    }
                }
              });
          }
      };
  }

})();
