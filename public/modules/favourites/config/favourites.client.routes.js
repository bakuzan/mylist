'use strict';

// Setting up route
angular.module('favourites').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('favourites', {
			url: '/favourites',
			templateUrl: 'modules/favourites/views/favourites.client.view.html'
		})
        .state('animeFavourites', {
			url: '/animefavourites',
			templateUrl: 'modules/favourites/views/anime-favourites.client.view.html'
		})
        .state('mangaFavourites', {
			url: '/mangafavourites',
			templateUrl: 'modules/favourites/views/manga-favourites.client.view.html'
		})
        .state('characterFavourites', {
			url: '/characterfavourites',
			templateUrl: 'modules/favourites/views/character-favourites.client.view.html'
		});
	}
]);