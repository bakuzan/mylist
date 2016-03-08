'use strict';

// Animeitems controller
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'animeitem';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            ongoingList: true,
            showingCount: 0,
            expandFilters: false,
            sortType: '',
            sortReverse: true,
            ratingLevel: undefined,
            ratingActions: {
                maxRating: 10,
                percent: undefined,
                overStar: null
            },
            search: {},
            searchTags: '',
            tagsForFilter: [],
            taglessItem: false,
            areTagless: false,
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            statTags: ItemService.buildStatTags($scope.animeitems, 0),
            commonArrays: ListService.getCommonArrays()
        };
        
        /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
         *      AND episode/start/latest auto-pop in create.
         */
        $scope.itemUpdate = new Date();
        $scope.start = $scope.itemUpdate;
        $scope.latest = $scope.itemUpdate;
        $scope.episodes = 0;
        $scope.viewItemHistory = false; //default stat of item history popout.
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
                console.log($scope.animeitems);
                $scope.filterConfig.areTagless = ListService.checkForTagless($scope.animeitems);
                $scope.filterConfig.statTags = ItemService.buildStatTags($scope.animeitems, 0);
            }
//            console.log($scope.animeitems);
        });

		// Create new Animeitem
		$scope.create = function() {
			// Create new Animeitem object
            var animeitem = new Animeitems();
            animeitem = new Animeitems ({
                title: this.title,
                episodes: this.episodes,
                start: this.start,
                latest: this.latest,
                finalEpisode: this.finalEpisode,
                season: this.season === true ? ItemService.convertDateToSeason(new Date(this.start)) : '',
                disc: this.disc,
                manga: this.manga!==undefined && this.manga!==null ? this.manga._id : this.manga,
                tags: $scope.tagArray,
                user: this.user
             });

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);
                NotificationFactory.success('Saved!', 'Anime was saved successfully');
				// Clear form fields
				$scope.title = '';
                $scope.episodes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Animeitem
		$scope.remove = function(animeitem) {
             //are you sure option...
            NotificationFactory.confirmation(function() {
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
                NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
            });
		};

		// Update existing Animeitem
		$scope.update = function() {
			var animeitem = $scope.animeitem;
            $scope.animeitem = undefined;
            AnimeFactory.update(animeitem, $scope.tagArray, $scope.updateHistory, $scope.imgPath);
		};
        $scope.tickOff = function(item) {
            item.episodes += 1;
            item.latest = new Date(); //update latest.
            $scope.updateHistory = true; //add to history.
            $scope.animeitem = item;
            $scope.update();
        };
        
        // Find a list of Animeitems
        $scope.find = function() {
            $scope.animeitems = Animeitems.query();
        };

		// Find existing Animeitem
		$scope.findOne = function() {
            Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
                $scope.animeitem = result;
//            console.log($scope.animeitem);
            });
		};
        
        // Find list of mangaitems for dropdown.
        $scope.findManga = function() {
            $scope.mangaitems = Mangaitems.query();
        };
        
        //image upload
        $scope.uploadFile = function(){
            $scope.imgPath = '/modules/animeitems/img/' + $scope.myFile.name;
            fileUpload.uploadFileToUrl($scope.myFile, '/fileUploadAnime');
        };

        //latest date display format.
        $scope.latestDate = function(latest, updated) {
            return ItemService.latestDate(latest, updated);
        };
        
        $scope.deleteHistory = function(item, history) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                $scope.animeitem = ItemService.deleteHistory(item, history);
                $scope.update();
            });
        };
        
		/** Find a list of Animeitems for values:
         *  (0) returns only ongoing series. (1) returns all series.
         */
		function getAnime(value) {
            spinnerService.loading('anime', function() {
                $scope.animeitems = Animeitems.query({
                    status: value
                });
            });
		}
        
        //Set defaults on requery and "neutralise" the other search variable.
        $scope.itemsAvailable = function() {
            $scope.animeitems = undefined;
            if ($scope.filterConfig.ongoingList === true) {
                $scope.filterConfig.search.onHold = false;
                $scope.filterConfig.search.status = '';
                getAnime(0);
            } else {
                $scope.filterConfig.search.onHold = '';
                $scope.filterConfig.search.status = false;
                getAnime(1);
            }
        };
        
	}
]);