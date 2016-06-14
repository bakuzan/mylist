
(function() {
	'use strict';
	angular.module('core').controller('HeaderController', HeaderController);
	HeaderController.$inject = ['$scope', 'Authentication', 'Menus', '$state', '$location', '$mdSidenav', '$mdUtil'];

	function HeaderController($scope, Authentication, Menus, $state, $location, $mdSidenav, $mdUtil) {
		var ctrl = this;

		ctrl.authentication = Authentication;
		ctrl.changeTheme = changeTheme;
		ctrl.home = home;
		ctrl.isActive = isActive;
		ctrl.isCollapsed = false;
		ctrl.isTimedTheme = localStorage.getItem('timedTheme');
		ctrl.menu = Menus.getMenu('topbar');
		console.log('menu: ', ctrl.menu);
		ctrl.saved = localStorage.getItem('theme');
		ctrl.signout = signout;
		ctrl.styles = [
        { name: 'Day', url: 'dist/main-day.css' },
        { name: 'Night', url: 'dist/main-night.css' }
    ];
		ctrl.theme = (localStorage.getItem('theme')!==null) ? JSON.parse(ctrl.saved) : ctrl.styles[1].url;
		ctrl.timedTheme = (localStorage.getItem('timedTheme')!==null) ? JSON.parse(ctrl.isTimedTheme) : false;
		ctrl.toggleLeft = buildToggler('left');
		localStorage.setItem('theme', JSON.stringify(ctrl.theme));
  	localStorage.setItem('timedTheme', JSON.stringify(ctrl.timedTheme));

		function home() {
			$state.go('listTasks');
		}

		function signout() {
			$location.path('/auth/signout');
		}

		/**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
        if($state.current.name !== 'login') {
            var debounceFn = $mdUtil.debounce(function () {
                $mdSidenav(navID)
                  .toggle()
                  .then(function () {
                //$log.debug('toggle ' + navID + ' is done');
            });
            }, 300);
            return debounceFn;
        }
    }

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			ctrl.isCollapsed = false;
		});

    function isActive(viewLocation) {
        return viewLocation === $state.current.url;
    }

    function changeTheme() {
        localStorage.setItem('timedTheme', JSON.stringify(ctrl.timedTheme));
        var timeOfDayTheme = localStorage.getItem('timedTheme');
        if (timeOfDayTheme === 'false') {
            localStorage.setItem('theme', JSON.stringify(ctrl.theme));
        } else {
            var time = new Date().getHours();
            if (time > 20 || time < 8) {
                localStorage.setItem('theme', JSON.stringify(ctrl.styles[1].url));
            } else if (time > 8) {
                localStorage.setItem('theme', JSON.stringify(ctrl.styles[0].url));
            }
        }
        var storedValue = localStorage.getItem('theme'),
        link = document.getElementById('app-theme');
        link.href = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason.
        ctrl.theme = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason. //set the dropdown to the correct value;
    }

	}
})();
