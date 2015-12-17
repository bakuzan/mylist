'use strict';

//Statistics service 
angular.module('statistics').service('StatisticsService', function() {
    
    this.buildSummaryFunctions = function(array) {
        if (array !== undefined) {
            var i = array.length, highestRating = 0, lowestRating = 10, averageRating = 0, ratings = { count: 0, sum: 0 };
            while(i--) {
//                console.log(array[i]);
                highestRating = array[i].rating > highestRating ? array[i].rating : highestRating;
                lowestRating = 0 < array[i].rating && array[i].rating < lowestRating ? array[i].rating : lowestRating;
                ratings.count += array[i].rating > 0 ? 1 : 0;
                ratings.sum += array[i].rating;
                averageRating = (ratings.sum / ratings.count).toFixed(2);
            }
            return [ { metric: 'Average rating', value: averageRating },{ metric: 'Highest rating', value: highestRating },{ metric: 'Lowest rating', value: lowestRating } ];
        }
    };
    
});