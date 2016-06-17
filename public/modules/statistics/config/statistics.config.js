(function() {
	'use strict';

	// Configuring the Articles module
	angular.module('statistics').run(['Menus',
		function(Menus) {
			// Set top bar menu items
			Menus.addMenuItem('topbar', 'Statistics', 'statistics');
		}
	]);

})();
