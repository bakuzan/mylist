(function() {
	'use strict';
	angular.module('animeitems')
	.factory('WatchAnime', WatchAnime);
	WatchAnime.$inject = ['$resource'];

		function WatchAnime($resource) {
			return $resource('animeitems/watch', {  }, { update: { method: 'PUT' } });
		}

})();
