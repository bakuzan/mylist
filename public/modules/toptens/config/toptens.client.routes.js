'use strict';

//Setting up route
angular.module('toptens').config(['$stateProvider',
	function($stateProvider) {
		// Toptens state routing
		$stateProvider.
		state('listToptens', {
			url: '/toptens',
			templateUrl: 'modules/toptens/views/list-toptens.client.view.html'
		}).
		state('createTopten', {
			url: '/toptens/create',
			templateUrl: 'modules/toptens/views/create-topten.client.view.html'
		}).
		state('viewTopten', {
			url: '/toptens/:toptenId',
			templateUrl: 'modules/toptens/views/view-topten.client.view.html'
		}).
		state('editTopten', {
			url: '/toptens/:toptenId/edit',
			templateUrl: 'modules/toptens/views/create-topten.client.view.html'
		});
	}
]);