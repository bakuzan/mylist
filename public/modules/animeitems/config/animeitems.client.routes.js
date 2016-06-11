'use strict';

//Setting up route
angular.module('animeitems').config(['$stateProvider',
	function($stateProvider) {
		// Animeitems state routing
		$stateProvider.
        state('listAnimeitems', {
			url: '/animeitems',
			templateUrl: 'modules/animeitems/views/list-animeitems.client.view.html',
			controller: 'AnimeitemsController as ctrl'
		}).
		state('watchListAnimeitems', {
			url: '/animeitems/watch-list',
			templateUrl: 'modules/animeitems/views/list-animeitems.client.view.html',
			controller: 'WatchListController as ctrl'
		}).
		state('createAnimeitem', {
			url: '/animeitems/create',
			templateUrl: 'modules/animeitems/views/create-animeitem.client.view.html'
		}).
		state('viewAnimeitem', {
			url: '/animeitems/:animeitemId',
			templateUrl: 'modules/animeitems/views/view-animeitem.client.view.html'
		}).
		state('editAnimeitem', {
			url: '/animeitems/:animeitemId/edit',
			templateUrl: 'modules/animeitems/views/create-animeitem.client.view.html'
		}).
		state('watchAnimeitem', {
			url: '/animeitems/watch/:animeitemId',
			templateUrl: 'modules/animeitems/views/watch-animeitem.client.view.html'
		});
	}
]);
