'use strict';

angular.module('core').filter('dayFilter', function() {
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
})
.filter('dateFilter', function() {
    return function(array, datesSelected) {
        return array.filter(function(item) {
            //date filter
            if (item.date===null || item.date===undefined) {
                if (datesSelected==='current') {
                    return item;
                }
                return false;
            }
            //console.log(item.date);
            var day = new Date().getDay(),
            diff = new Date().getDate() - day + (day === 0 ? 0:7);
            var temp = new Date();
            var wkEnd = new Date(temp.setDate(diff));
            var currentWkEnd = wkEnd.toISOString().substring(0,10);
//            console.log('day: ' + day);
//            console.log('date: ' + $scope.today.getDate());
//            console.log('diff: ' + diff);
//              console.log('wk-end: ' + currentWkEnd); // 0123-56-89

            if (datesSelected==='current') {
                if (item.date.substr(0,4) < currentWkEnd.substr(0,4)) {
                    return item;
                } else if (item.date.substr(0,4) === currentWkEnd.substr(0,4)) {
                    if (item.date.substr(5,2) < currentWkEnd.substr(5,2)) {
                        return item;
                    } else if (item.date.substr(5,2) === currentWkEnd.substr(5,2)) {
                        if (item.date.substr(8,2) <= currentWkEnd.substr(8,2)) {
                            return item;
                        }
                    }
                }
            } else if (datesSelected==='future') {
                if (item.date.substr(0,4) > currentWkEnd.substr(0,4)) {
                    return item;
                } else if (item.date.substr(0,4) === currentWkEnd.substr(0,4)) {
                    if (item.date.substr(5,2) > currentWkEnd.substr(5,2)) {
                        return item;
                    } else if (item.date.substr(5,2) === currentWkEnd.substr(5,2)) {
                        if (item.date.substr(8,2) > currentWkEnd.substr(8,2)) {
                            return item;
                        }
                    }
                }
            }
        });
    };
});