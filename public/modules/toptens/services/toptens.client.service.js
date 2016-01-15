'use strict';

//Toptens service used to communicate Toptens REST endpoints
angular.module('toptens').factory('Toptens', ['$resource',
	function($resource) {
		return $resource('toptens/:toptenId', { toptenId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);