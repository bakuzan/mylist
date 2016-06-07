(function() {
  'use strict';
  angular.module('animeitems')
  .filter('endedMonth', endedMonth);

  function endedMonth() {
      return function(array, year, month) {
          return array.filter(function(item) {
          //ended stat month filter
                  if (item.end!==undefined && item.end!==null) {
                      if (item.end.substring(0,4)===year) {
                          if (item.end.substr(5,2)===month) {
                              return item;
                          }
                      }
                  }
          });
      };
  }

})();
