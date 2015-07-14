'use strict';

// Setting up route
angular.module('history').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('history', {
			url: '/history',
			templateUrl: 'modules/history/views/history.client.view.html'
		});
	}
]);