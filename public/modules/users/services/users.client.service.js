(function() {
	'use strict';
	// Users service used for communicating with the users REST endpoint
	angular.module('users').factory('Users', UsersFactory);
	UsersFactory.$inject = ['$resource'];

	function UsersFactory($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}

})();
