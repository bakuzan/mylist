'use strict';

// Toptens controller
angular.module('toptens').controller('CreateToptenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens',
	function($scope, $stateParams, $location, Authentication, Toptens) {
		$scope.authentication = Authentication;
        
        $scope.stepConfig = {
            currentStep: 1,
            stepCount: 2,
            listGen: {
                items: [],
                typeDisplay: '',
                toptenItem: ''
            }
        };

		// Create new Topten
		$scope.create = function() {
			// Create new Topten object
			var topten = new Toptens ({
				name: this.name
			});

			// Redirect after save
			topten.$save(function(response) {
				$location.path('toptens/');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};
        
        //Step related functions:
        $scope.takeStep = function(number, direction) {
            $scope.stepConfig.currentStep = (direction) ? number + 1 : number - 1;
        };
        $scope.cancel = function() {
            $location.path('toptens');
        };

	}
]);