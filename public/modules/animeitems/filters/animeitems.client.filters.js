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
                if (item.end!==undefined) {
                    if (item.end.substring(0,4)===year) {
                        if (item.end.substr(5,2)===month) {
                            return item;
                        }
                    }
                }
        });
    };
});