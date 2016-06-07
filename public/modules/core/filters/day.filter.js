(function() {
  'use strict';
  angular.module('core')
  .filter('dayFilter', dayFilter);

   function dayFilter() {
    return function(array, daySelected) {
        return array.filter(function(item) {
            //special day filter
//            console.log(item);
            var ds = daySelected;
            if (ds==='1' && item.day==='Monday') {
                return item;
            } else if (ds==='2' && item.day==='Tuesday') {
                return item;
            } else if (ds==='3' && item.day==='Wednesday') {
                return item;
            } else if (ds==='4' && item.day==='Thursday') {
                return item;
            } else if (ds==='5' && item.day==='Friday') {
                return item;
            } else if (ds==='6' && item.day==='Saturday') {
                return item;
            } else if (ds==='0' && item.day==='Sunday') {
                return item;
            } else if (ds==='' || ds===null || ds===undefined) {
                return item;
            } else if (ds==='Any' && item.day==='Any') {
                return item;
            }
        });
    };
}

})();
