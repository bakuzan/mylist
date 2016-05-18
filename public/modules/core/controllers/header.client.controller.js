'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$location',
	function($scope, Authentication, Menus, $location) {
		$scope.authentication = Authentication;
		// If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
		
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
        $scope.theme = (localStorage.getItem('theme')!==null) ? JSON.parse($scope.saved) : 'dist/main-night.min.css';
        localStorage.setItem('theme', JSON.stringify($scope.theme));

        $scope.isTimedTheme = localStorage.getItem('timedTheme');
        $scope.timedTheme = (localStorage.getItem('timedTheme')!==null) ? JSON.parse($scope.isTimedTheme) : false;
        localStorage.setItem('timedTheme', JSON.stringify($scope.timedTheme));

        //user-selected style options/defaults.
        $scope.styles = [
//            { name: 'Blue', url: 'dist/main.min.css' },
//            { name: 'Red', url: 'dist/main-red.min.css' },
//            { name: 'Purple', url: 'dist/main-purple.min.css' },
            { name: 'Day', url: 'dist/main-day.min.css' },
            { name: 'Night', url: 'dist/main-night.min.css' }
        ];

        $scope.changeTheme = function() {
            localStorage.setItem('timedTheme', JSON.stringify($scope.timedTheme));
            var timeOfDayTheme = localStorage.getItem('timedTheme');
            if (timeOfDayTheme === 'false') {
                localStorage.setItem('theme', JSON.stringify($scope.theme));
            } else {
                var time = new Date().getHours();
                if (time > 20 || time < 8) {
                    localStorage.setItem('theme', JSON.stringify('dist/main-night.min.css'));
//                } else if (time > 17) {
//                    localStorage.setItem('theme', JSON.stringify('dist/main-purple.min.css'));
//                } else if (time > 9) {
//                    localStorage.setItem('theme', JSON.stringify('dist/main-day.min.css'));
                } else if (time > 8) {
                    localStorage.setItem('theme', JSON.stringify('dist/main-day.min.css'));
                }
            }
            var storedValue = localStorage.getItem('theme'),
            link = document.getElementById('app-theme');
            link.href = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason.
            $scope.theme = storedValue.substr(1, storedValue.lastIndexOf('\"') - 1); //remove quotes for whatever reason. //set the dropdown to the correct value;
        };

	}
]);
