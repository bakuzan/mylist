'use strict';

// Setting up route
angular.module('ratings').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('ratings', {
			url: '/ratings',
			templateUrl: 'modules/ratings/views/ratings.client.view.html'
		});
	}
]);