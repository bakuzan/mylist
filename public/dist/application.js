'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mylist';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('animeitems');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('mangaitems');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');
'use strict';

// Configuring the Articles module
angular.module('animeitems').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Animeitems', 'animeitems', 'dropdown', '/animeitems(/create)?');
		Menus.addSubMenuItem('topbar', 'animeitems', 'List Animeitems', 'animeitems');
		Menus.addSubMenuItem('topbar', 'animeitems', 'New Animeitem', 'animeitems/create');
	}
]);
'use strict';

//Setting up route
angular.module('animeitems').config(['$stateProvider',
	function($stateProvider) {
		// Animeitems state routing
		$stateProvider.
		state('listAnimeitems', {
			url: '/animeitems',
			templateUrl: 'modules/animeitems/views/list-animeitems.client.view.html'
		}).
		state('createAnimeitem', {
			url: '/animeitems/create',
			templateUrl: 'modules/animeitems/views/create-animeitem.client.view.html'
		}).
		state('viewAnimeitem', {
			url: '/animeitems/:animeitemId',
			templateUrl: 'modules/animeitems/views/view-animeitem.client.view.html'
		}).
		state('editAnimeitem', {
			url: '/animeitems/:animeitemId/edit',
			templateUrl: 'modules/animeitems/views/edit-animeitem.client.view.html'
		});
	}
]);
'use strict';

// Animeitems controller
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems',  'fileUpload', '$sce',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce) {
		$scope.authentication = Authentication;
        
        $scope.sortType = 'latest'; //default sort type
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.maxRating = 10; //maximum rating
        $scope.imgPath = ''; //image path

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };

		// Create new Animeitem
		$scope.create = function() {
			// Create new Animeitem object
			var animeitem = new Animeitems ({
				title: this.title,
                episodes: this.episodes,
                start: this.start,
                latest: this.latest,
                finalEpisode: this.finalEpisode,
                disc: this.disc,
                user: this.user
			});

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);

				// Clear form fields
								// Clear form fields
				$scope.title = '';
                $scope.episodes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Animeitem
		$scope.remove = function(animeitem) {
			if ( animeitem ) { 
				animeitem.$remove();

				for (var i in $scope.animeitems) {
					if ($scope.animeitems [i] === animeitem) {
						$scope.animeitems.splice(i, 1);
					}
				}
			} else {
				$scope.animeitem.$remove(function() {
					$location.path('animeitems');
				});
			}
		};

		// Update existing Animeitem
		$scope.update = function() {
			var animeitem = $scope.animeitem;
            
            console.log($scope.imgPath);
            console.log(animeitem.image);
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                animeitem.image = $scope.imgPath;
            }
            console.log($scope.imgPath);
            console.log(animeitem.image);
            
            //handle status: completed.
            if(animeitem.end!==undefined) {
                animeitem.status = true;
            } else {
                animeitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (animeitem.reWatching===true && animeitem.episodes===animeitem.finalEpisode) {
                animeitem.reWatchCount += 1;
                animeitem.reWatching = false;
            }
            

			animeitem.$update(function() {
				$location.path('animeitems/' + animeitem._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Animeitems
		$scope.find = function() {
			$scope.animeitems = Animeitems.query();
            console.log($scope.animeitems);
		};

		// Find existing Animeitem
		$scope.findOne = function() {
			$scope.animeitem = Animeitems.get({ 
				animeitemId: $stateParams.animeitemId
			});
		};
        
        // Find list of mangaitems for dropdown.
        $scope.mangaDropdown = function() {
            $scope.mangaitems = Mangaitems.query();
        };
        
                //image upload
        $scope.uploadFile = function(){
            var file = $scope.myFile;
            $scope.imgPath = '/modules/animeitems/img/' + file.name;
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = '/fileUploadAnime';
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
	}
]);
'use strict';

angular.module('animeitems').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.directive('listBack', function(){
    return function(scope, element, attrs){
        var url = attrs.listBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '50%',
            'background-repeat': 'no-repeat',
            'background-position': 'right'
        });
    };
});

'use strict';

//Animeitems service used to communicate Animeitems REST endpoints
angular.module('animeitems').factory('Animeitems', ['$resource',
	function($resource) {
		return $resource('animeitems/:animeitemId', { animeitemId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            alert('File Uploaded!');
        })
        .error(function(err){
            alert('File Upload Failed: ' + err.message);
        });
    };
}]);
'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
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
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$window',
	function($scope, Authentication, $window) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
    $scope.today = new Date();
    $scope.saved = localStorage.getItem('taskItems');
    $scope.taskItem = (localStorage.getItem('taskItems')!==null) ? 
    JSON.parse($scope.saved) : [ {description: 'Why not add a task?', date: $scope.today, complete: false}];
    localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    
    $scope.newTask = null;
    $scope.newTaskDate = null;
    $scope.categories = [
        {name: 'Watch'},
        {name: 'Read'},
        {name: 'Play'},
        {name: 'Other'}
    ];
    $scope.newTaskCategory = $scope.categories;
    $scope.days = [
        {name: 'Any'},
        {name: 'Monday'},
        {name: 'Tuesday'},
        {name: 'Wednesday'},
        {name: 'Thursday'},
        {name: 'Friday'},
        {name: 'Saturday'},
        {name: 'Sunday'}
    ];
    $scope.newTaskDay = $scope.days;
        
    $scope.weekBeginning = function() {
        var day = $scope.today.getDay(),
        diff = $scope.today.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
        var wkBeg = new Date();
        return new Date(wkBeg.setDate(diff));
    };
        
    //check things
    $scope.checkStatus = function() {
        //var day = new Date('2015-04-27').getDay();
        var day = $scope.today.getDay();
        console.log(day);
        console.log($scope.taskItem);
        if (day===1) {
            var refreshItems = $scope.taskItem;
            $scope.taskItem = [];
            angular.forEach(refreshItems, function (taskItem) {
                    if(taskItem.updated===false) {
                        if(taskItem.completeTimes!==taskItem.repeat) {
                            taskItem.complete = false;
                            taskItem.updated = true;
                            $scope.taskItem.push(taskItem);
                            console.log('updated set to true');
                        }
                    } else {
                        $scope.taskItem.push(taskItem);
                        console.log('updated already true');
                    }
            });
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem)); 
        
        } else {
            var updated = $scope.taskItem;
            $scope.taskItem = [];
            angular.forEach(updated, function (taskItem) {
                    taskItem.updated = false;
                    $scope.taskItem.push(taskItem);
                });
            console.log('updated set to false');
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        }
    };
        
    $scope.addNew = function () {
        console.log($scope.newTaskDay.name);
        if ($scope.newTaskDay.name === null || $scope.newTaskDay.name === '' || $scope.newTaskDay.name === undefined) {
            $scope.newTaskDay.name = 'Any';
        }
        if ($scope.newTaskCategory.name === null || $scope.newTaskCategory.name === '' || $scope.newTaskCategory.name === undefined) {
            $scope.newTaskCategory.name = 'Other';
        }
            $scope.taskItem.push({
                description: $scope.newTask,
                day: $scope.newTaskDay.name,
                repeat: $scope.newTaskRepeat,
                completeTimes: 0,
                updated: false,
                complete: false,
                category: $scope.newTaskCategory.name
            });
        
        $scope.newTask = '';
        $scope.newTaskDay = $scope.days;
        $scope.newTaskCategory = $scope.categories;
        $scope.newTaskRepeat = '';
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };
    $scope.deleteTask = function  (index) {
        var removal = $window.confirm('Are you sure you want to delete this task?');
        if (removal) {
            $scope.taskItem.splice(index, 1);
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        }
    };
    
    $scope.save = function (description) {
        //update the complete task.
        angular.forEach($scope.taskItem, function (taskItem) {
            if (taskItem.description === description && taskItem.complete === true) {
                taskItem.completeTimes += 1;
            }
        });
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };
        
    $scope.remaining = function() {
        var count = 0;
        angular.forEach($scope.taskItem, function(taskItem) {
            count += taskItem.complete ? 0 : 1;
        });
        return count;
  };
        
        
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Articles module
angular.module('mangaitems').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Mangaitems', 'mangaitems', 'dropdown', '/mangaitems(/create)?');
		Menus.addSubMenuItem('topbar', 'mangaitems', 'List Mangaitems', 'mangaitems');
		Menus.addSubMenuItem('topbar', 'mangaitems', 'New Mangaitem', 'mangaitems/create');
	}
]);
'use strict';

//Setting up route
angular.module('mangaitems').config(['$stateProvider',
	function($stateProvider) {
		// Mangaitems state routing
		$stateProvider.
		state('listMangaitems', {
			url: '/mangaitems',
			templateUrl: 'modules/mangaitems/views/list-mangaitems.client.view.html'
		}).
		state('createMangaitem', {
			url: '/mangaitems/create',
			templateUrl: 'modules/mangaitems/views/create-mangaitem.client.view.html'
		}).
		state('viewMangaitem', {
			url: '/mangaitems/:mangaitemId',
			templateUrl: 'modules/mangaitems/views/view-mangaitem.client.view.html'
		}).
		state('editMangaitem', {
			url: '/mangaitems/:mangaitemId/edit',
			templateUrl: 'modules/mangaitems/views/edit-mangaitem.client.view.html'
		});
	}
]);
'use strict';

// Mangaitems controller
angular.module('mangaitems').controller('MangaitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'fileUpload', '$sce',
	function($scope, $stateParams, $location, Authentication, Mangaitems, fileUpload, $sce) {
		$scope.authentication = Authentication;
        
        
        $scope.sortType = 'latest'; //default sort type
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.maxRating = 10; //maximum rating
        $scope.imgExtension = ''; //image path extension.
        $scope.imgPath = ''; //image path

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        // Create new Mangaitem
		$scope.create = function() {
			// Create new Mangaitem object
			var mangaitem = new Mangaitems ({
				title: this.title,
                chapters: this.chapters,
                volumes: this.volumes,
                start: this.start,
                latest: this.latest,
                finalChapter: this.finalChapter,
                finalVolume: this.finalVolume,
                hardcopy: this.hardcopy,
                user: this.user
			});

			// Redirect after save
			mangaitem.$save(function(response) {
				$location.path('/mangaitems/' + response._id);

				// Clear form fields
				$scope.title = '';
                $scope.chapters = '';
                $scope.volumes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Mangaitem
		$scope.remove = function(mangaitem) {
			if ( mangaitem ) { 
				mangaitem.$remove();

				for (var i in $scope.mangaitems) {
					if ($scope.mangaitems [i] === mangaitem) {
						$scope.mangaitems.splice(i, 1);
					}
				}
			} else {
				$scope.mangaitem.$remove(function() {
					$location.path('/mangaitems');
				});
			}
		};

		// Update existing Mangaitem
		$scope.update = function() {
			var mangaitem = $scope.mangaitem;
            
            console.log($scope.imgPath);
            console.log(mangaitem.image);
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                mangaitem.image = $scope.imgPath;
            }
            console.log($scope.imgPath);
            console.log(mangaitem.image);
            
            //handle status: completed.
            if(mangaitem.end!==undefined) {
                mangaitem.status = true;
            } else {
                mangaitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (mangaitem.reReading===true && mangaitem.chapters===mangaitem.finalChapter && mangaitem.volumes===mangaitem.finalVolume) {
                mangaitem.reReadCount += 1;
                mangaitem.reReading = false;
            }
                    

			mangaitem.$update(function() {
				$location.path('/mangaitems/' + mangaitem._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
            
		};

		// Find a list of Mangaitems
		$scope.find = function() {
			$scope.mangaitems = Mangaitems.query();
            console.log($scope.mangaitems);
		};

		// Find existing Mangaitem
		$scope.findOne = function() {
			$scope.mangaitem = Mangaitems.get({ 
				mangaitemId: $stateParams.mangaitemId
			});
            console.log($scope.mangaitem);
		};
        
        //image upload
        $scope.uploadFile = function(){
            var file = $scope.myFile;
            $scope.imgPath = '/modules/mangaitems/img/' + file.name;
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = '/fileUpload';
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
        
        /*set image path
        $scope.imagePath = function(file) {
            //var titleLower = file.toLowerCase();
            //console.log(titleLower);
            //var tmpName = titleLower.replace(/ /g, '-');
            //console.log(tmpName);
            $scope.imgPath = '/modules/mangaitems/img/' + file; //c:/mylist/whispering-lowlands-3953/public
        };
        */
	}
]);

'use strict';

angular.module('mangaitems').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.directive('listBack', function(){
    return function(scope, element, attrs){
        var url = attrs.listBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '50%',
            'background-repeat': 'no-repeat',
            'background-position': 'right'
        });
    };
});

'use strict';

//Mangaitems service used to communicate Mangaitems REST endpoints
angular.module('mangaitems').factory('Mangaitems', ['$resource',
	function($resource) {
		return $resource('mangaitems/:mangaitemId', { mangaitemId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            alert('File Uploaded!');
        })
        .error(function(err){
            alert('File Upload Failed: ' + err.message);
        });
    };
}]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invalid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/mangaitems');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/signin');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
            //console.log($scope.credentials);
            $scope.credentials.username = 'username';
            //console.log($scope.credentials);
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;
                $scope.loginBody = true;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [
	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);