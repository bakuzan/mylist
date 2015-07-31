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
        
        $scope.isTimedTheme = localStorage.getItem('timedTheme');
        $scope.timedTheme = (localStorage.getItem('timedTheme')!==null) ? JSON.parse($scope.isTimedTheme) : false;
        localStorage.setItem('timedTheme', JSON.stringify($scope.timedTheme));
        
        //user-selected style options/defaults.
        $scope.styles = [
            { name: 'Blue', url: 'style/main.min.css' },
            { name: 'Red', url: 'style/main-red.min.css' },
            { name: 'Purple', url: 'style/main-purple.min.css' },
            { name: 'Day', url: 'style/main-day.min.css' },
            { name: 'Night', url: 'style/main-night.min.css' }
        ];
        
        $scope.changeTheme = function() {
            localStorage.setItem('timedTheme', JSON.stringify($scope.timedTheme));
            var timeOfDayTheme = localStorage.getItem('timedTheme');
            if (timeOfDayTheme === 'false') {
                localStorage.setItem('theme', JSON.stringify($scope.theme));
            } else {
                var time = new Date().getHours();
                if (time > 20 || time < 6) {
                    localStorage.setItem('theme', JSON.stringify('style/main-night.min.css'));
                } else if (time > 17) {
                    localStorage.setItem('theme', JSON.stringify('style/main-purple.min.css'));
                } else if (time > 9) {
                    localStorage.setItem('theme', JSON.stringify('style/main-day.min.css'));
                } else if (time > 6) {
                    localStorage.setItem('theme', JSON.stringify('style/main.min.css'));
                }
            }
            var storedValue = localStorage.getItem('theme'),
            link = document.getElementById('app-theme');
            link.href = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason.
            $scope.theme = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason. //set the dropdown to the correct value;
        };
        
	}
]);