(function() {
	'use strict';
	angular.module('orders').factory('Orders', OrdersFactory);
	OrdersFactory.$inject = ['$resource'];

	function OrdersFactory($resource) {
		return $resource('orders/:orderId', { orderId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}

})();
