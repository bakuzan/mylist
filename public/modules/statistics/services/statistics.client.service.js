'use strict';

//Statistics service 
angular.module('statistics').service('StatisticsService', ['$filter', 'ListService', function($filter, ListService) {
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
                { metric: 'Lowest rating',  value: (lowestRating === 10) ? 0 : lowestRating },
                { metric: 'Mode rating',    value: (modeRating.value === undefined) ? 0 : modeRating.value }
            ];
        }
    };
    
    function processYearSummary(summary, array) {
        var i = array.length;
        if (summary.length < 1) {
            while(i--) {
                summary.push({
                    metric: array[i].metric,
                    values: []
                });
            }
            summary.reverse();
        } 
        i = array.length;
        for(var j = 0; j < i; j++) {
            summary[j].values.push({ value: array[j].value });
        }
        return summary;
    }
    
    this.buildYearSummary = function(array, year, type) {
        var filter = (type === 'months') ? 'endedMonth' : 'season',
            attr   = (type === 'months') ? 'number'     : 'text'  ,
            commonArrays = ListService.getCommonArrays(),
            i = commonArrays[type].length, 
            yearSummary = [];
        for(var j = 0; j < i; j++) {
            var filteredArray = $filter(filter)(array, year, commonArrays[type][j][attr]),
                result = self.buildSummaryFunctions(filteredArray);
            yearSummary = processYearSummary(yearSummary, result);
        }
        return yearSummary;
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
//        console.log(max);
        return max;        
    };
    
}]);