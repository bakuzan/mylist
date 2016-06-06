(function() {
	'use strict';
	angular.module('toptens').controller('ToptensController', ToptensController);
	ToptensController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', '$uibModal', 'Toptens', 'NotificationFactory', 'ListService', 'spinnerService'];

	function ToptensController($scope, $stateParams, $location, Authentication, $uibModal, Toptens, NotificationFactory, ListService, spinnerService) {
		var ctrl = this;
		ctrl.authentication = Authentication;
		ctrl.filterConfig = {
				showingCount: 0,
				expandFilters: false,
				sortType: '',
				sortReverse: false,
				ratingLevel: undefined,
				search: {},
				searchTags: '',
				tagsForFilter: [],
				taglessItem: false,
				areTagless: false,
				selectListOptions: {},
				commonArrays: ListService.getCommonArrays()
		};
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.openListStats = openListStats;
		ctrl.pageConfig = {
				currentPage: 0,
				pageSize: 10
		};
		ctrl.remove = remove;
		ctrl.viewConfig = {
        displayType: '',
        linkSuffix: '',
				tags: [],
				series: []
    };
    ctrl.whichController = 'topten';

		// Remove existing Topten
		function remove(topten) {
	    NotificationFactory.confirmation(function() {
	        if ( topten ) {
	            topten.$remove();
	            for (var i in ctrl.toptens) {
	                if (ctrl.toptens [i] === topten) {
	                    ctrl.toptens.splice(i, 1);
	                }
	            }
	        } else {
	            ctrl.topten.$remove(function() {
	                $location.path('toptens');
	            });
	        }
	        NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
	    });
		}

		// Find a list of Toptens
		function find() {
			ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
	    spinnerService.loading('topten', Toptens.query().$promise.then(function(result) {
	        ctrl.toptens = result;
	    }));
			console.log(ctrl.toptens);
		}

		// Find existing Topten
		function findOne() {
	    Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
	        ctrl.topten = result;
	        ctrl.viewConfig.displayType = (ctrl.topten.type === 'character') ? 'name' : 'title';
	        ctrl.viewConfig.linkSuffix = (ctrl.topten.type === 'character') ? 's' : 'items';
	    });
		}

		function openListStats() {
			var modalInstance = $uibModal.open({
				animation: true,
      	templateUrl: '/modules/toptens/views/statistics-topten.client.view.html',
      	controller: 'statisticsTopten as ctrl',
      	size: 'lg',
      	resolve: {
        	list: function () {
          	return ctrl.topten;
					}
				}
			});
		}

	}
})();
