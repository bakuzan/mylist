'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'mylist';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'angularMoment'];

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

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('characters');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('favourites');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('history');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('mangaitems');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('orders');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('ratings');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('statistics');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('tasks');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('toptens');
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
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        $scope.whichController = 'animeitem';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            ongoingList: true,
            showingCount: 0,
            expandFilters: false,
            sortType: '',
            sortReverse: true,
            ratingLevel: undefined,
            ratingActions: {
                maxRating: 10,
                percent: undefined,
                overStar: null
            },
            search: {},
            searchTags: '',
            tagsForFilter: [],
            taglessItem: false,
            areTagless: false,
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            statTags: [],
            commonArrays: ListService.getCommonArrays()
        };

        /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
         *      AND episode/start/latest auto-pop in create.
         */
        $scope.itemUpdate = new Date();
        $scope.start = $scope.itemUpdate;
        $scope.latest = $scope.itemUpdate;
        $scope.episodes = 0;
        $scope.viewItemHistory = false; //default stat of item history popout.
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };

        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };

        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
//                console.log($scope.animeitems);
                $scope.filterConfig.areTagless = ListService.checkForTagless($scope.animeitems);
                $scope.filterConfig.statTags = ItemService.buildStatTags($scope.animeitems, 0);
            }
//            console.log($scope.animeitems);
        });

		// Create new Animeitem
		$scope.create = function() {
			// Create new Animeitem object
            var animeitem = new Animeitems();
            animeitem = new Animeitems ({
                title: this.title,
                episodes: this.episodes,
                start: this.start,
                latest: this.latest,
                finalEpisode: this.finalEpisode,
                season: this.season === true ? ItemService.convertDateToSeason(new Date(this.start)) : '',
                disc: this.disc,
                manga: this.manga!==undefined && this.manga!==null ? this.manga._id : this.manga,
                tags: $scope.tagArray,
                user: this.user
             });

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems/' + response._id);
                NotificationFactory.success('Saved!', 'Anime was saved successfully');
				// Clear form fields
				$scope.title = '';
                $scope.episodes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Animeitem
		$scope.remove = function(animeitem) {
             //are you sure option...
            NotificationFactory.confirmation(function() {
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
                NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
            });
		};

		// Update existing Animeitem
		$scope.update = function() {
			var animeitem = $scope.animeitem;
            $scope.animeitem = undefined;
            AnimeFactory.update(animeitem, $scope.tagArray, $scope.updateHistory, $scope.imgPath);
		};
        $scope.tickOff = function(item) {
            item.episodes += 1;
            item.latest = new Date(); //update latest.
            $scope.updateHistory = true; //add to history.
            $scope.animeitem = item;
            $scope.update();
        };

        // Find a list of Animeitems
        $scope.find = function() {
            $scope.animeitems = Animeitems.query();
        };

		// Find existing Animeitem
		$scope.findOne = function() {
            Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
                $scope.animeitem = result;
//            console.log($scope.animeitem);
            });
		};

        // Find list of mangaitems for dropdown.
        $scope.findManga = function() {
            $scope.mangaitems = Mangaitems.query();
        };

        //image upload
        $scope.uploadFile = function(){
            $scope.imgPath = '/modules/animeitems/img/' + $scope.myFile.name;
            fileUpload.uploadFileToUrl($scope.myFile, '/fileUploadAnime');
        };

        //latest date display format.
        $scope.latestDate = function(latest, updated) {
            return ItemService.latestDate(latest, updated);
        };

        $scope.deleteHistory = function(item, history) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                $scope.animeitem = ItemService.deleteHistory(item, history);
                $scope.update();
            });
        };

		/** Find a list of Animeitems for values:
         *  (0) returns only ongoing series. (1) returns all series.
         */
		function getAnime(value) {
            spinnerService.loading('anime', Animeitems.query({ status: value }).$promise.then(function(result) {
                $scope.animeitems = result;
            }));
		}

        //Set defaults on requery and "neutralise" the other search variable.
        $scope.itemsAvailable = function() {
            $scope.animeitems = undefined;
            if ($scope.filterConfig.ongoingList === true) {
                $scope.filterConfig.search.onHold = false;
                $scope.filterConfig.search.status = '';
                getAnime(0);
            } else {
                $scope.filterConfig.search.onHold = '';
                $scope.filterConfig.search.status = false;
                getAnime(1);
            }
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
})
.directive('keycuts', function() {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            //keydown catch - alt+v for view
            scope.$on('my:keydown', function(event, e) {
//                console.log(event, e);
                if (e.altKey && e.keyCode===86) {
                    if (scope.isList==='list') {
                        scope.isList = 'slider';
                    } else if (scope.isList==='slider') {
                        scope.isList = 'list';
                    } else if (scope.view === 'Anime') {
                        scope.view = 'Manga';
                    } else if (scope.view === 'Manga') {
                        scope.view = 'Character';
                    } else if (scope.view === 'Character') {
                        scope.view = 'Anime';
                    }
                }
            });
        }
    };
})
.directive('pageControls', function() {
  return {
      restrict: 'EA',
      replace: true,
      scope: {
          pageConfig: '=',
          showingCount: '='
      },
      templateUrl: '/modules/animeitems/templates/page-controls.html',
      link: function(scope, elem, attrs) {
          /** Calculate page count.
           *    If showingCount isn't caluclated in time...
           *    If the pageSize is altered...
           */
              scope.$watch('showingCount', function() {
                  scope.pageCount = Math.ceil(scope.showingCount / scope.pageConfig.pageSize);
                  if (scope.pageConfig.currentPage > scope.pageCount - 1) {
                      scope.last(); //in the event changing page size would put you above the last page.
                  } else if (scope.pageConfig.currentPage < 0) {
                      scope.first();
                  }
              });
          
          /** Button Functions
           *    go to next/prev pages. skip to first/last page.
           */
          scope.first = function() {
//              console.log('first');
              scope.pageConfig.currentPage = 0;
          };
          scope.last = function() {
//              console.log('last');
              scope.pageConfig.currentPage = scope.pageCount - 1;
          };
          scope.next = function() {
//              console.log('next');
              scope.pageConfig.currentPage += 1;
          };
          scope.prev = function() {
//              console.log('prev');
              scope.pageConfig.currentPage -= 1;
          };
          
          //Catches ctrl+left/right keypresses to change pages.
          scope.$on('my:keydown', function(event, e) {
//              console.log(event, e);
            if (e.ctrlKey && e.keyCode===39 && scope.pageConfig.currentPage < scope.pageCount - 1) {
                scope.next();
            } else if (e.ctrlKey && e.keyCode===37 && scope.pageConfig.currentPage > 0) {
                scope.prev();
            }
          });
          
      }
  };
    
})
.directive('listFilters', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            filterConfig: '=',
            items: '=',
            page: '='
        },
        templateUrl: '/modules/animeitems/templates/list-filters.html',
        link: function(scope, elem, attrs) {
            scope.filterConfig.searchTags = '';
            scope.passTag = function(tag) {
                if (scope.filterConfig.searchTags.indexOf(tag) === -1) {
                    scope.filterConfig.searchTags += tag + ',';
                    scope.filterConfig.tagsForFilter = scope.filterConfig.searchTags.substring(0, scope.filterConfig.searchTags.length - 1).split(',');
                }
            };
            //rating 'tooltip' function
            scope.hoveringOver = function(value) {
                scope.filterConfig.ratingActions.overStar = value;
                scope.filterConfig.ratingActions.percent = 100 * (value / scope.filterConfig.ratingActions.maxRating);
            };
            
            scope.itemsAvailable = function() {
              scope.$parent.itemsAvailable();  
            };
            
            scope.$watch('$parent.isList', function(newValue) {
                if (newValue !== undefined) {
                    scope.isList = newValue;
                }
            });
            
            scope.collapseFilters = function() {
//                console.log('collapse filters');
                scope.filterConfig.expandFilters = false;
            };
          
        }
        
    };
});
'use strict';

angular.module('animeitems')
.filter('startFrom', function() {
    return function(input, start) {
        if (input !== undefined) {
            start = +start; //parse to int
            return input.slice(start);
        }
    };
})
.filter('ratingFilter', function() {
    return function(array, rating) {
        if (array !== undefined) {
            //filter for rating stars
            return array.filter(function(item) {
    //            console.log(item);
                if (item.rating===rating) {
                    return item;
                } else if (rating===undefined) {
                    return item;
                }
            });
        }
    };
})
.filter('endedMonth', function() {
    return function(array, year, month) {
        return array.filter(function(item) {
        //ended stat month filter
                if (item.end!==undefined && item.end!==null) {
                    if (item.end.substring(0,4)===year) {
                        if (item.end.substr(5,2)===month) {
                            return item;
                        }
                    }
                }
        });
    };
})
.filter('endedSeason', ['moment', function(moment) {
    //ended stat season filter
    return function(array, year, month) {
        return array.filter(function(item) {
                var start = moment(item.start), end = moment(item.end), num, startMonth, startYear, diff, weeks, pad = '00';
                if (item.end!==undefined && item.end!==null) {
                    /**
                     *  Can currently handle shows of 1 or 2 seasons with 'standard' lengths (10-13) / (22-26) that
                     *  start and finish in the 'normal' season months (J-M,A-J,J-S,O-D) / (J-J,A-S,J-D,O-M).
                     */
                    if (9 < item.finalEpisode && item.finalEpisode < 14) {
                        startMonth = (pad + (month - 2)).slice(-pad.length);
                        if ((item.end.substring(0,4) === year && item.end.substr(5,2) === month) || (item.start.substring(0,4) === year && item.start.substr(5,2) === startMonth)) {
                            diff = end.diff(start, 'days');
                            weeks = Math.ceil(diff / 7) + 1; //add one to correct for the first ep. counting as week 0 in an equation.
                            if (weeks >= item.episodes) {
                                return item;
                            }
                        }
                    } else if (13 < item.finalEpisode && item.finalEpisode < 26) {
                        num = (month - 5) > 0 ? (month - 5) : 10;
                        startYear = (month - 5) > 0 ? year : year - 1;
                        startMonth = (pad + num).slice(-pad.length);
                        if ((item.end.substring(0,4) === year && item.end.substr(5,2) === month) || (item.start.substring(0,4) === startYear && item.start.substr(5,2) === startMonth)) {
                            diff = end.diff(start, 'days');
                            weeks = Math.ceil(diff / 7) + 1; //add one to correct for the first ep. counting as week 0 in an equation.
                            if (weeks >= item.episodes) {
                                return item;
                            }
                        }
                    }
                }
        });
    };
}])
.filter('season', function() {
    return function(array, year, month) {
        return array.filter(function(item) {
            if (item.end!== undefined && item.end !== null && item.season !== undefined && item.season !== null) {
                if (item.season.year === year && item.season.season === month) {
                    return item;
                }
            }
        });
    };
})
.filter('seasonForCharacterAnime', function() {
    return function(array, year, month) {
        return array.filter(function(item) {
            if (item.anime && item.anime.season !== undefined && item.anime.season !== null) {
                if (item.anime.season.year === year && item.anime.season.season === month) {
                    return item;
                }
            }
        });
    };
})
.filter('summaryYear', function() {
    return function(array, year, type) {
        if (array !== undefined) {
            return array.filter(function(item) {
                if (item.end !== undefined && item.end !== null) {
                    if (type === 'months') {
                        if (item.end.substring(0,4) === year) {
                            return item;
                        }
                    } else if (type === 'seasons') {
                        if (item.season.year === year) {
                            return item;
                        }
                    }
                }
            });
        }
    };
})
.filter('statisticsDetailFilter', ['$filter', function($filter) {
    return function(array, type, year, division) {
        var filter = (division === '')   ? 'summaryYear' :
                     (type === 'months') ? 'endedMonth'  :
                                           'season'      ,
            filterPart = (division === '') ? type : division;
        return $filter(filter)(array, year, filterPart);
    };
}]);

'use strict';

//Animeitems service used to communicate Animeitems REST endpoints
angular.module('animeitems').factory('Animeitems', ['$resource',
	function($resource) {
		return $resource('animeitems/:animeitemId', { animeitemId: '@_id' }, { update: { method: 'PUT' } });
	}
])
.factory('AnimeFactory', ['Animeitems', 'ListService', 'ItemService', 'NotificationFactory', '$location', function(Animeitems, ListService, ItemService, NotificationFactory, $location) {
    return {
        update: function(item, tagArray, updateHistory, imgPath) {
            var animeitem = item;
            console.log(animeitem);
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if (item.manga!==null && item.manga!==undefined) {
                animeitem.manga = item.manga._id;
            }

            if (tagArray!==undefined) {
                animeitem.tags = ListService.concatenateTagArrays(animeitem.tags, tagArray);
            }

            //update the item history.
            animeitem = ItemService.itemHistory(animeitem, updateHistory, 'anime');

            if (imgPath!==undefined && imgPath!==null && imgPath!=='') {
                animeitem.image = imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(animeitem.image);

            //handle end date
            if (animeitem.episodes === animeitem.finalEpisode && animeitem.finalEpisode!==0) {
                if (animeitem.end===undefined || animeitem.end === null) {
                    animeitem.end = animeitem.latest;
//                    console.log(animeitem.end);
                }
            } else if (animeitem.reWatching === false) {
                //in the event the 'complete-ness' of an entry needs to be undone.
                //this will undo the end date.
                animeitem.end = null;
//                console.log(animeitem.end);
            }

            //handle status: completed.
            if(animeitem.end!==undefined && animeitem.end!==null) {
                animeitem.status = true;
                animeitem.onHold = false;
            } else {
                //if no end date, not complete.
                animeitem.status = false;
            }

            //handle re-reading, re-read count.
            if (animeitem.reWatching===true && animeitem.episodes===animeitem.finalEpisode) {
                animeitem.reWatchCount += 1;
                animeitem.reWatching = false;
            }

			animeitem.$update(function() {
				if (window.location.href.indexOf('tasks') === -1) $location.path('animeitems');

			    NotificationFactory.success('Saved!', 'Anime was saved successfully');
			}, function(errorResponse) {
				var error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
        }
    };
}])
.service('fileUpload', ['$http', 'NotificationFactory', function ($http, NotificationFactory) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(response){
            NotificationFactory.success('Uploaded!', 'Image was saved successfully');
        })
        .error(function(err){
            NotificationFactory.popup('Woops!', 'Something went wrong! \n' + err, 'error');
        });
    };
}])
.service('ListService', ['moment', function(moment) {

        //show a loading gif if text doesn't exist.
        this.loader = function(value) {
            if (value) {
                return false; //hide loader when value exists.
            }
            return true;
        };

        this.stringReverse = function(string) {
            return string.split('').reverse().join('');
        };

        //get number of pages for list.
        this.numberOfPages = function(showingCount, pageSize, currentPage) {
            var pageCount = Math.ceil(showingCount/pageSize);
            //reset number of pages to be the final page if the number of pages
            //becomes less than the one you are on.
            if (currentPage + 1 >= pageCount && pageCount !== 0) {
                currentPage = pageCount-1;
            }
            if (pageCount!==0 && currentPage < 0) {
                currentPage = 0;
            }
            var pagingDetails = { currentPage: currentPage, pageCount: pageCount };
            return pagingDetails;
        };

        //find index of object with given attr.
        this.findWithAttr = function(array, attr, value) {
            if (array !== undefined) {
                for(var i = 0; i < array.length; i += 1) {
                    if(array[i][attr] === value) {
                        return i;
                    }
                }
            }
            return -1;
        };

        this.manipulateString = function(string, transform, onlyFirst) {
            switch(transform.toLowerCase()) {
                case 'lower':
                    if (onlyFirst)  return string.charAt(0).toLowerCase() + string.slice(1);
                    if (!onlyFirst) return string.toLowerCase();
                    break;
                case 'upper':
                    if (onlyFirst) return string.charAt(0).toUpperCase() + string.slice(1);
                    if (!onlyFirst) return string.toUpperCase();
                    break;
                default:
                    return string.toLowerCase();
            }
        };

				this.weekEndingForDate = function(convertToSunday) {
		        var date = new Date(convertToSunday),
		            day = date.getDay(),
		            diff = date.getDate() - day + (day === 0 ? 0:7),
		            temp = new Date(convertToSunday),
		            wkEnd = new Date(temp.setDate(diff));
		        return moment(wkEnd.toISOString()).endOf('day');
		    };

        //returns the options for the various filters in list pages.
        this.getSelectListOptions = function(controller) {
            var self = this, selectListOptions = [];
            if (controller !== 'character' && controller !== 'topten') {
                selectListOptions.status = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'Completed' } ];
                selectListOptions.searchName = 'title';
                if (controller === 'animeitem') {
                    selectListOptions.onHold = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'On Hold' } ];
                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'episodes', n: 'Episodes' },{ v: 'start', n: 'Start date' },
                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
                                                    ];
                    selectListOptions.sortOption = self.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Disc' } ];
                    selectListOptions.mediaType = 'disc';
                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-watching' }, { v: true, n: 'Re-watching' } ];
                    selectListOptions.repeatType = 'reWatching';
                } else if (controller === 'mangaitem') {
                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'chapters', n: 'Chapters' },{ v: 'volumes', n: 'Volumes' },{ v: 'start', n: 'Start date' },
                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
                                                    ];
                    selectListOptions.sortOption = self.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Hardcopy' } ];
                    selectListOptions.mediaType = 'hardcopy';
                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-reading' }, { v: true, n: 'Re-reading' } ];
                    selectListOptions.repeatType = 'reReading';
                }
            } else {
                if (controller === 'character') {
                    selectListOptions.sortOptions = [ { v: 'name', n: 'Name' }, { v: 'anime.title', n: 'Anime' }, { v: 'manga.title', n: 'Manga' }, { v: 'voice', n: 'Voice' }  ];
                    selectListOptions.media = [
                        { v: '', n: '-- choose media type --' }, { v: 'none', n: 'None' }, { v: 'anime', n: 'Anime-only' }, { v: 'manga', n: 'Manga-only' }, { v: 'both', n: 'Both' }
                    ];
                } else if (controller === 'topten') {
                    selectListOptions.sortOptions = [ { v: 'name', n: 'Name' } ];
                    selectListOptions.media = [ { v: '', n: 'All' }, { v: 'anime', n: 'Anime' }, { v: 'manga', n: 'Manga' }, { v: 'character', n: 'Character' } ];
                    selectListOptions.mediaType = 'type';
                }
                selectListOptions.searchName = 'name';
                selectListOptions.sortOption = self.findWithAttr(selectListOptions.sortOptions, 'n', 'Name');
            }
//            console.log(selectListOptions);
            return selectListOptions;
        };

        this.addTag = function(tagArray, newTag) {
            if (newTag!=='' && newTag!==undefined) {
                var i = 0, alreadyAdded = false;
                if (tagArray.length > 0) {
                    while(i < tagArray.length) {
                        if (tagArray[i].text === newTag) {
                            alreadyAdded = true;
                        }
                        i++;
                    }
                    //if not in array add it.
                    if (alreadyAdded === false) {
                        tagArray.push({ text: newTag });
                    }
                } else {
                    tagArray.push({ text: newTag });
                }
            }
            return tagArray;
        };

        this.concatenateTagArrays = function(itemTags, tagArray) {
            if (itemTags.length > 0) {
                var i = 0, alreadyAdded = false;
                while(i < tagArray.length) {
                    for(var j = 0; j < itemTags.length; j++) {
                        if (itemTags[j].text === tagArray[i].text) {
                            alreadyAdded = true;
                        }
                    }
                    //add if isn't already in the array.
                    if (alreadyAdded === false) {
                        itemTags.push(tagArray[i]);
                    }
                    i++;
                    alreadyAdded = false;
                }
//                console.log(itemTags);
                return itemTags;
            } else {
                //if there are no tags for item, then just return the new tags.
                return tagArray;
            }
        };

        //check to see if there are items with no tags.
        this.checkForTagless = function(items) {
            var areTagless = false;
            angular.forEach(items, function(item) {
                if (item.tags.length === 0) {
                    areTagless = true;
                }
            });
            return areTagless;
        };

        this.getCommonArrays = function(controller) {
            var commonArrays = {},
                itemTypes = [
                    { name: 'anime' },
                    { name: 'manga' },
                    { name: 'character' }
                ],
                seasons = [
                    { number: '03', text: 'Winter' },
                    { number: '06', text: 'Spring' },
                    { number: '09', text: 'Summer' },
                    { number: '12', text: 'Fall' }
                ],
                months = [
                    { number: '01', text: 'January' },
                    { number: '02', text: 'February' },
                    { number: '03', text: 'March' },
                    { number: '04', text: 'April' },
                    { number: '05', text: 'May' },
                    { number: '06', text: 'June' },
                    { number: '07', text: 'July' },
                    { number: '08', text: 'August' },
                    { number: '09', text: 'September' },
                    { number: '10', text: 'October' },
                    { number: '11', text: 'November' },
                    { number: '12', text: 'December' }
                ],
                categories = [
                    {name: 'Watch'},
                    {name: 'Read'},
                    {name: 'Play'},
                    {name: 'Other'}
                ],
                days = [
                    {name: 'Any'},
                    {name: 'Monday'},
                    {name: 'Tuesday'},
                    {name: 'Wednesday'},
                    {name: 'Thursday'},
                    {name: 'Friday'},
                    {name: 'Saturday'},
                    {name: 'Sunday'}
                ],
                summaryFunctions = [
                    { name: 'Average' },
                    { name: 'Highest' },
                    { name: 'Lowest' },
                    { name: 'Mode' }
                ];
            commonArrays = { months: months, seasons: seasons, categories: categories, days: days, summaryFunctions: summaryFunctions, itemTypes: itemTypes };
            return commonArrays;
        };

}])
.service('ItemService', ['moment', '$filter', 'ListService', function(moment, $filter, ListService) {

        //Using the date, returns the season.
        this.convertDateToSeason = function(date) {
            var season = '', year = date.getFullYear(), month = date.getMonth() + 1, commonArrays = ListService.getCommonArrays(),
                i = commonArrays.seasons.length;
//            console.log('convert: ', year, month);
            while(i--) {
                if (month > Number(commonArrays.seasons[i].number) && season === '') {
                    season = { season: commonArrays.seasons[i+1].text, year: year };
                }
                //catch winter.
                if (i === 0 && season === '') {
                    season = { season: commonArrays.seasons[i].text, year: year };
                }
            }
//            console.log('to: ', season);
            return season;
        };

        //add history entry to item.
        this.itemHistory = function(item, updateHistory, type) {
//            console.log('item history: ', item, item.meta);
            //populate the history of when each part was 'checked' off.
            if (item.meta.history.length !== 0) {
                var latestHistory = item.meta.history[item.meta.history.length - 1].value,
                    length = type === 'anime' ? item.episodes - latestHistory : item.chapters - latestHistory;
                if (length > 0 && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
                    for(var i = 1; i <= length; i++) {
                        item.meta.history.push({
                            date: Date.now(),
                            value: latestHistory + i,
                            rating: 0,
                            title: item.title,
                            id: item._id
                        });
                    }
                }
            } else {
                if (updateHistory && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
                    item.meta.history.push({
                        date: Date.now(),
                        value: (type === 'anime' ? item.episodes : item.chapters),
                        rating: 0,
                        title: item.title,
                        id: item._id
                    });
                }
            }
            return item;
        };

        //remove an entry from an items history.
        this.deleteHistory = function(item, history) {
            var temp = [];
            angular.forEach(item.meta.history, function(past) {
                if (past.value !== history.value) {
                    temp.push(past);
                }
            });
            item.meta.history = temp;
            return item;
        };

        //function to display relative time - using latest or updated date.
        this.latestDate = function(latest, updated) {
            //latest date display format.
//          console.log(latest, updated);
            var today = moment(new Date()), latestDate, diff;

            if (moment(latest).toISOString().substring(0,10)===moment(updated).toISOString().substring(0,10)) {
                 latestDate = moment(updated);
                 diff = latestDate.fromNow();

                if (diff==='a day ago') {
                    return 'Yesterday at ' + latestDate.format('HH:mm');
                } else if (diff.indexOf('days') > -1) {
                    return diff + ' at ' + latestDate.format('HH:mm');
                } else {
                    return diff + '.';
                }
            } else {
                 latestDate = moment(latest);
                 diff = today.diff(latestDate, 'days');

                //for 0 and 1 day(s) ago use the special term.
                if (diff===0) {
                    return 'Today';
                } else if (diff===1) {
                    return 'Yesterday';
                } else {
                    return diff + ' days ago.';
                }
            }
        };

        //build statistics item overview details.
        this.buildOverview = function(items) {
            var overview = {
                ongoing: $filter('filter')(items, {status: false }).length,
                completed: $filter('filter')(items, {status: true }).length
            };
//            console.log('overview ' , overview);
            return overview;
        };

        //calculate which month has the most anime completed in it.
        this.maxCompleteMonth = function(items) {
            var modeMap = {}, maxCount = 0;
            for(var i = 0; i < items.length; i++) {
                if (items[i].end!==undefined && items[i].end!==null) {
                    var end = items[i].end.substring(0,7);
                    if(modeMap[end] === null || modeMap[end] === undefined) {
                        modeMap[end] = 1;
                    } else {
                        modeMap[end]++;
                    }
                    if(modeMap[end] > maxCount) {
                        maxCount = modeMap[end];
                    }
                }
            }
            return maxCount;
        };

        //calculate the rating values - max rated count and average rating.
        this.getRatingValues = function(items) {
            var tempRating = 0,
                maxRatedCount = 0,
                averageRating = 0;
            angular.forEach(items, function(item) {
                if (item.rating !== 0) {
                    tempRating += item.rating;
                    maxRatedCount++;
                }
            });
            averageRating = tempRating / maxRatedCount;
            var values = {
                maxRatedCount: maxRatedCount,
                averageRating: averageRating
            };
//            console.log('values', values);
            return values;
        };

        //calculate which month has the most anime completed in it.
        this.maxTagCount = function(items) {
            var modeMap = {}, maxCount = 0;
            angular.forEach(items, function(item) {
                angular.forEach(item.tags, function(tag) {
                    var text = tag.text;
                    if(modeMap[text] === null || modeMap[text] === undefined) {
                        modeMap[text] = 1;
                    } else {
                        modeMap[text]++;
                    }
                    if(modeMap[text] > maxCount) {
                        maxCount = modeMap[text];
                    }
                });
            });
            return maxCount;
        };

        //build stat tags including counts, averages etc.
        this.buildStatTags = function(items, averageItemRating) {
            var self = this, add = true, statTags = [], checkedRating, maxTagCount = self.maxTagCount(items), itemCount = items.length;
            //is tag in array?
            angular.forEach(items, function(item) {
                angular.forEach(item.tags, function(tag) {
                    for(var i=0, len = statTags.length; i < len; i++) {
                        if (statTags[i].tag===tag.text) {
                            add = false;
                            statTags[i].count += 1;
                            statTags[i].ratedCount += item.rating === 0 ? 0 : 1;
                            statTags[i].ratings.push(item.rating);
                            statTags[i].ratingAdded += item.rating;
                            statTags[i].ratingAvg = statTags[i].ratingAdded === 0 ? 0 : statTags[i].ratingAdded / statTags[i].ratedCount;
                            statTags[i].ratingWeighted = self.ratingsWeighted(statTags[i].ratings);
                        }
                    }
                    // add if not in
                    if (add===true) {
                        checkedRating = item.rating === 0 ? 0 : 1;
                        statTags.push({ tag: tag.text, count: 1, ratedCount: checkedRating, ratings: [item.rating], ratingAdded: item.rating, ratingAvg: item.rating, ratingWeighted: 0 });
                    }
                    add = true; //reset add status.
                });
//                    console.log(statTags);
            });
            return statTags;
        };

        //function to calculate the weighted mean ratings for the genre tags.
        this.ratingsWeighted = function(ratings) {
            var values = [], weights = [], unratedCount = 0, total = 0, count = 0;
            /**
             *  create array (weights) with key(rating).
             */
            for (var i=0, len = ratings.length; i < len; i++) {
                if (ratings[i] in values) {
                    weights[ratings[i]]++;
                } else {
                    values.push(ratings[i]);
                    weights[ratings[i]] = 1;
                }
            }
            /**
             *  using the key(rating) multiply by the value(weight).
             *  calculated weighted total and count.
             */
            for (var k in weights){
                if (typeof weights[k] !== 'function') {
                    if (!isNaN(weights[k])) {
                        total += k * weights[k];
                        count += weights[k];
                    }
                }
                if (k === 0) {
                    unratedCount = weights[k];
                }
            }
						/* Weighted average.
						 * total = (nth_rating_value * number_of_that_value + ...)
						 * count = number of ratings.
						 */
            return total / count;
        };

        //builds counts for number of items given for each rating.
        this.buildRatingsDistribution = function(items) {
            var maxCount = items.length, possibleValues = [10,9,8,7,6,5,4,3,2,1,0], ratingsDistribution = [], i = possibleValues.length;
            while(i--) {
                var count = $filter('filter')(items, { rating: i }, true).length;
                ratingsDistribution.push({ number: i === 0 ? '-' : i,
                                           text: i === 0 ? count + ' entries unrated.' : count + ' entries rated ' + i,
																					 colour: i > 6 		 ? '#449d44' :
																					 				 7 > i && i > 3 ? '#31b0d5' :
																									 i !== 0 ? '#c9302c' :
																									 					 '#000000',
                                           count: count,
                                           percentage: ((count / maxCount) * 100).toFixed(2)
                                         });
            }
//            console.log('RD: ', ratingsDistribution);
            return ratingsDistribution;
        };

        // 'sub-function' of the completeBy... functions.
        this.endingYears = function(items) {
            var years = [],
								itemYears = $filter('unique')(items, 'end.substring(0,4)'); //get unqiue years as items.
            		itemYears = $filter('orderBy')(itemYears, '-end.substring(0,4)'); //order desc.
						angular.forEach(itemYears, function(item) {
							if(item.end !== undefined && item.end !== null) {
								years.push({ year: item.end.substring(0,4) });
							}
						});
            return years;
        };

        //complete by month stats
        this.completeByMonth = function(items) {
            var self = this, monthDetails = {}, completeByMonth = [], maxCompleteMonth = 0, itemYears = self.endingYears(items), i = itemYears.length;
            //build comlpeteByMonths object.
            while(i--) {
                //chuck the null end date. push the year part of the other end dates with months array.
                if (itemYears[i].year !== undefined && itemYears[i].year !== null) {
                    completeByMonth.push({ year: itemYears[i].year,
                                          months: [
                                                    { number: '01', text: 'January', count: $filter('endedMonth')(items, itemYears[i].year, '01').length  },
                                                    { number: '02', text: 'February', count: $filter('endedMonth')(items, itemYears[i].year, '02').length },
                                                    { number: '03', text: 'March', count: $filter('endedMonth')(items, itemYears[i].year, '03').length },
                                                    { number: '04', text: 'April', count: $filter('endedMonth')(items, itemYears[i].year, '04').length },
                                                    { number: '05', text: 'May', count: $filter('endedMonth')(items, itemYears[i].year, '05').length },
                                                    { number: '06', text: 'June', count: $filter('endedMonth')(items, itemYears[i].year, '06').length },
                                                    { number: '07', text: 'July', count: $filter('endedMonth')(items, itemYears[i].year, '07').length },
                                                    { number: '08', text: 'August', count: $filter('endedMonth')(items, itemYears[i].year, '08').length },
                                                    { number: '09', text: 'September', count: $filter('endedMonth')(items, itemYears[i].year, '09').length },
                                                    { number: '10', text: 'October', count: $filter('endedMonth')(items, itemYears[i].year, '10').length },
                                                    { number: '11', text: 'November', count: $filter('endedMonth')(items, itemYears[i].year, '11').length },
                                                    { number: '12', text: 'December', count: $filter('endedMonth')(items, itemYears[i].year, '12').length }
                                          ]
                                         });
                }
            }
            maxCompleteMonth = self.maxCompleteMonth(items);
            monthDetails = { months: completeByMonth, max: maxCompleteMonth };

//            console.log('completeByMonth', completeByMonth);
            return monthDetails;
        };

        //complete by season stats.
        this.completeBySeason = function(items) {
            var self = this, seasonDetails = {}, completeBySeason = [], maxCompleteSeason = 0, itemYears = self.endingYears(items), i = itemYears.length;
            //build completeBySeason object.
            while(i--) {
                //chuck the null end date. push the year part of the other end dates with seasons array.
                if (itemYears[i].year !== undefined && itemYears[i].year !== null) {
                    completeBySeason.push({ year: itemYears[i].year,
                                            seasons: [
                                                        { number: '03', text: 'Winter', count: $filter('season')(items, itemYears[i].year, 'Winter').length },
                                                        { number: '06', text: 'Spring', count: $filter('season')(items, itemYears[i].year, 'Spring').length },
                                                        { number: '09', text: 'Summer', count: $filter('season')(items, itemYears[i].year, 'Summer').length },
                                                        { number: '12', text: 'Fall', count: $filter('season')(items, itemYears[i].year, 'Fall').length }
                                            ]
                                          });
                }
            }
            //find maximum complete in a season.
            angular.forEach(completeBySeason, function(item) {
                var i = item.seasons.length;
                while(i--) {
                    if (item.seasons[i].count > maxCompleteSeason) {
                        maxCompleteSeason = item.seasons[i].count;
                    }
                }
            });
            seasonDetails = { seasons: completeBySeason, max: maxCompleteSeason };
//            console.log('completeBySeason', seasonDetails);
            return seasonDetails;
        };

        //Temporary function to generate the season data for pre-exisiting items in db.
        this.setSeason = function(items, year, season) {
            var self = this, array = $filter('endedSeason')(items, year, season);
            angular.forEach(array, function(item) {
                console.log(item.title);
                item.season = self.convertDateToSeason(new Date(item.start));
            });
            return array;
        };

}]);

'use strict';

// Configuring the Articles module
angular.module('characters').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Characters', 'characters', 'dropdown', '/characters(/create)?');
		Menus.addSubMenuItem('topbar', 'characters', 'List Characters', 'characters');
		Menus.addSubMenuItem('topbar', 'characters', 'New Character', 'characters/create');
	}
]);
'use strict';

//Setting up route
angular.module('characters').config(['$stateProvider',
	function($stateProvider) {
		// Characters state routing
		$stateProvider.
		state('listCharacters', {
			url: '/characters',
			templateUrl: 'modules/characters/views/list-characters.client.view.html'
		}).
		state('createCharacter', {
			url: '/characters/create',
			templateUrl: 'modules/characters/views/create-character.client.view.html'
		}).
		state('viewCharacter', {
			url: '/characters/:characterId',
			templateUrl: 'modules/characters/views/view-character.client.view.html'
		}).
		state('editCharacter', {
			url: '/characters/:characterId/edit',
			templateUrl: 'modules/characters/views/edit-character.client.view.html'
		});
	}
]);
'use strict';

// Characters controller
angular.module('characters').controller('CharactersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ListService', 'CharacterService', 'NotificationFactory', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window, ListService, CharacterService, NotificationFactory, spinnerService) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        $scope.whichController = 'character';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            showingCount: 0,
            sortType: '',
            sortReverse: false,
            searchTags: '',
            media: '',
            seriesFilter: '',
            tagsForFilter: [],
            taglessItem: false,
            areTagless: false,
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            statTags: [],
            voiceActors: [],
            series: []
        };
        $scope.isList = 'list'; //show list? or slider.
        $scope.maxItemCount = 0; //number of characters.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };

        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };

		// Create new Character
		$scope.create = function() {
            //console.log($scope.tagArray);
            var character = new Characters();
             // Create new Character object
			 character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime!==undefined && this.anime!==null ? this.anime._id : this.anime,
                manga: this.manga!==undefined && this.manga!==null ? this.manga._id : this.manga,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });

			// Redirect after save
			character.$save(function(response) {
				$location.path('characters/' + response._id);
                NotificationFactory.success('Saved!', 'Character was saved successfully');
				// Clear form fields
				$scope.name = '';
                $scope.image = '';
                $scope.voice = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Character
		$scope.remove = function(character) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                if ( character ) {
                    character.$remove();

                    for (var i in $scope.characters) {
                        if ($scope.characters [i] === character) {
                            $scope.characters.splice(i, 1);
                        }
                    }
                } else {
                    $scope.character.$remove(function() {
                        $location.path('characters');
                    });
                }
                NotificationFactory.warning('Deleted!', 'Character was successfully deleted.');
            });
		};

		// Update existing Character
		$scope.update = function() {
			var character = $scope.character;
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.character.manga!==null && $scope.character.manga!==undefined) {
                character.manga = $scope.character.manga._id;
            }
//            console.log($scope.character.anime);
            if ($scope.character.anime!==null && $scope.character.anime!==undefined) {
                character.anime = $scope.character.anime._id;
            }

            if ($scope.tagArray!==undefined) {
                character.tags = ListService.concatenateTagArrays(character.tags, $scope.tagArray);
            }

            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                character.image = $scope.imgPath;
            }

			character.$update(function() {
				$location.path('characters');
                NotificationFactory.success('Saved!', 'Character was saved successfully');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Find a list of Characters
		$scope.find = function() {
			spinnerService.loading('characters', Characters.query().$promise.then(function(result) {
				$scope.characters = result;
				$scope.filterConfig.areTagless = ListService.checkForTagless(result);
				$scope.filterConfig.statTags = CharacterService.buildCharacterTags(result);
				$scope.filterConfig.voiceActors = CharacterService.buildVoiceActors(result);
				$scope.filterConfig.series = CharacterService.buildSeriesList(result);
				console.log('find characters: ', $scope.characters, $scope.filterConfig);
			}));
		};

		// Find existing Character
		$scope.findOne = function() {
			$scope.character = Characters.get({
				characterId: $stateParams.characterId
			});
//            console.log($scope.character);
		};

        // Find a list of Animeitems
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
		};

        // Find existing Animeitem
		$scope.findOneAnime = function(anime) {
            //console.log(anime);
			$scope.animeitem = Animeitems.get({
				animeitemId: anime
			});
		};

        // Find a list of Mangaitems
		$scope.findManga = function() {
			$scope.mangaitems = Mangaitems.query();
		};

        // Find existing Animeitem
		$scope.findOneManga = function(manga) {
			$scope.mangaitem = Mangaitems.get({
				mangaitemId: manga
			});
		};

        //image upload
        $scope.uploadFile = function(){
            $scope.imgPath = '/modules/characters/img/' + $scope.myFile.name;
            fileUpload.uploadFileToUrl($scope.myFile, '/fileUploadCharacter');
        };

	}
]);

'use strict';

angular.module('characters').directive('characterBack', function(){
    return function(scope, element, attrs){
        var url = attrs.characterBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover',
            'background-repeat': 'no-repeat',
            'background-position': 'center'
        });
    };
})
.directive('disableNgAnimate', ['$animate', function($animate) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      $animate.enabled(false, element);
    }
  };
}])
.directive('slider', ['$timeout', '$sce', function($timeout, $sce) {
  return {
      restrict: 'AE',
      replace: true,
      scope: {
          slides: '=?',
          interval: '=?'
      },
      templateUrl: '/modules/characters/templates/slider.html',
      link: function(scope, elem, attrs) {
          var timer, autoSlide, length = elem[0].childElementCount - 1;
          scope.currentIndex = -1; //pre-first slide to stop 'cannot assign to undefined' error.
          scope.repeater = scope.slides === undefined ? false : true; //is there a collection to iterate through?
          scope.interval = scope.interval === undefined ? 3000 : scope.interval; //is there a custom interval?
          scope.isFullscreen = false;
          
          //allow retreival of local resource
          scope.trustAsResourceUrl = function(url) {
              return $sce.trustAsResourceUrl(url);
          };
          
          //if no collection, make a dummy collection to cycle throught the children.
          if (!scope.repeater) {
            scope.slides = []; //used to allow cycling.
            for(var i = 0; i < length; i++) {
                scope.slides.push({ index: i });
            }
          }
          scope.goToSlide = function(slide) {
//              console.log('go to', slide);
              if (scope.currentIndex !== slide) {
                  //reached end of slides?
                  if (slide !== scope.filteredSlides.length) {
                    scope.currentIndex = slide;
                  } else {
                    scope.currentIndex = 0;
                  }
              } else {
                  if (scope.filteredSlides[scope.currentIndex].locked) {
                    //unlock, i.e start timer.
                    scope.filteredSlides[scope.currentIndex].locked = false;
                      autoSlide();
                  } else {
                    //lock, i.e. cancel timer.
                    scope.filteredSlides[scope.currentIndex].locked = true;
                    $timeout.cancel(timer);
                  }
              }
          };
          scope.next = function() {
              if (scope.currentIndex < scope.filteredSlides.length - 1) {
                  scope.currentIndex += 1;
              } else {
                  scope.currentIndex = 0;
              }
          };
          scope.prev = function() {
              if (scope.currentIndex > 0) {
                  scope.currentIndex -= 1;
              } else {
                  scope.currentIndex = scope.filteredSlides.length - 1;
              }
          };
          
          scope.$watch('currentIndex', function() {
//              console.log('index', scope.currentIndex, 'filtered slides ', scope.filteredSlides);
              if (scope.currentIndex > -1) {
                    scope.filteredSlides.forEach(function(slide) {
                        slide.visible = false; // make every slide invisible
                        slide.locked = false; // make every slide unlocked
                    });
                    scope.filteredSlides[scope.currentIndex].visible = true; // make the current slide visible
              }
          });
          
          autoSlide = function() {
              timer = $timeout(function() {
                  scope.next();
                  timer = $timeout(autoSlide, scope.interval);
              }, scope.interval);
          };
          autoSlide();
          scope.$on('$destroy', function() {
              $timeout.cancel(timer); // when the scope is destroyed, cancel the timer
          });
          
          //Stop timer on enter.
          scope.enter = function() {
//              console.log('entered');
              if (scope.filteredSlides[scope.currentIndex].locked !== true) {
                $timeout.cancel(timer);
//                  console.log('cancelled');
              }
          };
          //Restart timer on leave.
          scope.leave = function() {
//              console.log('left');
              if (scope.filteredSlides[scope.currentIndex].locked !== true) {
                timer = $timeout(autoSlide, scope.interval);
//                  console.log('restarted');
              }
          };
          
          //Fullscreen capability
          scope.toggleFullscreen = function() {
              scope.isFullscreen = !scope.isFullscreen;
          };
          
          /** FILTERS
           *    Code below here will allow the slides to be affected by the character filters.
           *    Note: the interval is removed and replaced to avoid the auto-slide fouling the
           *            change over up.
           */
          scope.$watch('$parent.filterConfig.search', function(newValue) {
              if (scope.$parent.filterConfig.search !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.search = newValue;
                  scope.interval = temp;
              }
          });
          scope.$watch('$parent.filterConfig.media', function(newValue) {
              if (scope.$parent.filterConfig.media !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.media = newValue;
                  scope.interval = temp;
              }
          });
          scope.$watch('$parent.filterConfig.seriesFilter', function(newValue) {
              if (scope.$parent.filterConfig.seriesFilter !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.seriesFilter = newValue;
                  scope.interval = temp;
              }
          });
          scope.$watch('$parent.filterConfig.searchTags', function(newValue) {
              if (scope.$parent.filterConfig.media !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.searchTags = newValue;
                  scope.interval = temp;
              }
          });
      }
  };
    
}])
.directive('enterTag', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.enterTag);
                    });
                    event.preventDefault();
                 }
            });
        }
    };
})
.directive('clearTagValues', function() {
    return function (scope, element, attrs) {
        element.bind('click', function(event) {
//            console.log('clear tags');
            scope.$apply(function() {
                scope.filterConfig.searchTags = '';
                scope.filterConfig.characterTags = '';
                scope.filterConfig.tagsForFilter = [];
            });
        });
    };
}) 
.directive('deleteSearchTag', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                scope.$apply(function() { 
                    var tag = attrs.deleteSearchTag;
                    var index = scope.filterConfig.tagsForFilter.indexOf(tag);
//                    console.log(tag, index);
                    scope.filterConfig.searchTags = scope.filterConfig.searchTags.replace(tag + ',', '');
                    scope.filterConfig.tagsForFilter.splice(index, 1);
//                    console.log(scope.searchTags, scope.tagsForFilter);
                });
            });
        }
    };
})
.directive('dropTag', ['NotificationFactory', function(NotificationFactory) {
    return function(scope, element, attrs) {
        element.bind('click', function(event) {    
            var text = attrs.dropTag;
             //are you sure option...
            NotificationFactory.confirmation(function() {
                scope.$apply(function() {
                    var deletingItem = scope.tagArray;
                    scope.$parent.tagArray = [];
//                    console.log('dropping tag - ', text);
                    //update the complete task.
                    angular.forEach(deletingItem, function(tag) {
                        if (tag.text !== text) {
                            scope.$parent.tagArray.push(tag);
                        }
                    });
                });
                NotificationFactory.warning('Dropped!', 'Tag was successfully dropped');
            });
        });
    };
}])
.directive('removeTag', ['NotificationFactory', function(NotificationFactory) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                var tag = attrs.removeTag,
                    i,
                    entry_type = scope.whichController;
                //are you sure option...
              NotificationFactory.confirmation(function() {
                    scope.$apply(function () {
                        var index;
                        if (entry_type === 'character') {
                            for(i=0; i < scope.character.tags.length; i++) {
                                if (scope.character.tags[i].text === tag) {
                                    index = i;
                                }
//                                console.log(index);
                            }
                            scope.$parent.character.tags.splice(index, 1);
                        } else if (entry_type === 'animeitem') {
                            for(i=0; i < scope.animeitem.tags.length; i++) {
                                if (scope.animeitem.tags[i].text === tag) {
                                    index = i;
                                }
//                                console.log(index);
                            }
                            scope.$parent.animeitem.tags.splice(index, 1);
                        } else if (entry_type === 'mangaitem') {
                            for(i=0; i < scope.mangaitem.tags.length; i++) {
                                if (scope.mangaitem.tags[i].text === tag) {
                                    index = i;
                                }
//                                console.log(index);
                            }
                            scope.$parent.mangaitem.tags.splice(index, 1);
                        }
//                        console.log(index, tag);
                    });
                    NotificationFactory.warning('Deleted!', 'Tag was successfully deleted');
                });
            });
        }
    };
}]);
'use strict';

angular.module('characters').filter('seriesDetailFilter', function() {
    return function(array, detailSeriesName) {
        if (array !== undefined) {
            return array.filter(function(item) {
                if (detailSeriesName !== '') {
                    //filter stat series detail.
                    if (item.anime!==null && item.anime!==undefined) {
                        if (item.anime.title===detailSeriesName) {
                            return item;
                        }
                    } else if (item.manga!==null && item.manga!==undefined) {
                        if (item.manga.title===detailSeriesName) {
                            return item;
                        }
                    }
                } else { 
                    return item;
                }
            });
        }
    };
})
.filter('seriesFilter', function() {
    return function(array, series) {
        if (array !== undefined) {
            return array.filter(function(item) {
                if (series !== '' && series !== undefined) {
                    //filter stat series detail.
                    if (item.anime!==null && item.anime!==undefined) {
                        return item.anime.title.toLowerCase().indexOf(series.toLowerCase()) > -1;
                    } else if (item.manga!==null && item.manga!==undefined) {
                        return item.manga.title.toLowerCase().indexOf(series.toLowerCase()) > -1;
                    }
                } else { 
                    return item;
                }
            });
        }
    };
})
.filter('mediaFilter', function() {
    return function(array, media) {
        if (array !== undefined) {
            return array.filter(function(item) {
                if (media==='anime') {
                    if (item.anime!==null && item.manga===null) {
                        return true;
                    }
                    return false;
                } else if (media==='manga') {
                    if (item.manga!==null && item.anime===null) {
                        return true;
                    }
                    return false;
                } else if (media==='both') {
                    if (item.anime!==null && item.manga!==null) {
                        return true;
                    }
                    return false;
                } else if (media==='none') {
                    if (item.anime===null && item.manga===null) {
                        return true;
                    }
                } else {
                    return true;
                }
            });
        }
    };
})
.filter('tagFilter', function() {
    return function(array, searchTags, taglessItem) {
        if (array !== undefined) {
            return array.filter(function(item) {
                //special tag filter
                var found = false;
                var i = 0;
                var tagsToSearch = [];
                var tagsForFilter;

                //if tagless is checked return tagless and nothing else.
                if (taglessItem===true) {
                    if (item.tags.length===0) {
                        return item;
                    }
                } else {
                    if (searchTags===undefined || searchTags==='') {
                        return true;
                    } else {
                        //get tags that are being looked for
                        tagsForFilter = searchTags.substring(0, searchTags.length - 1).split(',');
                        //console.log(tagsForFilter);

                        //get tags of items to filter
                        angular.forEach(item.tags, function(tag) {
                            tagsToSearch.push(tag.text);
                        });

                        //filter: check in 'query' is in tags.
                        for(i = 0; i < tagsForFilter.length; i++) {
                            if (tagsToSearch.indexOf(tagsForFilter[i]) !== -1) {
                                found = true;
                            } else {
                                return false;
                            }
                        }
                        return found;
                    }
                }
            });
        }
    };
});
'use strict';

//Characters service used to communicate Characters REST endpoints
angular.module('characters').factory('Characters', ['$resource',
	function($resource) {
		return $resource('characters/:characterId', { characterId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.service('CharacterService', ['$q', function($q) {

    //build the character gender distribution.
    this.buildGenderDistribution = function(items, maxCount) {
        return $q(function(resolve, reject) {
            var check, gender = [];
            angular.forEach(items, function(item) {
                if (item.tag === 'male') {
                    gender.push({
                        type: 'male',
                        count: item.count,
                        percentage: Number(((item.count / maxCount) * 100).toFixed(2)),
                        text: '% male.'
                    });
                } else if (item.tag === 'female') {
                    gender.push({
                        type: 'female',
                        count: item.count,
                        percentage: Number(((item.count / maxCount) * 100).toFixed(2)),
                        text: '% female.'
                    });
                }
            });
            gender.push({
                type: 'unassigned',
                count: maxCount - gender[0].count - gender[1].count,
                percentage: Number(((maxCount - gender[0].count - gender[1].count / maxCount) * 100).toFixed(2)),
                text: '% unassigned.'
            });

            //Fudge any rounding errors.
            check = gender[0].percentage + gender[1].percentage + gender[2].percentage;
            if (check > 100) {
                gender[2].percentage -= (check - 100).toFixed(2);
            } else if (check < 100) {
                gender[2].percentage += (100 - check).toFixed(2);
            }
            resolve(gender);
        });
    };

    this.buildCharacterTags = function(items) {
        var add = true, statTags = [];
        //is tag in array?
        angular.forEach(items, function(item) {
            angular.forEach(item.tags, function(tag) {
                for(var i=0; i < statTags.length; i++) {
                    if (statTags[i].tag === tag.text) {
                        add = false;
                        statTags[i].count += 1;
                    }
                }
                // add if not in
                if (add===true) {
                    statTags.push({ tag: tag.text, count: 1 });
                }
                add = true; //reset add status.
            });
//          console.log($scope.statTags);
        });

        return statTags;
    };

    this.buildRelatedCharacterTags = function(items, name) {
        var add = true, tagDetailCollection = [], tagDetailResult = [];
        //get all character tag arrays that contain the chosen tag into a collection.
        angular.forEach(items, function(item){
            for(var i=0; i < item.tags.length; i++) {
                if (item.tags[i].text === name) {
                    tagDetailCollection.push(item.tags);
                }
            }
        });
//        console.log(tagDetailCollection);
        angular.forEach(tagDetailCollection, function(item) {
            angular.forEach(item, function(bit) {
//              console.log(bit);
                for(var i=0; i < tagDetailResult.length; i++) {
                    //if exists and not the search value - increment the count.
                    if (tagDetailResult[i].name===bit.text && bit.text!==name) {
                        add = false;
                        tagDetailResult[i].count += 1;
                    }
                }
                //add if true and not the tag we searched on.
                if (add===true && bit.text!==name) {
                    tagDetailResult.push({ name: bit.text, count: 1 });
                }
                add = true;
            });
        });
//        console.log(tagDetailResult);
        return tagDetailResult;
    };

    this.buildVoiceActors = function(items) {
        var add = true, voiceActors = [];
        //is voice actor in array?
        angular.forEach(items, function(item) {
            for(var i=0; i < voiceActors.length; i++) {
                if (voiceActors[i].name === item.voice) {
                    add = false;
                    voiceActors[i].count += 1;
                }
            }
            // add if not in
            if (add===true) {
                voiceActors.push({ name: item.voice, count: 1 });
            }
            add = true; //reset add status.
        });

        return voiceActors;
    };

    this.buildSeriesList = function(items) {
        var add = true, statSeries = [];
        //get series counts.
        angular.forEach(items, function(item) {
            for(var i=0; i < statSeries.length; i++) {
                if (item.anime) {
                    if (statSeries[i].name === item.anime.title) {
                        add = false;
                        statSeries[i].count += 1;
                    }
                } else if (item.manga) {
                    if (statSeries[i].name === item.manga.title) {
                        add = false;
                        statSeries[i].count += 1;
                    }
                }
            }
            // add if not in
            if (add === true) {
                if (typeof(item.anime) === 'object' && item.anime !== null) {
                    statSeries.push({ _id: item.anime._id, name: item.anime.title, count: 1 });
                } else if (typeof(item.manga) === 'object' && item.manga !== null) {
                    statSeries.push({ _id: item.manga._id, name: item.manga.title, count: 1 });
                }
            }
            add = true; //reset add status.
        });

        return statSeries;
    };

}]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
//		$stateProvider
//        .state('home', {
//			url: '/',
//			templateUrl: 'modules/core/views/home.client.view.html'
//		});
	}
]);
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
'use strict';


angular.module('core').controller('HomeController', ['$scope', '$rootScope', 'Authentication', '$window', '$location', 'Animeitems', 'Mangaitems', '$filter', 'NotificationFactory',
	function($scope, $rootScope, Authentication, $window, $location, Animeitems, Mangaitems, $filter, NotificationFactory) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        //forces page to scroll top on load.
        $rootScope.$on('$viewContentLoaded', function(){ window.scrollTo(0, 0); });
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
    
    $scope.isAddTask = false;
    $scope.today = new Date();
    $scope.datesSelected = 'current';
    $scope.saved = localStorage.getItem('taskItems');
    $scope.taskItem = (localStorage.getItem('taskItems')!==null) ? 
    JSON.parse($scope.saved) : [ {description: 'Why not add a task?', date: $scope.today.toISOString().substring(0,10), complete: false}];
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
    
    //get monday!
    $scope.weekBeginning = function() {
        var day = $scope.today.getDay(),
        diff = $scope.today.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
        var wkBeg = new Date();
        return new Date(wkBeg.setDate(diff));
    };
        
    //check things
    $scope.checkStatus = function() {
        //var day = new Date('2015-05-04').getDay();
        var day = $scope.today.getDay();
        //console.log(day);
        console.log($scope.taskItem);
        //Is it monday?
        if (day===1) {
            var refreshItems = $scope.taskItem;
            $scope.taskItem = [];
            angular.forEach(refreshItems, function (taskItem) {
                    //has it been updated today?
                    if(taskItem.updated===false) {
                        //has it reached the necessary number of repeats?
                        if(taskItem.completeTimes!==taskItem.repeat) {
                            taskItem.complete = false;
                            taskItem.updated = true;
                            $scope.taskItem.push(taskItem);
//                            console.log('updated set to true');
                        }
                    } else {
                        $scope.taskItem.push(taskItem);
//                        console.log('updated already true');
                    }
            });
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem)); 
        
        } else {
            var updated = $scope.taskItem;
            $scope.taskItem = [];
            angular.forEach(updated, function (taskItem) {
                    taskItem.updated = false;
                    //is it a daily task?
                    if (taskItem.daily===true) {
                        //has it reached the necessary number of repeats?
                        if(taskItem.completeTimes!==taskItem.repeat) {
                            var today = $scope.today.getDate();
                            //has it been refreshed today?
                            if (taskItem.dailyRefresh!==today) {
                                taskItem.complete = false;
                                taskItem.dailyRefresh = today;
                                $scope.taskItem.push(taskItem);
                            } else { 
                                //already refreshed today.
                                $scope.taskItem.push(taskItem);
                            }
                        } else {
                            //daily task completed, keep pushing - monday will kill it.
                            $scope.taskItem.push(taskItem);
                        }
                    } else {
                        //not daily task, so push.
                        $scope.taskItem.push(taskItem);
                    }
                });
//            console.log('updated set to false');
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        }
    };
    $scope.optionArray = [];
    //for adding/removing options.
    $scope.addOption = function () {
            if ($scope.newOption!=='' && $scope.newOption!==undefined) {
                var i = 0;
                var alreadyAdded = false;
                if ($scope.optionArray.length > 0) {
                    while(i < $scope.optionArray.length) {
                        if ($scope.optionArray[i].text === $scope.newOption) {
                            alreadyAdded = true;
                        }
                        i++;
                    }
                    //if not in array add it.
                    if (alreadyAdded === false) {
                        $scope.optionArray.push({ text: $scope.newOption, complete: false });
                    }
                } else {
                    $scope.optionArray.push({ text: $scope.newOption, complete: false });
                }
            }
            $scope.newOption = '';
    };
    $scope.dropOption = function(text) {
        var deletingItem = $scope.optionArray;
        $scope.optionArray = [];
        //update the task.
        angular.forEach(deletingItem, function(item) {
            if (item.text !== text) {
                $scope.optionArray.push(item);
            }
        });
    };
        
    $scope.addNew = function () {
        //console.log($scope.newTaskDay.name);
        if ($scope.newTaskDay.name === null || $scope.newTaskDay.name === '' || $scope.newTaskDay.name === undefined) {
            $scope.newTaskDay.name = 'Any';
        }
        if ($scope.newTaskCategory.name === null || $scope.newTaskCategory.name === '' || $scope.newTaskCategory.name === undefined) {
            $scope.newTaskCategory.name = 'Other';
        }
        if ($scope.newTaskDate === null || $scope.newTaskDate === '' || $scope.newTaskDate === undefined) {
            $scope.newTaskDate = $scope.today.toISOString().substring(0,10); // 'yyyy-MM-dd'
        }
        //not allowed to be tied to a day if a daily task -- daily takes precedence.
        if ($scope.newTaskDaily === true) {
            $scope.newTaskDay.name = 'Any';
        }
        //if is a checklist, cannot be daily and only repeats once.
        if ($scope.newTaskChecklist === true) {
            $scope.newTaskDaily = false;
            $scope.newTaskRepeat = 1;
        } else {
            $scope.optionArray = [];
        }
        
        //if created on a monday set updated=true - without this task could be deleted/un-completed by the check status method.
        var day = $scope.today.getDay(); //new Date('2015-05-04').getDay();
        $scope.taskItem.push({
            description: $scope.newTask,
            day: $scope.newTaskDay.name,
            date: $scope.newTaskDate,
            repeat: $scope.newTaskRepeat,
            completeTimes: 0,
            updated: day === 1 ? true : false,
            complete: false,
            category: $scope.newTaskCategory.name,
            daily: $scope.newTaskDaily,
            dailyRefresh: $scope.today.getDate(),
            checklist: $scope.newTaskChecklist,
            checklistOptions: $scope.optionArray
        });
        $scope.newTask = '';
        $scope.newTaskDay = $scope.days;
        $scope.newTaskDate = '';
        $scope.newTaskCategory = $scope.categories;
        $scope.newTaskRepeat = '';
        $scope.newTaskDaily = false;
        $scope.newTaskChecklist = false;
        $scope.optionArray = [];
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        NotificationFactory.success('Saved!', 'Task was saved successfully');
    };
    $scope.deleteTask = function (description) {
        //are you sure option...
       NotificationFactory.confirmation(function() {
            var deletingItem = $scope.taskItem;
            $scope.taskItem = [];
            //update the complete task.
            angular.forEach(deletingItem, function (taskItem) {
                if (taskItem.description !== description) {
                    $scope.taskItem.push(taskItem);
                }
            });
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
            NotificationFactory.warning('Deleted!', 'Task was successfully deleted');
        });
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
        
    $scope.tickOff = function(itemText, optionText) {
        //update the option for the task.
        angular.forEach($scope.taskItem, function (taskItem) {
            if (taskItem.description === itemText) {
                var i = 0;
                var optionsCompleted = 0;
                while(i < taskItem.checklistOptions.length) {
                    if (taskItem.checklistOptions[i].text === optionText) {
                        taskItem.checklistOptions[i].complete = true;
                    }
                    if (taskItem.checklistOptions[i].complete === true) {
                        optionsCompleted += 1;
                    }
                    i++;
                }
                //if all options complete, complete the task.
                if (taskItem.checklistOptions.length === optionsCompleted) {
                    taskItem.completeTimes += 1;
                    taskItem.complete = true;
                }
            }
        });
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };
    $scope.insertOption = function (description, newOption) {
        if (newOption!=='' && newOption!==undefined) {
            var i = 0, alreadyAdded = false;
            //find the item and insert the option.
            angular.forEach($scope.taskItem, function (taskItem) {
                if (taskItem.description === description) {
                    while(i < taskItem.checklistOptions.length) {
                        if (taskItem.checklistOptions[i].text === newOption) {
                            alreadyAdded = true;
                        }
                        i++;
                    }
                    //if not in array add it.
                    if (alreadyAdded === false) {
                        taskItem.checklistOptions.push({ text: newOption, complete: false });
                    }
                }
            });
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
             if (alreadyAdded === true) {
                 NotificationFactory.popup('Option already exists.', 'Please re-name and try again.', 'error');
             }
        }
    };

	}
]);
'use strict';

angular.module('core').directive('myProgress', function() {
  return function(scope, element, attrs) {
      scope.$watch(attrs.myProgress, function(val) {
          var type = 'checklist-progress';
          element.html('<div class="' + type + '" style="width: ' + val + '%;height: 100%"></div>');
      });
  };
})
.directive('anywhereButHere', function ($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.data('thing', true);

            /** On click, check what you clicked and whether you can ignore it.
             *    Based on checks false the ng-show of the anywhere-but-here element.
             */
            angular.element($document[0].body).on('click', function (e) {
                var inThing = angular.element(e.target).inheritedData('thing'),
                    ignore = angular.element(e.target).attr('ignore-here');
                if (!inThing && !ignore) {
                    scope.$apply(function () {
                        scope[attrs.ngShow] = false;
                    });
                }
            });
        }
    };
})
.directive('formatDate', function(){
  return {
   require: 'ngModel',
    link: function(scope, elem, attr, modelCtrl) {
      modelCtrl.$formatters.push(function(modelValue){
        return (modelValue === null) ? null : new Date(modelValue);
      });
    }
  };
})
.directive('loadingSpinner', ['$http', 'spinnerService', function($http, spinnerService) {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        templateUrl: '/modules/core/templates/loading-spinner.html',
        scope: {
            name: '@',
            size: '@?'
        },
        bindToController: 'loadingSpinner',
        controller: function ($scope) {
            $scope.active = false;
//            $scope.isLoading = function () {
//                return $http.pendingRequests.length > 0;
//            };
            
//            $scope.$watch($scope.isLoading, function (v) {
//                if ($scope.size === 'fullscreen') {
//                    if(v) {
//                        $scope.active = true;
//                    } else {
//                        $scope.active = false;
//                    }
//                }
//            });
            
            var api = {
                name: $scope.name,
                show: function () {
                    $scope.active = true;
                },
                hide: function () {
                    $scope.active = false;
                },
                toggle: function () {
                    $scope.active = !$scope.active;
                }
            };
            
            spinnerService._register(api);
            $scope.$on('$destroy', function () {
                spinnerService._unregister($scope.name);
            });
        }
    };
}]); 
'use strict';

angular.module('core').filter('dayFilter', function() {
    return function(array, daySelected) {
        return array.filter(function(item) {
            //special day filter
//            console.log(item);
            var ds = daySelected;
            if (ds==='1' && item.day==='Monday') {
                return item;
            } else if (ds==='2' && item.day==='Tuesday') {
                return item;
            } else if (ds==='3' && item.day==='Wednesday') {
                return item;
            } else if (ds==='4' && item.day==='Thursday') {
                return item;
            } else if (ds==='5' && item.day==='Friday') {
                return item;
            } else if (ds==='6' && item.day==='Saturday') {
                return item;
            } else if (ds==='0' && item.day==='Sunday') {
                return item;
            } else if (ds==='' || ds===null || ds===undefined) {
                return item;
            } else if (ds==='Any' && item.day==='Any') {
                return item;
            }
        });
    };
})
.filter('calendarFilter', function() {
    return function(array, datesSelected) {
        if (array) {
            return array.filter(function(item) {
                //date filter
                if (item.date === null || item.date === undefined) {
                    if (datesSelected === false) {
                        return item;
                    }
                    return false;
                }
                //console.log(item.date);
                var day = new Date().getDay(),
                diff = new Date().getDate() - day + (day === 0 ? 0:7);
                var temp = new Date();
                var wkEnd = new Date(temp.setDate(diff));
                var currentWkEnd = wkEnd.toISOString().substring(0,10);
    //            console.log('day: ' + day);
    //            console.log('date: ' + $scope.today.getDate());
    //            console.log('diff: ' + diff);
    //              console.log('wk-end: ' + currentWkEnd); // 0123-56-89

                if (datesSelected === false) {
                    if (item.date.substr(0,4) < currentWkEnd.substr(0,4)) {
                        return item;
                    } else if (item.date.substr(0,4) === currentWkEnd.substr(0,4)) {
                        if (item.date.substr(5,2) < currentWkEnd.substr(5,2)) {
                            return item;
                        } else if (item.date.substr(5,2) === currentWkEnd.substr(5,2)) {
                            if (item.date.substr(8,2) <= currentWkEnd.substr(8,2)) {
                                return item;
                            }
                        }
                    }
                } else if (datesSelected === true) {
                    if (item.date.substr(0,4) > currentWkEnd.substr(0,4)) {
                        return item;
                    } else if (item.date.substr(0,4) === currentWkEnd.substr(0,4)) {
                        if (item.date.substr(5,2) > currentWkEnd.substr(5,2)) {
                            return item;
                        } else if (item.date.substr(5,2) === currentWkEnd.substr(5,2)) {
                            if (item.date.substr(8,2) > currentWkEnd.substr(8,2)) {
                                return item;
                            }
                        }
                    }
                }
            });
        }
    };
})
.filter('dateSuffix', function($filter) {
  var suffixes = ['th', 'st', 'nd', 'rd'];
  return function(input) {
    if(input !== undefined){
        var dtfilter = $filter('date')(input, 'MMMM d'),
            day = parseInt(dtfilter.slice(-2)),
            relevantDigits = (day < 30) ? day % 20 : day % 30,
            suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0],
            dateArray = dtfilter.split(' '),
            month = dateArray[0];
        return dateArray[1] + suffix + ' ' + month + ' ' + $filter('date')(input, 'yyyy');
    }
  };
})
.filter('numberFixedLen', function () {
  return function (n, len) {
      var num = parseInt(n, 10);
      len = parseInt(len, 10);
      if (isNaN(num) || isNaN(len)) {
          return n;
      }
      num = ''+num;
      while (num.length < len) {
          num = '0'+num;
      }
      return num;
  };
});

'use strict';

//Service to provide common access to features.
angular.module('core')
.factory('NotificationFactory', function() {
    var self = this;
    /*global swal */
    /*global toastr */
        toastr.options = {
                'closeButton': false,
                'debug': false,
                'newestOnTop': false,
                'progressBar': false,
                'positionClass': 'toast-bottom-right',
                'preventDuplicates': false,
                'onclick': null,
                'showDuration': '300',
                'hideDuration': '1000',
                'timeOut': '5000',
                'extendedTimeOut': '1000',
                'showEasing': 'swing',
                'hideEasing': 'linear',
                'showMethod': 'fadeIn',
                'hideMethod': 'fadeOut'
            };
    return {
        success: function (title, text) {
            toastr.success(text, title, 'Success');
        },
        warning: function (title, text) {
            toastr.warning(text, title, 'Warning');
        },
        error: function (title, text) {
            toastr.error(text, title, 'Error');
        },
        popup: function (title, text, type) {
            swal({ 
                title: title,
                text: text,
                type: type
            });
        },
        confirmation: function (thenDo) {
              //are you sure option...
            swal({
                title: 'Are you sure?', 
                text: 'Are you sure that you want to delete this?', 
                type: 'warning',
                showCancelButton: true,
                closeOnConfirm: true,
                confirmButtonText: 'Yes, delete it!',
                confirmButtonColor: '#ec6c62'
            }, thenDo);
        }
    };
})
.factory('spinnerService', ['$q', function($q) {
var spinners = {},
    queue = {}, 
    loads = {};
    
  return {
      spinners: spinners,
    // private method for spinner registration.
    _register: function (data) {
        if (!data.hasOwnProperty('name')) {
            throw new Error('Spinner must specify a name when registering with the spinner service.');
        }
        if (spinners.hasOwnProperty(data.name)) {
            throw new Error('A spinner with the name \'' + data.name + '\' has already been registered.');
        }
        spinners[data.name] = data;
        // Increase the spinner count.
        this.count++;

        // Check if spinnerId was in the queue, if so then fire the
        // queued function.
        if (queue[data.name]) {
//            console.log(queue, loads);
            if(loads[data.name]) {
//                console.log(loads[data.name]);
                this[queue[data.name]](data.name, loads[data.name]);
                delete loads[data.name];
                delete queue[data.name];
            } else {
//                console.log('queued', queue);
                this[queue[data.name]](data.name);
                delete queue[data.name];
            }
        }
//        console.log(spinners);
    },
    _unregister: function (name) {
      if (spinners.hasOwnProperty(name)) {
        delete spinners[name];
      }
    },
    loading: function (name, optionsOrPromise) {
        if (!this.spinners[name]) {
            queue[name] = 'loading';
            loads[name] = optionsOrPromise;
//            console.log('defer', loads[name]);
            return;
        }
        var spinner = spinners[name];
        spinner.show(name);
        optionsOrPromise = optionsOrPromise || {};
        
        //Check if it's promise
        if (optionsOrPromise.always || optionsOrPromise['finally']) { 
            optionsOrPromise = {
                promise: optionsOrPromise
            };
        }

        var options = angular.extend({}, optionsOrPromise);

        if (options.promise) { 
            if (options.promise.always) {
                options.promise.always(function () {
                    spinner.hide(name);
                });
            } else if (options.promise['finally']) {
                options.promise['finally'](function () {
                    spinner.hide(name);
                });
            }
        }
    },
    show: function (name) {
//        console.log('show');
        if (!this.spinners[name]) {
            queue[name] = 'show';
            return;
        }
      var spinner = spinners[name];
      if (!spinner) {
        throw new Error('No spinner named \'' + name + '\' is registered.');
      }
      spinner.show();
    },
    hide: function (name) {
//        console.log('hide');
        if (!this.spinners[name]) {
            queue[name] = 'hide';
            return;
        }
      var spinner = spinners[name];
      if (!spinner) {
        throw new Error('No spinner named \'' + name + '\' is registered.');
      }
      spinner.hide();
    },
    toggle: function (name) {
//        console.log('toggle');
        if (!this.spinners[name]) {
            queue[name] = 'toggle';
            return;
        }
      var spinner = spinners[name];
      if (!spinner) {
        throw new Error('No spinner named \'' + name + '\' is registered.');
      }
      spinner.toggle();
    },
    count: 0
  };
}]);
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

// Setting up route
angular.module('favourites').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('favourites', {
			url: '/favourites',
			templateUrl: 'modules/favourites/views/favourites.client.view.html'
		})
        .state('animeFavourites', {
			url: '/animefavourites',
			templateUrl: 'modules/favourites/views/anime-favourites.client.view.html'
		})
        .state('mangaFavourites', {
			url: '/mangafavourites',
			templateUrl: 'modules/favourites/views/manga-favourites.client.view.html'
		})
        .state('characterFavourites', {
			url: '/characterfavourites',
			templateUrl: 'modules/favourites/views/character-favourites.client.view.html'
		});
	}
]);
'use strict';


angular.module('favourites').controller('FavouritesController', ['$scope', 'Authentication', '$window', '$sce', 'Animeitems', 'Mangaitems', '$location', 'NotificationFactory',
	function($scope, Authentication, $window, $sce, Animeitems, Mangaitems, $location, NotificationFactory) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.today = new Date().toISOString();
        //Anime Favourites
        $scope.saved = localStorage.getItem('favouriteAnimeitems'); 
        $scope.favouriteAnimeitem = (localStorage.getItem('favouriteAnimeitems')!==null) ? 
        JSON.parse($scope.saved) : [{rank: '1', date: $scope.today, anime: { 'title': 'Favourite Anime 1' }},{rank: '2', date: $scope.today, anime: { 'title': 'Favourite Anime 2' }},{rank: '3', date: $scope.today, anime: { 'title': 'Favourite Anime 3' }},{rank: '4', date: $scope.today, anime: { 'title': 'Favourite Anime 4' }},{rank: '5', date: $scope.today, anime: { 'title': 'Favourite Anime 5' }}]; 
        localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
        
        //Manga Favourites
        $scope.saved = localStorage.getItem('favouriteMangaitems'); 
        $scope.favouriteMangaitem = (localStorage.getItem('favouriteMangaitems')!==null) ? 
        JSON.parse($scope.saved) : [{rank: '1', date: $scope.today, manga: { 'title': 'Favourite Manga 1' }},{rank: '2', date: $scope.today, manga: { 'title': 'Favourite Manga 2' }},{rank: '3', date: $scope.today, manga: { 'title': 'Favourite Manga 3' }},{rank: '4', date: $scope.today, manga: { 'title': 'Favourite Manga 4' }},{rank: '5', date: $scope.today, manga: { 'title': 'Favourite Manga 5' }}]; 
        localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        // Find a list of Anime
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
            //console.log($scope.characters);
		};
        // Find a list of Manga
		$scope.findManga = function() {
			$scope.mangaitems = Mangaitems.query();
            //console.log($scope.characters);
		};
        
        function favouriteLimitReached() {
            NotificationFactory.popup('Favourite limit reached!', 'Only allowed 5 favourites. \nPlease remove one if you wish to add another.', 'error');
        }
        
        /**
         *  Add, reorder, remove FAVOURITES
         */
        $scope.addFavourite = function(type) {
            if (type === 'anime') {
                if ($scope.favouriteAnimeitem.length < 5) {
                    $scope.favouriteAnimeitem.push({ date: $scope.today, anime: $scope.favourite });
                    localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                    $scope.favourite = '';
                } else {
                    favouriteLimitReached();
                }
            } else if (type === 'manga') {
                if ($scope.favouriteMangaitem.length < 5) {
                    $scope.favouriteMangaitem.push({ date: $scope.today, manga: $scope.favourite });
                    localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                    $scope.favourite = '';
                } else {
                    favouriteLimitReached();
                }
            }
        };
        
        $scope.removeFavourite = function(kill) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
                var deletingItem;
                if (kill.anime !== undefined) {
                    deletingItem = $scope.favouriteAnimeitem;
                    $scope.favouriteAnimeitem = [];
                    //update the complete task.
                    angular.forEach(deletingItem, function (item) {
                        if (item !== kill) {
                            $scope.favouriteAnimeitem.push(item);
                        }
                    });
                    localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                    $scope.$apply();
                    NotificationFactory.warning('Deleted!', 'Favourite was successfully deleted');
                } else if (kill.manga !== undefined) {
                    deletingItem = $scope.favouriteMangaitem;
                    $scope.favouriteMangaitem = [];
                    //update the complete task.
                    angular.forEach(deletingItem, function (item) {
                        if (item !== kill) {
                            $scope.favouriteMangaitem.push(item);
                        }
                    });
                    localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                    $scope.$apply();
                    NotificationFactory.warning('Deleted!', 'Favourite was successfully deleted');
                }
            });
        };
        
        $scope.reorderFavourites = function(favourite) {
//            console.log(favourite);
            if ($scope.selectedFavourite===favourite) {
                $scope.selectedFavourite = undefined;
                $scope.selectedFavouriteTwo = undefined;
            } else {
                if ($scope.selectedFavourite===undefined) {
                    $scope.selectedFavourite = favourite;
                } else {
                    $scope.selectedFavouriteTwo = favourite;
                    var ind1, ind2, hold;
                    if ($scope.selectedFavourite.anime!==undefined) {
//                        console.log('change places');
                        ind1 = $scope.favouriteAnimeitem.indexOf($scope.selectedFavourite);
                        ind2 = $scope.favouriteAnimeitem.indexOf($scope.selectedFavouriteTwo);
                        hold = $scope.favouriteAnimeitem[ind1];
                        $scope.favouriteAnimeitem[ind1] = $scope.favouriteAnimeitem[ind2];
                        $scope.favouriteAnimeitem[ind2] = hold;
                        
//                        console.log($scope.favouriteAnimeitem);
                        localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                        NotificationFactory.success('Moved!', 'Favourite was successfully moved');
                        $scope.selectedFavourite = undefined;
                        $scope.selectedFavouriteTwo = undefined;
                    } else if ($scope.selectedFavourite.manga!==undefined) {
//                        console.log('change places');
                        ind1 = $scope.favouriteMangaitem.indexOf($scope.selectedFavourite);
                        ind2 = $scope.favouriteMangaitem.indexOf($scope.selectedFavouriteTwo);
                        hold = $scope.favouriteMangaitem[ind1];
                        $scope.favouriteMangaitem[ind1] = $scope.favouriteMangaitem[ind2];
                        $scope.favouriteMangaitem[ind2] = hold;
                        
//                        console.log($scope.favouriteMangaitem);
                        localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                        NotificationFactory.success('Moved!', 'Favourite was successfully moved');
                        $scope.selectedFavourite = undefined;
                        $scope.selectedFavouriteTwo = undefined;
                    }
                }
            }
        };
    }
]);
'use strict';

angular.module('favourites').directive('favouriteBack', function(){
    return function(scope, element, attrs){
        var url = attrs.favouriteBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '100%',
            'background-repeat': 'no-repeat',
            'background-position': 'right'
        });
    };
});
'use strict';

// Setting up route
angular.module('history').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('history', {
			url: '/history',
			templateUrl: 'modules/history/views/history.client.view.html'
		});
	}
]);
'use strict';

// History controller
angular.module('history').controller('HistoryController', ['$scope', '$stateParams', '$location', 'Authentication', 'AnimeHistory', 'MangaHistory', 'HistoryService', 'ListService', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, AnimeHistory, MangaHistory, HistoryService, ListService, spinnerService) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        $scope.view = 'Anime';
        $scope.filterConfig = {
            historyFilter: 'Today'
        };
        $scope.historyGroups = [
            { name: 'Today' },
            { name: 'Yesterday' },
            { name: 'This week' },
            { name: 'Last week' },
            { name: 'Two weeks ago' },
            { name: 'Three weeks ago' },
            { name: 'Four weeks ago' },
        ];
        var latestDate = new Date().setDate(new Date().getDate() - 29);

        $scope.buildHistory = function() {
            spinnerService.loading('history', AnimeHistory.query({ latest: latestDate }).$promise.then(function(result) {
								return HistoryService.buildHistoryList(result);
							}).then(function(result) {
                  //  console.log('build anime history: ', result);
 								$scope.animeHistory = result;
                return MangaHistory.query({ latest: latestDate }).$promise;
            }).then(function(result) {
//                console.log('manga', result);
								return HistoryService.buildHistoryList(result);
            }).then(function(result) {
//                    console.log('build manga history: ', result);
								$scope.mangaHistory = result;
						})
					);
        };
        //Needed to catch 'Character' setting and skip it.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                if (newValue !== 'Anime' && newValue !== 'Manga') {
                    $scope.view = 'Anime';
                }
            }
        });

        $scope.happenedWhen = function(when) {
            return HistoryService.happenedWhen(when);
        };

    }
]);

'use strict';

angular.module('history')
.filter('historySeparator', ['HistoryService', 'moment', function(HistoryService, moment) {
    return function(array, level, timeframe) {
        var itemDate,
            attr = (level === 'group') ? 'latest' : 'date';
        if (array !== undefined) {
            return array.filter(function(item) {
                itemDate = moment(item[attr]).startOf('day');
                return HistoryService.filterItemHistory(timeframe.toLowerCase(), itemDate) ? item : false;
            });
        }
    };
}]);
'use strict';

//History service used to communicate Animeitems REST endpoints
angular.module('history')
.factory('AnimeHistory', ['$resource',
        function($resource) {
            return $resource('history/anime/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
        }
    ])
.factory('MangaHistory', ['$resource',
        function($resource) {
            return $resource('history/manga/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
        }
    ])
.service('HistoryService', ['moment', '$q', function(moment, $q) {
      
    // getting mondays and sundays for this, last, two and three weeks ago.
    this.getEndsOfWeek = function() {
        var self = this, endsOfWeek = [], thisMonday = self.weekBeginning(), thisSunday = self.weekEnding();
        endsOfWeek = { 
            mondays: [ thisMonday, self.getSetDaysAgo(thisMonday, 7), self.getSetDaysAgo(thisMonday, 14), self.getSetDaysAgo(thisMonday, 21), self.getSetDaysAgo(thisMonday, 28) ],
            sundays: [ thisSunday, self.getSetDaysAgo(thisSunday, 7), self.getSetDaysAgo(thisSunday, 14), self.getSetDaysAgo(thisSunday, 21), self.getSetDaysAgo(thisSunday, 28) ]
        };
        return endsOfWeek;        
    };
    //get 'daysAgo' days ago from 'thisEnd' date.
    this.getSetDaysAgo = function(thisEnd, daysAgo) {
        var newDate = moment(thisEnd).subtract(daysAgo, 'days');
        return newDate;
    };
    //get 'this' monday.
    this.weekBeginning = function() {
        var date = new Date(),
            day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? -6:1),
            temp = new Date(),
            wkBeg = new Date(temp.setDate(diff));
        return moment(wkBeg.toISOString()).startOf('day');
    };
    //get 'this' sunday.
    this.weekEnding = function() {
        var date = new Date(),
            day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? 0:7),
            temp = new Date(),
            wkEnd = new Date(temp.setDate(diff));
        return moment(wkEnd.toISOString()).endOf('day');
    };
    
    //Variables that require the above functions;
    this.today = moment(new Date()).startOf('day');
    this.endsOfWeek = this.getEndsOfWeek();
    this.mondays = this.endsOfWeek.mondays;
    this.sundays = this.endsOfWeek.sundays;

    this.buildHistoryList = function(items) {
        var deferred = $q.defer(),
            self = this,
            promise = self.extractHistory(items).then(function(result) {
//                console.log('extract history: ', result);
                result.sort(function (a, b) {
                    var dateA = a.date,
                        dateB = b.date;
                    if(dateA > dateB) return -1;
                    if(dateA < dateB) return 1;
                    if(dateA === dateB) return 0;
                });
                return self.groupItemHistory(result);
            }).then(function(result) {
//                console.log('grouped', result);
                deferred.resolve(result);
            });
        return deferred.promise;
    };
    
    this.extractHistory = function(items) {
        var deferred = $q.defer(),
            itemHistory = [], today = moment(new Date()).startOf('day');
        angular.forEach(items, function(item) {
            angular.forEach(item.meta.history, function(history) {
                var cutoff = moment(history.date).startOf('day'),
                    diff = today.diff(cutoff, 'days');
//                console.log(diff);
                if (diff < 29) {
                    itemHistory.push({ date: history.date, value: history.value, title: item.title, id: item._id });
                }
            });
        });
        deferred.resolve(itemHistory);
        return deferred.promise;
    };
    
    this.groupItemHistory = function(itemHistory) {
        var deferred = $q.defer(),
            index, prevItem, item, group,
            length = itemHistory.length,
            groupedHistory = [];
        for(var i = 0; i < length; i++) {
            item = itemHistory[i];
            if (i === 0) {
                groupedHistory.push({
                    title: item.title,
                    items: [],
                    count: 1,
                    latest: item.date,
                    oldest: item.date
                });
                groupedHistory[0].items.push(item);
            } else if (i !== 0) {
                prevItem = itemHistory[i - 1];
                index = groupedHistory.length - 1;
                if (prevItem.title === item.title) {
                    groupedHistory[index].items.push(item);
                    groupedHistory[index].count++;
                    groupedHistory[index].oldest = item.date;
                } else if (prevItem.title !== item.title) {
                    group = {
                        title: item.title,
                        items: [],
                        count: 1,
                        latest: item.date,
                        oldest: item.date
                    };
                    group.items.push(item);
                    groupedHistory.push(group);
                }
            }
        }
        deferred.resolve(groupedHistory);
        return deferred.promise;
    };
    
    this.filterItemHistory = function(timeframe, itemDate) {
        var self = this,
            diff = self.today.diff(itemDate, 'days');
        switch(timeframe) {
            case 'today':
                return diff === 0;
                
            case 'yesterday':
                return diff === 1;
                
            case 'this week':
                return self.mondays[0] <= itemDate && itemDate <= self.sundays[0];
                
            case 'last week':
                return self.mondays[1] <= itemDate && itemDate <= self.sundays[1];
                
            case 'two weeks ago':
                return self.mondays[2] <= itemDate && itemDate <= self.sundays[2];
            
            case 'three weeks ago':
                return self.mondays[3] <= itemDate && itemDate <= self.sundays[3];
                
            case 'four weeks ago':
                return self.mondays[4] <= itemDate && itemDate <= self.sundays[4];
        }
    };
    
    /** function to display relative time.
     *  Using diff because fromNow will create conflicts between
     *  the item date and the 'group date'.
     */
    this.happenedWhen = function(when) {
//          console.log(latest, updated);
        var today = moment(new Date()).startOf('day'), thisDate = moment(when).startOf('day'),
            diff = today.diff(thisDate, 'days');
                
        //for 0 and 1 day(s) ago use the special term.
        if (diff === 0) {
            return 'Today at ' + moment(when).format('HH:mm');
        } else if (diff === 1) {
            return 'Yesterday at ' + moment(when).format('HH:mm');
        } else {
            return diff + ' days ago at ' + moment(when).format('HH:mm');
        }
    };

}]);
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
angular.module('mangaitems').controller('MangaitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'MangaFactory', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, MangaFactory, spinnerService) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        $scope.whichController = 'mangaitem';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            showingCount: 0,
            sortType: '',
            sortReverse: true,
            ratingLevel: undefined,
            ratingActions: {
                maxRating: 10,
                percent: undefined,
                overStar: null
            },
            searchTags: '',
            tagsForFilter: [],
            taglessItem: false,
            areTagless: false,
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            statTags: []
        };

        /** today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
         *      AND chapter/volume/start/latest auto-pop in create.
         */
        $scope.itemUpdate = new Date();
        $scope.start = $scope.itemUpdate;
        $scope.latest = $scope.itemUpdate;
        $scope.chapters = 0;
        $scope.volumes = 0;
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };

        //for adding/removing tags.
        $scope.addTag = function () {
//            console.log($scope.newTag);
            $scope.tagArray = ListService.addTag($scope.tagArray, $scope.newTag);
            $scope.newTag = '';
        };

        $scope.$watchCollection('mangaitems', function() {
            if ($scope.mangaitems!==undefined) {
//                console.log($scope.mangaitems);
                $scope.filterConfig.areTagless = ListService.checkForTagless($scope.mangaitems);
                $scope.filterConfig.statTags = ItemService.buildStatTags($scope.mangaitems, 0);
            }
        });

        // Create new Mangaitem
		$scope.create = function() {

            var mangaitem = new Mangaitems();
            //Handle situation if objects not selected.
                // Create new Mangaitem object
			     mangaitem = new Mangaitems ({
				    title: this.title,
                    chapters: this.chapters,
                    volumes: this.volumes,
                    start: this.start,
                    latest: this.latest,
                    finalChapter: this.finalChapter,
                    finalVolume: this.finalVolume,
                    hardcopy: this.hardcopy,
                    anime: this.anime!==undefined && this.anime!==null ? this.anime._id : this.anime,
                    tags: $scope.tagArray,
                    user: this.user
			     });

			// Redirect after save
			mangaitem.$save(function(response) {
				$location.path('/mangaitems/' + response._id);
                NotificationFactory.success('Saved!', 'Manga was saved successfully');
				// Clear form fields
				$scope.title = '';
                $scope.chapters = '';
                $scope.volumes = '';
                $scope.start = '';
                $scope.latest = '';
                $scope.status = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
		};

		// Remove existing Mangaitem
		$scope.remove = function(mangaitem) {
            //are you sure option...
            NotificationFactory.confirmation(function() {
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
                NotificationFactory.warning('Deleted!', 'Manga was successfully deleted.');
            });
		};

		// Update existing Mangaitem
		$scope.update = function() {
			var mangaitem = $scope.mangaitem;
            $scope.mangaitem = undefined;
            MangaFactory.update(mangaitem, $scope.tagArray, $scope.updateHistory, $scope.imgPath);
		};
        $scope.tickOff = function(item) {
            item.chapters += 1;
            item.latest = new Date(); //update latest.
            $scope.updateHistory = true; //add to history.
            $scope.mangaitem = item;
            $scope.update();
        };

		// Find a list of Mangaitems
		$scope.find = function() {
            spinnerService.loading('manga', Mangaitems.query().$promise.then(function(result) {
                $scope.mangaitems = result;
            }));
		};

		// Find existing Mangaitem
		$scope.findOne = function() {
            Mangaitems.get({ mangaitemId: $stateParams.mangaitemId }).$promise.then(function(result) {
                $scope.mangaitem = result;
                //            console.log($scope.mangaitem);
            });
		};

        // Find a list of Animeitems for dropdowns.
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
		};

        //image upload
        $scope.uploadFile = function(){
            $scope.imgPath = '/modules/mangaitems/img/' + $scope.myFile.name;
            fileUpload.uploadFileToUrl($scope.myFile, '/fileUpload');
        };

        //latest date display format.
        $scope.latestDate = function(latest, updated) {
            return ItemService.latestDate(latest, updated);
        };

        $scope.deleteHistory = function(item, history) {
            //are you sure option...
           NotificationFactory.confirmation(function() {
                $scope.mangaitem = ItemService.deleteHistory(item, history);
                $scope.update();
            });
        };
	}
]);

//'use strict';
//
//angular.module('mangaitems')
//.directive('fileModel', ['$parse', function ($parse) {
//    return {
//        restrict: 'A',
//        link: function(scope, element, attrs) {
//            var model = $parse(attrs.fileModel);
//            var modelSetter = model.assign;
//            
//            element.bind('change', function(){
//                scope.$apply(function(){
//                    modelSetter(scope, element[0].files[0]);
//                });
//            });
//        }
//    };
//}]);
//.directive('listBack', function(){
//    return function(scope, element, attrs){
//        var url = attrs.listBack;
//        element.css({
//            'background-image': 'url(' + url +')',
//            'background-size' : '50%',
//            'background-repeat': 'no-repeat',
//            'background-position': 'right'
//        });
//    };
//});

'use strict';

//angular.module('mangaitems').filter('startFrom', function() {
//    return function(input, start) {
//        start = +start; //parse to int
//        return input.slice(start);
//    };
//});
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
.factory('MangaFactory', ['Mangaitems', 'ListService', 'ItemService', 'NotificationFactory', '$location', function(Mangaitems, ListService, ItemService, NotificationFactory, $location) {
    return {
        update: function(item, tagArray, updateHistory, imgPath) {
            var mangaitem = item;
            console.log(mangaitem);
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if (item.anime!==null && item.anime!==undefined) {
                mangaitem.anime = item.anime._id;
            }
            
            if (tagArray!==undefined) {
                mangaitem.tags = ListService.concatenateTagArrays(mangaitem.tags, tagArray);
            }
            
            //update the item history.
            mangaitem = ItemService.itemHistory(mangaitem, updateHistory, 'manga');
            
            if (imgPath!==undefined && imgPath!==null && imgPath!=='') {
                mangaitem.image = imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(mangaitem.image);
            
            //handle end date
            if (mangaitem.chapters===mangaitem.finalChapter && mangaitem.finalChapter!==0) {
                if (mangaitem.end===undefined || mangaitem.end===null) {
                    mangaitem.volumes = mangaitem.finalVolume;
                    mangaitem.end = mangaitem.latest;
                    //console.log(animeitem.end);
                }
            } else if (mangaitem.reReading === false) {
                mangaitem.end = null;
            }
            
            //handle status: completed.
            if(mangaitem.end!==undefined && mangaitem.end!==null) {
                mangaitem.status = true;
            } else {
                mangaitem.status = false;
            }
            
            //handle re-reading, re-read count.
            if (mangaitem.reReading===true && mangaitem.chapters===mangaitem.finalChapter) {
                mangaitem.volumes = mangaitem.finalVolume;
                mangaitem.reReadCount += 1;
                mangaitem.reReading = false;
            }
            
			mangaitem.$update(function() {
				if (window.location.href.indexOf('tasks') === -1) $location.path('/mangaitems');

                NotificationFactory.success('Saved!', 'Manga was saved successfully');
			}, function(errorResponse) {
				var error = errorResponse.data.message;
                NotificationFactory.error('Error!', errorResponse.data.message);
			});
            
            
        }
    };
}]);
'use strict';

// Configuring the Articles module
angular.module('orders').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Orders', 'orders', 'dropdown', '/orders(/create)?');
		Menus.addSubMenuItem('topbar', 'orders', 'List Orders', 'orders');
		Menus.addSubMenuItem('topbar', 'orders', 'New Order', 'orders/create');
	}
]);
'use strict';

//Setting up route
angular.module('orders').config(['$stateProvider',
	function($stateProvider) {
		// Orders state routing
		$stateProvider.
		state('listOrders', {
			url: '/orders',
			templateUrl: 'modules/orders/views/list-orders.client.view.html'
		}).
		state('createOrder', {
			url: '/orders/create',
			templateUrl: 'modules/orders/views/create-order.client.view.html'
		}).
		state('viewOrder', {
			url: '/orders/:orderId',
			templateUrl: 'modules/orders/views/view-order.client.view.html'
		}).
		state('editOrder', {
			url: '/orders/:orderId/edit',
			templateUrl: 'modules/orders/views/create-order.client.view.html'
		});
	}
]);

'use strict';
var CompleteOrdersController = (function () {
    function CompleteOrdersController($scope, $uibModalInstance, order) {
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.order = order;
        this.newPrice = {
            company: '',
            price: null
        };
    }
    CompleteOrdersController.prototype.editOrder = function (index) {
        var item = this.order.nextVolume.prices[index];
        this.newPrice.company = item.company;
        this.newPrice.price = item.price;
        this.order.nextVolume.prices.splice(index, 1);
    };
    CompleteOrdersController.prototype.completeOrder = function () {
        this.order.nextVolume.prices.push({ company: this.newPrice.company, date: this.newPrice.date, price: this.newPrice.price, rrp: this.order.rrp, paid: true });
        this.$uibModalInstance.close(this.order);
    };
    CompleteOrdersController.prototype.cancel = function () {
        this.$uibModalInstance.dismiss('cancel');
    };
    CompleteOrdersController.controllerId = 'CompleteOrdersController';
    CompleteOrdersController.$inject = ['$scope', '$uibModalInstance', 'order'];
    return CompleteOrdersController;
}());
angular.module('orders').controller(CompleteOrdersController.controllerId, CompleteOrdersController);

'use strict';
var CreateOrdersController = (function () {
    function CreateOrdersController($scope, $stateParams, $location, Authentication, $q, Orders, Mangaitems, $uibModal, NotificationFactory) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$location = $location;
        this.Authentication = Authentication;
        this.$q = $q;
        this.Orders = Orders;
        this.Mangaitems = Mangaitems;
        this.$uibModal = $uibModal;
        this.NotificationFactory = NotificationFactory;
        this.isCreateMode = this.$stateParams.orderId === undefined;
        this.order = {};
        this.orderCopy = {
            series: '',
            nextVolume: {
                volume: 1,
                date: Date.now(),
                rrp: 0.00,
                prices: []
            },
            rrp: 0.00,
            orderHistory: []
        };
        this.authentication = this.Authentication;
        this.stepConfig = {
            stepHeaders: [
                { text: 'Set next order' },
                { text: 'Set prices' }
            ],
            currentStep: 1,
            stepCount: 2,
            items: []
        };
        this.init();
    }
    CreateOrdersController.prototype.init = function () {
        var _this = this;
        angular.copy(this.orderCopy, this.order);
        if (this.isCreateMode) {
            console.log('create mode');
            this.Mangaitems.query().$promise.then(function (result) {
                _this.stepConfig.items = result;
                console.log('items: ', result);
            });
        }
        else {
            console.log('edit mode');
            this.findOne();
        }
        console.log('init done: ');
    };
    CreateOrdersController.prototype.takeStep = function (step, direction) {
        console.log('stepping: ', step, direction);
        this.stepConfig.currentStep = (direction) ? step + 1 : step - 1;
    };
    CreateOrdersController.prototype.processOrder = function () {
        if (this.order.nextVolume.volume > 0) {
            var temp = angular.copy(this.order.nextVolume);
            this.order.orderHistory.push(this.order.nextVolume);
            this.order.nextVolume = {
                volume: temp.volume + 1,
                date: null,
                rrp: this.order.rrp,
                prices: []
            };
            this.update();
        }
    };
    CreateOrdersController.prototype.cancel = function () {
        this.$location.path('orders');
    };
    CreateOrdersController.prototype.create = function () {
        var _this = this;
        var order = new this.Orders({
            series: this.order.series._id,
            nextVolume: {
                date: this.order.nextVolume.date,
                volume: this.order.nextVolume.volume,
                rrp: this.order.nextVolume.rrp,
                prices: this.order.nextVolume.prices
            },
            rrp: this.order.rrp,
            orderHistory: this.order.orderHistory
        });
        order.$save(function (response) {
            _this.$location.path('orders/' + response._id);
            _this.NotificationFactory.success('Saved!', 'New Order was successfully saved!');
            angular.copy(_this.orderCopy, _this.order);
        }, function (errorResponse) {
            this.error = errorResponse.data.message;
            this.NotificationFactory.error('Error!', 'Order failed to save!');
        });
    };
    CreateOrdersController.prototype.update = function () {
        var _this = this;
        var order = this.order;
        order.$update(function () {
            _this.$location.path('orders/' + order._id);
            _this.NotificationFactory.success('Saved!', 'Order was successfully saved!');
        }, function (errorResponse) {
            this.error = errorResponse.data.message;
            this.NotificationFactory.error('Error!', 'Order failed to save!');
        });
    };
    CreateOrdersController.prototype.openBoughtDialog = function () {
        var _this = this;
        var modalInstance = this.$uibModal.open({
            animation: true,
            templateUrl: '/modules/orders/views/complete-order.client.view.html',
            controller: 'CompleteOrdersController as modal',
            size: 'md',
            resolve: {
                order: function () {
                    return _this.order;
                }
            }
        });
        modalInstance.result.then(function (result) {
            console.log(result);
            _this.order = result;
            _this.processOrder();
        });
    };
    CreateOrdersController.prototype.findOne = function () {
        this.order = this.Orders.get({ orderId: this.$stateParams.orderId });
        console.log('found one: ', this.order);
    };
    CreateOrdersController.controllerId = 'CreateOrdersController';
    CreateOrdersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', '$q', 'Orders', 'Mangaitems', '$uibModal', 'NotificationFactory'];
    return CreateOrdersController;
}());
angular.module('orders').controller(CreateOrdersController.controllerId, CreateOrdersController);

'use strict';
var OrderHistoryController = (function () {
    function OrderHistoryController($scope, $uibModalInstance, order, $filter) {
        this.$scope = $scope;
        this.$uibModalInstance = $uibModalInstance;
        this.order = order;
        this.$filter = $filter;
        this.processHistory();
    }
    OrderHistoryController.prototype.processHistory = function () {
        var _this = this;
        angular.forEach(this.order.orderHistory, function (item) {
            console.log('order history: ', item);
            var len = item.prices.length;
            for (var i = 0; i < len; i++) {
                if (item.prices[i].paid) {
                    var cost = _this.$filter('number')(item.prices[i].price, 2), rrp = _this.$filter('number')(item.prices[i].rrp, 2);
                    item.purchaseDate = item.prices[i].date;
                    item.paid = cost;
                    item.rrpInstance = rrp;
                    item.saving = ((cost / rrp) * 100).toFixed(2);
                }
            }
        });
    };
    OrderHistoryController.prototype.cancel = function () {
        this.$uibModalInstance.dismiss('cancel');
    };
    OrderHistoryController.controllerId = 'OrderHistoryController';
    OrderHistoryController.$inject = ['$scope', '$uibModalInstance', 'order', '$filter'];
    return OrderHistoryController;
}());
angular.module('orders').controller(OrderHistoryController.controllerId, OrderHistoryController);

'use strict';
var OrdersController = (function () {
    function OrdersController($scope, $stateParams, $location, Authentication, Orders, spinnerService, $uibModal) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$location = $location;
        this.Authentication = Authentication;
        this.Orders = Orders;
        this.spinnerService = spinnerService;
        this.$uibModal = $uibModal;
        this.authentication = this.Authentication;
        this.order = undefined;
        this.orders = [];
        this.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        this.init();
    }
    OrdersController.prototype.init = function () {
        console.log('init: ', this.$stateParams);
        if (this.$stateParams.orderId) {
            console.log('find one');
            this.findOne();
        }
        else {
            console.log('find all');
            this.find();
        }
    };
    OrdersController.prototype.remove = function (order) {
        if (order) {
            order.$remove();
            for (var i = 0, length = this.order.length; i < length; i++) {
                if (this.orders[i] === order) {
                    this.orders.splice(i, 1);
                    return;
                }
            }
        }
        else {
            this.order.$remove(function () {
                this.$location.path('orders');
            });
        }
    };
    OrdersController.prototype.find = function () {
        var _this = this;
        this.spinnerService.loading('orders', this.Orders.query().$promise.then(function (result) {
            _this.orders = result;
        }));
    };
    OrdersController.prototype.findOne = function () {
        var _this = this;
        this.spinnerService.loading('orders', this.Orders.get({ orderId: this.$stateParams.orderId }).$promise.then(function (result) {
            _this.order = result;
        }));
    };
    OrdersController.prototype.openOrderHistoryDialog = function () {
        var _this = this;
        var modalInstance = this.$uibModal.open({
            animation: true,
            templateUrl: '/modules/orders/views/order-history.client.view.html',
            controller: 'OrderHistoryController as modal',
            size: 'md',
            resolve: {
                order: function () {
                    return _this.order;
                }
            }
        });
    };
    OrdersController.controllerId = 'OrdersController';
    OrdersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Orders', 'spinnerService', '$uibModal'];
    return OrdersController;
}());
angular.module('orders').controller(OrdersController.controllerId, OrdersController);

'use strict';

//Orders service used to communicate Orders REST endpoints
angular.module('orders').factory('Orders', ['$resource',
	function($resource) {
		return $resource('orders/:orderId', { orderId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Setting up route
angular.module('ratings').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('ratings', {
			url: '/ratings',
			templateUrl: 'modules/ratings/views/ratings.client.view.html'
		});
	}
]);
'use strict';

// History controller
angular.module('ratings').controller('RatingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'ListService', 'NotificationFactory', 'StatisticsService', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, ListService, NotificationFactory, StatisticsService, spinnerService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.go = function(id) {
            $location.path('/mangaitems/' + id);
        };
        
        $scope.view = 'Anime';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 50
        };
        $scope.sortType = 'rating';
        $scope.sortReverse = true;
        $scope.viewItem = undefined;
        $scope.ratingLevel = undefined; //default rating filter
        //rating 'tooltip' function
        $scope.maxRating = 10;
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        function getItems(view) {
            if (view === 'Anime') {
                spinnerService.loading('rating', Animeitems.query().$promise.then(function(result) {
                    $scope.items = result;
                }));
            } else if (view === 'Manga') {
                spinnerService.loading('rating', Mangaitems.query().$promise.then(function(result) {
                    $scope.items = result;
                }));
            }
            $scope.viewItem = undefined;
//            console.log(view, $scope.items);
        }
        
        $scope.find = function(view) {
            getItems(view);
        };
        
        //Needed to catch 'Character' setting and skip it.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                $scope.isLoading = true;
                if (newValue !== 'Anime' && newValue !== 'Manga') {
                    $scope.view = 'Anime';
                } else {
                    getItems($scope.view);
                }
            }
        });
        
        //apply new score.
        $scope.itemScore = function(item, score) {
            if (item.rating !== score) {
                item.rating = score;

                item.$update(function() {
                    $location.path('ratings');
                    NotificationFactory.success('Saved!', 'New rating was saved successfully');
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                    NotificationFactory.error('Error!', 'Your change failed!');
                }); 
//                console.log('update');
            }
            return false;
        };
        
        /** Episode rating functions below here.
         */        
        $scope.viewEpisodeRatings = function(item) {
            $scope.viewItem = ($scope.viewItem !== item) ? item : undefined;
            $scope.isEqual = ($scope.viewItem === item) ? true : false; 
            $scope.search = ($scope.viewItem === item) ? item.title : '';
            if ($scope.viewItem !== undefined) {
                spinnerService.loading('summary', 
                                       StatisticsService.buildSummaryFunctions($scope.viewItem.meta.history).then(function(result) {
                    $scope.summaryFunctions = result;
                }));
            }
        };
        
        $scope.episodeScore = function(finished) {
//            console.log('finished: ', finished, $scope.viewItem.meta.history);
            if (finished) {
                var item = $scope.viewItem;
                item.$update(function() {
                    $location.path('ratings');
                    NotificationFactory.success('Saved!', 'New episode rating was saved successfully');
                    spinnerService.loading('summary',
                                           StatisticsService.buildSummaryFunctions($scope.viewItem.meta.history).then(function(result) {
                        $scope.summaryFunctions = result;
                    }));
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                    NotificationFactory.error('Error!', 'Your change failed!');
                }); 
            }
        };
        
        
    }
]);
'use strict';

angular.module('ratings').directive('focusOnShow', function($timeout) {
    return function(scope, element, attrs) {
       scope.$watch(attrs.focusOnShow, function (newValue) { 
//            console.log('preview changed!')
            $timeout(function() {
                var myValue = newValue && element[0].focus();
                return myValue;
            });
         },true);
      };    
});
'use strict';

// Setting up route
angular.module('statistics').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/signin');

		// Home state routing
		$stateProvider
        .state('statistics', {
			url: '/statistics',
			templateUrl: 'modules/statistics/views/statistics.client.view.html'
		});
	}
]);
'use strict';

// Statistics controller
angular.module('statistics').controller('StatisticsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'Characters', 'ListService', 'ItemService', 'CharacterService', 'StatisticsService', '$filter', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, Characters, ListService, ItemService, CharacterService, StatisticsService, $filter, spinnerService) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        $scope.view = 'Anime';
        $scope.detail = {
            isVisible: false,
            year: '',
            division: '',
            divisionText: '',
            history: 'months',
            summary: {
                type: '',
                isVisible: false
            },
            isEpisodeRatings: false
        };
        $scope.commonArrays = ListService.getCommonArrays('statistics');
        $scope.filterConfig = {
            show: {
                tag: false,
                series: false,
                voice: false
            },
            sort: {
								episodeRating: {
									type: 'title',
									reverse: false
								},
                tag: {
                    type: 'ratingWeighted',
                    reverse: true
                },
                tagDetail: {
                    type: 'count',
                    reverse: true
                },
                series: {
                    type: 'count',
                    reverse: true
                },
                voice: {
                    type: 'count',
                    reverse: true
                },
            },
            search: {
                tag: '',
                tagDetail: '',
                series: '',
                voice: ''
            }
        };
        $scope.overview = {}; //holds summary/overview details.
        $scope.gender = {}; //holds gender summary details.
        $scope.statTags = []; //for tag statistics;
        $scope.ratingsDistribution = []; //counts for each rating.
        $scope.statSeries = []; //for series statistics;
        $scope.voiceActors = []; //for voice actor list;
        $scope.historyDetails = {};
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.
        //handle getting view items and setting view specific defaults.
        function getItems(view) {
            if (view === 'Anime') {
                $scope.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
                spinnerService.loading('items', Animeitems.query().$promise.then(function(result) {
                    $scope.items = result;
                }));
            } else if (view === 'Manga') {
                $scope.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
                spinnerService.loading('items', Mangaitems.query().$promise.then(function(result) {
                    $scope.items = result;
										$scope.detail.isEpisodeRatings = false;
                }));
            } else if (view === 'Character') {
                $scope.filterConfig.sort.tag.type = 'count'; //stat tag sort
                spinnerService.loading('character', Characters.query().$promise.then(function(result) {
                    $scope.items = result;
										$scope.detail.isEpisodeRatings = false;
                }));
            }
        }
        $scope.find = function(view) {
            getItems(view);
        };
        //required for ctrl+v clicks.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                getItems(newValue);
                //reset defaults that are shared between views.
                $scope.detail.history = 'months';
                $scope.filterConfig.search.tag = '';
                $scope.detail.isVisible = false;
                $scope.statTags = [];
                $scope.ratingsDistribution = [];
            }
        });
        //watch for items changes...occurs on view change.
        $scope.$watchCollection('items', function() {
            if ($scope.items !== undefined) {
                $scope.statTags = []; //clear to stop multiple views tags appearing.
                if ($scope.view !== 'Character') {
                    $scope.overview = ItemService.buildOverview($scope.items);
                    $scope.historyDetails.months = ItemService.completeByMonth($scope.items);
                    if ($scope.view === 'Anime') {
                        $scope.historyDetails.seasons = ItemService.completeBySeason($scope.items);
                    }
                    $scope.ratingValues = ItemService.getRatingValues($scope.items);
                    $scope.ratingsDistribution = ItemService.buildRatingsDistribution($scope.items);
                    $scope.statTags = ItemService.buildStatTags($scope.items, $scope.ratingValues.averageRating);
                } else if ($scope.view === 'Character') {
                    $scope.statTags = CharacterService.buildCharacterTags($scope.items);
                    $scope.statSeries = CharacterService.buildSeriesList($scope.items);
                    $scope.voiceActors = CharacterService.buildVoiceActors($scope.items);
                    CharacterService.buildGenderDistribution($scope.statTags, $scope.items.length).then(function(result) {
                        $scope.gender = result;
                        $scope.gender[0].colour = '#c9302c'; //'red'; '#d9534f'; //
                        $scope.gender[1].colour = '#449d44'; //'green';'#5cb85c'; //
                        $scope.gender[2].colour = '#31b0d5'; //'blue';'#5bc0de'; //
                    });
                }
            }
        });

        //Builds ratings aggregates.
        function getSummaryFunctions(array) {
            //Check whether to do ratings or episode ratings.
            if (!$scope.detail.isEpisodeRatings) {
                spinnerService.loading('detail', StatisticsService.buildSummaryFunctions(array).then(function(result) {
                    $scope.historyDetails.summaryFunctions = result;
                }));
                if ($scope.detail.summary.isVisible === true) {
                    spinnerService.loading('detail',
                        StatisticsService.buildYearSummary(array, $scope.detail.year, $scope.detail.summary.type).then(function(result) {
                            $scope.historyDetails.yearSummary = result;
                        })
                    );
                }
            } else {
                spinnerService.loading('detail', StatisticsService.buildEpisodeSummaries(array).then(function(result) {
                        console.log(array);
                }));
            }
//            console.log(array, $scope.historyDetails);
        }
        $scope.$watchGroup(['detail.history', 'detail.year', 'detail.division', 'detail.isEpisodeRatings'], function(newValues) {
            if (newValues !== undefined) {
                var filtered = $filter('statisticsDetailFilter')($scope.items, newValues[0], newValues[1], newValues[2]);
                getSummaryFunctions(filtered);
            }
        });

        $scope.historyDetail = function(year, division, divisionText, summaryType) {
            if ($scope.detail.year === year && $scope.detail.divisionText === divisionText) {
                $scope.detail.isVisible = !$scope.detail.isVisible;
            } else {
                $scope.detail.isVisible = true;
                $scope.detail.year = year;
                $scope.detail.division = division;
                $scope.detail.divisionText = divisionText;
                $scope.detail.summary.type = summaryType;
                $scope.detail.summary.isVisible = (summaryType === undefined) ? false : true;
            }
        };

        $scope.tableDetail = function(type, name) {
            if ($scope.tableDetail[type] === name) {
                $scope.filterConfig.search[type] = '';
                $scope.filterConfig.show[type] = false;
                $scope.tableDetail[type] = '';
                if (type === 'tag') $scope.tableDetail.isEqual = false;
            } else {
                $scope.filterConfig.search[type] = name;
                $scope.tableDetail[type] = name;
                $scope.filterConfig.show[type] = true;
                if (type === 'tag') {
                    $scope.tagDetailResult = CharacterService.buildRelatedCharacterTags($scope.items, name);
                    $scope.tableDetail.isEqual = true;
                }
            }
        };

        /** Using the start date of confirmed 'in-season' shows
         *  to populate the new season attrs. that will work with the new
         *  filters in the hopes accuracy and speed will increase.
         */
        $scope.generateSeasons = function() {
            if ($scope.view === 'Anime') {
                var array = ItemService.setSeason($scope.items, $scope.detailSeasonYear, $scope.detailSeason);
                angular.forEach(array, function(item) {
                    item.$update(function() {
                        console.log(item);
                    }, function(errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                });
            }
        };

    }
]);

'use strict';

angular.module('statistics')
.directive('tabContainer', function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        scope: {
            model: '=ngModel'
        },
        templateUrl: '/modules/statistics/templates/tab-container.html',
        require: '?ngModel',
        bindToController: true,
        controllerAs: 'tabContainer',
        controller: function($scope) {
            var self = this;
            self.tabs = [];
            self.currentTab = undefined;
            self.listShift = 0;

            self.addTab = function addTab(tab) {
                self.tabs.push(tab);

                if(self.tabs.length === 1) {
                    tab.active = true;
                }
            };

            self.disable = function(disabledTab) {
                if(disabledTab.active) {
                    angular.forEach(self.tabs, function(tab) {
                        if(!tab.disabled) {
                            self.select(tab);
                            return;
                        }
                    });
                }
            };

            self.select = function(selectedTab) {
                if(!selectedTab.disabled) {
                    angular.forEach(self.tabs, function(tab) {
                        if(tab.active && tab !== selectedTab) {
                          tab.active = false;
                        }
                    });
                    selectedTab.active = true;
                    self.currentTab = ($scope.tabContainer.model === undefined) ? undefined : selectedTab.heading;
                }
            };

            self.shiftTabs = function(direction) {
                switch(direction) {
                    case 'origin':
//                        console.log(self.listShift, (self.listShift - 100));
                        if ((self.listShift + 100) > 0) {
                            self.listShift = 0;
                        } else {
                            self.listShift += 100;
                        }
                        break;

                    case 'offset':
                        if ((self.listShift - 100) < ($scope.elWidth - $scope.ulWidth)) {
                            self.listShift = $scope.elWidth - $scope.ulWidth;
                        } else {
                            self.listShift -= 100;
                        }
                        break;
                }
            };

        },
        link: function(scope, element, attrs, model) {
            var el = element[0],
                ul = el.children[0].children[0];
            scope.elWidth = el.offsetWidth;
            scope.ulWidth = ul.offsetWidth;

            scope.$watch('tabContainer.currentTab', function(newValue) {
                if (newValue !== undefined && model.$viewValue !== undefined) {
                    model.$setViewValue(newValue);
                }
            });

            scope.$watch(
                function () {
                    return {
                        width: el.offsetWidth,
                    };
                }, function () {
                    scope.elWidth = el.offsetWidth;
                }, true
            );

            scope.$watch(
                function () {
                    return {
                        width: ul.offsetWidth,
                    };
                }, function () {
                    scope.ulWidth = ul.offsetWidth;
                }, true
            );

            scope.$watch('tabContainer.listShift', function(newValue) {
                if(newValue !== undefined) {
                    var shift = (newValue === 0) ? '' : 'px';
                    ul.style.left = newValue + shift;
                }
            });

        }
    };
})
.directive('tabView', function () {
    return {
        restrict: 'A',
        transclude: true,
        replace: true,
        template: '<div class="tab-view" role="tabpanel" ng-show="active" ng-transclude></div>',
        require: '^tabContainer',
        scope: {
            heading: '@',
            disabled: '='
        },
        link: function (scope, element, attrs, tabContainerCtrl) {
            scope.active = false;
            tabContainerCtrl.addTab(scope);

            scope.$watch('disabled', function(newValue) {
                if(newValue !== undefined) {
                    if(newValue) {
                        console.log(scope.heading, newValue);
                        tabContainerCtrl.disable(scope);
                    }
                }
            });
        }
    };
})
.directive('detectFlood', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var el = element[0];

            function overflowCheck() {
                if (el.scrollWidth > el.offsetWidth) {
                    el.classList.add('flooded');
                } else {
                    el.classList.remove('flooded');
                }
            }
            overflowCheck();

            scope.$watch(
                function () {
                    return {
                        width: el.offsetWidth,
                    };
                }, function () {
//                    console.log('detect flood?');
                        overflowCheck();
                }, true
            );

        }
    };
}])
.directive('percentageBarContainer', function() {
  return {
      restrict: 'A',
      replace: true,
      scope: {
        border: '@?'
      },
      transclude: true,
      bindToController: true,
      template: '<div class="relative {{percentageBarContainer.border}}" style="height: 20px;" ng-transclude></div>',
      controllerAs: 'percentageBarContainer',
      controller: function($scope) {

      }
  };
})
.directive('percentageBar', function() {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            type: '@?',
            percentage: '@',
            colour: '@?',
            display: '@?'
        },
        require: '^percentageBarContainer',
        templateUrl: '/modules/statistics/templates/percentage-bar.html',
        link: function(scope, element, attrs, percentageBarContainerCtrl) {

        }
    };
});

'use strict';

//Statistics service 
angular.module('statistics').service('StatisticsService', ['$filter', 'ListService', '$q', function($filter, ListService, $q) {
    var self = this;
    
    this.buildSummaryFunctions = function(array) {
        return $q(function(resolve, reject) {
            if (array !== undefined) {
                var i = array.length, highestRating = 0, lowestRating = 10, averageRating = 0, modeRating = {}, ratings = { count: 0, sum: 0 };
                while(i--) {
    //                console.log(array[i]);
                    highestRating = array[i].rating > highestRating ? array[i].rating : highestRating;
                    lowestRating = 0 < array[i].rating && array[i].rating < lowestRating ? array[i].rating : lowestRating;
                    ratings.count += array[i].rating > 0 ? 1 : 0;
                    ratings.sum += array[i].rating;
                    averageRating = (ratings.sum / ratings.count).toFixed(2);
                    modeRating = self.getModeMap(array, 'rating', 0);
                }
                resolve([ 
                    { metric: 'Average rating', value: averageRating },
                    { metric: 'Highest rating', value: highestRating },
                    { metric: 'Lowest rating',  value: (lowestRating === 10) ? 0 : lowestRating },
                    { metric: 'Mode rating',    value: (modeRating.value === undefined) ? 0 : modeRating.value }
                ]);
            }
        });
    };
    
    function processYearSummary(summary, array) {
        var i = array.length;
        if (summary.length < 1) {
            while(i--) {
                summary.push({
                    metric: array[i].metric,
                    values: []
                });
            }
            summary.reverse();
        } 
        i = array.length;
        for(var j = 0; j < i; j++) {
            summary[j].values.push({ value: array[j].value });
        }
        return summary;
    }
    
    this.buildYearSummary = function(array, year, type) {
        return $q(function(resolve, reject) {
            var filter = (type === 'months') ? 'endedMonth' : 'season',
                attr   = (type === 'months') ? 'number'     : 'text'  ,
                commonArrays = ListService.getCommonArrays(),
                i = commonArrays[type].length, 
                yearSummary = [], results = [];
            
            for(var j = 0; j < i; j++) {
                var filteredArray = $filter(filter)(array, year, commonArrays[type][j][attr]),
                    promise = self.buildSummaryFunctions(filteredArray);
                results.push(promise);
            }
            angular.forEach(results, function(promise) {
                promise.then(function(result) {
                    yearSummary = processYearSummary(yearSummary, result);
                });
            });
            resolve(yearSummary);
        });
    };
    
    this.buildEpisodeSummaries = function(array) {
        return $q(function(resolve, reject) {
            angular.forEach(array, function(item) {
                self.buildSummaryFunctions(item.meta.history).then(function(result) {
                    item.meta.episodeSummaryFunctions = result;
                });
            });
            resolve(array);
        });
    };
    
    this.getModeMap = function(array, attr, ignore) {
        var modeMap = {}, 
            max = {
                count: 0,
                value: ''
            };
        for(var i = 0; i < array.length; i++) {
            var value = array[i][attr];
            if(modeMap[value] === null || modeMap[value] === undefined) {
                modeMap[value] = 1;
            } else {
                modeMap[value]++;
            }
            if(modeMap[value] > max.count) {
                //Ignore is a value you might not care about e.g. 0;
                if (ignore !== value) {
                    max.count = modeMap[value];
                    max.value = value;
                }
            }
        }
//        console.log(max);
        return max;        
    };
    
}]);
'use strict';

//// Configuring the Articles module
//angular.module('tasks').run(['Menus',
//	function(Menus) {
//		// Set top bar menu items
//		Menus.addMenuItem('topbar', 'Tasks', 'tasks', 'dropdown', '/tasks(/create)?');
//		Menus.addSubMenuItem('topbar', 'tasks', 'List Tasks', 'tasks');
//		Menus.addSubMenuItem('topbar', 'tasks', 'New Task', 'tasks/create');
//	}
//]);
'use strict';

//Setting up route
angular.module('tasks').config(['$stateProvider',
	function($stateProvider) {
		// Tasks state routing
		$stateProvider.
		state('listTasks', {
			url: '/tasks',
			templateUrl: 'modules/tasks/views/list-tasks.client.view.html'
		}).
		state('createTask', {
			url: '/tasks/create',
			templateUrl: 'modules/tasks/views/create-task.client.view.html'
		}).
		state('viewTask', {
			url: '/tasks/:taskId',
			templateUrl: 'modules/tasks/views/view-task.client.view.html'
		}).
		state('editTask', {
			url: '/tasks/:taskId/edit',
			templateUrl: 'modules/tasks/views/edit-task.client.view.html'
		});
	}
]);
'use strict';

// Tasks controller
angular.module('tasks').controller('ScheduleCalendarTaskController', ['$scope', '$uibModalInstance', 'moment', 'data', 'ListService',
	function($scope, $uibModalInstance, moment, data, ListService) {
    var ctrl = this;
		ctrl.today = new Date();
    ctrl.date = new Date(data.date);
		var timeDiff = Math.abs(ctrl.date.getTime() - ctrl.today.getTime());
		ctrl.daysFromToday = Math.ceil(timeDiff / (1000 * 3600 * 24));
		ctrl.day = ctrl.date.getDay() > 0 ? ctrl.date.getDay() - 1 : 6;
		ctrl.days = data.days;
    ctrl.events = [];
		console.log('data: ', data, 'days: ', ctrl.days, ctrl.day, ctrl.date);

		ctrl.init = function() {
			var weekEnds = new Date(ListService.weekEndingForDate(ctrl.date));
			angular.forEach(data.events, function(event) {
				if(new Date(event.date) < weekEnds && ((event.day.substring(0, 3) === ctrl.days[ctrl.day].text) || (event.day === 'Any'))) {
					// console.log('daysFromToday: ', ctrl.daysFromToday);
					if(!event.daily) {
						//in weeks
						// console.log('weeks: ', event.completeTimes, Math.floor(ctrl.daysFromToday / 7), event.repeat);
						if((event.completeTimes + Math.floor(ctrl.daysFromToday / 7) <= event.repeat) || event.repeat === 0) {
							ctrl.events.push(event);
						}
					} else if(event.daily) {
						//in days
						// console.log('days: ', event.completeTimes, ctrl.daysFromToday, event.repeat);
						if(((event.completeTimes + ctrl.daysFromToday) <= event.repeat) || event.repeat === 0) {
							ctrl.events.push(event);
						}
					}
				}
			});
			ctrl.events.sort(function(a, b) {
				var aDate = a.date, bDate = b.date;
				return aDate < bDate ? 1 :
							 aDate > bDate ? -1 : 0;
			});
		};
		ctrl.init();

    ctrl.submit = function () {
      $uibModalInstance.close(ctrl.item);
    };

    ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
	}]);

'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$rootScope', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory', 'spinnerService', '$uibModal', 'moment',
	function($scope, $rootScope, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory, spinnerService, $uibModal, moment) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        var today = new Date(),
            day = today.getDay();

        $rootScope.commonArrays = ListService.getCommonArrays();
        $scope.whichController = 'task';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
					view: 'list',
          showingCount: 0,
          sortType: '',
          sortReverse: true,
          search: {
              description: '',
              day: ''
          },
          datesSelected: false
        };
        $scope.mangaUpdate = {
            isPopup: ''
        };

        $scope.tabFilter = function(tabName) {
            $scope.filterConfig.search.day = tabName;
        };

        $scope.weekBeginning = function() {
            return TaskFactory.getWeekBeginning();
        };

		// Create new Task
		$scope.create = function() {
//            console.log(this.newTask);
                // Create new Task object
                var task = new Tasks ({
                    description: this.newTask.description,
                    link: {
                        linked: this.newTask.link.linked,
                        type: (this.newTask.link.linked === false) ? ''      :
                              (this.newTask.category === 'Watch')  ? 'anime' :
                                                                     'manga' ,
                        anime: (this.newTask.link.anime === undefined) ? undefined : this.newTask.link.anime._id ,
                        manga: (this.newTask.link.manga === undefined) ? undefined : this.newTask.link.manga._id
                    },
                    day: this.newTask.daily === true ? 'Any' : this.newTask.day,
                    date: this.newTask.date === '' ? new Date() : this.newTask.date,
                    repeat: (this.newTask.link.linked === false) ? this.newTask.repeat                     :
                            (this.newTask.category === 'Watch')  ? this.newTask.link.anime.finalEpisode    :
                                                                   1    ,
                    completeTimes: (this.newTask.link.linked === false) ? 0                                     :
                                   (this.newTask.category === 'Watch')  ? this.newTask.link.anime.episodes      :
                                                                          0      ,
                    updateCheck: new Date().getDay() === 1 ? true : false,
                    complete: false,
                    category: this.newTask.category === '' ? 'Other' : this.newTask.category,
                    daily: this.newTask.daily,
                    checklist: this.newTask.checklist,
                    checklistItems: this.newTask.checklistItems
                });
//			// Redirect after save
			task.$save(function(response) {
				$location.path('tasks');
                NotificationFactory.success('Saved!', 'New Task was successfully saved!');
                find();
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                console.log(errorResponse);
                NotificationFactory.error('Error!', 'New Task failed to save!');
			});
		};

        function remove(task) {
            if ( task ) {
                task.$remove();

                for (var i in $scope.tasks) {
                    if ($scope.tasks [i] === task) {
                        $scope.tasks.splice(i, 1);
                    }
                }
            } else {
                $scope.task.$remove(function() {
                    $location.path('tasks');
                });
            }
            NotificationFactory.warning('Deleted!', 'Task was successfully deleted.');
        }

		// Remove existing Task
		$scope.deleteTask = function(task) {
            NotificationFactory.confirmation(function() {
                remove(task);
            });
		};

		// Update existing Task
		function update(refresh) {
            console.log('update');
			var task = $scope.task;
            if (task.link.anime) {
                task.link.anime = task.link.anime._id;
            } else if (task.link.manga) {
                task.link.manga = task.link.manga._id;
            }

			task.$update(function() {
				$location.path('tasks');
                NotificationFactory.success('Saved!', 'Task was successfully updated!');
                //Refresh items if the callee wasn't checkStatus.
                if (refresh === true) {
                    console.log('update + refresh items');
                    find();
                }
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                console.log(errorResponse);
                NotificationFactory.error('Error!', 'Task failed to save!');
			});
		}

        //Tick off a task.
        $scope.tickOff = function(task) {
            var isLinked = false;
            //Is it linked?
            if (task.link.linked === false) {
                task.completeTimes += 1;
            } else if (task.link.linked === true) {
                isLinked = true;
                /** Anime or manga?
                 *   Update the item value AND the complete/repeat values.
                 */
                if (task.link.type === 'anime') {
                    task.completeTimes = task.link.anime.episodes + 1;
                    task.repeat = task.link.anime.finalEpisode;
                    TaskFactory.updateAnimeitem(task);
                } else if (task.link.type === 'manga') {
									  task.complete = false;
                    launchMangaUpdateDialog(task);
										return;
                }
            }
            $scope.task = task;
            console.log($scope.task);
            update(isLinked);
        };
        $scope.changeTaskDay = function(task) {
            $scope.task = task;
            update();
        };

        //Tick of a checklist item.
        $scope.tickOffChecklist = function(task, index) {
            //update the option for the task.
            var isLinked = task.link.linked;
            if (isLinked && task.link.type === 'manga') {
							  task.checklistItems[index].complete = false;
                launchMangaUpdateDialog(task, index);
								return;
            }

						if(ListService.findWithAttr(task.checklistItems, 'complete', false) === -1) {
							task.completeTimes += 1;
							task.complete = true;
						}
            $scope.task = task;
            update(isLinked);
        };

				function launchMangaUpdateDialog(task, checklistIndex) {
					var modalInstance = $uibModal.open({
						animation: true,
		      	templateUrl: '/modules/tasks/views/update-manga-task.client.view.html',
		      	controller: 'UpdateMangaTaskController as ctrl',
		      	size: 'lg',
		      	resolve: {
		        	data: function () {
		          	return { item: angular.copy(task), itemOriginal: task };
							}
						}
					});
					modalInstance.result.then(function(result) {
						task = result;
						if(checklistIndex === undefined) {
							task.completeTimes += 1;
							task.complete = true;
						} else {
							task.checklistItems[checklistIndex].complete = true;
							if(ListService.findWithAttr(task.checklistItems, 'complete', false) === -1) {
								task.completeTimes += 1;
                task.complete = true;
							}
						}
						TaskFactory.updateMangaitem(task, task.link.manga.chapters, task.link.manga.volumes).then(function() {
							$scope.task = task;
							update(true);
						});
					});
				}

        //Add new checklist item.
        $scope.insertChecklistItem = function (task, newChecklistItem) {
            if (newChecklistItem!=='' && newChecklistItem!==undefined) {
                var alreadyAdded = false;
                //find the item and insert the option.
                angular.forEach(task.checklistItems, function (item) {
                    if (item === newChecklistItem) {
                        alreadyAdded = true;
                    }
                });

                //if not in array add it.
                if (alreadyAdded === false) {
                    task.checklistItems.push({ text: newChecklistItem, complete: false });
                } else if (alreadyAdded === true) {
                    NotificationFactory.popup('Option already exists.', 'Please re-name and try again.', 'error');
                }
            }
            $scope.task = task;
            update();
        };

        //Defaults the tab filter to the current day of the week.
        function setTabFilterDay(day) {
            var index = day === 0 ? 7 : day; //Adjust for Sunday.
            $scope.filterConfig.search.day = $scope.commonArrays.days[index].name;
            console.log(day, $scope.filterConfig.search.day);
        }
        setTabFilterDay(day);

         //check things
        function checkStatus() {
            if (day === 1) {
                console.log('monday', day);
                angular.forEach($scope.tasks, function (task) {
                    //has it been updated today?
                    if(task.updateCheck === false) {
                        console.log('updating - ', task.description);
                        var type = task.link.type;
                        if ((task.link.linked === false) || (type === 'manga')) {
                            //has it reached the necessary number of repeats?
                            if(task.completeTimes !== task.repeat) {
                                console.log('not complete', task.description);
                                task.complete = false;
                                task.updateCheck = true;
                                $scope.task = task;
                                update();
                            } else if (task.completeTimes === task.repeat) {
                                console.log('complete - delete', task.description);
                                remove(task);
                            }
                        } else if (task.link.type === 'anime') {
                            console.log('linked');
                                var parts = { single: 'episodes', all: 'finalEpisode' };
                            if (task.link[type][parts.single] !== task.link[type][parts.all]) {
                                console.log('linked not complete', task.description);
                                task.complete = false;
                                task.updateCheck = true;
                                $scope.task = task;
                                update();
                            } else if (task.link[type][parts.single] === task.link[type][parts.all]) {
                                console.log('linked complete - delete', task.description);
                                remove(task);
                            }
                        }
                    }
                });
            } else {
                console.log('not monday', day);
                angular.forEach($scope.tasks, function (task) {
                    var change = task.updateCheck === false ? false : true;
                    task.updateCheck = false;
                    //is it a daily task?
                    if (task.daily === true) {
                        console.log('daily', task.description);
                        //has it reached the necessary number of repeats?
                        if(task.completeTimes !== task.repeat) {
                            console.log('not complete', task.description);
                            var refresh = today.toISOString().slice(0,10);
                            //has it been refreshed today?
                            if (task.dailyRefresh.slice(0,10) !== refresh) {
                                console.log('not complete - update', task.description);
                                task.complete = false;
                                task.dailyRefresh = refresh;
                                $scope.task = task;
                                update();
                            }
                        } else if (task.completeTimes === task.repeat) {
                            console.log('complete - delete', task.description);
                            remove(task);
                        }
                    } else if ((task.daily === false) && change) {
                        console.log('weekly update: ', task.description);
                        $scope.task = task;
                        update();
                    }
                });
            }
            find();
        }

		// Find a list of Tasks
		function find(check) {
            spinnerService.loading('tasks', Tasks.query().$promise.then(function(result) {
                $scope.tasks = result;
                if (check === true) checkStatus();
            }));
		}
		find(true);

		$scope.refreshItems = function() {
			find();
      NotificationFactory.warning('Refreshed!', 'Task list refreshed!');
		};

		// Find existing Task
		$scope.findOne = function() {
			$scope.task = Tasks.get({
				taskId: $stateParams.taskId
			});
		};

	}
]);

'use strict';

// Tasks controller
angular.module('tasks').controller('UpdateMangaTaskController', ['$scope', '$uibModalInstance', 'data',
	function($scope, $uibModalInstance, data) {
    var ctrl = this;
    ctrl.item = data.item;
    ctrl.stepConfig = {
        currentStep: 1,
        stepCount: 1
    };
    console.log('update linked manga item: ', ctrl.item);

    ctrl.submit = function () {
      $uibModalInstance.close(ctrl.item);
    };

    ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
	}
]);

'use strict';

angular.module('tasks')
.directive('taskCreate', ['ListService', 'NotificationFactory', 'Animeitems', 'Mangaitems', function (ListService, NotificationFactory, Animeitems, Mangaitems) {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: '/modules/tasks/views/create-task.client.view.html',
        link: function (scope, element, attrs) {
            var newTaskModel = {};
            function setNewTask() {
                scope.newTask = {
                    description: '',
                    link: {
                        linked: false,
                        type: '',
                        anime: undefined,
                        manga: undefined
                    },
                    day: '',
                    date: new Date(),
                    repeat: 0,
                    category: '',
                    daily: false,
                    checklist: false,
                    checklistItems: [],
                    isAddTask: false
                };
            }
            setNewTask();
            angular.copy(scope.newTask, newTaskModel);
            scope.stepConfig = {
                currentStep: 1,
                stepCount: 2
            };

            //for adding/removing options.
            scope.addChecklistItem = function () {
                    if (scope.newTask.checklistItem!=='' && scope.newTask.checklistItem!==undefined) {
                        var i = 0;
                        var alreadyAdded = false;
                        if (scope.newTask.checklistItems.length > 0) {
                            while(i < scope.newTask.checklistItems.length) {
                                if (scope.newTask.checklistItems[i].text === scope.newTask.checklistItem) {
                                    alreadyAdded = true;
                                }
                                i++;
                            }
                            //if not in array add it.
                            if (alreadyAdded === false) {
                                scope.newTask.checklistItems.push({ text: scope.newTask.checklistItem, complete: false });
                            }
                        } else {
                            scope.newTask.checklistItems.push({ text: scope.newTask.checklistItem, complete: false });
                        }
                    }
                    scope.newTask.checklistItem = '';
            };
            scope.dropChecklistItem = function(text) {
                var deletingItem = scope.newTask.checklistItems;
                scope.newTask.checklistItems = [];
                //update the task.
                angular.forEach(deletingItem, function(item) {
                    if (item.text !== text) {
                        scope.newTask.checklistItems.push(item);
                    }
                });
            };

            scope.backStep = function(step) {
                scope.stepConfig.currentStep -= 1;
            };
            scope.takeStep = function(step) {
                var check = process(step);
                if (check.valid) {
                    scope.stepConfig.currentStep += 1;
                } else {
                    NotificationFactory.popup('Attention!', check.message, 'warning');
                }
            };
            scope.cancel = function() {
                scope.stepConfig.currentStep = 1;
                angular.copy(newTaskModel, scope.newTask);
                scope.scheduleForm.$setPristine();
            };

            function process(step) {
                switch(step) {
                    case 1:
                        if (scope.newTask.link.linked === true) {
                            var category = scope.newTask.category;
                            if (category === 'Watch') {
                                scope.linkItems = Animeitems.query({
                                    status: 0
                                });
                                scope.linkType = 'anime';
                                scope.newTask.checklistItems = [];
                                scope.newTask.checklist = false;
                            } else if (category === 'Read') {
                                scope.linkItems = Mangaitems.query({
                                    status: 0
                                });
                                scope.linkType = 'manga';
                            } else {
                                return { valid: false, message: 'Category must be either Watch or Read for linked items!' };
                            }
                        } else {
                            //Ensure that stuff is cleared when not linked.
                            scope.linkType = '';
                            scope.newTask.link.anime = undefined;
                            scope.newTask.link.manga = undefined;
                        }
                        return { valid: true };
                }
            }

        }
    };
}])
.directive('shadowModel', function() {
  return {
    scope: true,
    link: function(scope, el, att) {
      console.log('shadow: ', scope);
      scope[att.shadow] = angular.copy(scope[att.shadow]);
    }
  };
})
.directive('loseInterest', function ($document, $window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.data('interesting', true);
            /** On click, check what you clicked and whether you can ignore it.
             *    Based on checks false the ng-show of the anywhere-but-here element.
             */
            angular.element($document[0].body).on('click', function (e) {
                var interesting = angular.element(e.target).inheritedData('interesting'),
                    elm = angular.element(e.target)[0].tagName,
                    alsoInteresting = (elm === 'A') || (elm === 'I');
                    //console.log(elm);
                if (!interesting && !alsoInteresting) {
                    scope.$apply(function () {
                        scope.collapseFilters();
                    });
                }
            });
        }
    };
})
.directive('scheduleCalendar', ['$uibModal', 'moment', 'ListService', function($uibModal, moment, ListService) {

  function _removeTime(date) {
    return date.day(1).hour(12).minute(0).second(0).millisecond(0);
  }

  function _buildMonth(scope, start, month) {
       scope.weeks = [];
       var done = false, date = moment(start), monthIndex = date.month(), count = 0;
       while (!done) {
         var days = _buildWeek(moment(date), month);
         if(ListService.findWithAttr(days, 'isCurrentMonth', true) > -1) {
           scope.weeks.push({ days: days });
         }
           date.add(1, 'w');
           done = count++ > 2 && monthIndex !== date.month();
           monthIndex = date.month();
       }
   }

   function _buildWeek(date, month) {
       var days = [];
       for (var i = 0; i < 7; i++) {
           days.push({
               name: date.format('dd').substring(0, 1),
               number: date.date(),
               isCurrentMonth: date.month() === month.month(),
               isToday: date.isSame(new Date(), 'day'),
               date: date
           });
           date = moment(date);
           date.add(1, 'd');
       }
       return days;
   }

   function _displayEvents(events, date, days) {
     var modalInstance = $uibModal.open({
       animation: true,
       templateUrl: '/modules/tasks/views/schedule-calendar-task.client.view.html',
       controller: 'ScheduleCalendarTaskController as ctrl',
       size: 'lg',
       resolve: {
         data: function () {
           return { events: events, date: date, days: days };
         }
       }
     });
   }

  return {
       restrict: 'A',
       templateUrl: 'modules/tasks/templates/schedule-calendar.html',
       scope: {
         events: '='
       },
       link: function(scope) {
           scope.days = [{ text: 'Mon' }, { text: 'Tue' }, { text: 'Wed' }, { text: 'Thu' }, { text: 'Fri' }, { text: 'Sat' }, { text: 'Sun' }];
           scope.selected = moment(new Date());
           scope.month = moment(scope.selected);

           var start = moment(_removeTime(angular.copy(scope.selected)));
           start.date(-6);
           _removeTime(start.day(0));

           _buildMonth(scope, start, scope.month);

           scope.select = function(day) {
             if(scope.selected === day.date){
               _displayEvents(scope.events, day.date, scope.days);
             }
             scope.selected = day.date;
           };

           scope.next = function() {
               var next = moment(scope.month);
               _removeTime(next.month(next.month()+1).date(0));
               scope.month.month(scope.month.month()+1);
               _buildMonth(scope, next, scope.month);
           };

           scope.previous = function() {
               var previous = moment(scope.month);
               _removeTime(previous.month(previous.month()-1).date(0));
               scope.month.month(scope.month.month()-1);
               _buildMonth(scope, previous, scope.month);
           };
       }
   };
}])
.directive('taskItemModel', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'modules/tasks/templates/task-item.html'
  };
});

'use strict';

//Tasks service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Tasks', ['$resource',
	function($resource) {
		return $resource('tasks/:taskId', { taskId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('TaskFactory', ['$q', 'Animeitems', 'Mangaitems', 'AnimeFactory', 'MangaFactory', function($q, Animeitems, Mangaitems, AnimeFactory, MangaFactory) {
    var obj = {};

        obj.getWeekBeginning = function() {
            var newDate = new Date(),
                day = newDate.getDay(),
                diff = newDate.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
            var wkBeg = new Date();
            return new Date(wkBeg.setDate(diff));
        };

        obj.updateAnimeitem = function(task) {
            var query = Animeitems.get({
				animeitemId: task.link.anime._id
			});
            query.$promise.then(function(data) {
                console.log(data);
                data.episodes += 1;
                data.latest = new Date();
                AnimeFactory.update(data, undefined, true, undefined);
            });
        };

        obj.updateMangaitem = function(task, chapters, volumes) {
					return $q(function(resolve, reject) {
            var query = Mangaitems.get({
							mangaitemId: task.link.manga._id
						});

            query.$promise.then(function(data) {
                console.log(data);
                data.chapters = chapters;
                data.volumes = volumes;
                data.latest = new Date();
                MangaFactory.update(data, undefined, true, undefined);
								resolve('manga updated');
            });
					});
        };

    return obj;
}]);

'use strict';

// Configuring the Articles module
angular.module('toptens').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Toptens', 'toptens', 'dropdown', '/toptens(/create)?');
		Menus.addSubMenuItem('topbar', 'toptens', 'List Toptens', 'toptens');
		Menus.addSubMenuItem('topbar', 'toptens', 'New Topten', 'toptens/create');
	}
]);
'use strict';

//Setting up route
angular.module('toptens').config(['$stateProvider',
	function($stateProvider) {
		// Toptens state routing
		$stateProvider.
		state('listToptens', {
			url: '/toptens',
			templateUrl: 'modules/toptens/views/list-toptens.client.view.html'
		}).
		state('createTopten', {
			url: '/toptens/create',
			templateUrl: 'modules/toptens/views/create-topten.client.view.html'
		}).
		state('viewTopten', {
			url: '/toptens/:toptenId',
			templateUrl: 'modules/toptens/views/view-topten.client.view.html'
		}).
		state('editTopten', {
			url: '/toptens/:toptenId/edit',
			templateUrl: 'modules/toptens/views/create-topten.client.view.html'
		});
	}
]);
'use strict';

// Toptens controller
angular.module('toptens').controller('CreateToptenController', ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'ListService', 'Animeitems', 'Mangaitems', 'Characters', 'NotificationFactory', 'CharacterService', 'ItemService', '$filter',
	function($scope, $stateParams, $location, Authentication, Toptens, ListService, Animeitems, Mangaitems, Characters, NotificationFactory, CharacterService, ItemService, $filter) {
		$scope.authentication = Authentication;

        $scope.stepConfig = {
            steps: [1,2,3,4,5,6,7,8,9,10],
            stepHeaders: [
                { text: 'Select attributes' },
                { text: 'Set conditions' },
                { text: 'Populate list' }
            ],
            currentStep: 1,
            stepCount: 3,
            listGen: {
                itemsCached: [],
                items: [],
                displayList: [],
                seriesList: [],
                typeDisplay: '',
                toptenItem: '',
                seriesLimit: '',
                tagLimit: '',
                series: [],
                tags: []
            },
            limitMin: 0,
						swapping: {
							one: '',
							two: ''
						}
        };
        var toptenCopy = {
            name: '',
            description: '',
            type: '',
            isFavourite: false,
            isRanked: false,
            animeList: [],
            mangaList: [],
            characterList: [],
            conditions: {
                limit: null,
                series: [],
                tags: [],
								season: null,
								year: null
            }
        };
        $scope.topten = {};
        angular.copy(toptenCopy, $scope.topten);
        $scope.commonArrays = ListService.getCommonArrays();
				$scope.years = [];
        $scope.isCreate = true;
        $scope.imgSize = {
            height: '50px',
            width: '100px'
        };

		// Create new Topten
		$scope.create = function() {
            // console.log($scope.topten, this.topten);
			// Create new Topten object
            var topten = new Toptens();
			topten = new Toptens ({
				name: this.topten.name,
                description: this.topten.description,
                type: this.topten.type,
                isFavourite: this.topten.isFavourite,
                isRanked: this.topten.isRanked,
                animeList: this.topten.animeList.length > 0 ? this.topten.animeList : null,
                characterList: this.topten.characterList.length > 0 ? this.topten.characterList : null,
                mangaList: this.topten.mangaList.length > 0 ? this.topten.mangaList : null,
                conditions: {
                    limit: this.topten.conditions.limit,
                    series: this.topten.conditions.series,
                    tags: this.topten.conditions.tags,
										season: this.topten.conditions.season,
										year: this.topten.conditions.year,
                }
			});

			// Redirect after save
			topten.$save(function(response) {
				$location.path('toptens/' + response._id);
                NotificationFactory.success('Saved!', 'New List was successfully saved!');
				// Clear form fields
				angular.copy(toptenCopy, $scope.topten);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Something went wrong!');
			});
		};

		// Update existing Topten
		$scope.update = function() {
			var topten = $scope.topten;

			topten.$update(function() {
				$location.path('toptens/' + topten._id);
                NotificationFactory.success('Updated!', 'List update was successful!');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Something went wrong!');
			});
		};

        function typeSetItemPopulate() {
            var type = ListService.manipulateString($scope.topten.type, 'upper', true);
            switch(type) {
                case 'Anime':
                    Animeitems.query().$promise.then(function(result) {
                        $scope.stepConfig.listGen.items = result;
                        $scope.stepConfig.listGen.typeDisplay = 'title';
                        $scope.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
												$scope.years = ItemService.endingYears(result);
                    });
                    break;
                case 'Manga':
                    Mangaitems.query().$promise.then(function(result) {
                        $scope.stepConfig.listGen.items = result;
                        $scope.stepConfig.listGen.typeDisplay = 'title';
                        $scope.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                    });
                    break;
                case 'Character':
                    Characters.query().$promise.then(function(result) {
                        $scope.stepConfig.listGen.items = result;
                        $scope.stepConfig.listGen.typeDisplay = 'name';
                        $scope.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                        $scope.stepConfig.listGen.series = CharacterService.buildSeriesList(result);
												var getYears = [];
												angular.forEach(result, function (item) {
													if(item.anime) {
														getYears.push(item.anime);
													}
												});
												$scope.years = ItemService.endingYears(getYears);
                    });
                    break;
            }
            // console.log('type set: ', $scope.stepConfig.listGen);
					}

        //Processing on step submits.
        function process(number, direction, callback) {
            // console.log(number, direction);
            switch(number) {
                case 1:
                    if ($scope.topten.type !== '' && $scope.isCreate) {
                        typeSetItemPopulate();
                        callback();
                    } else if ($scope.topten.type !== '' && !$scope.isCreate) {
                        if ($scope.stepConfig.listGen.displayList.length < 1) {
                            angular.forEach($scope.topten[$scope.topten.type + 'List'], function(item) {
                                var index = ListService.findWithAttr($scope.stepConfig.listGen.items, '_id', item._id);
                                $scope.stepConfig.listGen.displayList.push($scope.stepConfig.listGen.items[index]);
                            });
                            $scope.stepConfig.limitMin = $scope.stepConfig.listGen.displayList.length;
                        }
                        callback();
                    } else if ($scope.topten.type === '') {
                        NotificationFactory.popup('Invalid form', 'You MUST select a type to continue.', 'error');
                    }
                    break;

                case 2:
										if(direction) {
											var i = 0, j = 0, length;
	                    angular.copy($scope.stepConfig.listGen.items, $scope.stepConfig.listGen.itemsCached);
	                    // console.log('pre conditions: ', $scope.stepConfig.listGen.items.length, $scope.stepConfig.listGen.itemsCached.length);

											if($scope.topten.type === 'anime') {
												if($scope.topten.conditions.season) {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('season')($scope.stepConfig.listGen.items, $scope.topten.conditions.year, $scope.topten.conditions.season);
													} else {
														NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
														break;
													}
												} else {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('filter')($scope.stepConfig.listGen.items, { season: { year: $scope.topten.conditions.year } });
													}
												}
											} else if($scope.topten.type === 'character') {
												if($scope.topten.conditions.season) {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('seasonForCharacterAnime')($scope.stepConfig.listGen.items, $scope.topten.conditions.year, $scope.topten.conditions.season);
													} else {
														NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
														break;
													}
												} else {
													if($scope.topten.conditions.year) {
														$scope.stepConfig.listGen.items = $filter('filter')($scope.stepConfig.listGen.items, { anime: { season: { year: $scope.topten.conditions.year } } });
													}
												}
											}

	                    if($scope.topten.conditions.series.length > 0) {
	                        i = $scope.stepConfig.listGen.items.length;
	                        while(i--) {
	                            var remove = true,
																	attr = ($scope.stepConfig.listGen.items[i].anime !== null) ? 'anime' :
																				 ($scope.stepConfig.listGen.items[i].anime !== null) ? 'manga' :
																				 																											 null;
															length = $scope.topten.conditions.series.length;
														//  console.log('tag while: ', i, length, attr);
	                            if(attr !== null) {
																// console.log('tag item: ', $scope.stepConfig.listGen.items[i]);
																for(j = 0; j < length; j++) {
																	var series = $scope.topten.conditions.series[j];
																	// console.log($scope.stepConfig.listGen.items[i][attr].title, series.name, $scope.stepConfig.listGen.items[i][attr].title.indexOf(series.name));
	                                if($scope.stepConfig.listGen.items[i][attr].title.indexOf(series.name) > -1) {
	                                    remove = false;
	                                }
																}
	                              if(remove) {
																	// console.log('remove as remove: ' + remove);
	                                  $scope.stepConfig.listGen.items.splice(i, 1);
	                              }
	                            } else {
																// console.log('straight remove');
																$scope.stepConfig.listGen.items.splice(i, 1);
	                            }
	                        }
	                    }

	                    if($scope.topten.conditions.tags.length > 0) {
	                        i = $scope.stepConfig.listGen.items.length;
	                        while(i--) {
	                            var count = 0;
															length = $scope.topten.conditions.tags.length;
																	// console.log('tag while: ', i, length);
															if($scope.stepConfig.listGen.items[i].tags.length > 0) {
																// console.log('tag item: ', $scope.stepConfig.listGen.items[i].tags);
																for(j = 0; j < length; j++) {
																	var tag = $scope.topten.conditions.tags[j];
																	// console.log('tag round: ' + i + '-' + j, $scope.stepConfig.listGen.items[i].tags, tag.tag, ListService.findWithAttr($scope.stepConfig.listGen.items[i].tags, 'text', tag.tag));
			                                if(ListService.findWithAttr($scope.stepConfig.listGen.items[i].tags, 'text', tag.tag) > -1) {
			                                    count++;
			                                }
																}
		                            if(count !== length) {
																	// console.log('remove as count: ' + count + ' > length: ' + length);
																	$scope.stepConfig.listGen.items.splice(i, 1);
		                            }
															} else {
																// console.log('straight remove');
																$scope.stepConfig.listGen.items.splice(i, 1);
															}
	                        }
	                    }
											// console.log('post conditions: ', $scope.stepConfig.listGen.items.length, $scope.stepConfig.listGen.itemsCached.length);
										}
                    callback();
                    break;

                case 3:
                    if(!direction) {
                        $scope.stepConfig.listGen.items = angular.copy($scope.stepConfig.listGen.itemsCached);
                    }
                    callback();
                    break;
            }
        }

        $scope.pushItem = function(item) {
            if($scope.topten.conditions.limit === null || $scope.topten.conditions.limit === 0 || $scope.topten.conditions.limit > $scope.stepConfig.listGen.displayList.length) {
                var index = $scope.topten[$scope.topten.type+'List'].indexOf(item._id);
                if (!$scope.isCreate && index === -1) {
                    index = ListService.findWithAttr($scope.topten[$scope.topten.type+'List'], '_id', item._id);
                }
                if (index === -1) {
                    $scope.topten[$scope.topten.type + 'List'].push(item._id);
                    $scope.stepConfig.listGen.displayList.push(item);
                } else {
                    NotificationFactory.warning('Duplicate!', 'Item has already been added to list.');
                }
            } else {
                NotificationFactory.error('Full!', 'Item list has reached the defined capacity.');
            }
            $scope.stepConfig.listGen.toptenItem = '';
        };

        $scope.removeItem = function(item) {
            //For display array.
            var index = $scope.stepConfig.listGen.displayList.indexOf(item);
            $scope.stepConfig.listGen.displayList.splice(index, 1);

            //For topten list.
            index = $scope.topten[$scope.topten.type + 'List'].indexOf(item._id);
            if (!$scope.isCreate && index === -1) {
                index = ListService.findWithAttr($scope.topten[$scope.topten.type+'List'], '_id', item._id);
            }
            $scope.topten[$scope.topten.type + 'List'].splice(index, 1);
            NotificationFactory.warning('Removed!', 'Item has been removed from list.');
        };

        $scope.pushCondition = function(type, item) {
            var index, indexTwo;
            switch(type) {
                case 'series':
                    index = ListService.findWithAttr($scope.topten.conditions.series, 'name', item.name);
                    if(index === -1) {
                        $scope.topten.conditions.series.push(item);
                    } else {
                        NotificationFactory.warning('Duplicate!', 'Series has already been added to list.');
                    }
                    $scope.stepConfig.listGen.seriesLimit = '';
                    break;

                case 'tag':
                    index = ListService.findWithAttr($scope.topten.conditions.tags, 'tag', item.tag);
                    if(index === -1) {
                        $scope.topten.conditions.tags.push(item);
                    } else {
                        NotificationFactory.warning('Duplicate!', 'Tag has already been added to list.');
                    }
                    $scope.stepConfig.listGen.tagLimit = '';
                    break;
            }
        };

        $scope.removeCondition = function(type, item) {
            var index, indexTwo;
            switch(type) {
                case 'series':
                    index = ListService.findWithAttr($scope.topten.conditions.series, 'name', item.name);
										$scope.topten.conditions.series.splice(index, 1);
                    NotificationFactory.warning('Removed!', 'Series has been removed from list.');
                    break;

                case 'tag':
                    index = $scope.topten.conditions.tags.indexOf(item);
                    $scope.topten.conditions.tags.splice(index, 1);
                    NotificationFactory.warning('Removed!', 'Tag has been removed from list.');
                    break;
            }
        };

        //Step related functions:
        $scope.takeStep = function(number, direction) {
            process(number, direction, function() {
                $scope.stepConfig.currentStep = (direction) ? number + 1 : number - 1;
            });
            // console.log('step: ', $scope.stepConfig, $scope.topten);
        };
        $scope.cancel = function() {
            $location.path('toptens');
        };

        function inital() {
            // console.log('state params: ', $stateParams);
            if ($stateParams.toptenId !== undefined) {
                $scope.isCreate = false;
                Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
                    $scope.topten = result;
										// console.log('topten: ', result);
                    typeSetItemPopulate();
                });
            }
        }
        inital();

				$scope.swappingItems = function(index) {
					// console.log('item selected: ', index);
					if($scope.stepConfig.swapping.one === '') {
						$scope.stepConfig.swapping.one = index;
					} else if($scope.stepConfig.swapping.one === index) {
						$scope.stepConfig.swapping.one = '';
					} else {
						$scope.stepConfig.swapping.two = index;
						//Re-order display list.
						var temp = $scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.one];
						$scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.one] = $scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.two];
						$scope.stepConfig.listGen.displayList[$scope.stepConfig.swapping.two] = temp;
						//Re-order topten item list.
						temp = $scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.one];
						$scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.one] = $scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.two];
						$scope.topten[$scope.topten.type + 'List'][$scope.stepConfig.swapping.two] = temp;
						//Clear.
						$scope.stepConfig.swapping.one = '';
						$scope.stepConfig.swapping.two = '';
					}
				};

	}
]);

'use strict';

angular.module('toptens').controller('statisticsTopten', ['$scope','$uibModalInstance','list', 'CharacterService',
 function ($scope, $uibModalInstance, list, CharacterService) {
   var self = this;
   $scope.list = list;
   $scope.toptenInfo = {
     tags: [],
     series: []
   };

   function process() {
     var listType = $scope.list.type + 'List';
     $scope.toptenInfo.tags = CharacterService.buildCharacterTags($scope.list[listType]);
     if($scope.list.type === 'character') {
       $scope.toptenInfo.series = CharacterService.buildSeriesList($scope.list[listType]);
     }
   }
   process();

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

'use strict';

// Toptens controller
angular.module('toptens').controller('ToptensController', ['$scope', '$stateParams', '$location', 'Authentication', '$uibModal', 'Toptens', 'NotificationFactory', 'ListService', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, $uibModal, Toptens, NotificationFactory, ListService, spinnerService) {
		$scope.authentication = Authentication;

        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');

        $scope.whichController = 'topten';
        //paging variables.
        $scope.pageConfig = {
            currentPage: 0,
            pageSize: 10
        };
        $scope.filterConfig = {
            showingCount: 0,
            expandFilters: false,
            sortType: '',
            sortReverse: false,
            ratingLevel: undefined,
            search: {},
            searchTags: '',
            tagsForFilter: [],
            taglessItem: false,
            areTagless: false,
            selectListOptions: ListService.getSelectListOptions($scope.whichController),
            commonArrays: ListService.getCommonArrays()
        };
        $scope.viewConfig = {
            displayType: '',
            linkSuffix: '',
						tags: [],
						series: []
        };

		// Remove existing Topten
		$scope.remove = function(topten) {
            NotificationFactory.confirmation(function() {
                if ( topten ) {
                    topten.$remove();
                    for (var i in $scope.toptens) {
                        if ($scope.toptens [i] === topten) {
                            $scope.toptens.splice(i, 1);
                        }
                    }
                } else {
                    $scope.topten.$remove(function() {
                        $location.path('toptens');
                    });
                }
                NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
            });
		};

		// Find a list of Toptens
		$scope.find = function() {
            spinnerService.loading('topten', Toptens.query().$promise.then(function(result) {
                $scope.toptens = result;
            }));
//            console.log($scope.toptens);
		};

		// Find existing Topten
		$scope.findOne = function() {
            Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
                $scope.topten = result;
                $scope.viewConfig.displayType = ($scope.topten.type === 'character') ? 'name' : 'title';
                $scope.viewConfig.linkSuffix = ($scope.topten.type === 'character') ? 's' : 'items';
            });
		};

		$scope.openListStats = function() {
			var modalInstance = $uibModal.open({
				animation: true,
      	templateUrl: '/modules/toptens/views/statistics-topten.client.view.html',
      	controller: 'statisticsTopten',
      	size: 'lg',
      	resolve: {
        	list: function () {
          	return $scope.topten;
					}
				}
			});
		};

	}
]);

'use strict';

angular.module('toptens')
.directive('steps', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            stepConfig: '='
        },
        template: '<div class="steps" ng-transclude>' +
                  '</div>',
        bindToController: 'steps',
        controller: function($scope) {
            var self = this;
            self.steps = [];

            self.register = function(step) {
                self.steps.push(step);
                if(step.stepNumber === 1) {
                    step.active = true;
                }
            };

            $scope.$watch('stepConfig.currentStep', function(newValue) {
                if (newValue !== undefined) {
                    angular.forEach(self.steps, function(step) {
                        if(step.stepNumber !== newValue) {
                            step.active = false;
                        } else {
                            step.active = true;
                        }
                    });
                }
            });

        }
    };
})
.directive('oneStep', function() {
  return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {},
      require: '^steps',
      templateUrl: '/modules/toptens/templates/step.html',
      link: function(scope, elm, attrs, stepsController) {
          scope.active = false;
          scope.stepNumber = elm.index() + 1;
          stepsController.register(scope);
      }
  };
})
.directive('stepControls', function() {
   return {
       restrict: 'A',
       replace: true,
       transclude: true,
       template: '<div class="step-controls step-button-group padding-5" ng-transclude>' +
                  '</div>'
   };
})
.directive('sticky', function() {
    return {
        restrict: 'A',
        scope: {},
        link: function(scope, element, attrs) {

            window.addEventListener('scroll', function (evt) {
                var stickyClass = 'sticky-scroll-top', stickyInnerClass = 'sticky-inner-container',
                    scrollTop = document.body.scrollTop,
                    elm = element[0],
                    inner = elm.children[0],
                    viewportOffset = elm.getBoundingClientRect(),
                    distance_from_top = viewportOffset.top; // This value is your scroll distance from the top

                // The element has scrolled to the top of the page. Set appropriate style.
                if (distance_from_top < 56) {
//                    console.log('top hit : ', distance_from_top);
                    elm.classList.add(stickyClass);
                    inner.classList.add(stickyInnerClass);
                }

                // The element has not reached the top.
                if(distance_from_top > 55 || scrollTop < 10) {
//                    console.log('we are at: ', distance_from_top);
                    elm.classList.remove(stickyClass);
                    inner.classList.remove(stickyInnerClass);
                }
          });

        }
    };
})
.directive('horizontalList', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        require: 'horizontalList',
        scope: {},
        templateUrl: '/modules/toptens/templates/horizontal-list.html',
        bindToController: true,
        controllerAs: 'horizontalList',
        controller: function($scope) {
            var self = this;
            self.items = [];
            self.shift = 0;
            self.clicks = 0;
            self.register = function(item) {
                self.items.push(item);
                if([0, 1, 2].indexOf(item.position) > -1) {
                    item.isVisible = true;
                }
            };

            function setVisibility() {
                var values = [],
                    check = self.clicks * 3;
                for(var i = 0; i < 3; i++) {
                    values.push(check + i);
                }
                angular.forEach(self.items, function(item) {
                    item.isVisible = (values.indexOf(item.position) > -1);
                });
            }

            self.moveItems = function(direction) {
                if(direction === 'left') {
                    if((self.clicks - 1) < 0) {
                        self.clicks = 0;
                    } else {
                        self.clicks -= 1;
                    }
                    setVisibility();
                } else if (direction === 'right') {
                    if ((self.clicks + 1) < Math.ceil(self.items.length / 3)) {
                        self.clicks += 1;
                    }
                    setVisibility();
                }
            };

        },
        link: function(scope, element, attr, ctrl) {
            var el = element[0],
                child = el.children[0];
            scope.settings = {
                child: child,
                style: child.style,
                value: 0
            };

            function listSettings() {
                ctrl.shift = -el.offsetWidth;
                ctrl.itemWidth = el.offsetWidth / 3;
                angular.forEach(ctrl.items, function(item) {
                    item.itemWidth = ctrl.itemWidth;
                });
            }
            listSettings();

            window.addEventListener('resize', function(e) {
                if(el.offsetWidth !== Math.abs(ctrl.shift)) {
                    listSettings();
                    scope.$apply();
                }
            });

        }
    };
})
.directive('horizontalListItem', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {},
        templateUrl: '/modules/toptens/templates/horizontal-list-item.html',
        require: '^horizontalList',
        link: function(scope, element, attr, horizontalListCtrl) {
            scope.isVisible = false;
            scope.itemWidth = horizontalListCtrl.itemWidth;
            scope.position = element.index();
            horizontalListCtrl.register(scope);
        }
    };
})
.directive('ngMin', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMin, function(){
                if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
            });

            var isEmpty = function (value) {
               return angular.isUndefined(value) || value === '' || value === null;
            };

            var minValidator = function(value) {
              var min = scope.$eval(attr.ngMin) || 0;
              if (!isEmpty(value) && value < min) {
                ctrl.$setValidity('ngMin', false);
                return undefined;
              } else {
                ctrl.$setValidity('ngMin', true);
                return value;
              }
            };

            ctrl.$parsers.push(minValidator);
            ctrl.$formatters.push(minValidator);
        }
    };
})
.directive('ngMax', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {
            scope.$watch(attr.ngMax, function(){
                if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
            });

            var isEmpty = function (value) {
               return angular.isUndefined(value) || value === '' || value === null;
            };

            var maxValidator = function(value) {
              var max = scope.$eval(attr.ngMax) || Infinity;
              if (!isEmpty(value) && value > max) {
                ctrl.$setValidity('ngMax', false);
                return undefined;
              } else {
                ctrl.$setValidity('ngMax', true);
                return value;
              }
            };

            ctrl.$parsers.push(maxValidator);
            ctrl.$formatters.push(maxValidator);
        }
    };
});

'use strict';

angular.module('toptens')
.filter('toptenFilter', function() {
    return function(array, displayType, value) {
        if(array !== undefined) {
            return array.filter(function(item) {
                if(item[displayType].toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    return item;
                }
            });
        }
    };
});

'use strict';

//Toptens service used to communicate Toptens REST endpoints
angular.module('toptens').factory('Toptens', ['$resource',
	function($resource) {
		return $resource('toptens/:toptenId', { toptenId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
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
//		state('signup', {
//			url: '/signup',
//			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
//		}).
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
		if ($scope.authentication.user) $location.path('/tasks');

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
				$location.path('/tasks');
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