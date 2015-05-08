'use strict';


angular.module('core').controller('FavouritesController', ['$scope', 'Authentication', '$window', '$sce', 'Characters',
	function($scope, Authentication, $window, $sce, Characters) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        $scope.myInterval = 2500; //for carousel
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        // Find a list of Characters
		$scope.findCharacters = function() {
			$scope.characters = Characters.query();
            console.log($scope.characters);
		};
    }
]);