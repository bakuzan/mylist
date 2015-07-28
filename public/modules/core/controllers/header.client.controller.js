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
        $scope.theme = (localStorage.getItem('theme')!==null) ? JSON.parse($scope.saved) : 'main.css';
        localStorage.setItem('theme', JSON.stringify($scope.theme));
        
        //user-selected style options/defaults.
        $scope.styles = [
            { name: 'Blue', url: 'main.css' },
            { name: 'Red', url: 'main-red.css' },
            { name: 'Purple', url: 'main-purple.css' }
        ];
        
        $scope.changeTheme = function() {
            localStorage.setItem('theme', JSON.stringify($scope.theme));            
        };
        
	}
]);