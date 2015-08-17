'use strict';

// Mangaitems controller
angular.module('mangaitems').controller('MangaitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService',
	function($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, fileUpload, $sce, $window, ItemService, ListService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'mangaitem';
        $scope.isLoading = true;
        //paging controls for the list view.
        $scope.currentPage = 0;
        $scope.pageSize = 10;
        $scope.pageCount = 0;
        $scope.$watch('showingCount', function() {
            var pagingDetails = ListService.numberOfPages($scope.showingCount, $scope.pageSize, $scope.currentPage);
            $scope.currentPage = pagingDetails.currentPage;
            $scope.pageCount = pagingDetails.pageCount;
        });
        
        /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
         *      AND chapter/volume/start/latest auto-pop in create.
         */
        $scope.itemUpdate = new Date().toISOString().substring(0,10);
        $scope.start = $scope.itemUpdate;
        $scope.latest = $scope.itemUpdate;
        $scope.chapters = 0;
        $scope.volumes = 0;
        $scope.selectListOptions = ListService.getSelectListOptions($scope.whichController);
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.ratingLevel = undefined; //default rating selection
        $scope.maxRating = 10; //maximum rating
        $scope.imgExtension = ''; //image path extension.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        $scope.statTags = []; //for stat table.
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        $scope.searchTags = '';
        $scope.passTag = function(tag) {
            if ($scope.searchTags.indexOf(tag) === -1) {
                $scope.searchTags += tag + ',';
                $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
            }
        };
        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };
        
        $scope.$watchCollection('mangaitems', function() {
            if ($scope.mangaitems!==undefined) {
//                console.log($scope.mangaitems);
                
                $scope.areTagless = ListService.checkForTagless($scope.mangaitems);
                var maxTagCount = ItemService.maxTagCount($scope.mangaitems);
                $scope.statTags = ItemService.buildStatTags($scope.mangaitems, maxTagCount, 0);
            }
        });
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        // Create new Mangaitem
		$scope.create = function() {
            
            var mangaitem = new Mangaitems();
            //Handle situation if objects not selected.
			if (this.anime!==undefined && this.anime!==null) {
                // Create new Mangaitem object
			     mangaitem = new Mangaitems ({
				    title: this.title,
                    chapters: this.chapters,
                    volumes: this.volumes,
                    start: this.start,
                    latest: this.latest,
                    finalChapter: this.finalChapter,
                    finalVolume: this.finalVolume,
                    hardcopy: this.hardcopy,
                    anime: this.anime._id,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            } else {
                // Create new Mangaitem object
			     mangaitem = new Mangaitems ({
				    title: this.title,
                    chapters: this.chapters,
                    volumes: this.volumes,
                    start: this.start,
                    latest: this.latest,
                    finalChapter: this.finalChapter,
                    finalVolume: this.finalVolume,
                    hardcopy: this.hardcopy,
                    anime: this.anime,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            }

			// Redirect after save
			mangaitem.$save(function(response) {
				$location.path('/mangaitems/' + response._id);

				// Clear form fields
				$scope.title = '';
                $scope.chapters = '';
                $scope.volumes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Mangaitem
		$scope.remove = function(mangaitem) {
            //are you sure option...
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
			 if ( mangaitem ) { 
				mangaitem.$remove();

				for (var i in $scope.mangaitems) {
					if ($scope.mangaitems [i] === mangaitem) {
						$scope.mangaitems.splice(i, 1);
					}
				}
			 } else {
				$scope.mangaitem.$remove(function() {
					$location.path('/mangaitems');
				});
			 }
            }
		};

		// Update existing Mangaitem
		$scope.update = function() {
			var mangaitem = $scope.mangaitem;
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.mangaitem.anime!==null && $scope.mangaitem.anime!==undefined) {
                mangaitem.anime = $scope.mangaitem.anime._id;
            }
            
            if ($scope.tagArray!==undefined) {
                mangaitem.tags = ListService.concatenateTagArrays(mangaitem.tags, $scope.tagArray);
            }
            
            //update the item history.
            mangaitem = ItemService.itemHistory(mangaitem, $scope.updateHistory, 'manga');
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                mangaitem.image = $scope.imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(mangaitem.image);
            
            //handle end date
            if (mangaitem.chapters===mangaitem.finalChapter && mangaitem.finalChapter!==0) {
                if (mangaitem.end===undefined || mangaitem.end===null) {
                    mangaitem.volumes = mangaitem.finalVolume;
                    mangaitem.end = mangaitem.latest.substring(0,10);
                    //console.log(animeitem.end);
                }
            } else if (mangaitem.reReading === false) {
                mangaitem.end = null;
            }
            
            //handle status: completed.
            if(mangaitem.end!==undefined && mangaitem.end!==null) {
                mangaitem.status = true;
            } else {
                mangaitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (mangaitem.reReading===true && mangaitem.chapters===mangaitem.finalChapter && mangaitem.volumes===mangaitem.finalVolume) {
                mangaitem.reReadCount += 1;
                mangaitem.reReading = false;
            }

			mangaitem.$update(function() {
				$location.path('/mangaitems');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
            
		};
        $scope.tickOff = function(item) {
            item.chapters += 1;
            item.latest = $scope.itemUpdate;
            $scope.mangaitem = item;
            $scope.update();
        };

		// Find a list of Mangaitems
		$scope.find = function() {
			$scope.mangaitems = Mangaitems.query();
            //console.log($scope.mangaitems);
		};

		// Find existing Mangaitem
		$scope.findOne = function() {
			$scope.mangaitem = Mangaitems.get({ 
				mangaitemId: $stateParams.mangaitemId
			});
//            console.log($scope.mangaitem);
		};
        
        // Find a list of Animeitems for dropdowns.
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
		};
        
        //image upload
        $scope.uploadFile = function(){
            $scope.imgPath = '/modules/mangaitems/img/' + $scope.myFile.name;
            fileUpload.uploadFileToUrl($scope.myFile, '/fileUpload');
        };
        
        //latest date display format.
        $scope.latestDate = function(latest, updated) {
            return ItemService.latestDate(latest, updated);
        };
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
	}
]);
