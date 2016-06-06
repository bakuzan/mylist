(function() {
	'use strict';
	//Tasks service used to communicate Tasks REST endpoints
	angular.module('tasks').factory('Tasks', Tasks);
	Tasks.$inject = ['$resource'];

		function Tasks($resource) {
			return $resource('tasks/:taskId', { taskId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});
		}

})();
