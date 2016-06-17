(function() {
	'use strict';

	// Configuring the Articles module
	angular.module('animeitems').run(['Menus',
		function(Menus) {
			// Set top bar menu items
			Menus.addMenuItem('topbar', 'Animeitems', 'animeitems', 'dropdown');
			Menus.addSubMenuItem('topbar', 'animeitems', 'List Animeitems', 'listAnimeitems');
			Menus.addSubMenuItem('topbar', 'animeitems', 'Watch Animeitems', 'watchListAnimeitems');
			Menus.addSubMenuItem('topbar', 'animeitems', 'New Animeitem', 'createAnimeitem');
		}
	]);
	
})();
