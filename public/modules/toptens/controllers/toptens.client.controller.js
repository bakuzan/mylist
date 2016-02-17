'use strict';

// Toptens controller
angular.module('toptens').controller('ToptensController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'NotificationFactory', 'ListService',
	function($scope, $stateParams, $location, Authentication, Toptens, NotificationFactory, ListService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'topten';
        $scope.isLoading = true;
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
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
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            commonArrays: ListService.getCommonArrays()
        };
    
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };

		// Remove existing Topten
		$scope.remove = function(topten) {
            NotificationFactory.confirmation(function() {
                if ( topten ) { 
                    topten.$remove();
                    for (var i in $scope.toptens) {
                        if ($scope.toptens [i] === topten) {
                            $scope.toptens.splice(i, 1);
                        }
                    }
                } else {
                    $scope.topten.$remove(function() {
                        $location.path('toptens');
                    });
                }
                NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
            });
		};

		// Find a list of Toptens
		$scope.find = function() {
			$scope.toptens = Toptens.query();
            console.log($scope.toptens);
		};

		// Find existing Topten
		$scope.findOne = function() {
			$scope.topten = Toptens.get({ 
				toptenId: $stateParams.toptenId
			});
            console.log($scope.topten);
		};
	}
]);