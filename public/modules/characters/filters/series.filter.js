(function() {
  'use strict';
  angular.module('characters')
  .filter('seriesFilter', seriesFilter);

  function seriesFilter() {
      return function(array, series) {
          if (array !== undefined) {
              return array.filter(function(item) {
                  if (series !== '' && series !== undefined) {
                      //filter stat series detail.
                      if (item.anime!==null && item.anime!==undefined) {
                          return item.anime.title.toLowerCase().indexOf(series.toLowerCase()) > -1;
                      } else if (item.manga!==null && item.manga!==undefined) {
                          return item.manga.title.toLowerCase().indexOf(series.toLowerCase()) > -1;
                      }
                  } else {
                      return item;
                  }
              });
          }
      };
  }

})();
