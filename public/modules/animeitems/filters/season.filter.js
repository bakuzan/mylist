(function() {
  'use strict';
  angular.module('animeitems')
  .filter('season', season);

  function season() {
      return function(array, year, month) {
          return array.filter(function(item) {
              if (item.season !== undefined && item.season !== null) {
                  if (item.season.year === year && item.season.season === month) {
                      return item;
                  }
              }
          });
      };
  }

})();
