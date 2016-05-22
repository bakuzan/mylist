'use strict';

//Statistics service
angular.module('statistics').service('StatisticsService', ['$filter', 'ListService', '$q', function($filter, ListService, $q) {
    var self = this;

    this.buildSummaryFunctions = function(array) {
        return $q(function(resolve, reject) {
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
                resolve([
                    { metric: 'Average rating', value: averageRating },
                    { metric: 'Highest rating', value: highestRating },
                    { metric: 'Lowest rating',  value: (lowestRating === 10) ? 0 : lowestRating },
                    { metric: 'Mode rating',    value: (modeRating.value === undefined) ? 0 : modeRating.value }
                ]);
            }
        });
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
        return $q(function(resolve, reject) {
            var filter = (type === 'months') ? 'endedMonth' : 'season',
                attr   = (type === 'months') ? 'number'     : 'text'  ,
                commonArrays = ListService.getCommonArrays(),
                i = commonArrays[type].length,
                yearSummary = [], results = [];

            for(var j = 0; j < i; j++) {
                var filteredArray = $filter(filter)(array, year, commonArrays[type][j][attr]),
                    promise = self.buildSummaryFunctions(filteredArray);
                results.push(promise);
            }
            angular.forEach(results, function(promise) {
                promise.then(function(result) {
                    yearSummary = processYearSummary(yearSummary, result);
                });
            });
            resolve(yearSummary);
        });
    };

    this.buildEpisodeSummaries = function(array) {
        return $q(function(resolve, reject) {
            angular.forEach(array, function(item) {
                self.buildSummaryFunctions(item.meta.history).then(function(result) {
                    item.meta.episodeSummaryFunctions = result;
                });
            });
            resolve(array);
        });
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

    this.occuranceCounter = function(array, attr) {
      return $q(function(resolve, reject) {
        var occuranceCounter = [];
        ListService.groupItemsByProperties(array, [attr]).then(function(result) {
          for(var i = 0, len = result.length; i < len; i++) {
            occuranceCounter.push({
              value: result[i][0][attr],
              count: result[i].length
            });
          }
        });
        resolve(occuranceCounter);
      });
    };

    this.buildToptenDataStructure = function(obj, arrayOfArrays) {
      return $q(function(resolve, reject) {
        angular.forEach(arrayOfArrays, function(array) {
          var type = array[0].type, listType = type + 'List', len = array.length;
          obj[type].listCount = len;
          for(var i = 0; i < len; i++) {
            var itemLen = array[i][listType].length;
            for(var j = 0; j < itemLen; j++) {
              obj[type].items.push(array[i][listType][j]);
            }
          }
        });
        resolve(obj);
      });
    };

    this.buildToptenModeList = function(array, type) {
      var attr = type === 'character' ? 'name' : 'title';
      return self.occuranceCounter(array, attr);
    };

}]);
