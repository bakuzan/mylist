'use strict';

// History controller
angular.module('ratings').controller('RatingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'ListService', 'NotificationFactory', 'StatisticsService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, ListService, NotificationFactory, StatisticsService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.go = function(id) {
            $location.path('/mangaitems/' + id);
        }
        
        $scope.view = 'Anime';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 50
        };
        $scope.sortType = 'rating';
        $scope.sortReverse = true;
        $scope.viewItem = undefined;
        $scope.ratingLevel = undefined; //default rating filter
        //rating 'tooltip' function
        $scope.maxRating = 10;
        $scope.isLoading = true;
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        function getItems(view) {
            if (view === 'Anime') {
                $scope.items = Animeitems.query();
            } else if (view === 'Manga') {
                $scope.items = Mangaitems.query();
            }
            $scope.viewItem = undefined;
//            console.log(view, $scope.items);
        }
        
        $scope.find = function(view) {
            getItems(view);
        };
        
        //Needed to catch 'Character' setting and skip it.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                $scope.isLoading = true;
                if (newValue !== 'Anime' && newValue !== 'Manga') {
                    $scope.view = 'Anime';
                } else {
                    getItems($scope.view);
                }
            }
        });
        
        //apply new score.
        $scope.itemScore = function(item, score) {
            if (item.rating !== score) {
                item.rating = score;

                item.$update(function() {
                    $location.path('ratings');
                    NotificationFactory.success('Saved!', 'New rating was saved successfully');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                    NotificationFactory.error('Error!', 'Your change failed!');
                }); 
//                console.log('update');
            }
            return false;
        };
        
        /** Episode rating functions below here.
         */
        
        $scope.$watch('viewItem', function(newValue) {
            console.log(newValue);
        });
        
        $scope.viewEpisodeRatings = function(item) {
            $scope.viewItem = ($scope.viewItem !== item) ? item : undefined;
            $scope.search = ($scope.viewItem === item) ? item.title : '';
            if ($scope.viewItem !== undefined) {
                $scope.summaryFunctions = StatisticsService.buildSummaryFunctions($scope.viewItem.meta.history);
            }
        };
        
        $scope.episodeScore = function(finished) {
            console.log('finished: ', finished, $scope.viewItem.meta.history);
            if (finished) {
                var item = $scope.viewItem;
                item.$update(function() {
                    $location.path('ratings');
                    NotificationFactory.success('Saved!', 'New episode rating was saved successfully');
                    $scope.summaryFunctions = StatisticsService.buildSummaryFunctions($scope.viewItem.meta.history);
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                    NotificationFactory.error('Error!', 'Your change failed!');
                }); 
            }
        };
        
        
    }
]);