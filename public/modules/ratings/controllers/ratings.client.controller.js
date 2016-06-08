(function() {
	'use strict';
	angular.module('ratings')
	.controller('RatingsController', RatingsController);
	RatingsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'ListService', 'NotificationFactory', 'StatisticsService', 'spinnerService'];
	function RatingsController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, ListService, NotificationFactory, StatisticsService, spinnerService) {
		var ctrl = this;

		ctrl.authentication = Authentication;
		ctrl.episodeScore = episodeScore;
		ctrl.find = find;
		ctrl.go = go;
		ctrl.hoveringOver = hoveringOver;
		ctrl.itemScore = itemScore;
		ctrl.maxRating = 10;
		ctrl.modelOptions = { debounce: 700 };
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 20
    };
    ctrl.ratingLevel = undefined; //default rating filter
    ctrl.sortReverse = true;
    ctrl.sortType = 'rating';
		ctrl.view = 'Anime';
		ctrl.viewEpisodeRatings = viewEpisodeRatings;
    ctrl.viewItem = undefined;

		//rating 'tooltip' function
    function hoveringOver(value) {
        ctrl.overStar = value;
        ctrl.percent = 100 * (value / ctrl.maxRating);
    }

    function go(id) {
        $location.path('/mangaitems/' + id);
    }

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

    function find(view) {
			if(view === 'Anime' || view === 'Manga') {
				 getItems(view);
			 } else {
				ctrl.view = 'Anime';
				getItems(ctrl.view);
			 }
    }

    //apply new score.
    function itemScore(item, score) {
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
    }

    /** Episode rating functions below here.
     */
    function viewEpisodeRatings(item) {
        ctrl.viewItem = (ctrl.viewItem !== item) ? item : undefined;
        ctrl.isEqual = (ctrl.viewItem === item) ? true : false;
        ctrl.search = (ctrl.viewItem === item) ? item.title : '';
        if (ctrl.viewItem !== undefined) {
            spinnerService.loading('summary', StatisticsService.buildSummaryFunctions(ctrl.viewItem.meta.history).then(function(result) {
                ctrl.summaryFunctions = result;
            }));
        }
    }

    function episodeScore(finished) {
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
    }
	}

})();
