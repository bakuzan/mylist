'use strict';


angular.module('favourites').controller('FavouritesController', ['$scope', 'Authentication', '$window', '$sce', 'Animeitems', 'Mangaitems', '$location', 'NotificationFactory',
	function($scope, Authentication, $window, $sce, Animeitems, Mangaitems, $location, NotificationFactory) {
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
        
        function favouriteLimitReached() {
            NotificationFactory.popup('Favourite limit reached!', 'Only allowed 5 favourites. \nPlease remove one if you wish to add another.', 'error');
        }
        
        /**
         *  Add, reorder, remove FAVOURITES
         */
        $scope.addFavourite = function(type) {
            if (type === 'anime') {
                if ($scope.favouriteAnimeitem.length < 5) {
                    $scope.favouriteAnimeitem.push({ date: $scope.today, anime: $scope.favourite });
                    localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                    $scope.favourite = '';
                } else {
                    favouriteLimitReached();
                }
            } else if (type === 'manga') {
                if ($scope.favouriteMangaitem.length < 5) {
                    $scope.favouriteMangaitem.push({ date: $scope.today, manga: $scope.favourite });
                    localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                    $scope.favourite = '';
                } else {
                    favouriteLimitReached();
                }
            }
        };
        
        $scope.removeFavourite = function(kill) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                var deletingItem;
                if (kill.anime !== undefined) {
                    deletingItem = $scope.favouriteAnimeitem;
                    $scope.favouriteAnimeitem = [];
                    //update the complete task.
                    angular.forEach(deletingItem, function (item) {
                        if (item !== kill) {
                            $scope.favouriteAnimeitem.push(item);
                        }
                    });
                    localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                    $scope.$apply();
                    NotificationFactory.warning('Deleted!', 'Favourite was successfully deleted');
                } else if (kill.manga !== undefined) {
                    deletingItem = $scope.favouriteMangaitem;
                    $scope.favouriteMangaitem = [];
                    //update the complete task.
                    angular.forEach(deletingItem, function (item) {
                        if (item !== kill) {
                            $scope.favouriteMangaitem.push(item);
                        }
                    });
                    localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                    $scope.$apply();
                    NotificationFactory.warning('Deleted!', 'Favourite was successfully deleted');
                }
            });
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
                    var ind1, ind2, hold;
                    if ($scope.selectedFavourite.anime!==undefined) {
//                        console.log('change places');
                        ind1 = $scope.favouriteAnimeitem.indexOf($scope.selectedFavourite);
                        ind2 = $scope.favouriteAnimeitem.indexOf($scope.selectedFavouriteTwo);
                        hold = $scope.favouriteAnimeitem[ind1];
                        $scope.favouriteAnimeitem[ind1] = $scope.favouriteAnimeitem[ind2];
                        $scope.favouriteAnimeitem[ind2] = hold;
                        
//                        console.log($scope.favouriteAnimeitem);
                        localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                        NotificationFactory.success('Moved!', 'Favourite was successfully moved');
                        $scope.selectedFavourite = undefined;
                        $scope.selectedFavouriteTwo = undefined;
                    } else if ($scope.selectedFavourite.manga!==undefined) {
//                        console.log('change places');
                        ind1 = $scope.favouriteMangaitem.indexOf($scope.selectedFavourite);
                        ind2 = $scope.favouriteMangaitem.indexOf($scope.selectedFavouriteTwo);
                        hold = $scope.favouriteMangaitem[ind1];
                        $scope.favouriteMangaitem[ind1] = $scope.favouriteMangaitem[ind2];
                        $scope.favouriteMangaitem[ind2] = hold;
                        
//                        console.log($scope.favouriteMangaitem);
                        localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                        NotificationFactory.success('Moved!', 'Favourite was successfully moved');
                        $scope.selectedFavourite = undefined;
                        $scope.selectedFavouriteTwo = undefined;
                    }
                }
            }
        };
    }
]);