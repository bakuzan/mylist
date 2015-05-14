'use strict';


angular.module('favourites').controller('FavouritesController', ['$scope', 'Authentication', '$window', '$sce', 'Characters', 'Animeitems',
	function($scope, Authentication, $window, $sce, Characters, Animeitems) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        $scope.myInterval = 2500; //for carousel
        $scope.today = new Date().toISOString();        
        $scope.saved = localStorage.getItem('favouriteAnimeitems'); 
        $scope.favouriteAnimeitem = (localStorage.getItem('favouriteAnimeitems')!==null) ? 
        JSON.parse($scope.saved) : [{rank: '1', date: $scope.today, anime: { 'title': 'Steins;Gate' }},{rank: '2', date: $scope.today, anime: { 'title': 'Kiseijuu' }},{rank: '3', date: $scope.today, anime: { 'title': 'Sidonia no Kishi' }},{rank: '4', date: $scope.today, anime: { 'title': 'Code Geass R2' }},{rank: '5', date: $scope.today, anime: { 'title': 'Kill la Kill' }}]; 
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
        
        $scope.updateAnimeFavouriteOne = function() {
            if ($scope.favouriteOne) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '1') {
                        favouriteAnimeitem.anime = $scope.favouriteOne;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
            } 
        };
        $scope.updateAnimeFavouriteTwo = function() {
            if ($scope.favouriteTwo) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '2') {
                        favouriteAnimeitem.anime = $scope.favouriteTwo;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
            } 
        };
        $scope.updateAnimeFavouriteThree = function() {
            if ($scope.favouriteThree) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '3') {
                        favouriteAnimeitem.anime = $scope.favouriteThree;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
            } 
        };
        $scope.updateAnimeFavouriteFour = function() {
            if ($scope.favouriteFour) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '4') {
                        favouriteAnimeitem.anime = $scope.favouriteFour;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
            } 
        };
        $scope.updateAnimeFavouriteFive = function() {
            if ($scope.favouriteFive) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '5') {
                        favouriteAnimeitem.anime = $scope.favouriteFive;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
            } 
        };
    
    }
]);