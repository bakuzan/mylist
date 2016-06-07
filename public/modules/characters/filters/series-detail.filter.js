(function() {
  'use strict';
  angular.module('characters')
  .filter('seriesDetailFilter', seriesDetailFilter);

  function seriesDetailFilter() {
    return function(array, detailSeriesName) {
        if (array !== undefined) {
            return array.filter(function(item) {
                if (detailSeriesName !== '') {
                    //filter stat series detail.
                    if (item.anime!==null && item.anime!==undefined) {
                        if (item.anime.title===detailSeriesName) {
                            return item;
                        }
                    } else if (item.manga!==null && item.manga!==undefined) {
                        if (item.manga.title===detailSeriesName) {
                            return item;
                        }
                    }
                } else {
                    return item;
                }
            });
        }
    };
  }

})();
