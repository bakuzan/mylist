(function() {
	'use strict';

	// Configuring the Articles module
	angular.module('history').run(['Menus',
		function(Menus) {
			// Set top bar menu items
			Menus.addMenuItem('topbar', 'History', 'history');
		}
	]);

})();
