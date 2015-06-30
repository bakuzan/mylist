'use strict';

angular.module('animeitems').filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
})
.filter('ratingFilter', function() {
    return function(array, rating) {
        //filter for rating stars
        return array.filter(function(item) {
//            console.log(item);
            if (item.rating===rating) {
                return item;
            } else if (rating===undefined) {
                return item;
            }
        });
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
.filter('endedSeason', function() {
    return function(array, year, month) {
        return array.filter(function(item) {
        //ended stat season filter
                if (item.end!==undefined && item.end!==null) {
                    /**
                     *  Can currently handle shows of 1 or 2 seasons with 'standard' lengths (10-13) / (22-26) that
                     *  start and finish in the 'normal' season months (J-M,A-J,J-S,O-D) / (J-J,A-S,J-D,O-M).
                     */
                    var pad = '00';
                    var startMonth;
                    if (9 < item.finalEpisode && item.finalEpisode < 14) {
                        if (item.end.substring(0,4) === year) {
                            if (item.end.substr(5,2) === month) {
                                startMonth = (pad + (month - 2)).slice(-pad.length);
                                if (item.start.substr(5,2) === startMonth) {
                                    return item;
                                }
                            }
                        }
                    } else if (13 < item.finalEpisode && item.finalEpisode < 26) {
                        if (item.end.substring(0,4) === year) {
                            if (item.end.substr(5,2) === month) {
                                var num = (month - 5) > 0 ? (month - 5) : 10;
                                startMonth = (pad + num).slice(-pad.length);
//                                console.log(startMonth);
                                if (item.start.substr(5,2) === startMonth) {
                                    return item;
                                }
                            }
                        }
                    }
                }
        });
    };
});