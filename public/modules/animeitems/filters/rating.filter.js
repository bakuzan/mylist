(function() {
  'use strict';
  angular.module('animeitems')
  .filter('ratingFilter', ratingFilter);

  function ratingFilter() {
      return function(array, rating) {
          if (array !== undefined) {
              //filter for rating stars
              return array.filter(function(item) {
      //            console.log(item);
                  if (item.rating===rating) {
                      return item;
                  } else if (rating===undefined) {
                      return item;
                  }
              });
          }
      };
  }

})();
