'use strict';

// Toptens controller
angular.module('toptens').controller('ToptensController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'NotificationFactory',
	function($scope, $stateParams, $location, Authentication, Toptens, NotificationFactory) {
		$scope.authentication = Authentication;

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