(function() {
	'use strict';
	//Toptens service used to communicate Toptens REST endpoints
	angular.module('toptens').factory('Toptens', ToptensFactory);
	ToptensFactory.$inject = ['$resource'];

		function ToptensFactory($resource) {
			return $resource('toptens/:toptenId', { toptenId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});
		}
		
})();
