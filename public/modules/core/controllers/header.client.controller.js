'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$location',
	function($scope, Authentication, Menus, $location) {
		var ctrl = this;
		ctrl.authentication = Authentication;

		ctrl.isCollapsed = false;
		ctrl.menu = Menus.getMenu('topbar');

		ctrl.toggleCollapsibleMenu = function() {
			ctrl.isCollapsed = !ctrl.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			ctrl.isCollapsed = false;
		});

    ctrl.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    ctrl.saved = localStorage.getItem('theme');
    ctrl.theme = (localStorage.getItem('theme')!==null) ? JSON.parse(ctrl.saved) : 'dist/main-night.min.css';
    localStorage.setItem('theme', JSON.stringify(ctrl.theme));

    ctrl.isTimedTheme = localStorage.getItem('timedTheme');
    ctrl.timedTheme = (localStorage.getItem('timedTheme')!==null) ? JSON.parse(ctrl.isTimedTheme) : false;
    localStorage.setItem('timedTheme', JSON.stringify(ctrl.timedTheme));

    //user-selected style options/defaults.
    ctrl.styles = [
        { name: 'Day', url: 'dist/main-day.min.css' },
        { name: 'Night', url: 'dist/main-night.min.css' }
    ];

    ctrl.changeTheme = function() {
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
    };

	}
]);
