'use strict';

// Animeitems controller
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'moment',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, moment) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.view = 'list'; //dynamic page title.
        $scope.isList = true; //list view as default.
        $scope.maxAnimeCount = 0; //number of anime.
        $scope.maxCompleteMonth = 0; //used to find the max number of ends in 1 month.
        $scope.showDetail = false; //show month detail.
        $scope.sortType = 'latest'; //default sort type
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.ratingLevel = undefined; //default rating filter
        $scope.maxRating = 10; //maximum rating
        $scope.imgPath = ''; //image path
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        $scope.months = [
            { number: '01', text: 'January' },
            { number: '02', text: 'February' },
            { number: '03', text: 'March' },
            { number: '04', text: 'April' },
            { number: '05', text: 'May' },
            { number: '06', text: 'June' },
            { number: '07', text: 'July' },
            { number: '08', text: 'August' },
            { number: '09', text: 'September' },
            { number: '10', text: 'October' },
            { number: '11', text: 'November' },
            { number: '12', text: 'December' }
        ];
        
        //ended stat month filter
        $scope.endedMonth = function(year, month){
            return function(item) {
                if (item.end!==undefined) {
                    if (item.end.substring(0,4)===year) {
                        if (item.end.substr(5,2)===month) {
                            return item;
                        }
                    }
                }
            };
        };
        
        //show month detail.
        $scope.monthDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailYear===year && $scope.detailMonth===month) {
                    $scope.showDetail = !$scope.showDetail;
            } else {
                $scope.detailYear = year;
                $scope.detailMonth = month;
                //get month name also, cause why not.
                angular.forEach($scope.months, function(mmm) {
                    if ($scope.detailMonth===mmm.number) {
                        $scope.detailMonthName = mmm.text;
                    }
                });
                $scope.showDetail = true;
            }
        };
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
//                console.log($scope.animeitems);
                $scope.maxAnimeCount = $scope.animeitems.length;
                var modeMap = {};
                var maxCount = 0;
                for(var i = 0; i < $scope.animeitems.length; i++) {
    	           if ($scope.animeitems[i].end!==undefined) {
                        var end = $scope.animeitems[i].end.substring(0,7);

    	               if(modeMap[end] === null || modeMap[end] === undefined) {
    		              modeMap[end] = 1;
                        } else {
                            modeMap[end]++;
                        }

                        if(modeMap[end] > maxCount) {
    		              maxCount = modeMap[end];
    	               }
                   }
                }
                console.log(modeMap);
                console.log(maxCount);
                $scope.maxCompleteMonth = maxCount;
            }
        });
        
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        //filter for rating stars
        $scope.ratingFilter = function(item) {
            if (item.rating===$scope.ratingLevel) {
                return item;
            } else if ($scope.ratingLevel===undefined) {
                return item;
            }
        };

		// Create new Animeitem
		$scope.create = function() {
			// Create new Animeitem object
			var animeitem = new Animeitems ({
				title: this.title,
                episodes: this.episodes,
                start: this.start,
                latest: this.latest,
                finalEpisode: this.finalEpisode,
                disc: this.disc,
                user: this.user
			});

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);

				// Clear form fields
								// Clear form fields
				$scope.title = '';
                $scope.episodes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Animeitem
		$scope.remove = function(animeitem) {
            //are you sure option...
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
			 if ( animeitem ) { 
				animeitem.$remove();

				for (var i in $scope.animeitems) {
					if ($scope.animeitems [i] === animeitem) {
						$scope.animeitems.splice(i, 1);
					}
				}
			 } else {
				$scope.animeitem.$remove(function() {
					$location.path('animeitems');
				});
			 }
            }
		};

		// Update existing Animeitem
		$scope.update = function() {
			var animeitem = $scope.animeitem;
            
            //console.log($scope.imgPath);
            //console.log(animeitem.image);
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                animeitem.image = $scope.imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(animeitem.image);
            
            //handle end date
            if (animeitem.episodes===animeitem.finalEpisode) {
                if (animeitem.end===undefined) {
                    animeitem.end = new Date().toISOString().substring(0,10);
                    //console.log(animeitem.end);
                }
            }
            
            //handle status: completed.
            if(animeitem.end!==undefined) {
                animeitem.status = true;
            } else {
                animeitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (animeitem.reWatching===true && animeitem.episodes===animeitem.finalEpisode) {
                animeitem.reWatchCount += 1;
                animeitem.reWatching = false;
            }
            

			animeitem.$update(function() {
				$location.path('animeitems/' + animeitem._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Animeitems
		$scope.find = function() {
			$scope.animeitems = Animeitems.query();
            console.log($scope.animeitems);
		};

		// Find existing Animeitem
		$scope.findOne = function() {
			$scope.animeitem = Animeitems.get({ 
				animeitemId: $stateParams.animeitemId
			});
		};
        
        // Find list of mangaitems for dropdown.
        $scope.mangaDropdown = function() {
            $scope.mangaitems = Mangaitems.query();
        };
        
                //image upload
        $scope.uploadFile = function(){
            var file = $scope.myFile;
            $scope.imgPath = '/modules/animeitems/img/' + file.name;
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = '/fileUploadAnime';
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
        
        //latest date display format.
        $scope.latestDate = function(latest) {
//          console.log(latest);
            var today = moment(new Date());
            var latestDate = moment(latest);
            var diff = today.diff(latestDate, 'days');
            
            //for 0 and 1 day(s) ago use the special term.
            if (diff===0) {
                return 'Today';
            } else if (diff===1) {
                return 'Yesterday';
            } else {
                return diff + ' days ago.';
            }
        };
	}
]);