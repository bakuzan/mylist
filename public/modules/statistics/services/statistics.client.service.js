'use strict';

//Statistics service 
angular.module('statistics').service('StatisticsService', function() {
    var self = this;
    
    this.buildSummaryFunctions = function(array) {
        if (array !== undefined) {
            var i = array.length, highestRating = 0, lowestRating = 10, averageRating = 0, modeRating = {}, ratings = { count: 0, sum: 0 };
            while(i--) {
//                console.log(array[i]);
                highestRating = array[i].rating > highestRating ? array[i].rating : highestRating;
                lowestRating = 0 < array[i].rating && array[i].rating < lowestRating ? array[i].rating : lowestRating;
                ratings.count += array[i].rating > 0 ? 1 : 0;
                ratings.sum += array[i].rating;
                averageRating = (ratings.sum / ratings.count).toFixed(2);
                modeRating = self.getModeMap(array, 'rating', 0);
            }
            return [ 
                { metric: 'Average rating', value: averageRating },
                { metric: 'Highest rating', value: highestRating },
                { metric: 'Lowest rating',  value: lowestRating  },
                { metric: 'Mode rating',    value: modeRating.value }
            ];
        }
    };
    
    this.getModeMap = function(array, attr, ignore) {
        var modeMap = {}, 
            max = {
                count: 0,
                value: ''
            };
        for(var i = 0; i < array.length; i++) {
            var value = array[i][attr];
            if(modeMap[value] === null || modeMap[value] === undefined) {
                modeMap[value] = 1;
            } else {
                modeMap[value]++;
            }
            if(modeMap[value] > max.count) {
                //Ignore is a value you might not care about e.g. 0;
                if (ignore !== value) {
                    max.count = modeMap[value];
                    max.value = value;
                }
            }
        }
        console.log(max);
        return max;        
    };
    
});