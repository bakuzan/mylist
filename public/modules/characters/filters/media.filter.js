(function() {
  'use strict';
  angular.module('characters')
  .filter('mediaFilter', mediaFilter);

  function mediaFilter() {
      return function(array, media) {
          if (array !== undefined) {
              return array.filter(function(item) {
                  if (media==='anime') {
                      if (item.anime!==null && item.manga===null) {
                          return true;
                      }
                      return false;
                  } else if (media==='manga') {
                      if (item.manga!==null && item.anime===null) {
                          return true;
                      }
                      return false;
                  } else if (media==='both') {
                      if (item.anime!==null && item.manga!==null) {
                          return true;
                      }
                      return false;
                  } else if (media==='none') {
                      if (item.anime===null && item.manga===null) {
                          return true;
                      }
                  } else {
                      return true;
                  }
              });
          }
      };
  }

})();
