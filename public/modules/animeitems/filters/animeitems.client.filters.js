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
});