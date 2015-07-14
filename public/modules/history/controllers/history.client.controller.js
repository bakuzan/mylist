'use strict';

// Animeitems controller
angular.module('history').controller('HistoryController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.view = 'Anime';
        
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
        
    }

                                                          ]);