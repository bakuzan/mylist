(function() {
  'use strict';
  angular.module('core')
  .filter('calendarFilter', calendarFilter);

   function calendarFilter() {
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
  }

})();
