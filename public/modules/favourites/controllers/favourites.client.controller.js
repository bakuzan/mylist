'use strict';


angular.module('favourites').controller('FavouritesController', ['$scope', 'Authentication', '$window', '$sce', 'Animeitems', 'Mangaitems', '$location',
	function($scope, Authentication, $window, $sce, Animeitems, Mangaitems, $location) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.today = new Date().toISOString();
        //Anime Favourites
        $scope.saved = localStorage.getItem('favouriteAnimeitems'); 
        $scope.favouriteAnimeitem = (localStorage.getItem('favouriteAnimeitems')!==null) ? 
        JSON.parse($scope.saved) : [{rank: '1', date: $scope.today, anime: { 'title': 'Favourite Anime 1' }},{rank: '2', date: $scope.today, anime: { 'title': 'Favourite Anime 2' }},{rank: '3', date: $scope.today, anime: { 'title': 'Favourite Anime 3' }},{rank: '4', date: $scope.today, anime: { 'title': 'Favourite Anime 4' }},{rank: '5', date: $scope.today, anime: { 'title': 'Favourite Anime 5' }}]; 
        localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
        
        //Manga Favourites
        $scope.saved = localStorage.getItem('favouriteMangaitems'); 
        $scope.favouriteMangaitem = (localStorage.getItem('favouriteMangaitems')!==null) ? 
        JSON.parse($scope.saved) : [{rank: '1', date: $scope.today, manga: { 'title': 'Favourite Manga 1' }},{rank: '2', date: $scope.today, manga: { 'title': 'Favourite Manga 2' }},{rank: '3', date: $scope.today, manga: { 'title': 'Favourite Manga 3' }},{rank: '4', date: $scope.today, manga: { 'title': 'Favourite Manga 4' }},{rank: '5', date: $scope.today, manga: { 'title': 'Favourite Manga 5' }}]; 
        localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        // Find a list of Anime
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
            //console.log($scope.characters);
		};
        
        // Find a list of Manga
		$scope.findManga = function() {
			$scope.mangaitems = Mangaitems.query();
            //console.log($scope.characters);
		};
        
        /**
         *  UPDATE ANIME FAVOURITES
         */
        $scope.updateAnimeFavouriteOne = function() {
            if ($scope.favouriteOne) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '1') {
                        favouriteAnimeitem.anime = $scope.favouriteOne;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                $scope.favouriteOne = '';
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
                $scope.favouriteTwo = '';
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
                $scope.favouriteThree = '';
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
                $scope.favouriteFour = '';
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
                $scope.favouriteFive = '';
            } 
        };
        
        /**
         *  UPDATE MANGA FAVOURITES
         */
        $scope.updateMangaFavouriteOne = function() {
            if ($scope.favouriteMangaOne) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '1') {
                        favouriteMangaitem.manga = $scope.favouriteMangaOne;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaOne = '';
            } 
        };
        $scope.updateMangaFavouriteTwo = function() {
            if ($scope.favouriteMangaTwo) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '2') {
                        favouriteMangaitem.manga = $scope.favouriteMangaTwo;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaTwo = '';
            } 
        };
        $scope.updateMangaFavouriteThree = function() {
            if ($scope.favouriteMangaThree) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '3') {
                        favouriteMangaitem.manga = $scope.favouriteMangaThree;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaThree = '';
            } 
        };
        $scope.updateMangaFavouriteFour = function() {
            if ($scope.favouriteMangaFour) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '4') {
                        favouriteMangaitem.manga = $scope.favouriteMangaFour;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaFour = '';
            } 
        };
        $scope.updateMangaFavouriteFive = function() {
            if ($scope.favouriteMangaFive) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '5') {
                        favouriteMangaitem.manga = $scope.favouriteMangaFive;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaFive = '';
            } 
        };
        
        $scope.reorderFavourites = function(favourite) {
//            console.log(favourite);
            if ($scope.selectedFavourite===favourite) {
                $scope.selectedFavourite = undefined;
                $scope.selectedFavouriteTwo = undefined;
            } else {
                if ($scope.selectedFavourite===undefined) {
                    $scope.selectedFavourite = favourite;
                } else {
                    $scope.selectedFavouriteTwo = favourite;
                    var temprank1 = $scope.selectedFavourite.rank;
                    var temprank2 = $scope.selectedFavouriteTwo.rank;
                    
                    if ($scope.selectedFavourite.anime!==undefined) {
//                        console.log('change places');
                        angular.forEach($scope.favouriteAnimeitem, function(favouriteAnimeitem) {
                            if (favouriteAnimeitem.anime.title===$scope.selectedFavourite.anime.title) {
                                favouriteAnimeitem.rank = temprank2;
                            } else if (favouriteAnimeitem.anime.title===$scope.selectedFavouriteTwo.anime.title) {
                                favouriteAnimeitem.rank = temprank1;
                            }
//                            console.log('final=' + favouriteAnimeitem.anime.title + ' - ' + favouriteAnimeitem.rank);
                        });
//                        console.log($scope.favouriteAnimeitem);
                        localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                        $scope.selectedFavourite = undefined;
                        $scope.selectedFavouriteTwo = undefined;
                    } else if ($scope.selectedFavourite.manga!==undefined) {
//                        console.log('change places');
                        angular.forEach($scope.favouriteMangaitem, function(favouriteMangaitem) {
                            if (favouriteMangaitem.manga.title===$scope.selectedFavourite.manga.title) {
                                favouriteMangaitem.rank = temprank2;
                            } else if (favouriteMangaitem.manga.title===$scope.selectedFavouriteTwo.manga.title) {
                                favouriteMangaitem.rank = temprank1;
                            }
//                            console.log('final=' + favouriteMangaitem.manga.title + ' - ' + favouriteMangaitem.rank);
                        });
//                        console.log($scope.favouriteMangaitem);
                        localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                        $scope.selectedFavourite = undefined;
                        $scope.selectedFavouriteTwo = undefined;
                    }
                }
            }
        };
    }
]);