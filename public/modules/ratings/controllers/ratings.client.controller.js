'use strict';

// History controller
angular.module('ratings').controller('RatingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'ListService', 'NotificationFactory', 'StatisticsService', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, ListService, NotificationFactory, StatisticsService, spinnerService) {
		var ctrl = this;
		ctrl.authentication = Authentication;
    ctrl.view = 'Anime';
    //paging variables.
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 20
    };
		ctrl.modelOptions = { debounce: 700 };
    ctrl.sortType = 'rating';
    ctrl.sortReverse = true;
    ctrl.viewItem = undefined;
    ctrl.ratingLevel = undefined; //default rating filter
    //rating 'tooltip' function
    ctrl.maxRating = 10;
    ctrl.hoveringOver = function(value) {
        ctrl.overStar = value;
        ctrl.percent = 100 * (value / ctrl.maxRating);
    };

    ctrl.go = function(id) {
        $location.path('/mangaitems/' + id);
    };

    function getItems(view) {
        if (view === 'Anime') {
            spinnerService.loading('rating', Animeitems.query().$promise.then(function(result) {
                ctrl.items = result;
            }));
        } else if (view === 'Manga') {
            spinnerService.loading('rating', Mangaitems.query().$promise.then(function(result) {
                ctrl.items = result;
            }));
        }
        ctrl.viewItem = undefined;
    }

    ctrl.find = function(view) {
			if(view === 'Anime' || view === 'Manga') {
				 getItems(view);
			 } else {
				ctrl.view = 'Anime';
				getItems(ctrl.view);
			 }
    };

    //apply new score.
    ctrl.itemScore = function(item, score) {
        if (item.rating !== score) {
            item.rating = score;

            item.$update(function() {
                $location.path('ratings');
                NotificationFactory.success('Saved!', 'New rating was saved successfully');
            }, function(errorResponse) {
                ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Your change failed!');
            });
//                console.log('update');
        }
        return false;
    };

    /** Episode rating functions below here.
     */
    ctrl.viewEpisodeRatings = function(item) {
        ctrl.viewItem = (ctrl.viewItem !== item) ? item : undefined;
        ctrl.isEqual = (ctrl.viewItem === item) ? true : false;
        ctrl.search = (ctrl.viewItem === item) ? item.title : '';
        if (ctrl.viewItem !== undefined) {
            spinnerService.loading('summary', StatisticsService.buildSummaryFunctions(ctrl.viewItem.meta.history).then(function(result) {
                ctrl.summaryFunctions = result;
            }));
        }
    };

    ctrl.episodeScore = function(finished) {
//            console.log('finished: ', finished, ctrl.viewItem.meta.history);
        if (finished) {
            var item = ctrl.viewItem;
            item.$update(function() {
                $location.path('ratings');
                NotificationFactory.success('Saved!', 'New episode rating was saved successfully');
                spinnerService.loading('summary', StatisticsService.buildSummaryFunctions(ctrl.viewItem.meta.history).then(function(result) {
                    ctrl.summaryFunctions = result;
                }));
            }, function(errorResponse) {
                ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Your change failed!');
            });
        }
    };


    }
]);
