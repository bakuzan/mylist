'use strict';

// Toptens controller
angular.module('toptens').controller('ToptensController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'NotificationFactory', 'ListService', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Toptens, NotificationFactory, ListService, spinnerService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.whichController = 'topten';
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
        $scope.viewConfig = {
            displayType: '',
            linkSuffix: ''
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
            spinnerService.loading('topten', Toptens.query().$promise.then(function(result) {
                $scope.toptens = result;
            }));
//            console.log($scope.toptens);
		};

		// Find existing Topten
		$scope.findOne = function() {
            Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
                $scope.topten = result;
                $scope.viewConfig.displayType = ($scope.topten.type === 'character') ? 'name' : 'title';
                $scope.viewConfig.linkSuffix = ($scope.topten.type === 'character') ? 's' : 'items';
//                console.log($scope.topten, $scope.viewConfig);
            });
		};
        
	}
]);