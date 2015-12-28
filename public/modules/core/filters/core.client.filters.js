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
.filter('calendarFilter', function() {
    return function(array, datesSelected) {
        return array.filter(function(item) {
            //date filter
            if (item.date === null || item.date === undefined) {
                if (datesSelected === false) {
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

            if (datesSelected === false) {
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
            } else if (datesSelected === true) {
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
})
.filter('dateSuffix', function($filter) {
  var suffixes = ['th', 'st', 'nd', 'rd'];
  return function(input) {
    if(input !== undefined){
        var dtfilter = $filter('date')(input, 'MMMM d'),
            day = parseInt(dtfilter.slice(-2)),
            relevantDigits = (day < 30) ? day % 20 : day % 30,
            suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0],
            dateArray = dtfilter.split(' '),
            month = dateArray[0];
        return dateArray[1] + suffix + ' ' + month + ' ' + $filter('date')(input, 'yyyy');
    }
  };
});