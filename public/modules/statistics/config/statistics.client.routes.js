'use strict';

// Setting up route
angular.module('statistics').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('statistics', {
			url: '/statistics',
			templateUrl: 'modules/statistics/views/statistics.client.view.html'
		});
	}
]);