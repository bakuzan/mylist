'use strict';

// Animeitems controller
angular.module('history').controller('HistoryController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'HistoryService', 'ListService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, HistoryService, ListService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.view = 'Anime';
        $scope.isLoading = true;
        
        function getAnimeitems() {
             // Find list of mangaitems.
            $scope.animeitems = Animeitems.query();
        }
        
        function getMangaitems() {
             // Find list of mangaitems.
            $scope.mangaitems = Mangaitems.query();
        }
        
        $scope.buildHistory = function() {
            getAnimeitems();
            getMangaitems();
        };
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
                $scope.animeHistory = HistoryService.buildHistoryList($scope.animeitems);
            }
        });
        
        $scope.$watchCollection('mangaitems', function() {
            if ($scope.mangaitems!==undefined) {
                $scope.mangaHistory = HistoryService.buildHistoryList($scope.mangaitems);
            }
        });
        
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
    }

                                                          ]);