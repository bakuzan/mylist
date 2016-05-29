'use strict';

angular.module('animeitems')
.filter('startFrom', function() {
    return function(input, start) {
        if (input !== undefined) {
            start = +start; //parse to int
            return input.slice(start);
        }
    };
})
.filter('ratingFilter', function() {
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
})
.filter('endedMonth', function() {
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
})
.filter('endedSeason', ['moment', function(moment) {
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
}])
.filter('season', function() {
    return function(array, year, month) {
        return array.filter(function(item) {
            if (item.season !== undefined && item.season !== null) {
                if (item.season.year === year && item.season.season === month) {
                    return item;
                }
            }
        });
    };
})
.filter('seasonForCharacterAnime', function() {
    return function(array, year, month) {
        return array.filter(function(item) {
            if (item.anime && item.anime.season !== undefined && item.anime.season !== null) {
                if (item.anime.season.year === year && item.anime.season.season === month) {
                    return item;
                }
            }
        });
    };
})
.filter('summaryYear', function() {
    return function(array, year, type) {
        if (array !== undefined) {
            return array.filter(function(item) {
              if (type === 'months' && item.end !== undefined && item.end !== null) {
                  if (item.end.substring(0,4) === year) {
                      return item;
                  }
              } else if (type === 'seasons') {
                  if (item.season.year === year) {
                      return item;
                  }
              }
            });
        }
    };
})
.filter('statisticsDetailFilter', ['$filter', function($filter) {
    return function(array, type, year, division) {
        var filter = (division === '')   ? 'summaryYear' :
                     (type === 'months') ? 'endedMonth'  :
                                           'season'      ,
            filterPart = (division === '') ? type : division;
        return $filter(filter)(array, year, filterPart);
    };
}]);
