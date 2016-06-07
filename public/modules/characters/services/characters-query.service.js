(function() {
	'use strict';
	angular.module('characters')
	.factory('Characters', CharacterFactory);
	 CharacterFactory.$inject = ['$resource'];

		function CharacterFactory($resource) {
			return $resource('characters/:characterId', { characterId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});
		}

})();
