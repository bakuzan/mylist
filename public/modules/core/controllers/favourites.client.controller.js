'use strict';


angular.module('core').controller('FavouritesController', ['$scope', 'Authentication', '$window', '$sce', 'Characters', 'Animeitems',
	function($scope, Authentication, $window, $sce, Characters, Animeitems) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        $scope.myInterval = 2500; //for carousel
                
        $scope.saved = localStorage.getItem('favouriteAnimeitems');
        $scope.favouriteAnimeitem = JSON.parse($scope.saved);
        localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        // Find a list of Characters
		$scope.findCharacters = function() {
			$scope.characters = Characters.query();
            console.log($scope.characters);
		};
        
        // Find a list of Anime
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
            //console.log($scope.characters);
		};
        
        $scope.updateAnimeFavourites = function() {
//            console.log($scope.favouriteOne);
//            $scope.favouriteAnimeitem.push({
//                favourite: $scope.favouriteOne
//            });
//            localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
        };
    
    }
]);