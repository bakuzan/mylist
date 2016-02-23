'use strict';

// Configuring the Articles module
angular.module('toptens').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Toptens', 'toptens', 'dropdown', '/toptens(/create)?');
		Menus.addSubMenuItem('topbar', 'toptens', 'List Toptens', 'toptens');
		Menus.addSubMenuItem('topbar', 'toptens', 'New Topten', 'toptens/create');
	}
]);