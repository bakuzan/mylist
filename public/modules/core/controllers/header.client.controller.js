
(function() {
	'use strict';
	angular.module('core').controller('HeaderController', HeaderController);
	HeaderController.$inject = ['$scope', 'Authentication', 'Menus', '$state', '$location', '$mdSidenav', '$mdUtil'];

	function HeaderController($scope, Authentication, Menus, $state, $location, $mdSidenav, $mdUtil) {
		var ctrl = this;

		ctrl.applicationThemes = [{ n: 'day', v: 'day-time' }, { n: 'night', v: 'night-time' }];
		ctrl.authentication = Authentication;
		ctrl.changeTheme = changeTheme;
		ctrl.home = home;
		ctrl.isActive = isActive;
		ctrl.isCollapsed = false;
		ctrl.isTimedTheme = localStorage.getItem('timedTheme');
		ctrl.menu = Menus.getMenu('topbar');
		console.log('menu: ', ctrl.menu);
		ctrl.saved = localStorage.getItem('theme');
		ctrl.styles = [
        { n: 'Day', v: 'dist/main-day.css' },
        { n: 'Night', v: 'dist/main-night.css' }
    ];
		ctrl.theme = ctrl.applicationThemes[0].v;
		ctrl.toggleLeft = buildToggler('left');

		function home() {
			$state.go('listTasks');
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
			console.log('new theme: ', ctrl.theme);
    }

	}

})();
