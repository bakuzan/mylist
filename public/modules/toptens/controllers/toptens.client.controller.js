'use strict';

// Toptens controller
angular.module('toptens').controller('ToptensController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens',
	function($scope, $stateParams, $location, Authentication, Toptens) {
		$scope.authentication = Authentication;

		// Remove existing Topten
		$scope.remove = function(topten) {
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
		};

		// Update existing Topten
		$scope.update = function() {
			var topten = $scope.topten;

			topten.$update(function() {
				$location.path('toptens/' + topten._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
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
		};
	}
]);