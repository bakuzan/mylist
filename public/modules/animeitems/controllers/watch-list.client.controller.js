(function() {
	'use strict';
	angular.module('animeitems')
	.controller('WatchListController', WatchListController);
	WatchListController.$inject = ['$scope', 'Authentication', '$stateParams', '$timeout', 'Animeitems', '$sce', 'spinnerService', 'WatchAnime'];

	function WatchListController($scope, Authentication, $stateParams, $timeout, Animeitems, $sce, spinnerService, WatchAnime) {
				var ctrl = this,
						saved = localStorage.getItem('watched');

        ctrl.authentication = Authentication;
				ctrl.find = find;

        // Find a list of Animeitems
        function find() {
            spinnerService.loading('anime', WatchAnime.query().$promise.then(function(result) {
    					ctrl.animeitems = result;
    				}));
        }
        ctrl.find();

	}

})();
