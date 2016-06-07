(function() {
  'use strict';
  angular.module('animeitems')
  .filter('endedSeason', endedSeason);
  endedSeason.$inject = ['moment'];

  function endedSeason(moment) {
      //ended stat season filter
      return function(array, year, month) {
          return array.filter(function(item) {
                  var start = moment(item.start), end = moment(item.end), num, startMonth, startYear, diff, weeks, pad = '00';
                  if (item.end!==undefined && item.end!==null) {
                      /**
                       *  Can currently handle shows of 1 or 2 seasons with 'standard' lengths (10-13) / (22-26) that
                       *  start and finish in the 'normal' season months (J-M,A-J,J-S,O-D) / (J-J,A-S,J-D,O-M).
                       */
                      if (9 < item.finalEpisode && item.finalEpisode < 14) {
                          startMonth = (pad + (month - 2)).slice(-pad.length);
                          if ((item.end.substring(0,4) === year && item.end.substr(5,2) === month) || (item.start.substring(0,4) === year && item.start.substr(5,2) === startMonth)) {
                              diff = end.diff(start, 'days');
                              weeks = Math.ceil(diff / 7) + 1; //add one to correct for the first ep. counting as week 0 in an equation.
                              if (weeks >= item.episodes) {
                                  return item;
                              }
                          }
                      } else if (13 < item.finalEpisode && item.finalEpisode < 26) {
                          num = (month - 5) > 0 ? (month - 5) : 10;
                          startYear = (month - 5) > 0 ? year : year - 1;
                          startMonth = (pad + num).slice(-pad.length);
                          if ((item.end.substring(0,4) === year && item.end.substr(5,2) === month) || (item.start.substring(0,4) === startYear && item.start.substr(5,2) === startMonth)) {
                              diff = end.diff(start, 'days');
                              weeks = Math.ceil(diff / 7) + 1; //add one to correct for the first ep. counting as week 0 in an equation.
                              if (weeks >= item.episodes) {
                                  return item;
                              }
                          }
                      }
                  }
          });
      };
  }

})();
