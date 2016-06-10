(function() {
	'use strict';
	angular.module('animeitems')
	.controller('WatchListController', WatchListController);
	WatchListController.$inject = ['$scope', 'Authentication', '$stateParams', '$sce', 'spinnerService', 'ItemService', 'ListService', 'WatchAnime'];

	function WatchListController($scope, Authentication, $stateParams, $sce, spinnerService, ItemService, ListService, WatchAnime) {
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
		        commonArrays: ListService.getCommonArrays()
		    };
				ctrl.find = find;
				ctrl.latestDate = latestDate;
				ctrl.pageConfig = {
						currentPage: 0,
						pageSize: 10
				};
				ctrl.trustAsResourceUrl = trustAsResourceUrl;
				ctrl.watchAnime = watchAnime;
				ctrl.whichController = 'watch';

				function watchAnime(id) {
					$state.go('watchAnimeitem', { animeitemId: id });
				}

        // Find a list of Animeitems
        function find() {
					ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
          spinnerService.loading('watch', WatchAnime.query().$promise.then(function(result) {
  					ctrl.animeitems = result;
						console.log('watch list: ', result, 'filterConfig: ', ctrl.filterConfig);
  				}));
        }
        ctrl.find();

				//allow retreival of local resource
		    function trustAsResourceUrl(url) {
		        return $sce.trustAsResourceUrl(url);
		    }

				//latest date display format.
		    function latestDate(latest, updated) {
		        return ItemService.latestDate(latest, updated);
		    }

	}

})();
