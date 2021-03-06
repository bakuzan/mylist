(function() {
	'use strict';
	angular.module('animeitems')
	.controller('AnimeitemsController', AnimeitemsController);
	AnimeitemsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService', '$uibModal'];

	function AnimeitemsController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService, $uibModal) {
		var ctrl = this;

		ctrl.authentication = Authentication;
    ctrl.filterConfig = {
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
        selectListOptions: {},
        statTags: [],
        commonArrays: ListService.getCommonArrays(),
				getItemsAvailable: getItemsAvailable,
				viewItem: ''
    };
		ctrl.findOne = findOne;
		ctrl.latestDate = latestDate;
		ctrl.pageConfig = {
				currentPage: 0,
				pageSize: 10
		};
		ctrl.remove = remove;
		ctrl.tickOff = tickOff;
		ctrl.trustAsResourceUrl = trustAsResourceUrl;
		ctrl.update = update;
    ctrl.usedTags = []; //for typeahead array.
		ctrl.viewItemHistory = viewItemHistory;
		ctrl.whichController = 'animeitem';

		ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);

    //allow retreival of local resource
    function trustAsResourceUrl(url) {
        return $sce.trustAsResourceUrl(url);
    }

		// Remove existing Animeitem
		function remove(animeitem) {
	     //are you sure option...
	    NotificationFactory.confirmation(function() {
	        if ( animeitem ) {
	          animeitem.$remove();

	          for (var i in ctrl.animeitems) {
	            if (ctrl.animeitems [i] === animeitem) {
	            	ctrl.animeitems.splice(i, 1);
	            }
	          }
	        } else {
						ctrl.animeitem.$remove(function() {
	          	$location.path('animeitems');
						});
	        }
	        NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
	    });
		}

		// Update existing Animeitem
		function update() {
			var animeitem = ctrl.animeitem;
			ctrl.animeitem = undefined;
      AnimeFactory.update(animeitem, undefined, true, undefined);
		}

    function tickOff(item) {
        item.episodes += 1;
        item.latest = new Date(); //update latest.
        ctrl.animeitem = item;
        ctrl.update();
    }

    //latest date display format.
    function latestDate(latest, updated) {
        return ItemService.latestDate(latest, updated);
    }

		function viewItemHistory() {
			var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '/modules/history/views/item-history.html',
        controller: 'ViewHistoryController as viewHistory',
        size: 'lg',
				resolve: {
					data: function () {
						return { viewItem: ctrl.filterConfig.viewItem, type: 'anime' };
					}
				}
      }).result.then(function(result) {
        console.log('closed history: ', result, ctrl.filterConfig.viewItem.meta);
				if (result) {
					ctrl.animeitem = ctrl.filterConfig.viewItem;
					ctrl.update();
				}
      });
		}

		// Find existing Animeitem
		function findOne() {
	    Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
	        ctrl.animeitem = result;
	   			console.log(ctrl.animeitem);
	    });
		}

		/** Find a list of Animeitems for values:
         *  (0) returns only ongoing series. (1) returns all series.
         */
		function getAnime(value) {
	    spinnerService.loading('anime', Animeitems.query({ status: value }).$promise.then(function(result) {
	        ctrl.animeitems = result;
					ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
					ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
	    }));
		}

    //Set defaults on requery and "neutralise" the other search variable.
    function getItemsAvailable() {
        ctrl.animeitems = undefined;
        if (ctrl.filterConfig.ongoingList === true) {
            ctrl.filterConfig.search.onHold = false;
            ctrl.filterConfig.search.status = '';
            getAnime(0);
        } else {
            ctrl.filterConfig.search.onHold = '';
            ctrl.filterConfig.search.status = false;
            getAnime(1);
        }
    }
		ctrl.filterConfig.getItemsAvailable();

	}

})();
