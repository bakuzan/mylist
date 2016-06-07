(function() {
  'use strict';
  angular.module('toptens')
  .filter('toptenFilter', toptenFilter);

  function toptenFilter() {
    return function(array, displayType, value) {
        if(array !== undefined) {
            return array.filter(function(item) {
                if(item[displayType].toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    return item;
                }
            });
        }
    };
  }
})();
