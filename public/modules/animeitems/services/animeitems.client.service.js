'use strict';

//Animeitems service used to communicate Animeitems REST endpoints
angular.module('animeitems').factory('Animeitems', ['$resource',
	function($resource) {
		return $resource('animeitems/:animeitemId', { animeitemId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            alert('File Uploaded!');
        })
        .error(function(err){
            alert('File Upload Failed: ' + err.message);
        });
    };
}]).service('ItemService', ['moment', function(moment) {
    
        //function to display relative time - using latest or updated date.
        this.latestDate = function(latest, updated) {
            //latest date display format.
//          console.log(latest, updated);
            var today = moment(new Date());
            var latestDate, diff;
            if (latest.substring(0,10)===updated.substring(0,10)) {
                 latestDate = moment(updated);
                 diff = latestDate.fromNow();
                
                if (diff==='a day ago') {
                    return 'Yesterday';
                } else {
                    return diff;
                }
            } else {
                 latestDate = moment(latest);
                 diff = today.diff(latestDate, 'days');
                
                //for 0 and 1 day(s) ago use the special term.
                if (diff===0) {
                    return 'Today';
                } else if (diff===1) {
                    return 'Yesterday';
                } else {
                    return diff + ' days ago.';
                }
            }
        };
        
        //function to calculate the weighted mean ratings for the genre tags.
        this.ratingsWeighted = function(ratings, listAverage) {
            var values = [];
            var weights = [];
            var total = 0;
            var count = 0;
            var someValue = 0; //a value to augment weighted average.
            
            /**
             *  create array (weights) with key(rating) and value(weight).
             *  uses values as a control.
             */
            for (var i=0; i < ratings.length; i++) {
                if (ratings[i]!==0) {
                    if (ratings[i] in values) {
                        weights[ratings[i]]++;
                    } else {
                        values.push(ratings[i]);
                        weights[ratings[i]] = 1;
                    }
                }
            }
//            console.log(values,weights);
            /**
             *  using the key(rating) multiply by the value(weight).
             *  calculated weighted total and count.
             */
            for (var k in weights){
                if (typeof weights[k] !== 'function') {
                    total += k * weights[k];
                    count += weights[k];
                }
            }
            
            /**
             *  count = number of ratings for it. total/count = average rating for tag.
             *  someValue = minimum score to get weighted. listAverage = average rating for all tags.
             */
            someValue = count / 50; //set someValue now that count is calculated - it SHOULD favour those with more ratings -> needs work.
            return count > 1 ? (count / (count + someValue)) * (total / count) + (someValue / (count + someValue)) * listAverage : 0;
            //most likely unecessary due to earlier 0 check. returns weighted average.
//            return count ? (total / count) : 0;
            
        };
        
}]);


