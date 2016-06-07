(function() {
	'use strict';
	angular.module('animeitems')
	.factory('Animeitems', AnimeitemsFactory);
	AnimeitemsFactory.$inject = ['$resource'];

		function AnimeitemsFactory($resource) {
			return $resource('animeitems/:animeitemId', { animeitemId: '@_id' }, { update: { method: 'PUT' } });
		}

})();
