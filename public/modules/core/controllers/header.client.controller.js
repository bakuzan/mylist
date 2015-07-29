'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$location',
	function($scope, Authentication, Menus, $location) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
        
        $scope.isActive = function (viewLocation) { 
            return viewLocation === $location.path();
        };
        
        $scope.saved = localStorage.getItem('theme');
        $scope.theme = (localStorage.getItem('theme')!==null) ? JSON.parse($scope.saved) : 'style/main.min.css';
        localStorage.setItem('theme', JSON.stringify($scope.theme));
        
        //user-selected style options/defaults.
        $scope.styles = [
            { name: 'Blue', url: 'style/main.min.css' },
            { name: 'Red', url: 'style/main-red.min.css' },
            { name: 'Purple', url: 'style/main-purple.min.css' },
            { name: 'Day', url: 'style/main-day.min.css' },
            { name: 'Night', url: 'style/main-night.min.css' }
        ];
        
        $scope.changeTheme = function() {
            localStorage.setItem('theme', JSON.stringify($scope.theme));
            var storedValue = localStorage.getItem('theme'),
                link = document.getElementById('app-theme');
                link.href = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason.
        };
        
	}
]);