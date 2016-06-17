(function() {
	'use strict';

	// Configuring the Articles module
	angular.module('orders').run(['Menus',
		function(Menus) {
			// Set top bar menu items
			Menus.addMenuItem('topbar', 'Orders', 'orders', 'dropdown', '/orders(/create)?');
			Menus.addSubMenuItem('topbar', 'orders', 'List Orders', 'listOrders');
			Menus.addSubMenuItem('topbar', 'orders', 'New Order', 'createOrder');
		}
	]);

})();
