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
        if (array) {
            return array.filter(function(item) {
                //date filter
                if (item.date === null || item.date === undefined) {
                    if (datesSelected === false) {
                        return item;
                    }
                    return false;
                }

                var day = new Date().getDay(),
                    diff = new Date().getDate() - day + (day === 0 ? 0:7),
                    temp = new Date(),
                    wkEnd = new Date(temp.setDate(diff)),
                    currentWkEnd = wkEnd.toISOString().substring(0,10),
                    iDate = new Date(item.date).toISOString(),
                    itemDate = { year: iDate.substr(0,4), month: iDate.substr(5,2), day: iDate.substr(8,2) },
                    currentDate = { year: currentWkEnd.substr(0,4), month: currentWkEnd.substr(5,2), day: currentWkEnd.substr(8,2) };

                if (datesSelected === false) {
                    if (itemDate.year < currentDate.year) {
                        return item;
                    } else if (itemDate.year === currentDate.year) {
                        if (itemDate.month < currentDate.month) {
                            return item;
                        } else if (itemDate.month === currentDate.month) {
                            if (itemDate.day <= currentDate.day) {
                                return item;
                            }
                        }
                    }
                } else if (datesSelected === true) {
                    if (itemDate.year > currentDate.year) {
                        return item;
                    } else if (itemDate.year === currentDate.year) {
                        if (itemDate.month > currentDate.month) {
                            return item;
                        } else if (itemDate.month === currentDate.month) {
                            if (itemDate.day > currentDate.day) {
                                return item;
                            }
                        }
                    }
                }
            });
        }
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
})
.filter('numberFixedLen', function () {
  return function (n, len) {
      var num = parseInt(n, 10);
      len = parseInt(len, 10);
      if (isNaN(num) || isNaN(len)) {
          return n;
      }
      num = ''+num;
      while (num.length < len) {
          num = '0'+num;
      }
      return num;
  };
});
