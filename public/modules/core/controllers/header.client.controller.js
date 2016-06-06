
(function() {
	'use strict';
	angular.module('core').controller('HeaderController', HeaderController);
	HeaderController.$inject = ['$scope', 'Authentication', 'Menus', '$location'];

	function HeaderController($scope, Authentication, Menus, $location) {
		var ctrl = this;

		ctrl.authentication = Authentication;
		ctrl.isActive = isActive;
		ctrl.isCollapsed = false;
		ctrl.isTimedTheme = localStorage.getItem('timedTheme');
		ctrl.menu = Menus.getMenu('topbar');
		ctrl.saved = localStorage.getItem('theme');
		ctrl.styles = [
        { name: 'Day', url: 'dist/main-day.min.css' },
        { name: 'Night', url: 'dist/main-night.min.css' }
    ];
		ctrl.theme = (localStorage.getItem('theme')!==null) ? JSON.parse(ctrl.saved) : 'dist/main-night.min.css';
		ctrl.timedTheme = (localStorage.getItem('timedTheme')!==null) ? JSON.parse(ctrl.isTimedTheme) : false;
		ctrl.toggleCollapsibleMenu = toggleCollapsibleMenu;

		localStorage.setItem('theme', JSON.stringify(ctrl.theme));
  	localStorage.setItem('timedTheme', JSON.stringify(ctrl.timedTheme));

		function toggleCollapsibleMenu() {
			ctrl.isCollapsed = !ctrl.isCollapsed;
		}

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			ctrl.isCollapsed = false;
		});

    function isActive(viewLocation) {
        return viewLocation === $location.path();
    }

    function changeTheme() {
        localStorage.setItem('timedTheme', JSON.stringify(ctrl.timedTheme));
        var timeOfDayTheme = localStorage.getItem('timedTheme');
        if (timeOfDayTheme === 'false') {
            localStorage.setItem('theme', JSON.stringify(ctrl.theme));
        } else {
            var time = new Date().getHours();
            if (time > 20 || time < 8) {
                localStorage.setItem('theme', JSON.stringify('dist/main-night.min.css'));
            } else if (time > 8) {
                localStorage.setItem('theme', JSON.stringify('dist/main-day.min.css'));
            }
        }
        var storedValue = localStorage.getItem('theme'),
        link = document.getElementById('app-theme');
        link.href = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason.
        ctrl.theme = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason. //set the dropdown to the correct value;
    }

	}
})();
