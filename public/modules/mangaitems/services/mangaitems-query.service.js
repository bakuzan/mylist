(function() {
	'use strict';
	//Mangaitems service used to communicate Mangaitems REST endpoints
	angular.module('mangaitems')
	.factory('Mangaitems',  MangaitemsFactory);
	MangaitemsFactory.$inject = ['$resource'];

	function MangaitemsFactory($resource) {
		return $resource('mangaitems/:mangaitemId', { mangaitemId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}

})();
