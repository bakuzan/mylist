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

angular.module(ApplicationConfiguration.applicationModuleName)
     .run(['$rootScope', '$state', 'Authentication', function ($rootScope, $state, Authentication) {
        $rootScope.$on('$stateChangeStart', function (event, toState) {
					if(toState.name === 'signin') {
						if(Authentication.user._id) {
							event.preventDefault();
							$state.go('listTasks');
						} else {
							return;
						}
					}
	        if (!Authentication.user) {
						event.preventDefault();
						$state.go('signin');
	        }
				});
}]);

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
		Menus.addMenuItem('topbar', 'Animeitems', 'animeitems', 'dropdown');
		Menus.addSubMenuItem('topbar', 'animeitems', 'List Animeitems', 'animeitems');
		Menus.addSubMenuItem('topbar', 'animeitems', 'Watch Animeitems', 'animeitems/watch-list');
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
			templateUrl: 'modules/animeitems/views/list-animeitems.client.view.html',
			controller: 'AnimeitemsController as ctrl'
		}).
		state('watchListAnimeitems', {
			url: '/animeitems/watch-list',
			templateUrl: 'modules/animeitems/views/list-animeitems.client.view.html',
			controller: 'WatchListController as ctrl'
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
			templateUrl: 'modules/animeitems/views/create-animeitem.client.view.html'
		}).
		state('watchAnimeitem', {
			url: '/animeitems/watch/:animeitemId',
			templateUrl: 'modules/animeitems/views/watch-animeitem.client.view.html'
		});
	}
]);

(function() {
	'use strict';
	angular.module('animeitems')
	.controller('AnimeitemsController', AnimeitemsController);
	AnimeitemsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService', '$uibModal'];

	function AnimeitemsController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService, $uibModal) {
		var ctrl = this;

		ctrl.authentication = Authentication;
    ctrl.filterConfig = {
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
        selectListOptions: {},
        statTags: [],
        commonArrays: ListService.getCommonArrays(),
				getItemsAvailable: getItemsAvailable,
				viewItem: ''
    };
		ctrl.findOne = findOne;
		ctrl.latestDate = latestDate;
		ctrl.pageConfig = {
				currentPage: 0,
				pageSize: 10
		};
		ctrl.remove = remove;
		ctrl.tickOff = tickOff;
		ctrl.trustAsResourceUrl = trustAsResourceUrl;
		ctrl.update = update;
    ctrl.usedTags = []; //for typeahead array.
		ctrl.viewItemHistory = viewItemHistory;
		ctrl.whichController = 'animeitem';

		ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);

    //allow retreival of local resource
    function trustAsResourceUrl(url) {
        return $sce.trustAsResourceUrl(url);
    }

		// Remove existing Animeitem
		function remove(animeitem) {
	     //are you sure option...
	    NotificationFactory.confirmation(function() {
	        if ( animeitem ) {
	          animeitem.$remove();

	          for (var i in ctrl.animeitems) {
	            if (ctrl.animeitems [i] === animeitem) {
	            	ctrl.animeitems.splice(i, 1);
	            }
	          }
	        } else {
						ctrl.animeitem.$remove(function() {
	          	$location.path('animeitems');
						});
	        }
	        NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
	    });
		}

		// Update existing Animeitem
		function update() {
			var animeitem = ctrl.animeitem;
			ctrl.animeitem = undefined;
      AnimeFactory.update(animeitem, undefined, true, undefined);
		}

    function tickOff(item) {
        item.episodes += 1;
        item.latest = new Date(); //update latest.
        ctrl.animeitem = item;
        ctrl.update();
    }

    //latest date display format.
    function latestDate(latest, updated) {
        return ItemService.latestDate(latest, updated);
    }

		function viewItemHistory() {
			var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '/modules/history/views/item-history.html',
        controller: 'ViewHistoryController as viewHistory',
        size: 'lg',
				resolve: {
					data: function () {
						return { viewItem: ctrl.filterConfig.viewItem, type: 'anime' };
					}
				}
      }).result.then(function(result) {
        console.log('closed history: ', result, ctrl.filterConfig.viewItem.meta);
				if (result) {
					ctrl.animeitem = ctrl.filterConfig.viewItem;
					ctrl.update();
				}
      });
		}

		// Find existing Animeitem
		function findOne() {
	    Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
	        ctrl.animeitem = result;
	   			console.log(ctrl.animeitem);
	    });
		}

		/** Find a list of Animeitems for values:
         *  (0) returns only ongoing series. (1) returns all series.
         */
		function getAnime(value) {
	    spinnerService.loading('anime', Animeitems.query({ status: value }).$promise.then(function(result) {
	        ctrl.animeitems = result;
					ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
					ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
	    }));
		}

    //Set defaults on requery and "neutralise" the other search variable.
    function getItemsAvailable() {
        ctrl.animeitems = undefined;
        if (ctrl.filterConfig.ongoingList === true) {
            ctrl.filterConfig.search.onHold = false;
            ctrl.filterConfig.search.status = '';
            getAnime(0);
        } else {
            ctrl.filterConfig.search.onHold = '';
            ctrl.filterConfig.search.status = false;
            getAnime(1);
        }
    }
		ctrl.filterConfig.getItemsAvailable();

	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.controller('CreateAnimeController', CreateAnimeController);
	CreateAnimeController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'AnimeFactory', 'spinnerService', 'TagService', 'Enums'];

	function CreateAnimeController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, AnimeFactory, spinnerService, TagService, Enums) {
		var ctrl = this,
        animeitemId = $stateParams.animeitemId;

		ctrl.addedEpisodes = addedEpisodes;
		ctrl.addTag = addTag;
		ctrl.animeitem = {};
		ctrl.authentication = Authentication;
    ctrl.config = {
      title: 'Create',
			updateHistory: false,
      ratingActions: {
          maxRating: 10,
          percent: undefined,
          overStar: null
      },
      statTags: [],
      commonArrays: ListService.getCommonArrays(),
			malSearchType: 'anime'
    };
		ctrl.create = create;
		ctrl.dropTag = dropTag;
    ctrl.finalNumbers = false; //default show status of final number fields in edit view.
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.findManga = findManga;
    ctrl.imgPath = ''; //image path
		ctrl.itemUpdate = new Date(); // today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
    ctrl.init = init;
		ctrl.malSearchOptions = {
			placeholder: 'Title',
			name: 'title',
			required: true,
			autocomplete: 'off',
			disabled: true
		};
		ctrl.removeTag = removeTag;
		ctrl.sections = {
			showAdditional: false,
			showCompletion: false,
			showItemTags: false
		};
		ctrl.selectMalEntry = selectMalEntry;
		ctrl.setInSeason = setInSeason;
		ctrl.submit = submit;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.

    function init() {
      ctrl.config.isCreate = animeitemId === undefined;
      if(ctrl.config.isCreate) {
				ctrl.animeitem.episodes = 0;
				ctrl.animeitem.start = ctrl.itemUpdate;
				ctrl.animeitem.latest = ctrl.itemUpdate;
				ctrl.malSearchOptions.disabled = false;
			} else if(!ctrl.config.isCreate) {
        ctrl.config.title = 'Edit';
        ctrl.findOne();
      }
      ctrl.find();
      ctrl.findManga();
    }
    ctrl.init();

		function selectMalEntry(malEntry) {
			if(malEntry) {
				if (ctrl.config.isCreate) {
					ctrl.animeitem.title = malEntry.title;
				}
				ctrl.animeitem.finalEpisode = malEntry.episodes;
				ctrl.imgPath = malEntry.image;
				ctrl.season = malEntry.status === Enums.malStatus.anime.ongoing;
				ctrl.animeitem.mal = {
					id: malEntry.id
				};
			} else {
				ctrl.animeitem.finalEpisode = 0;
				ctrl.animeitem.mal = undefined;
				ctrl.season = false;
			}
		}

    //For adding new tags.
    function addTag() {
			TagService.addTag(ctrl.tagArray, ctrl.newTag);
      ctrl.newTag = '';
    }
		//Drop tag for new tags.
		function dropTag(text) {
			TagService.dropTag(ctrl.tagArray, text);
		}
		//Drop tag for animeitem tags.
		function removeTag(text) {
			TagService.dropTag(ctrl.animeitem.tags, text);
		}

		function addedEpisodes() {
			ctrl.animeitem.latest = ctrl.itemUpdate;
			ctrl.config.updateHistory = true;
			if(ctrl.animeitem.episodes === ctrl.animeitem.finalEpisode && ctrl.animeitem.finalEpisode !== 0 && ctrl.animeitem.reWatching === false) {
				ctrl.animeitem.end = ctrl.itemUpdate;
			}
			if(ctrl.animeitem.episodes > ctrl.animeitem.finalEpisode && ctrl.animeitem.finalEpisode !== 0) {
				ctrl.animeitem.episodes = ctrl.animeitem.finalEpisode;
			}
		}

		function setInSeason() {
			if(ctrl.animeitem.season.season === null) {
				 ctrl.animeitem.season.year = null;
			 } else {
				 ctrl.animeitem.season.year = ctrl.animeitem.start.substring(0,4);
			 }
		}

		// Create new Animeitem
		function create() {
			// Create new Animeitem object
      var animeitem = new Animeitems();
      animeitem = new Animeitems ({
          title: ctrl.animeitem.title,
          episodes: ctrl.animeitem.episodes,
          start: ctrl.animeitem.start,
          latest: ctrl.animeitem.latest,
          finalEpisode: ctrl.animeitem.finalEpisode,
					image: ctrl.imgPath,
          season: ctrl.season === true ? ItemService.convertDateToSeason(new Date(ctrl.animeitem.start)) : '',
          disc: ctrl.animeitem.disc,
          manga: ctrl.animeitem.manga!==undefined && ctrl.animeitem.manga!==null ? ctrl.animeitem.manga._id : ctrl.animeitem.manga,
          tags: ctrl.tagArray,
					mal: ctrl.animeitem.mal,
          user: ctrl.user
       });

			// Redirect after save
			animeitem.$save(function(response) {
				$location.path('/animeitems');
				NotificationFactory.success('Saved!', 'Anime was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
        NotificationFactory.error('Error!', errorResponse.data.message);
			});
		}

		// Update existing Animeitem
		function update() {
			var animeitem = ctrl.animeitem;
			ctrl.animeitem = undefined;
      AnimeFactory.update(animeitem, ctrl.tagArray, ctrl.config.updateHistory, ctrl.imgPath);
		}

		function submit() {
			if(ctrl.config.isCreate) ctrl.create();
			if(!ctrl.config.isCreate) ctrl.update();
		}

    // Find a list of Animeitems
    function find() {
        Animeitems.query().$promise.then(function(result) {
					ctrl.animeitems = result;
						ctrl.config.statTags = ItemService.buildStatTags(result, 0);
				});
    }

		// Find existing Animeitem
		function findOne() {
	    spinnerService.loading('editAnime', Animeitems.get({ animeitemId: animeitemId }).$promise.then(function(result) {
	        ctrl.animeitem = result;
					ctrl.malSearchOptions.disabled = false; //(ctrl.animeitem.mal && ctrl.animeitem.mal.id > 0) || false;
	    }));
		}

    // Find list of mangaitems for dropdown.
    function findManga() {
        ctrl.mangaitems = Mangaitems.query();
    }

    //image upload
    function uploadFile(){
        ctrl.imgPath = '/modules/animeitems/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUploadAnime');
    }

	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.controller('WatchAnimeController', WatchAnimeController);
	WatchAnimeController.$inject = ['$scope', 'Authentication', '$stateParams', '$timeout', 'Animeitems', '$sce', 'ListService', 'AnimeFactory'];

	function WatchAnimeController($scope, Authentication, $stateParams, $timeout, Animeitems, $sce, ListService, AnimeFactory) {
				var ctrl = this,
						saved = localStorage.getItem('watched');

        ctrl.authentication = Authentication;
				ctrl.findOne = findOne;
				ctrl.playVideo = playVideo;
				ctrl.startRewatch = startRewatch;
				ctrl.update = update;
        ctrl.videoFile = {
  				processed: '',
  				file: '',
					number: '',
  				message: 'Please select an episode.'
        };
				ctrl.watchedList = (localStorage.getItem('watched') !== null) ? JSON.parse(saved) : {};

				function updateWatchedList() {
					localStorage.setItem('watched', JSON.stringify(ctrl.watchedList));
					ctrl.watchedList = JSON.parse(localStorage.getItem('watched'));
				}

        $scope.$watch('fileGrab', function(nVal, oVal) {
          if(nVal) {
						ctrl.videoFile.message = ''; //clear any error.
            ctrl.videoFile.file = nVal.name;
						ctrl.videoFile.number = ctrl.animeitem.video.files[ListService.findWithAttr(ctrl.animeitem.video.files, 'file', nVal.name)].number;
            ctrl.videoFile.processed = $sce.trustAsResourceUrl(window.URL.createObjectURL(nVal));
          }
        });

				function playVideo() {
					ctrl.watchedList[ctrl.videoFile.file] = true;
					updateWatchedList();
					if(ctrl.animeitem.reWatching && (ListService.findWithAttr(ctrl.animeitem.video.files, 'file', ctrl.videoFile.file) > -1)) {
						ctrl.animeitem.episodes = parseInt(ctrl.videoFile.number, 10);
						ctrl.update();
					}
				}

				function startRewatch() {
					console.log('startRewatch: ');
					var i = ctrl.animeitem.video.files.length;
					while(i--) {
						ctrl.watchedList[ctrl.animeitem.video.files[i].file] = false;
					}
					updateWatchedList();
					ctrl.animeitem.episodes = 0;
					ctrl.update();
				}

				// Update existing Animeitem
				function update() {
					ctrl.animeitem.latest = new Date();
		      AnimeFactory.update(ctrl.animeitem, undefined, false, '');
				}

        // Find existing Animeitem
    		function findOne() {
    	    Animeitems.get({ animeitemId: $stateParams.animeitemId }).$promise.then(function(result) {
    	        ctrl.animeitem = result;
    	   			console.log(ctrl.animeitem);
    	    });
    		}
        ctrl.findOne();

	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.controller('WatchListController', WatchListController);
	WatchListController.$inject = ['$scope', 'Authentication', '$state', '$sce', 'spinnerService', 'ItemService', 'ListService', 'WatchAnime', '$filter'];

	function WatchListController($scope, Authentication, $state, $sce, spinnerService, ItemService, ListService, WatchAnime, $filter) {
				var ctrl = this;

        ctrl.authentication = Authentication;
				ctrl.filterConfig = {
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
		        selectListOptions: {},
		        statTags: [],
		        commonArrays: ListService.getCommonArrays()
		    };
				ctrl.find = find;
				ctrl.latestDate = latestDate;
				ctrl.pageConfig = {
						currentPage: 0,
						pageSize: 10
				};
				ctrl.trustAsResourceUrl = trustAsResourceUrl;
				ctrl.watchAnime = watchAnime;
				ctrl.whichController = 'watch';

				function watchAnime(id) {
					$state.go('watchAnimeitem', { animeitemId: id });
				}

        // Find a list of Animeitems
        function find() {
					ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
					ctrl.filterConfig.sortType = ctrl.filterConfig.selectListOptions.sortOptions[ctrl.filterConfig.selectListOptions.sortOption].v; //Set sort order.
          spinnerService.loading('watch', WatchAnime.query().$promise.then(function(result) {
  					ctrl.animeitems = result;
						console.log('watch list: ', result, 'filterConfig: ', ctrl.filterConfig);
  				}));
        }
        ctrl.find();

				//allow retreival of local resource
		    function trustAsResourceUrl(url) {
		        return $sce.trustAsResourceUrl(url);
		    }

				//latest date display format.
		    function latestDate(latest, updated) {
		        return ItemService.latestDate(latest, updated);
		    }

	}

})();

(function() {
  'use strict';
  angular.module('tasks')
  .directive('animeItemModel', animeItemModel);

  function animeItemModel() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'modules/animeitems/templates/anime-item.html'
    };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .directive('fileModel', fileModel);
  fileModel.$inject = ['$parse'];

  function fileModel($parse) {
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
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .directive('keycuts', keycuts);

  function keycuts() {
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
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .directive('listBack', listBack);
   function listBack() {
      return function(scope, element, attrs){
          var url = attrs.listBack;
          element.css({
              'background-image': 'url(' + url +')',
              'background-size' : '50%',
              'background-repeat': 'no-repeat',
              'background-position': 'right'
          });
      };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .directive('listFilters', listFilters);

  function listFilters() {
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
                scope.filterConfig.getItemsAvailable();
              };

              scope.collapseFilters = function() {
                scope.filterConfig.expandFilters = false;
              };

          }

      };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .directive('swOnplay', swOnplay);

  function swOnplay() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var el = element[0];
        el.addEventListener('play', function() {
          scope.$apply(attrs.swOnplay);
        });
      }
    };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .directive('pageControls', pageControls);

  function pageControls() {
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

  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('endedMonth', endedMonth);

  function endedMonth() {
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
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('endedSeason', endedSeason);
  endedSeason.$inject = ['moment'];

  function endedSeason(moment) {
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
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('ratingFilter', ratingFilter);

  function ratingFilter() {
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
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('seasonForCharacterAnime', seasonForCharacterAnime);

  function seasonForCharacterAnime() {
      return function(array, year, month) {
          return array.filter(function(item) {
              if (item.anime && item.anime.season !== undefined && item.anime.season !== null) {
                  if (item.anime.season.year === year && item.anime.season.season === month) {
                      return item;
                  }
              }
          });
      };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('season', season);

  function season() {
      return function(array, year, month) {
          return array.filter(function(item) {
              if (item.season !== undefined && item.season !== null) {
                  if (item.season.year === year && item.season.season === month) {
                      return item;
                  }
              }
          });
      };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('startFrom', startFrom);

   function startFrom() {
      return function(input, start) {
          if (input !== undefined) {
              start = +start; //parse to int
              return input.slice(start);
          }
      };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('statisticsDetailFilter',statisticsDetailFilter);
   statisticsDetailFilter.$inject = ['$filter'];

   function statisticsDetailFilter($filter) {
      return function(array, type, year, division) {
          var filter = (division === '')   ? 'summaryYear' :
                       (type === 'months') ? 'endedMonth'  :
                                             'season'      ,
              filterPart = (division === '') ? type : division;
          return $filter(filter)(array, year, filterPart);
      };
  }

})();

(function() {
  'use strict';
  angular.module('animeitems')
  .filter('summaryYear', summaryYear);

  function summaryYear() {
      return function(array, year, type) {
          if (array !== undefined) {
              return array.filter(function(item) {
                if (type === 'months' && item.end !== undefined && item.end !== null) {
                    if (item.end.substring(0,4) === year) {
                        return item;
                    }
                } else if (type === 'seasons') {
                    if (item.season.year === year) {
                        return item;
                    }
                }
              });
          }
      };
  }

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.factory('AnimeFactory', AnimeFactory);
	AnimeFactory.$inject = ['Animeitems', 'ListService', 'ItemService', 'NotificationFactory', '$location'];

	function AnimeFactory(Animeitems, ListService, ItemService, NotificationFactory, $location) {
	    return {
	        update: function(item, tagArray, updateHistory, imgPath, episodeRating) {
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
	            animeitem = ItemService.itemHistory(animeitem, updateHistory, 'anime', episodeRating);

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
	            if (animeitem.reWatching===true) {
								animeitem = ItemService.itemRevisits(animeitem, 'anime');
								if(animeitem.episodes===animeitem.finalEpisode) {
	                animeitem.reWatchCount += 1;
	                animeitem.reWatching = false;
								}
	            }

				animeitem.$update(function() {
					if (window.location.href.indexOf('tasks') === -1 && window.location.href.indexOf('watch') === -1 ) $location.path('animeitems');

				    NotificationFactory.success('Saved!', 'Anime was saved successfully');
				}, function(errorResponse) {
					var error = errorResponse.data.message;
	                NotificationFactory.error('Error!', errorResponse.data.message);
				});
	        }
	    };
	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.factory('Animeitems', AnimeitemsFactory);
	AnimeitemsFactory.$inject = ['$resource'];

		function AnimeitemsFactory($resource) {
			return $resource('animeitems/:animeitemId', { animeitemId: '@_id' }, { update: { method: 'PUT' } });
		}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.service('fileUpload', fileUpload);
	fileUpload.$inject = ['$http', 'NotificationFactory'];

	function fileUpload($http, NotificationFactory) {
		var obj = {
			uploadFileToUrl: uploadFileToUrl
		};
		return obj;

    function uploadFileToUrl(file, uploadUrl){
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
    }

	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.service('ItemService', ItemService);
	ItemService.$inject = ['moment', '$filter', 'ListService'];

	function ItemService(moment, $filter, ListService) {
		var obj = {
			buildOverview: buildOverview,
			buildRatingsDistribution: buildRatingsDistribution,
			buildStatTags: buildStatTags,
			completeByMonth: completeByMonth,
			completeBySeason: completeBySeason,
			convertDateToSeason: convertDateToSeason,
			deleteHistory: deleteHistory,
			endingYears: endingYears,
			getRatingValues: getRatingValues,
			itemHistory: itemHistory,
			itemRevisits: itemRevisits,
			latestDate: latestDate,
			maxCompleteMonth: maxCompleteMonth,
			maxTagCount: maxTagCount,
			ratingsWeighted: ratingsWeighted,
			setSeason: setSeason
		};
		return obj;

	        //Using the date, returns the season.
	        function convertDateToSeason(date) {
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
	        }

	        //add history entry to item.
	        function itemHistory(item, updateHistory, type, episodeRating) {
	            //console.log('item history: ', item, item.meta, episodeRating);
	            //populate the history of when each part was 'checked' off.
	            if (item.meta.history.length !== 0) {
	                var latestHistory = item.meta.history[item.meta.history.length - 1].value,
	                    length = type === 'anime' ? item.episodes - latestHistory : item.chapters - latestHistory;
	                if (length > 0 && (type === 'anime' ? item.reWatching === false : item.reReading === false)) {
	                    for(var i = 1; i <= length; i++) {
	                        item.meta.history.push({
	                            date: Date.now(),
	                            value: latestHistory + i,
	                            rating: episodeRating || 0,
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
	                        rating: episodeRating || 0,
	                        title: item.title,
	                        id: item._id
	                    });
	                }
	            }
	            return item;
	        }

	        //remove an entry from an items history.
	        function deleteHistory(item, history) {
	            var temp = [];
	            angular.forEach(item.meta.history, function(past) {
	                if (past.value !== history.value) {
	                    temp.push(past);
	                }
	            });
	            item.meta.history = temp;
	            return item;
	        }

					function itemRevisits(item, type) {
						var anime = { count: 'reWatchCount', currentPart: 'episodes', finalPart: 'finalEpisode' },
								manga = { count: 'reReadCount',  currentPart: 'chapters', finalPart: 'finalChapter' },
								repeating = type === 'anime' ? anime : manga,
								index = ListService.findWithAttr(item.meta.revisits, 'value', item[repeating.count] + 1);
						if(index === -1) {
							item.meta.revisits.push({
								id: item.id,
								title: item.title,
								value: item[repeating.count] + 1,
								rating: 0,
								start: item.latest,
								end: item[repeating.currentPart] === item[repeating.finalPart] ? item.latest : null
							});
						} else if(index > -1 && item[repeating.currentPart] === item[repeating.finalPart]) {
							item.meta.revisits[index].end = item.latest;
						}
						return item;
					}

	        //function to display relative time - using latest or updated date.
	        function latestDate(latest, updated) {
	            //latest date display format.
	//          console.log(latest, updated);
	            var today = moment(new Date()), displayDate, diff;

	            if (moment(latest).toISOString().substring(0,10)===moment(updated).toISOString().substring(0,10)) {
	                 displayDate = moment(updated);
	                 diff = displayDate.fromNow();

	                if (diff==='a day ago') {
	                    return 'Yesterday at ' + displayDate.format('HH:mm');
	                } else if (diff.indexOf('days') > -1) {
	                    return diff + ' at ' + displayDate.format('HH:mm');
	                } else {
	                    return diff + '.';
	                }
	            } else {
	                 displayDate = moment(latest);
	                 diff = today.diff(displayDate, 'days');

	                //for 0 and 1 day(s) ago use the special term.
	                if (diff===0) {
	                    return 'Today';
	                } else if (diff===1) {
	                    return 'Yesterday';
	                } else {
	                    return diff + ' days ago.';
	                }
	            }
	        }

	        //build statistics item overview details.
	        function buildOverview(items) {
	            var overview = {
	                ongoing: $filter('filter')(items, {status: false }).length,
	                completed: $filter('filter')(items, {status: true }).length
	            };
	//            console.log('overview ' , overview);
	            return overview;
	        }

	        //calculate which month has the most anime completed in it.
	        function maxCompleteMonth(items) {
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
	        }

	        //calculate the rating values - max rated count and average rating.
	        function getRatingValues(items) {
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
	        }

	        //calculate which month has the most anime completed in it.
	        function maxTagCount(items) {
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
	        }

	        //build stat tags including counts, averages etc.
	        function buildStatTags(items, averageItemRating) {
	            var add = true, statTags = [], checkedRating, maxTagCount = obj.maxTagCount(items), itemCount = items.length;
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
	                            statTags[i].ratingWeighted = obj.ratingsWeighted(statTags[i].ratings);
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
	        }

	        //function to calculate the weighted mean ratings for the genre tags.
	        function ratingsWeighted(ratings) {
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
	        }

	        //builds counts for number of items given for each rating.
	        function buildRatingsDistribution(items) {
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
	        }

	        // 'sub-function' of the completeBy... functions.
	        function endingYears(items) {
	            var years = [],
									itemYears = $filter('unique')(items, 'end.substring(0,4)'); //get unqiue years as items.
	            		itemYears = $filter('orderBy')(itemYears, '-end.substring(0,4)'); //order desc.
							angular.forEach(itemYears, function(item) {
								if(item.end !== undefined && item.end !== null) {
									years.push({ year: item.end.substring(0,4) });
								}
							});
	            return years;
	        }

	        //complete by month stats
	        function completeByMonth(items) {
	            var monthDetails = {}, completeByMonthItems = [], maxCompleteMonth = 0, itemYears = obj.endingYears(items), i = itemYears.length;
	            //build comlpeteByMonths object.
	            while(i--) {
	                //chuck the null end date. push the year part of the other end dates with months array.
	                if (itemYears[i].year !== undefined && itemYears[i].year !== null) {
	                    completeByMonthItems.push({ year: itemYears[i].year,
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
	            maxCompleteMonth = obj.maxCompleteMonth(items);
	            monthDetails = { months: completeByMonthItems, max: maxCompleteMonth };

	//            console.log('completeByMonthItems', completeByMonthItems);
	            return monthDetails;
	        }

	        //complete by season stats.
	        function completeBySeason(items) {
	            var seasonDetails = {}, completeBySeasonItems = [], maxCompleteSeason = 0, itemYears = obj.endingYears(items), i = itemYears.length;
	            //build completeBySeasonItems object.
	            while(i--) {
	                //chuck the null end date. push the year part of the other end dates with seasons array.
	                if (itemYears[i].year !== undefined && itemYears[i].year !== null) {
	                    completeBySeasonItems.push({ year: itemYears[i].year,
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
	            angular.forEach(completeBySeasonItems, function(item) {
	                var i = item.seasons.length;
	                while(i--) {
	                    if (item.seasons[i].count > maxCompleteSeason) {
	                        maxCompleteSeason = item.seasons[i].count;
	                    }
	                }
	            });
	            seasonDetails = { seasons: completeBySeasonItems, max: maxCompleteSeason };
	//            console.log('completeBySeasonItems', seasonDetails);
	            return seasonDetails;
	        }

	        //Temporary function to generate the season data for pre-exisiting items in db.
	        function setSeason(items, year, season) {
	            var array = $filter('endedSeason')(items, year, season);
	            angular.forEach(array, function(item) {
	                //console.log(item.title);
	                item.season = obj.convertDateToSeason(new Date(item.start));
	            });
	            return array;
	        }

	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.service('ListService', ListService);
	ListService.$inject = ['moment', '$q'];

	function ListService(moment, $q) {
		var service = {
			checkForTagless: checkForTagless,
			concatenateTagArrays: concatenateTagArrays,
			findWithAttr: findWithAttr,
			getCommonArrays: getCommonArrays,
			getSelectListOptions: getSelectListOptions,
			groupItemsByProperties: groupItemsByProperties,
			manipulateString: manipulateString,
			numberOfPages: numberOfPages,
			stringReverse: stringReverse,
			weekEndingForDate: weekEndingForDate
		};
		return service;

	        function stringReverse(string) {
	            return string.split('').reverse().join('');
	        }

	        //get number of pages for list.
	        function numberOfPages(showingCount, pageSize, currentPage) {
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
	        }

	        //find index of object with given attr.
	        function findWithAttr(array, attr, value) {
	            if (array !== undefined) {
	                for(var i = 0; i < array.length; i += 1) {
	                    if(array[i][attr] === value) {
	                        return i;
	                    }
	                }
	            }
	            return -1;
	        }

					/** Splitting array into multiple arrays by grouping by attributes.
					 */
					 function groupItemsByProperties(array, groupProperties) {
						 return $q(function (resolve, reject) {
								 var groupedArrays = groupBy(array, function (item) {
										 return getGroupProperties(item, groupProperties);
								 });
								 resolve(groupedArrays);
						 });
					 }
					 //Retrieve the item values for grouping by
					 function getGroupProperties(item, groups) {
							 var array = [];
							 angular.forEach(groups, function (group) {
									 array.push(item[group]);
							 });
							 return array;
					 }
					 //Group the items into arrays using the values.
					 function groupBy(array, f) {
							 var groups = {};
							 array.forEach(function (o) {
									 var group = JSON.stringify(f(o));
									 groups[group] = groups[group] || [];
									 groups[group].push(o);
							 });
							 return Object.keys(groups).map(function (group) {
									 return groups[group];
							 });
					 }

	        function manipulateString(string, transform, onlyFirst) {
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
	        }

					function weekEndingForDate(convertToSunday) {
			        var date = new Date(convertToSunday),
			            day = date.getDay(),
			            diff = date.getDate() - day + (day === 0 ? 0:7),
			            temp = new Date(convertToSunday),
			            wkEnd = new Date(temp.setDate(diff));
			        return moment(wkEnd.toISOString()).endOf('day');
			    }

	        //returns the options for the various filters in list pages.
	        function getSelectListOptions(controller) {
	            var selectListOptions = {};
	            if (controller !== 'character' && controller !== 'topten') {
	                selectListOptions.status = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'Completed' } ];
	                selectListOptions.searchName = 'title';
	                if (controller === 'animeitem' || controller === 'watch') {
	                    selectListOptions.onHold = [ { v: '', n: 'All' }, { v: false, n: 'Ongoing' }, { v: true, n: 'On Hold' } ];
	                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'episodes', n: 'Episodes' },{ v: 'start', n: 'Start date' },
	                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
	                                                    ];
	                    selectListOptions.sortOption = service.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
	                    selectListOptions.media = [ { v: '', n: 'All' }, { v: false, n: 'Online' }, { v: true, n: 'Disc' } ];
	                    selectListOptions.mediaType = 'disc';
	                    selectListOptions.repeating = [ { v: '', n: 'All' }, { v: false, n: 'Not Re-watching' }, { v: true, n: 'Re-watching' } ];
	                    selectListOptions.repeatType = 'reWatching';
	                } else if (controller === 'mangaitem') {
	                    selectListOptions.sortOptions = [ { v: 'title', n: 'Title' },{ v: 'chapters', n: 'Chapters' },{ v: 'volumes', n: 'Volumes' },{ v: 'start', n: 'Start date' },
	                                                      { v: 'end', n: 'End date' },{ v: ['latest', 'meta.updated'], n: 'Latest' },{ v: 'rating', n: 'Rating' }
	                                                    ];
	                    selectListOptions.sortOption = service.findWithAttr(selectListOptions.sortOptions, 'n', 'Latest');
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
	                selectListOptions.sortOption = service.findWithAttr(selectListOptions.sortOptions, 'n', 'Name');
	            }
	//            console.log(selectListOptions);
	            return selectListOptions;
	        }

	        function concatenateTagArrays(itemTags, tagArray) {
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
	        }

	        //check to see if there are items with no tags.
	        function checkForTagless(items) {
	            var areTagless = false;
	            angular.forEach(items, function(item) {
	                if (item.tags.length === 0) {
	                    areTagless = true;
	                }
	            });
	            return areTagless;
	        }

	        function getCommonArrays(controller) {
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
	        }

	}

})();

(function() {
	'use strict';
	angular.module('animeitems')
	.factory('WatchAnime', WatchAnime);
	WatchAnime.$inject = ['$resource'];

		function WatchAnime($resource) {
			return $resource('animeitems/watch-list', { }, { update: { method: 'PUT' } });
		}

})();

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
(function() {
	'use strict';
	angular.module('characters')
	.controller('CharactersController', CharactersController);
	CharactersController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ListService', 'CharacterService', 'NotificationFactory', 'spinnerService', 'TagService'];

	function CharactersController($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window, ListService, CharacterService, NotificationFactory, spinnerService, TagService) {
		var ctrl = this;

		ctrl.addTag = addTag;
		ctrl.authentication = Authentication;
		ctrl.create = create;
		ctrl.dropTag = dropTag;
    ctrl.filterConfig = {
			isList: 'list', //show list? or slider.
      showingCount: 0,
      sortType: '',
      sortReverse: false,
      searchTags: '',
      media: '',
      seriesFilter: '',
      tagsForFilter: [],
      taglessItem: false,
      areTagless: false,
      selectListOptions: {},
      statTags: [],
      voiceActors: [],
      series: []
    };
		ctrl.find = find;
		ctrl.findAnime = findAnime;
		ctrl.findManga = findManga;
		ctrl.findOne = findOne;
		ctrl.findOneAnime = findOneAnime;
		ctrl.findOneManga = findOneManga;
    ctrl.imgPath = ''; //image path
		ctrl.maxItemCount = 0; //number of characters.
		ctrl.pageConfig = {
				currentPage: 0,
				pageSize: 10
		};
		ctrl.remove = remove;
		ctrl.removeTag = removeTag;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.trustAsResourceUrl = trustAsResourceUrl;
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.
		ctrl.whichController = 'character';


		//allow retreival of local resource
    function trustAsResourceUrl(url) {
        return $sce.trustAsResourceUrl(url);
    }
    //For adding new tags.
    function addTag() {
			TagService.addTag(ctrl.tagArray, ctrl.newTag);
      ctrl.newTag = '';
    }
		//Drop tag for new tags.
		function dropTag(text) {
			TagService.dropTag(ctrl.tagArray, text);
		}
		//Drop tag for animeitem tags.
		function removeTag(text) {
			TagService.dropTag(ctrl.mangaitem.tags, text);
		}

		// Create new Character
		function create() {
	    //console.log(ctrl.tagArray);
	    var character = new Characters();
			// Create new Character object
			character = new Characters ({
				name: ctrl.name,
      	image: ctrl.imgPath,
        anime: ctrl.anime!==undefined && ctrl.anime!==null ? ctrl.anime._id : ctrl.anime,
        manga: ctrl.manga!==undefined && ctrl.manga!==null ? ctrl.manga._id : ctrl.manga,
        voice: ctrl.voice,
        tags: ctrl.tagArray,
        user: ctrl.user
			});

			// Redirect after save
			character.$save(function(response) {
				$location.path('characters/' + response._id);
        NotificationFactory.success('Saved!', 'Character was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
				NotificationFactory.error('Error!', errorResponse.data.message);
			});
		}

		// Remove existing Character
		function remove(character) {
      //are you sure option...
	    NotificationFactory.confirmation(function() {
	        if ( character ) {
	          character.$remove();
	          for (var i in ctrl.characters) {
	            if (ctrl.characters [i] === character) {
	                ctrl.characters.splice(i, 1);
	            }
	          }
	        } else {
	          ctrl.character.$remove(function() {
							$location.path('characters');
	          });
	        }
	        NotificationFactory.warning('Deleted!', 'Character was successfully deleted.');
	    });
		}

		// Update existing Character
		function update() {
			var character = ctrl.character;
      //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
      if (ctrl.character.manga!==null && ctrl.character.manga!==undefined) {
          character.manga = ctrl.character.manga._id;
      }
//            console.log(ctrl.character.anime);
      if (ctrl.character.anime!==null && ctrl.character.anime!==undefined) {
          character.anime = ctrl.character.anime._id;
      }

      if (ctrl.tagArray!==undefined) {
          character.tags = ListService.concatenateTagArrays(character.tags, ctrl.tagArray);
      }

      if (ctrl.imgPath!==undefined && ctrl.imgPath!==null && ctrl.imgPath!=='') {
          character.image = ctrl.imgPath;
      }

			character.$update(function() {
				$location.path('characters');
				NotificationFactory.success('Saved!', 'Character was saved successfully');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
        NotificationFactory.error('Error!', errorResponse.data.message);
			});
		}

		// Find a list of Characters
		function find() {
			ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
			spinnerService.loading('characters', Characters.query().$promise.then(function(result) {
				ctrl.characters = result;
				ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
				ctrl.filterConfig.statTags = CharacterService.buildCharacterTags(result);
				ctrl.filterConfig.voiceActors = CharacterService.buildVoiceActors(result);
				ctrl.filterConfig.series = CharacterService.buildSeriesList(result);
				console.log('find characters: ', ctrl.characters, ctrl.filterConfig);
			}));
		}

		// Find existing Character
		function findOne() {
			ctrl.character = Characters.get({
				characterId: $stateParams.characterId
			});
		}

    // Find a list of Animeitems
		function findAnime() {
			ctrl.animeitems = Animeitems.query();
		}

    // Find existing Animeitem
		function findOneAnime(anime) {
			ctrl.animeitem = Animeitems.get({
				animeitemId: anime
			});
		}

    // Find a list of Mangaitems
		function findManga() {
			ctrl.mangaitems = Mangaitems.query();
		}

    // Find existing Animeitem
		function findOneManga(manga) {
			ctrl.mangaitem = Mangaitems.get({
				mangaitemId: manga
			});
		}

    //image upload
    function uploadFile(){
        ctrl.imgPath = '/modules/characters/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUploadCharacter');
    }

	}

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('characterBack', characterBack);

   function characterBack(){
      return function(scope, element, attrs){
          var url = attrs.characterBack;
          element.css({
              'background-image': 'url(' + url +')',
              'background-size' : 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center'
          });
      };
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('clearTagValues', clearTagValues);

  function clearTagValues() {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('deleteSearchTag', deleteSearchTag);

  function deleteSearchTag() {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('disableNgAnimate', disableNgAnimate);
  disableNgAnimate.$inject = ['$animate'];

  function disableNgAnimate($animate) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        $animate.enabled(false, element);
      }
    };
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('dropTag', dropTag);
  dropTag.$inject = ['NotificationFactory'];

   function dropTag(NotificationFactory) {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('enterTag', enterTag);
  function enterTag() {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('removeTag', removeTag);
  removeTag.$inject = ['NotificationFactory'];

   function removeTag(NotificationFactory) {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .directive('slider', slider);
  slider.$inject = ['$timeout', '$sce'];

  function slider($timeout, $sce) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            slides: '=?',
            interval: '=?',
            filterConfig: '=?'
        },
        bindToController: true,
        controllerAs: 'sliderController',
        templateUrl: '/modules/characters/templates/slider.html',
        controller: ["$scope", function($scope) {
          var self = this,
              timer,
              autoSlide;
          self.currentIndex = -1; //pre-first slide to stop 'cannot assign to undefined' error.
          self.enter = enter;
          self.goToSlide = goToSlide;
          self.interval = self.interval === undefined ? 3000 : self.interval; //is there a custom interval?
          self.isFullscreen = false;
          self.leave = leave;
          self.next = next;
          self.prev = prev;
          self.repeater = self.slides === undefined ? false : true; //is there a collection to iterate through?
          self.toggleFullscreen = toggleFullscreen;
          self.trustAsResourceUrl = trustAsResourceUrl;

          //allow retreival of local resource
          function trustAsResourceUrl(url) {
              return $sce.trustAsResourceUrl(url);
          }

          //if no collection, make a dummy collection to cycle throught the children.
          if (!self.repeater) {
            self.slides = []; //used to allow cycling.
            for(var i = 0; i < length; i++) {
                self.slides.push({ index: i });
            }
          }
          function goToSlide(slide) {
  //              console.log('go to', slide);
              if (self.currentIndex !== slide) {
                  //reached end of slides?
                  if (slide !== $scope.filteredSlides.length) {
                    self.currentIndex = slide;
                  } else {
                    self.currentIndex = 0;
                  }
              } else {
                  if ($scope.filteredSlides[self.currentIndex].locked) {
                    //unlock, i.e start timer.
                    $scope.filteredSlides[self.currentIndex].locked = false;
                      autoSlide();
                  } else {
                    //lock, i.e. cancel timer.
                    $scope.filteredSlides[self.currentIndex].locked = true;
                    $timeout.cancel(timer);
                  }
              }
          }

          function next() {
              if (self.currentIndex < $scope.filteredSlides.length - 1) {
                  self.currentIndex += 1;

              } else {
                  self.currentIndex = 0;
              }
          }

          function prev() {
              if (self.currentIndex > 0) {
                  self.currentIndex -= 1;
              } else {
                  self.currentIndex = $scope.filteredSlides.length - 1;
              }
          }

          $scope.$watch('sliderController.currentIndex', function() {
              //  console.log('index', self.currentIndex, 'filtered slides ', $scope.filteredSlides);
              if (self.currentIndex > -1 && $scope.filteredSlides.length > 0) {
                    $scope.filteredSlides.forEach(function(slide) {
                        slide.visible = false; // make every slide invisible
                        slide.locked = false; // make every slide unlocked
                    });
                    $scope.filteredSlides[self.currentIndex].visible = true; // make the current slide visible
              }
          });

          autoSlide = function() {
              timer = $timeout(function() {
                  self.next();
                  timer = $timeout(autoSlide, self.interval);
              }, self.interval);
          };
          autoSlide();
          $scope.$on('$destroy', function() {
              $timeout.cancel(timer); // when the scope is destroyed, cancel the timer
          });

          //Stop timer on enter.
          function enter() {
  //              console.log('entered');
              if ($scope.filteredSlides[self.currentIndex].locked !== true) {
                $timeout.cancel(timer);
  //                  console.log('cancelled');
              }
          }
          //Restart timer on leave.
          function leave() {
  //              console.log('left');
              if ($scope.filteredSlides[self.currentIndex].locked !== true) {
                timer = $timeout(autoSlide, self.interval);
  //                  console.log('restarted');
              }
          }

          //Fullscreen capability
          function toggleFullscreen() {
              self.isFullscreen = !self.isFullscreen;
          }

        }],
        link: function(scope, elem, attrs, sliderController) {
            scope.childElementCount = elem[0].childElementCount - 1;
        }
    };

  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .filter('mediaFilter', mediaFilter);

  function mediaFilter() {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .filter('seriesDetailFilter', seriesDetailFilter);

  function seriesDetailFilter() {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .filter('seriesFilter', seriesFilter);

  function seriesFilter() {
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
  }

})();

(function() {
  'use strict';
  angular.module('characters')
  .filter('tagFilter', tagFilter);

  function tagFilter() {
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
  }

})();

(function() {
	'use strict';
	angular.module('characters')
	.service('CharacterService', CharacterService);
	CharacterService.$inject = ['$q'];

	function CharacterService($q) {

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

	}

})();

(function() {
	'use strict';
	angular.module('characters')
	.factory('Characters', CharacterFactory);
	 CharacterFactory.$inject = ['$resource'];

		function CharacterFactory($resource) {
			return $resource('characters/:characterId', { characterId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});
		}

})();

(function() {
	'use strict';
	angular.module('characters')
	.service('TagService', TagService);
	TagService.$inject = ['$rootScope', 'NotificationFactory'];

	 function TagService($rootScope, NotificationFactory) {
			var service = {};

			//Add newTag to tagArray
			service.addTag = function(tagArray, newTag) {
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
			};

			//Drop tag with text = text, from tagArray
			service.dropTag = function(tagArray, text) {
				 //are you sure option...
				NotificationFactory.confirmation(function() {
					$rootScope.$apply(function() {
						var i = tagArray.length;
						while(i--) {
							if(tagArray[i].text === text) {
								tagArray.splice(i, 1);
								NotificationFactory.warning('Dropped!', 'Tag was successfully dropped');
								break;
							}
						}
					});
				});
			};

			return service;
	}

})();


(function() {
	'use strict';
	angular.module('core').controller('HeaderController', HeaderController);
	HeaderController.$inject = ['$scope', 'Authentication', 'Menus', '$location'];

	function HeaderController($scope, Authentication, Menus, $location) {
		var ctrl = this;

		ctrl.authentication = Authentication;
		ctrl.changeTheme = changeTheme;
		ctrl.isActive = isActive;
		ctrl.isCollapsed = false;
		ctrl.isTimedTheme = localStorage.getItem('timedTheme');
		ctrl.menu = Menus.getMenu('topbar');
		ctrl.saved = localStorage.getItem('theme');
		ctrl.styles = [
        { name: 'Day', url: 'dist/main-day.css' },
        { name: 'Night', url: 'dist/main-night.css' }
    ];
		ctrl.theme = (localStorage.getItem('theme')!==null) ? JSON.parse(ctrl.saved) : ctrl.styles[1].url;
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

(function() {
  'use strict';
  angular.module('core')
  .directive('anywhereButHere', anywhereButHere);
  anywhereButHere.$inject = ['$compile'];

  function anywhereButHere($compile) {
      return {
          restrict: 'A',
          scope: {
            showBackdrop: '=ngShow'
          },
          link: function (scope, element, attrs) {
            var body = document.body,
                backdrop = angular.element('<div id="anywhere-but-here-backdrop" ng-show="showBackdrop" ng-click="triggerAnywhereButHere()"></div>')[0];
            body.appendChild(backdrop);
            $compile(backdrop)(scope);

            scope.triggerAnywhereButHere = function() {
              scope.showBackdrop = false;
            };
          }
      };
  }

})();

(function() {
  'use strict';
  angular.module('core')
  .directive('clickPass', clickPass);
  clickPass.$inject = ['$timeout'];

   function clickPass($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('click', function(event) {
          $timeout(function() {
            event.stopPropagation();
            document.getElementById(attrs.clickPass).click();
          }, 0);
        });
      }
    };
  }

})();

(function() {
  'use strict';
  angular.module('core')
  .directive('formatDate', formatDate);
   function formatDate(){
    return {
     require: 'ngModel',
      link: function(scope, elem, attr, modelCtrl) {
        modelCtrl.$formatters.push(function(modelValue){
          return (modelValue === null) ? null : new Date(modelValue);
        });
      }
    };
  }

})();

(function() {
  'use strict';
  angular.module('core')
  .directive('loadingSpinner', loadingSpinner);
  loadingSpinner.$inject = ['$http', 'spinnerService'];

   function loadingSpinner($http, spinnerService) {
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
          controller: ["$scope", function ($scope) {
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
          }]
      };
  }

})();

(function() {
  'use strict';
  angular.module('core')
  .directive('malSearch', malSearch);
  malSearch.$inject = ['MalService', '$timeout', 'spinnerService'];

  function malSearch(MalService, $timeout, spinnerService) {
      return {
          restrict: 'A',
          scope: {
            type: '=malSearch',
            selectItem: '=malSearchSelect',
            searchString: '=malSearchModel',
            options: '=malSearchOptions'
          },
          templateUrl: '/modules/core/templates/mal-search.html',
          bindToController: true,
          controllerAs: 'malSearchCtrl',
          controller: ["$scope", function($scope) {
            var self = this;

            self.delayInMs = 1500;
            self.displayActions = false;
            self.displaySelectedItemActions = displaySelectedItemActions;
            self.handleSearchString = handleSearchString;
            self.hasFocus = false;
            self.hasSearchResults = false;
            self.processItem = processItem;
            self.searchResults = [];
            self.selectedItem = null;
            self.selectedItemActions = [
              {
                displayText: 'Remove selected',
                action: () => {
                  self.processItem(null);
                  self.searchString = undefined;
                  self.displayActions = false;
                }
              },
              {
                displayText: 'Display raw json',
                action: () => {
                  self.displayRawJson = true;
                }
              }
            ];
            self.spinner = `mal-search-${self.options.name}`;
            self.toggleSearchDropdownOnFocus = toggleSearchDropdownOnFocus;

            function processItem(item) {
              self.selectItem(item);
              self.selectedItem = item;
            }

            function displaySelectedItemActions() {
              self.displayActions = true;
            }

            function searchMal(type, searchString) {
              MalService.search(type, searchString).then(result => {
                self.searchResults = result;
                self.hasSearchResults = true;
                spinnerService.hide(self.spinner);
              });
            }

            function toggleSearchDropdownOnFocus(event) {
              $timeout(() => {
                self.hasFocus = event.type === 'focus';
                if(self.hasFocus && self.searchResults.length === 0 && self.searchString && self.searchString.length > 2) handleSearchString();
              }, 200);
            }

            function handleSearchString() {
              self.hasFocus = true;
              if(self.searchString !== undefined && self.searchString.length > 2 && self.selectedItem === null && !self.options.disabled) {
                spinnerService.show(self.spinner);
                searchMal(self.type, self.searchString);
              }
            }

            $scope.$watch('malSearchCtrl.displayActions', newValue => {
              if(newValue !== undefined && !newValue) {
                self.displayRawJson = newValue;
              }
            });

          }]
      };
  }

})();

(function() {
  'use strict';
  angular.module('core')
  .directive('myProgress', myProgress);

   function myProgress() {
      return function(scope, element, attrs) {
          scope.$watch(attrs.myProgress, function(val) {
              var type = 'checklist-progress';
              element.html('<div class="' + type + '" style="width: ' + val + '%;height: 100%"></div>');
          });
        };
    }

})();

(function() {
  'use strict';
  angular.module('core')
  .filter('calendarFilter', calendarFilter);

   function calendarFilter() {
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

                  var day = new Date().getDay(),
                      diff = new Date().getDate() - day + (day === 0 ? 0:7),
                      temp = new Date(),
                      wkEnd = new Date(temp.setDate(diff)),
                      currentWkEnd = wkEnd.toISOString().substring(0,10),
                      iDate = new Date(item.date).toISOString(),
                      itemDate = { year: iDate.substr(0,4), month: iDate.substr(5,2), day: iDate.substr(8,2) },
                      currentDate = { year: currentWkEnd.substr(0,4), month: currentWkEnd.substr(5,2), day: currentWkEnd.substr(8,2) };

                  if (datesSelected === false) {
                      if (itemDate.year < currentDate.year) {
                          return item;
                      } else if (itemDate.year === currentDate.year) {
                          if (itemDate.month < currentDate.month) {
                              return item;
                          } else if (itemDate.month === currentDate.month) {
                              if (itemDate.day <= currentDate.day) {
                                  return item;
                              }
                          }
                      }
                  } else if (datesSelected === true) {
                      if (itemDate.year > currentDate.year) {
                          return item;
                      } else if (itemDate.year === currentDate.year) {
                          if (itemDate.month > currentDate.month) {
                              return item;
                          } else if (itemDate.month === currentDate.month) {
                              if (itemDate.day > currentDate.day) {
                                  return item;
                              }
                          }
                      }
                  }
              });
          }
      };
  }

})();

(function() {
  'use strict';
  dateSuffix.$inject = ["$filter"];
  angular.module('core')
  .filter('dateSuffix', dateSuffix);

   function dateSuffix($filter) {
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
  }

})();

(function() {
  'use strict';
  angular.module('core')
  .filter('dayFilter', dayFilter);

   function dayFilter() {
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
}

})();

(function() {
  'use strict';
  angular.module('core')
  .filter('numberFixedLen', numberFixedLen);

   function numberFixedLen() {
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
  }

})();

(function() {
	'use strict';
	angular.module('core')
	.service('Enums', Enums);

	function Enums() {
		var obj = {
			malStatus: {
        anime: {
          ongoing: 'Currently Airing',
          complete: 'Finished Airing'
        },
        manga: {
          ongoing: 'Publishing',
          complete: 'Finished'
        }
      }
		};
		return obj;
	}

})();

(function() {
	'use strict';
	angular.module('core')
	.service('FunctionService', FunctionService);
	FunctionService.$inject = ['moment'];

	function FunctionService(moment) {
		var obj = {
			pad: pad
		};
		return obj;

    function pad(number, width, padChar) {
      padChar = padChar || '0';
      number = number + '';
      return number.length >= width ? number : new Array(width - number.length + 1).join(padChar) + number;
    }

	}

})();

(function() {
	'use strict';
	angular.module('core')
	.factory('MalService', MalService);
	MalService.$inject = ['$http', '$resource'];

	function MalService($http, $resource) {
		var malService = $resource('', {},
			 {
				search: {
					method: 'GET',
					url: 'malSearch/:type',
					params: { type: '@_type', searchString: '@_searchString' },
					isArray: true
				}
			 });

		function xmlToJson(xml) {
			var ELEMENT_NODE_TYPE = 1,
				TEXT_NODE_TYPE = 3,
				obj = {};

			if (xml.nodeType === ELEMENT_NODE_TYPE) {
				if (xml.attributes.length > 0) {
				obj['@attributes'] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType === TEXT_NODE_TYPE) {
				obj = xml.nodeValue;
			}

			if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === TEXT_NODE_TYPE) {
				obj = xml.childNodes[0].nodeValue;
			}
			else if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i),
						nodeName = item.nodeName;
					if (typeof(obj[nodeName]) === 'undefined') {
						obj[nodeName] = xmlToJson(item);
					} else {
						if (typeof(obj[nodeName].push) === 'undefined') {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(xmlToJson(item));
					}
				}
			}
			return obj;
		}

		function xmlProcessor(type, data) {
			var searchResult = [],
				xml = data.responseXML,
				nodes = xml.evaluate(`//${type}/entry`, xml, null, XPathResult.ANY_TYPE, null),
				result = nodes.iterateNext();
			while (result) {
				searchResult.push(xmlToJson(result));
				result = nodes.iterateNext();
			}
			return searchResult;
		}

		return {
			search: function (queryType, searchString) {
				return malService.search({ type: queryType, searchString: searchString }).$promise;
			}
		};
	}
})();

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
(function() {
  'use strict';
  angular.module('core')
  .factory('NotificationFactory', NotificationFactory);

   function NotificationFactory() {
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
}

})();

(function() {
  'use strict';
  angular.module('core')
  .factory('spinnerService', SpinnerService);
  SpinnerService.$inject = ['$q'];
   function SpinnerService($q) {
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

  }

})();

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
(function() {
  'use strict';
  angular.module('history').controller('HistoryController', HistoryController);
  HistoryController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'AnimeHistory', 'MangaHistory', 'HistoryService', 'ListService', 'spinnerService'];

  function HistoryController($scope, $stateParams, $location, Authentication, AnimeHistory, MangaHistory, HistoryService, ListService, spinnerService) {
		var ctrl = this,
		    latestDate = new Date().setDate(new Date().getDate() - 29);

    ctrl.authentication = Authentication;
    ctrl.buildHistory = buildHistory;
    ctrl.filterConfig = {
			historyFilter: 'Today'
    };
    ctrl.happenedWhen = happenedWhen;
    ctrl.historyGroups = [
      { name: 'Today' },
      { name: 'Yesterday' },
      { name: 'This week' },
      { name: 'Last week' },
      { name: 'Two weeks ago' },
      { name: 'Three weeks ago' },
      { name: 'Four weeks ago' },
    ];
    ctrl.view = 'Anime';


    function buildHistory() {
	    spinnerService.loading('history', AnimeHistory.query({ latest: latestDate }).$promise.then(function(result) {
					return HistoryService.buildHistoryList(result);
			}).then(function(result) {
	      //  console.log('build anime history: ', result);
				ctrl.animeHistory = result;
	      return MangaHistory.query({ latest: latestDate }).$promise;
	    }).then(function(result) {
				//    console.log('manga', result);
				return HistoryService.buildHistoryList(result);
	    }).then(function(result) {
				//                    console.log('build manga history: ', result);
				ctrl.mangaHistory = result;
			})
		  );
    }

    //Needed to catch 'Character' setting and skip it.
    $scope.$watch('view', function(newValue) {
      if (ctrl.view !== undefined) {
          if (newValue !== 'Anime' && newValue !== 'Manga') {
              ctrl.view = 'Anime';
          }
      }
    });

    function happenedWhen(when) {
        return HistoryService.happenedWhen(when);
    }

	}

})();

(function() {
  'use strict';

  angular.module('tasks').controller('ViewHistoryController', ViewHistoryController);
  ViewHistoryController.$inject =  ['$scope', 'data', '$stateParams', 'Authentication', 'ItemService', 'NotificationFactory', 'spinnerService', '$uibModalInstance'];

function ViewHistoryController($scope, data, $stateParams, Authentication, ItemService, NotificationFactory, spinnerService, $uibModalInstance) {
  var ctrl = this,
      historyStore = [];

  ctrl.cancel = cancel;
  ctrl.deleteHistory = deleteHistory;
  ctrl.submit = submit;
  ctrl.type = data.type;
  ctrl.updated = false;
  ctrl.viewItem = data.viewItem;

  function deleteHistory(item, history) {
      //are you sure option...
      NotificationFactory.confirmation(function() {
        if(historyStore.length === 0) {
          historyStore = ctrl.viewItem.meta.history;
        }
        ctrl.viewItem = ItemService.deleteHistory(item, history);
        ctrl.updated = true;
      });
  }

  function submit() {
    $uibModalInstance.close(ctrl.updated);
  }

  function cancel() {
    if(ctrl.updated) {
      ctrl.viewItem.meta.history = historyStore;
    }
    $uibModalInstance.dismiss();
  }

}

})();

(function() {
  'use strict';
  angular.module('history')
  .filter('historySeparator', historySeparator);
  historySeparator.$inject = ['HistoryService', 'moment'];

  function historySeparator(HistoryService, moment) {
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
  }

})();

(function() {
  'use strict';
  //History service used to communicate Animeitems REST endpoints
  angular.module('history')
  .factory('AnimeHistory', AnimeHistory);
  AnimeHistory.$inject = ['$resource'];

    function AnimeHistory($resource) {
      return $resource('history/anime/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
    }

})();

(function() {
  'use strict';
  angular.module('history')
  .service('HistoryService', HistoryService);
  HistoryService.$inject = ['moment', '$q'];

   function HistoryService(moment, $q) {
     var service = {
           buildHistoryList: buildHistoryList,
           extractHistory: extractHistory,
           filterItemHistory: filterItemHistory,
           getEndsOfWeek: getEndsOfWeek,
           getSetDaysAgo: getSetDaysAgo,
           groupItemHistory: groupItemHistory,
           happenedWhen: happenedWhen,
           today: moment(new Date()).startOf('day'),
           weekBeginning: weekBeginning,
           weekEnding: weekEnding
         },
         endsOfWeek = getEndsOfWeek(),
         mondays = endsOfWeek.mondays,
         sundays = endsOfWeek.sundays;
         return service;

    // getting mondays and sundays for this, last, two and three weeks ago.
    function getEndsOfWeek() {
        var endsOfWeek = [], thisMonday = service.weekBeginning(), thisSunday = service.weekEnding();
        endsOfWeek = {
            mondays: [ thisMonday, service.getSetDaysAgo(thisMonday, 7), service.getSetDaysAgo(thisMonday, 14), service.getSetDaysAgo(thisMonday, 21), service.getSetDaysAgo(thisMonday, 28) ],
            sundays: [ thisSunday, service.getSetDaysAgo(thisSunday, 7), service.getSetDaysAgo(thisSunday, 14), service.getSetDaysAgo(thisSunday, 21), service.getSetDaysAgo(thisSunday, 28) ]
        };
        return endsOfWeek;
    }

    //get 'daysAgo' days ago from 'thisEnd' date.
    function getSetDaysAgo(thisEnd, daysAgo) {
        var newDate = moment(thisEnd).subtract(daysAgo, 'days');
        return newDate;
    }

    //get 'this' monday.
    function weekBeginning() {
        var date = new Date(),
            day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? -6:1),
            temp = new Date(),
            wkBeg = new Date(temp.setDate(diff));
        return moment(wkBeg.toISOString()).startOf('day');
    }

    //get 'this' sunday.
    function weekEnding() {
        var date = new Date(),
            day = date.getDay(),
            diff = date.getDate() - day + (day === 0 ? 0:7),
            temp = new Date(),
            wkEnd = new Date(temp.setDate(diff));
        return moment(wkEnd.toISOString()).endOf('day');
    }

    function buildHistoryList(items) {
        var deferred = $q.defer(),
            promise = service.extractHistory(items).then(function(result) {
//                console.log('extract history: ', result);
                result.sort(function (a, b) {
                    var dateA = a.date,
                        dateB = b.date;
                    if(dateA > dateB) return -1;
                    if(dateA < dateB) return 1;
                    if(dateA === dateB) return 0;
                });
                return service.groupItemHistory(result);
            }).then(function(result) {
//                console.log('grouped', result);
                deferred.resolve(result);
            });
        return deferred.promise;
    }

    function extractHistory(items) {
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
    }

    function groupItemHistory(itemHistory) {
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
    }

    function filterItemHistory(timeframe, itemDate) {
        var diff = service.today.diff(itemDate, 'days');
        switch(timeframe) {
            case 'today':
                return diff === 0;

            case 'yesterday':
                return diff === 1;

            case 'this week':
                return mondays[0] <= itemDate && itemDate <= sundays[0];

            case 'last week':
                return mondays[1] <= itemDate && itemDate <= sundays[1];

            case 'two weeks ago':
                return mondays[2] <= itemDate && itemDate <= sundays[2];

            case 'three weeks ago':
                return mondays[3] <= itemDate && itemDate <= sundays[3];

            case 'four weeks ago':
                return mondays[4] <= itemDate && itemDate <= sundays[4];
        }
    }

    /** function to display relative time.
     *  Using diff because fromNow will create conflicts between
     *  the item date and the 'group date'.
     */
    function happenedWhen(when) {
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
    }

  }

})();

(function() {
  'use strict';
  angular.module('history')
  .factory('MangaHistory', MangaHistory);
  MangaHistory.$inject = ['$resource'];

  function MangaHistory($resource) {
    return $resource('history/manga/:latest', { latest: '@_latest' }, { update: { method: 'PUT' } });
  }

})();

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
			templateUrl: 'modules/mangaitems/views/create-mangaitem.client.view.html'
		});
	}
]);

(function() {
	'use strict';
	angular.module('mangaitems')
	.controller('CreateMangaController', CreateMangaController);
	CreateMangaController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'MangaFactory', 'spinnerService', 'TagService', 'Enums'];

	function CreateMangaController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, ItemService, ListService, NotificationFactory, MangaFactory, spinnerService, TagService, Enums) {
		var ctrl = this,
        mangaitemId = $stateParams.mangaitemId;

		ctrl.addedChapters = addedChapters;
    ctrl.addedVolumes = addedVolumes;
		ctrl.addTag = addTag;
		ctrl.mangaitem = {};
		ctrl.authentication = Authentication;
    ctrl.config = {
      title: 'Create',
			updateHistory: false,
      ratingActions: {
          maxRating: 10,
          percent: undefined,
          overStar: null
      },
      statTags: [],
      commonArrays: ListService.getCommonArrays(),
			malSearchType: 'manga'
    };
		ctrl.create = create;
		ctrl.dropTag = dropTag;
    ctrl.finalNumbers = false; //default show status of final number fields in edit view.
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.findAnime = findAnime;
    ctrl.imgPath = ''; //image path
		ctrl.itemUpdate = new Date(); // today's date as 'yyyy-MM-dd' for the auto-pop of 'latest' in edit page.
    ctrl.init = init;
		ctrl.malSearchOptions = {
			placeholder: 'Title',
			name: 'title',
			required: true,
			autocomplete: 'off',
			disabled: true
		};
		ctrl.removeTag = removeTag;
		ctrl.sections = {
			showAdditional: false,
			showCompletion: false,
			showItemTags: false
		};
		ctrl.selectMalEntry = selectMalEntry;
		ctrl.submit = submit;
    ctrl.tagArray = []; // holding tags pre-submit
    ctrl.tagArrayRemove = [];
		ctrl.update = update;
		ctrl.uploadFile = uploadFile;
    ctrl.usedTags = []; //for typeahead array.

    function init() {
      ctrl.config.isCreate = mangaitemId === undefined;
      if(ctrl.config.isCreate) {
				ctrl.mangaitem.chapters = 0;
				ctrl.mangaitem.volumes = 0;
				ctrl.mangaitem.start = ctrl.itemUpdate;
				ctrl.mangaitem.latest = ctrl.itemUpdate;
				ctrl.malSearchOptions.disabled = false;
			} else if(!ctrl.config.isCreate) {
        ctrl.config.title = 'Edit';
        ctrl.findOne();
      }
      ctrl.find();
      ctrl.findAnime();
    }
    ctrl.init();

		function selectMalEntry(malEntry) {
			if(malEntry) {
				ctrl.mangaitem.title = malEntry.title;
				ctrl.mangaitem.finalChapter = malEntry.chapters;
				ctrl.mangaitem.finalVolume = malEntry.volumes;
				ctrl.imgPath = malEntry.image;
				ctrl.mangaitem.mal = {
					id: malEntry.id
				};
			} else {
				ctrl.mangaitem.finalChapter = 0;
				ctrl.mangaitem.finalVolume = 0;
				ctrl.mangaitem.mal = undefined;
			}
		}

    //For adding new tags.
    function addTag() {
			TagService.addTag(ctrl.tagArray, ctrl.newTag);
      ctrl.newTag = '';
    }
		//Drop tag for new tags.
		function dropTag(text) {
			TagService.dropTag(ctrl.tagArray, text);
		}
		//Drop tag for tags.
		function removeTag(text) {
			TagService.dropTag(ctrl.mangaitem.tags, text);
		}

		function addedChapters() {
			ctrl.mangaitem.latest = ctrl.itemUpdate;
			ctrl.config.updateHistory = true;
      if (ctrl.mangaitem.chapters === ctrl.mangaitem.finalChapter && ctrl.mangaitem.finalChapter !== 0 && ctrl.mangaitem.reReading === false) {
        ctrl.mangaitem.end = ctrl.itemUpdate;
      }
      if (ctrl.mangaitem.chapters > ctrl.mangaitem.finalChapter && ctrl.mangaitem.finalChapter !== 0) {
        ctrl.mangaitem.chapters = ctrl.mangaitem.finalChapter;
      }
		}

    function addedVolumes() {
      if (ctrl.mangaitem.volumes > ctrl.mangaitem.finalVolume && ctrl.mangaitem.finalVolume !== 0) {
        ctrl.mangaitem.volumes = ctrl.mangaitem.finalVolume;
      }
    }

    // Create new Mangaitem
    function create() {

      var mangaitem = new Mangaitems();
      //Handle situation if objects not selected.
      // Create new Mangaitem object
     mangaitem = new Mangaitems ({
      title: ctrl.mangaitem.title,
      chapters: ctrl.mangaitem.chapters,
      volumes: ctrl.mangaitem.volumes,
      start: ctrl.mangaitem.start,
      latest: ctrl.mangaitem.latest,
      finalChapter: ctrl.mangaitem.finalChapter,
      finalVolume: ctrl.mangaitem.finalVolume,
      image: ctrl.imgPath,
      hardcopy: ctrl.mangaitem.hardcopy,
      anime: ctrl.mangaitem.anime !== undefined && ctrl.mangaitem.anime !== null ? ctrl.mangaitem.anime._id : ctrl.mangaitem.anime,
      tags: ctrl.tagArray,
      mal: ctrl.mangaitem.mal,
      user: ctrl.user
    });
      // Redirect after save
      mangaitem.$save(function(response) {
        $location.path('/mangaitems');
        NotificationFactory.success('Saved!', 'Manga was saved successfully');

      }, function(errorResponse) {
        ctrl.error = errorResponse.data.message;
        NotificationFactory.error('Error!', errorResponse.data.message);
      });
    }

    // Update existing Mangaitem
    function update() {
      var mangaitem = ctrl.mangaitem;
      ctrl.mangaitem = undefined;
      MangaFactory.update(mangaitem, ctrl.tagArray, ctrl.config.updateHistory, ctrl.imgPath);
    }

		function submit() {
			if(ctrl.config.isCreate) ctrl.create();
			if(!ctrl.config.isCreate) ctrl.update();
		}

    // Find a list of Mangaitems
		function find() {
      Mangaitems.query().$promise.then(function(result) {
          ctrl.mangaitems = result;
					ctrl.config.statTags = ItemService.buildStatTags(result, 0);
      });
		}

		// Find existing Animeitem
		function findOne() {
	    spinnerService.loading('editManga', Mangaitems.get({ mangaitemId: $stateParams.mangaitemId }).$promise.then(function(result) {
          ctrl.mangaitem = result;
					ctrl.malSearchOptions.disabled = (ctrl.mangaitem.mal && ctrl.mangaitem.mal.id > 0) || false;
	    }));
		}

    // Find a list of Animeitems for dropdowns.
    function findAnime() {
      ctrl.animeitems = Animeitems.query();
    }

    //image upload
    function uploadFile(){
        ctrl.imgPath = '/modules/mangaitems/img/' + ctrl.myFile.name;
        fileUpload.uploadFileToUrl(ctrl.myFile, '/fileUpload');
    }

	}

})();

(function() {
	'use strict';
	angular.module('mangaitems').controller('MangaitemsController', MangaitemsController);
	MangaitemsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', '$sce', '$window', 'ItemService', 'ListService', 'NotificationFactory', 'MangaFactory', 'spinnerService', '$uibModal'];

	function MangaitemsController($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, $sce, $window, ItemService, ListService, NotificationFactory, MangaFactory, spinnerService, $uibModal) {
		var ctrl = this;

		ctrl.authentication = Authentication;
    ctrl.filterConfig = {
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
        selectListOptions: {},
        statTags: [],
				viewItem: ''
    };
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.latestDate = latestDate;
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 10
    };
		ctrl.remove = remove;
		ctrl.tickOff = tickOff;
		ctrl.trustAsResourceUrl = trustAsResourceUrl;
		ctrl.update = update;
		ctrl.usedTags = []; //for typeahead array.
		ctrl.viewItemHistory = viewItemHistory;
		ctrl.whichController = 'mangaitem';

    //allow retreival of local resource
    function trustAsResourceUrl(url) {
        return $sce.trustAsResourceUrl(url);
    }

		// Remove existing Mangaitem
		function remove(mangaitem) {
      //are you sure option...
      NotificationFactory.confirmation(function() {
          if ( mangaitem ) {
              mangaitem.$remove();

              for (var i in ctrl.mangaitems) {
                  if (ctrl.mangaitems [i] === mangaitem) {
                      ctrl.mangaitems.splice(i, 1);
                  }
              }
          } else {
              ctrl.mangaitem.$remove(function() {
                  $location.path('/mangaitems');
              });
          }
          NotificationFactory.warning('Deleted!', 'Manga was successfully deleted.');
      });
		}

		// Update existing Mangaitem
		function update() {
			var mangaitem = ctrl.mangaitem;
            ctrl.mangaitem = undefined;
            MangaFactory.update(mangaitem, ctrl.tagArray, ctrl.updateHistory, ctrl.imgPath);
		}

		function tickOff(item) {
        item.chapters += 1;
        item.latest = new Date(); //update latest.
        ctrl.updateHistory = true; //add to history.
        ctrl.mangaitem = item;
        ctrl.update();
    }

    //latest date display format.
    function latestDate(latest, updated) {
        return ItemService.latestDate(latest, updated);
    }

		function viewItemHistory() {
			var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '/modules/history/views/item-history.html',
        controller: 'ViewHistoryController as viewHistory',
        size: 'lg',
				resolve: {
					data: function () {
						return { viewItem: ctrl.filterConfig.viewItem, type: 'manga' };
					}
				}
      }).result.then(function(result) {
        console.log('closed history: ', result, ctrl.filterConfig.viewItem.meta);
				if (result) {
					ctrl.mangaitem = ctrl.filterConfig.viewItem;
					ctrl.update();
				}
      });
		}

		// Find existing Mangaitem
		function findOne() {
	    Mangaitems.get({ mangaitemId: $stateParams.mangaitemId }).$promise.then(function(result) {
	        ctrl.mangaitem = result;
	        //            console.log(ctrl.mangaitem);
	    });
		}

		// Find a list of Mangaitems
		function find() {
			ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
      spinnerService.loading('manga', Mangaitems.query().$promise.then(function(result) {
          ctrl.mangaitems = result;
					ctrl.filterConfig.areTagless = ListService.checkForTagless(result);
					ctrl.filterConfig.statTags = ItemService.buildStatTags(result, 0);
      }));
		}

	}

})();

(function() {
  'use strict';
  angular.module('tasks')
  .directive('mangaItemModel', mangaItemModel);

  function mangaItemModel() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'modules/mangaitems/templates/manga-item.html'
    };
  }

})();

(function() {
	'use strict';
	angular.module('mangaitems')
	.factory('MangaFactory', MangaFactory);
	MangaFactory.$inject = ['Mangaitems', 'ListService', 'ItemService', 'NotificationFactory', '$location'];

	function MangaFactory(Mangaitems, ListService, ItemService, NotificationFactory, $location) {
    return {
        update: function(item, tagArray, updateHistory, imgPath) {
            var mangaitem = item;
            //console.log(mangaitem);
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
	}

})();

(function() {
	'use strict';
	//Mangaitems service used to communicate Mangaitems REST endpoints
	angular.module('mangaitems')
	.factory('Mangaitems',  MangaitemsFactory);
	MangaitemsFactory.$inject = ['$resource'];

	function MangaitemsFactory($resource) {
		return $resource('mangaitems/:mangaitemId', { mangaitemId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}

})();

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

(function() {
	'use strict';
	angular.module('orders').factory('Orders', OrdersFactory);
	OrdersFactory.$inject = ['$resource'];

	function OrdersFactory($resource) {
		return $resource('orders/:orderId', { orderId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}

})();

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
(function() {
	'use strict';
	angular.module('ratings')
	.controller('RatingsController', RatingsController);
	RatingsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'ListService', 'NotificationFactory', 'StatisticsService', 'spinnerService'];
	function RatingsController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, ListService, NotificationFactory, StatisticsService, spinnerService) {
		var ctrl = this;

		ctrl.authentication = Authentication;
		ctrl.episodeScore = episodeScore;
		ctrl.find = find;
		ctrl.go = go;
		ctrl.hoveringOver = hoveringOver;
		ctrl.itemScore = itemScore;
		ctrl.maxRating = 10;
		ctrl.modelOptions = { debounce: 700 };
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 20
    };
    ctrl.ratingLevel = undefined; //default rating filter
    ctrl.sortReverse = true;
    ctrl.sortType = 'rating';
		ctrl.view = 'Anime';
		ctrl.viewEpisodeRatings = viewEpisodeRatings;
    ctrl.viewItem = undefined;

		//rating 'tooltip' function
    function hoveringOver(value) {
        ctrl.overStar = value;
        ctrl.percent = 100 * (value / ctrl.maxRating);
    }

    function go(id) {
        $location.path('/mangaitems/' + id);
    }

    function getItems(view) {
        if (view === 'Anime') {
            spinnerService.loading('rating', Animeitems.query().$promise.then(function(result) {
                ctrl.items = result;
            }));
        } else if (view === 'Manga') {
            spinnerService.loading('rating', Mangaitems.query().$promise.then(function(result) {
                ctrl.items = result;
            }));
        }
        ctrl.viewItem = undefined;
    }

    function find(view) {
			if(view === 'Anime' || view === 'Manga') {
				 getItems(view);
			 } else {
				ctrl.view = 'Anime';
				getItems(ctrl.view);
			 }
    }

    //apply new score.
    function itemScore(item, score) {
        if (item.rating !== score) {
            item.rating = score;

            item.$update(function() {
                $location.path('ratings');
                NotificationFactory.success('Saved!', 'New rating was saved successfully');
            }, function(errorResponse) {
                ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Your change failed!');
            });
//                console.log('update');
        }
        return false;
    }

    /** Episode rating functions below here.
     */
    function viewEpisodeRatings(item) {
        ctrl.viewItem = (ctrl.viewItem !== item) ? item : undefined;
        ctrl.isEqual = (ctrl.viewItem === item) ? true : false;
        ctrl.search = (ctrl.viewItem === item) ? item.title : '';
        if (ctrl.viewItem !== undefined) {
            spinnerService.loading('summary', StatisticsService.buildSummaryFunctions(ctrl.viewItem.meta.history).then(function(result) {
                ctrl.summaryFunctions = result;
            }));
        }
    }

    function episodeScore(finished) {
//            console.log('finished: ', finished, ctrl.viewItem.meta.history);
        if (finished) {
            var item = ctrl.viewItem;
            item.$update(function() {
                $location.path('ratings');
                NotificationFactory.success('Saved!', 'New episode rating was saved successfully');
                spinnerService.loading('summary', StatisticsService.buildSummaryFunctions(ctrl.viewItem.meta.history).then(function(result) {
                    ctrl.summaryFunctions = result;
                }));
            }, function(errorResponse) {
                ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Your change failed!');
            });
        }
    }
	}

})();

(function() {
  'use strict';
    focusOnShow.$inject = ["$timeout"];
  angular.module('ratings')
  .directive('focusOnShow', focusOnShow);

  function focusOnShow($timeout) {
    return function(scope, element, attrs) {
       scope.$watch(attrs.focusOnShow, function (newValue) {
//            console.log('preview changed!')
            $timeout(function() {
                var myValue = newValue && element[0].focus();
                return myValue;
            });
         },true);
      };
    }
})();

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
(function() {
	'use strict';

	angular.module('statistics').controller('StatisticsController', StatisticsController);
	StatisticsController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'Characters', 'Toptens', 'ListService', 'ItemService', 'CharacterService', 'StatisticsService', '$filter', 'spinnerService'];

		function StatisticsController($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, Characters, Toptens, ListService, ItemService, CharacterService, StatisticsService, $filter, spinnerService) {
			var ctrl = this,
					filter = $filter('filter');
			ctrl.authentication = Authentication;
			ctrl.colours = { red: '#c9302c', green: '#449d44', blue: '#31b0d5' }; //'red'; '#d9534f'; ////'green';'#5cb85c'; ////'blue';'#5bc0de'; //
			ctrl.commonArrays = ListService.getCommonArrays('statistics');
			ctrl.dataStore = { anime: [], manga: [], character: [], toptens: { anime: {}, manga: {}, character: {} } };
			ctrl.detail = {
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
			ctrl.filterConfig = {
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
							topten: {
								type: 'count',
								reverse: true
							}
          },
          search: {
              tag: '',
              tagDetail: '',
              series: '',
              voice: '',
							topten: ''
          },
					topten: {
						isRanked: false,
						isFavourite: false
					}
      };
			ctrl.find = find;
			ctrl.gender = {}; //holds gender summary details.
			ctrl.generateSeasons = generateSeasons;
			ctrl.getFilteredItems = getFilteredItems;
			ctrl.getToptenItemStatistics = getToptenItemStatistics;
			ctrl.historyDetail = historyDetail;
      ctrl.historyDetails = {};
      ctrl.overview = {}; //holds summary/overview details.
      ctrl.ratingsDistribution = []; //counts for each rating.
      ctrl.statSeries = []; //for series statistics;
      ctrl.statTags = []; //for tag statistics;
			ctrl.tableDetail = tableDetail;
			ctrl.tableDetails = {};
      ctrl.taglessItem = false; //filter variable for showing tagless items.
      ctrl.toptens = {
				type: 'anime',
				anime: { listCount: 0, items: [] }, manga:  { listCount: 0, items: [] }, character:  { listCount: 0, items: [] }, detail: { items: [] }
			 };
      ctrl.view = 'Anime';
      ctrl.voiceActors = []; //for voice actor list;

			function getItemStatistics(view, items) {
				if(view === 'Anime' || view === 'Manga') {
					ctrl.overview = ItemService.buildOverview(items);
					ctrl.historyDetails.months = ItemService.completeByMonth(items);
					if (view === 'Anime') ctrl.historyDetails.seasons = ItemService.completeBySeason(items);
					ctrl.ratingValues = ItemService.getRatingValues(items);
					ctrl.ratingsDistribution = ItemService.buildRatingsDistribution(items);
					ctrl.statTags = ItemService.buildStatTags(items, ctrl.ratingValues.averageRating);
				} else if (view === 'Character') {
					ctrl.statTags = CharacterService.buildCharacterTags(items);
					ctrl.statSeries = CharacterService.buildSeriesList(items);
					ctrl.voiceActors = CharacterService.buildVoiceActors(items);
					CharacterService.buildGenderDistribution(ctrl.statTags, items.length).then(function(result) {
							ctrl.gender = result;
							ctrl.gender[0].colour = ctrl.colours.red;
							ctrl.gender[1].colour = ctrl.colours.green;
							ctrl.gender[2].colour = ctrl.colours.blue;
					});
				} else if (view ==='Topten') {
					StatisticsService.buildToptenModeList(items, ctrl.toptens.type).then(function(result) {
						ctrl.toptens.detail.items = result.sort(function(a, b) {
							if(a.count < b.count) return 1;
							if(a.count > b.count) return -1;
																		return 0;
						});
					});
					console.log('topten stat process: ', items, ctrl.toptens);
				}
			}

			//handle getting view items and setting view specific defaults.
      function getItems(view) {
          //reset defaults that are shared between views.
          ctrl.detail.history = 'months';
          ctrl.filterConfig.search.tag = '';
          ctrl.detail.isVisible = false;
          ctrl.detail.isEpisodeRatings = false;
          ctrl.statTags = []; //clear to stop multiple views tags appearing.
          ctrl.ratingsDistribution = [];
          if (view === 'Anime') {
              ctrl.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
							if (ctrl.dataStore.anime.length === 0) {
                spinnerService.loading('items', Animeitems.query().$promise.then(function(result) {
									ctrl.dataStore.anime = result;
									ctrl.items = result;
	                getItemStatistics(view, result);
								}));
							} else {
								ctrl.items = ctrl.dataStore.anime;
								getItemStatistics(view, ctrl.dataStore.anime);
								console.log('from cache - anime');
							}
          } else if (view === 'Manga') {
              ctrl.filterConfig.sort.tag.type = 'ratingWeighted'; //stat tag sort
							if (ctrl.dataStore.manga.length === 0) {
              	spinnerService.loading('items',	Mangaitems.query().$promise.then(function(result) {
									ctrl.dataStore.manga = result;
									ctrl.items = result;
									getItemStatistics(view, result);
              	}));
							} else {
								ctrl.items = ctrl.dataStore.manga;
								getItemStatistics(view, ctrl.dataStore.manga);
								console.log('from cache - anime');
							}
          } else if (view === 'Character') {
              ctrl.filterConfig.sort.tag.type = 'count'; //stat tag sort
							if (ctrl.dataStore.character.length === 0) {
								spinnerService.loading('character', Characters.query().$promise.then(function(result) {
									ctrl.dataStore.character = result;
									ctrl.items = result;
									getItemStatistics(view, result);
                }));
							} else {
								ctrl.items = ctrl.dataStore.character;
								getItemStatistics(view, ctrl.dataStore.character);
								console.log('from cache - character');
							}
          } else if (view === 'Topten') {
						if (ctrl.dataStore.toptens.anime.totalListCount === undefined) {
              spinnerService.loading('topten', Toptens.query().$promise.then(function(result) {
                return ListService.groupItemsByProperties(result, ['type']);
              }).then(function(result) {
								for(var i = 0, type = ''; i < 3; i++) {
									type = result[i][0].type;
									ctrl.dataStore.toptens[type].items = result[i];
									ctrl.dataStore.toptens[type].totalListCount = result[i].length;
								}
								return StatisticsService.buildToptenDataStructure(ctrl.toptens, result);
              }).then(function(result) {
								ctrl.toptens = result;
								getItemStatistics(view, result[ctrl.toptens.type].items);
								console.log('topten arrays: ', ctrl.toptens);
							}));
						} else {
							getItemStatistics(view, ctrl.toptens[ctrl.toptens.type].items);
							console.log('from cache - topten');
						}
          }
					console.log('dataStore check: ', ctrl.dataStore);
      }
      function find(view) {
          getItems(view);
      }

			function getToptenItemStatistics(view, toptenType) {
				console.log('get topten stats: ', toptenType);
				var filteredItems = ctrl.dataStore.toptens[toptenType].items;
				if(ctrl.filterConfig.topten.isRanked) filteredItems = filter(filteredItems, { isRanked: true });
				if(ctrl.filterConfig.topten.isFavourite) filteredItems = filter(filteredItems, { isFavourite: true });
				console.log('post filtering: ', filteredItems);
				if(filteredItems.length > 0) {
					ctrl.toptens[toptenType].items = []; //clear items so you won't get repeats.
					StatisticsService.buildToptenDataStructure(ctrl.toptens, [filteredItems]).then(function(result) {
						ctrl.toptens = result;
						console.log('topten data structure - result: ', result, ctrl.toptens);
						getItemStatistics(view, result[toptenType].items);
					});
				} else {
					ctrl.toptens[toptenType].listCount = 0;
					ctrl.toptens.detail.items = filteredItems;
				}
			}

      //Builds ratings aggregates.
      function getSummaryFunctions(array) {
      	spinnerService.loading('detail', StatisticsService.buildSummaryFunctions(array).then(function(result) {
        	ctrl.historyDetails.summaryFunctions = result;
					console.log('got summary functions: ', ctrl.detail, ctrl.historyDetails);
        }));
        if (ctrl.detail.summary.isVisible === true) {
	        spinnerService.loading('detail',
	            StatisticsService.buildYearSummary(array, ctrl.detail.year, ctrl.detail.summary.type).then(function(result) {
	                ctrl.historyDetails.yearSummary = result;
									console.log('got year summary: ', ctrl.detail, ctrl.historyDetails);
	            })
	        );
        }
				if(ctrl.detail.isEpisodeRatings && array[0].meta.episodeSummaryFunctions === undefined) { //If the first item has it already, they all do and this is pointless.
          spinnerService.loading('detail', StatisticsService.buildEpisodeSummaries(array).then(function(result) {
                  console.log(array);
          }));
				}
//            console.log(array, $scope.historyDetails);
      }

      function historyDetail(year, division, divisionText, summaryType) {
	      ctrl.detail.isVisible = true;
	      ctrl.detail.year = year;
	      ctrl.detail.division = division;
	      ctrl.detail.divisionText = divisionText;
				ctrl.detail.summary.type = summaryType;
	      ctrl.detail.summary.isVisible = (summaryType === undefined) ? false : true;
				ctrl.getFilteredItems();
      }

      function tableDetail(type, name) {
          if (ctrl.tableDetails[type] === name) {
              ctrl.filterConfig.search[type] = '';
              ctrl.filterConfig.show[type] = false;
              ctrl.tableDetails[type] = '';
              if (type === 'tag') ctrl.tableDetails.isEqual = false;
          } else {
              ctrl.filterConfig.search[type] = name;
              ctrl.tableDetails[type] = name;
              ctrl.filterConfig.show[type] = true;
              if (type === 'tag') {
                  ctrl.tagDetailResult = CharacterService.buildRelatedCharacterTags(ctrl.items, name);
                  ctrl.tableDetails.isEqual = true;
              }
          }
      }

			function getFilteredItems(historyChange) {
				if(historyChange) {
					ctrl.detail.isVisible = false;
					ctrl.detail.summary.isVisible = false;
					if(ctrl.detail.history === 'months') ctrl.detail.isEpisodeRatings = false;
				}
				var filtered = $filter('statisticsDetailFilter')(ctrl.items, ctrl.detail.history, ctrl.detail.year, ctrl.detail.division);
				getSummaryFunctions(filtered);
			}

      /** Using the start date of confirmed 'in-season' shows
       *  to populate the new season attrs. that will work with the new
       *  filters in the hopes accuracy and speed will increase.
       */
      function generateSeasons() {
          if (ctrl.view === 'Anime') {
              var array = ItemService.setSeason(ctrl.items, ctrl.detailSeasonYear, ctrl.detailSeason);
              angular.forEach(array, function(item) {
                  item.$update(function() {
                      console.log(item);
                  }, function(errorResponse) {
                      ctrl.error = errorResponse.data.message;
                  });
              });
          }
      }
		}

})();

(function() {
  'use strict';
  angular.module('statistics')
  .directive('detectFlood', detectFlood);
  detectFlood.$inject = ['$timeout'];

  function detectFlood($timeout) {
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
  }

})();

(function() {
  'use strict';
  angular.module('statistics')
  .directive('percentageBarContainer', percentageBarContainer);

  function percentageBarContainer() {
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
        controller: ["$scope", function($scope) {

        }]
    };
  }

})();

(function() {
  'use strict';
  angular.module('statistics')
  .directive('percentageBar', percentageBar);

  function percentageBar() {
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
  }

})();

(function() {
  'use strict';
  angular.module('statistics')
  .directive('tabContainer', tabContainer);

  function tabContainer() {
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
        controller: ["$scope", function($scope) {
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

        }],
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
  }

})();

(function() {
  'use strict';
  angular.module('statistics')
  .directive('tabView', tabView);

  function tabView() {
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
  }

})();

(function() {
  'use strict';
  //Statistics service
  angular.module('statistics')
  .service('StatisticsService', StatisticsService);
  StatisticsService.$inject = ['$filter', 'ListService', '$q'];

   function StatisticsService($filter, ListService, $q) {
      var service = {
        buildEpisodeSummaries: buildEpisodeSummaries,
        buildSummaryFunctions: buildSummaryFunctions,
        buildToptenDataStructure: buildToptenDataStructure,
        buildToptenModeList: buildToptenModeList,
        buildYearSummary: buildYearSummary,
        getModeMap: getModeMap,
        occuranceCounter: occuranceCounter
      };
      return service;

      function buildSummaryFunctions(array) {
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
                      modeRating = service.getModeMap(array, 'rating', 0);
                  }
                  resolve([
                      { metric: 'Average rating', value: averageRating },
                      { metric: 'Highest rating', value: highestRating },
                      { metric: 'Lowest rating',  value: (lowestRating === 10) ? 0 : lowestRating },
                      { metric: 'Mode rating',    value: (modeRating.value === undefined) ? 0 : modeRating.value }
                  ]);
              }
          });
      }

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

      function buildYearSummary(array, year, type) {
          return $q(function(resolve, reject) {
              var filter = (type === 'months') ? 'endedMonth' : 'season',
                  attr   = (type === 'months') ? 'number'     : 'text'  ,
                  commonArrays = ListService.getCommonArrays(),
                  i = commonArrays[type].length,
                  yearSummary = [], results = [];

              for(var j = 0; j < i; j++) {
                  var filteredArray = $filter(filter)(array, year, commonArrays[type][j][attr]),
                      promise = service.buildSummaryFunctions(filteredArray);
                  results.push(promise);
              }
              angular.forEach(results, function(promise) {
                  promise.then(function(result) {
                      yearSummary = processYearSummary(yearSummary, result);
                  });
              });
              resolve(yearSummary);
          });
      }

      function buildEpisodeSummaries(array) {
          return $q(function(resolve, reject) {
              angular.forEach(array, function(item) {
                  service.buildSummaryFunctions(item.meta.history).then(function(result) {
                      item.meta.episodeSummaryFunctions = result;
                  });
              });
              resolve(array);
          });
      }

      function getModeMap(array, attr, ignore) {
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
      }

      function occuranceCounter(array, attr) {
        return $q(function(resolve, reject) {
          var occuranceCounter = [];
          ListService.groupItemsByProperties(array, [attr]).then(function(result) {
            for(var i = 0, len = result.length; i < len; i++) {
              occuranceCounter.push({
                value: result[i][0][attr],
                count: result[i].length
              });
            }
          });
          resolve(occuranceCounter);
        });
      }

      function buildToptenDataStructure(obj, arrayOfArrays) {
        return $q(function(resolve, reject) {
          angular.forEach(arrayOfArrays, function(array) {
            var type = array[0].type, listType = type + 'List', len = array.length;
            obj[type].listCount = len;
            for(var i = 0; i < len; i++) {
              var itemLen = array[i][listType].length;
              for(var j = 0; j < itemLen; j++) {
                obj[type].items.push(array[i][listType][j]);
              }
            }
          });
          resolve(obj);
        });
      }

      function buildToptenModeList(array, type) {
        var attr = type === 'character' ? 'name' : 'title';
        return service.occuranceCounter(array, attr);
      }

    }

  })();

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
(function() {
  'use strict';

  angular.module('tasks').controller('CreateTaskController', CreateTaskController);
  CreateTaskController.$inject =  ['$scope', 'data', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory', 'spinnerService', '$uibModalInstance', 'Animeitems', 'Mangaitems'];

function CreateTaskController($scope, data, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory, spinnerService, $uibModalInstance, Animeitems, Mangaitems) {
  var ctrl = this,
      newTaskModel = {};
  ctrl.addChecklistItem = addChecklistItem;
  ctrl.backStep = backStep;
  ctrl.cancel = cancel;
  ctrl.commonArrays = data.commonArrays;
  ctrl.create = create;
  ctrl.dropChecklistItem = dropChecklistItem;
  ctrl.stepConfig = {
      currentStep: 1,
      stepCount: 2
  };
  ctrl.submit = submit;
  ctrl.takeStep = takeStep;

  function setNewTask() {
      ctrl.newTask = {
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
  angular.copy(ctrl.newTask, newTaskModel);


  //for adding/removing options.
  function addChecklistItem() {
          if (ctrl.newTask.checklistItem!=='' && ctrl.newTask.checklistItem!==undefined) {
              var i = 0;
              var alreadyAdded = false;
              if (ctrl.newTask.checklistItems.length > 0) {
                  while(i < ctrl.newTask.checklistItems.length) {
                      if (ctrl.newTask.checklistItems[i].text === ctrl.newTask.checklistItem) {
                          alreadyAdded = true;
                      }
                      i++;
                  }
                  //if not in array add it.
                  if (alreadyAdded === false) {
                      ctrl.newTask.checklistItems.push({ text: ctrl.newTask.checklistItem, complete: false });
                  }
              } else {
                  ctrl.newTask.checklistItems.push({ text: ctrl.newTask.checklistItem, complete: false });
              }
          }
          ctrl.newTask.checklistItem = '';
  }
  function dropChecklistItem(text) {
      var deletingItem = ctrl.newTask.checklistItems;
      ctrl.newTask.checklistItems = [];
      //update the task.
      angular.forEach(deletingItem, function(item) {
          if (item.text !== text) {
              ctrl.newTask.checklistItems.push(item);
          }
      });
  }

  // Create new Task
  function create() {
//            console.log(this.newTask);
    // Create new Task object
    var task = new Tasks ({
        description: ctrl.newTask.description,
        link: {
            linked: ctrl.newTask.link.linked,
            type: (ctrl.newTask.link.linked === false) ? ''      :
                  (ctrl.newTask.category === 'Watch')  ? 'anime' :
                                                         'manga' ,
            anime: (ctrl.newTask.link.anime === undefined) ? undefined : ctrl.newTask.link.anime._id ,
            manga: (ctrl.newTask.link.manga === undefined) ? undefined : ctrl.newTask.link.manga._id
        },
        day: ctrl.newTask.daily === true ? 'Any' : ctrl.newTask.day,
        date: ctrl.newTask.date === '' ? new Date() : ctrl.newTask.date,
        repeat: (ctrl.newTask.link.linked === false) ? ctrl.newTask.repeat                     :
                (ctrl.newTask.category === 'Watch')  ? ctrl.newTask.link.anime.finalEpisode    :
                                                       1    ,
        completeTimes: (ctrl.newTask.link.linked === false) ? 0                                     :
                       (ctrl.newTask.category === 'Watch')  ? ctrl.newTask.link.anime.episodes      :
                                                              0      ,
        updateCheck: new Date().getDay() === 1 ? true : false,
        complete: false,
        category: ctrl.newTask.category === '' ? 'Other' : ctrl.newTask.category,
        daily: ctrl.newTask.daily,
        checklist: ctrl.newTask.checklist,
        checklistItems: ctrl.newTask.checklistItems
    });
//			// Redirect after save
    task.$save(function(response) {
      $location.path('tasks');
      NotificationFactory.success('Saved!', 'New Task was successfully saved!');
    }, function(errorResponse) {
      ctrl.error = errorResponse.data.message;
      console.log(errorResponse);
      NotificationFactory.error('Error!', 'New Task failed to save!');
    });
  }

  function backStep(step) {
      ctrl.stepConfig.currentStep -= 1;
  }
  function takeStep(step) {
      var check = process(step);
      if (check.valid) {
          ctrl.stepConfig.currentStep += 1;
      } else {
          NotificationFactory.popup('Attention!', check.message, 'warning');
      }
  }
  function submit() {
    ctrl.create();
    $uibModalInstance.close();
  }
  function cancel() {
    $uibModalInstance.dismiss();
  }

  function process(step) {
      switch(step) {
          case 1:
              if (ctrl.newTask.link.linked === true) {
                  var category = ctrl.newTask.category;
                  if (category === 'Watch') {
                      ctrl.linkItems = Animeitems.query({
                          status: 0
                      });
                      ctrl.linkType = 'anime';
                      ctrl.newTask.checklistItems = [];
                      ctrl.newTask.checklist = false;
                  } else if (category === 'Read') {
                      ctrl.linkItems = Mangaitems.query({
                          status: 0
                      });
                      ctrl.linkType = 'manga';
                  } else {
                      return { valid: false, message: 'Category must be either Watch or Read for linked items!' };
                  }
              } else {
                  //Ensure that stuff is cleared when not linked.
                  ctrl.linkType = '';
                  ctrl.newTask.link.anime = undefined;
                  ctrl.newTask.link.manga = undefined;
              }
              return { valid: true };
      }
  }
}

})();

(function() {
	'use strict';
	angular.module('tasks').controller('ScheduleCalendarTaskController', ScheduleCalendarTaskController);
	ScheduleCalendarTaskController.$inject = ['$scope', '$uibModalInstance', 'moment', 'data', 'ListService', 'TaskFactory'];

	function ScheduleCalendarTaskController($scope, $uibModalInstance, moment, data, ListService, TaskFactory) {
    var ctrl = this,
				refresh = false,
				timeDiff = Math.abs(new Date(data.date).getTime() - new Date().getTime());

		ctrl.cancel = cancel;
    ctrl.date = new Date(data.date);
		ctrl.day = ctrl.date.getDay() > 0 ? ctrl.date.getDay() - 1 : 6;
		ctrl.days = data.days;
		ctrl.daysFromToday = Math.ceil(timeDiff / (1000 * 3600 * 24));
    ctrl.events = [];
		ctrl.init = init;
		ctrl.insertChecklistItem = insertChecklistItem;
		ctrl.removeTask = removeTask;
		ctrl.tickOff = tickOff;
		ctrl.tickOffChecklist = tickOffChecklist;
		ctrl.today = new Date();
		ctrl.updateTask = updateTask;
		console.log('data: ', data, 'days: ', ctrl.days, ctrl.day, ctrl.date);

		function init() {
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
		}
		ctrl.init();

		function removeTask(task) {
			TaskFactory.removeTask(task, ctrl.events, true);
		}
		//Update task.
		function updateTask(task) {
				TaskFactory.updateTask(task);
		}
    //Add new checklist item.
    function insertChecklistItem(task, newChecklistItem) {
        TaskFactory.insertChecklistItem(task, newChecklistItem);
    }
		//Tick off a task.
		function tickOff(task) {
		    TaskFactory.tickOff(task).then(function(result) {
					// console.log('update task res - tickOff: ', result);
					refresh = result.refresh;
				});
		}
    //Tick of a checklist item.
    function tickOffChecklist(task, index) {
        TaskFactory.tickOffChecklist(task, index).then(function(result) {
					// console.log('update task res - tickOffChecklist: ', result);
					refresh = result.refresh;
				});
    }

    function cancel() {
      $uibModalInstance.close(refresh);
    }
	}
})();

(function() {
'use strict';

	// Tasks controller
	angular.module('tasks').controller('TasksController', TasksController);
	TasksController.$inject =  ['$scope', '$timeout', '$stateParams', '$location', 'Authentication', 'Tasks', 'ListService', 'NotificationFactory', 'TaskFactory', 'spinnerService', '$uibModal', 'moment'];

	function TasksController($scope, $timeout, $stateParams, $location, Authentication, Tasks, ListService, NotificationFactory, TaskFactory, spinnerService, $uibModal, moment) {
		var ctrl = this,
				today = new Date(),
				day = today.getDay();
		ctrl.authentication = Authentication;
		ctrl.commonArrays = ListService.getCommonArrays();
		ctrl.createTask = createTask;
		ctrl.dateOptions = {
			dateDisabled: false,
			formatYear: 'yy',
			maxDate: new Date(2020, 5, 22),
			minDate: new Date(),
			startingDay: 1
		};
		ctrl.filterConfig = {
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
		ctrl.insertChecklistItem = insertChecklistItem;
    ctrl.pageConfig = {
        currentPage: 0,
        pageSize: 10
    };
		ctrl.refreshItems = refreshItems;
		ctrl.removeTask = removeTask;
		ctrl.setTabFilterDay = setTabFilterDay;
		ctrl.tabFilter = tabFilter;
		ctrl.tickOff = tickOff;
		ctrl.tickOffChecklist = tickOffChecklist;
		ctrl.updateTask = updateTask;
		ctrl.weekBeginning = weekBeginning;
		ctrl.whichController = 'task';

    function tabFilter(tabName) {
        ctrl.filterConfig.search.day = tabName;
    }

    function weekBeginning() {
        return TaskFactory.getWeekBeginning();
    }

		function createTask() {
			var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: '/modules/tasks/views/create-task.client.view.html',
        controller: 'CreateTaskController as taskCreate',
        size: 'lg',
				resolve: {
					data: function () {
						return { commonArrays: ctrl.commonArrays };
					}
				}
      }).result.then(function(result) {
        console.log('closed create task: ', result);
				find();
      });
		}

		// Remove existing Task
		function removeTask(task) {
			TaskFactory.removeTask(task, ctrl.tasks, true);
		}
		//Update task.
		function updateTask(task) {
				TaskFactory.updateTask(task);
		}
    //Add new checklist item.
    function insertChecklistItem(task, newChecklistItem) {
        TaskFactory.insertChecklistItem(task, newChecklistItem);
    }
		//Tick off a task.
		function tickOff(task) {
		    TaskFactory.tickOff(task).then(function(result) {
					// console.log('update task res - tickOff: ', result);
					if(result.refresh) find();
				});
		}
    //Tick of a checklist item.
		function tickOffChecklist(task, index) {
        TaskFactory.tickOffChecklist(task, index).then(function(result) {
					// console.log('update task res - tickOffChecklist: ', result);
					if(result.refresh) find();
				});
    }

    //Defaults the tab filter to the current day of the week.
    function setTabFilterDay(day) {
        var index = day === 0 ? 7 : day; //Adjust for Sunday.
        ctrl.filterConfig.search.day = ctrl.commonArrays.days[index].name;
        console.log(day, ctrl.filterConfig.search.day);
    }
    ctrl.setTabFilterDay(day);

    //check things
    function checkStatus() {
        if (day === 1) {
            console.log('monday', day);
            angular.forEach(ctrl.tasks, function (task) {
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
                            TaskFactory.updateTask(task);
                        } else if (task.completeTimes === task.repeat) {
                            console.log('complete - delete', task.description);
                            TaskFactory.removeTask(task, ctrl.tasks);
                        }
                    } else if (task.link.type === 'anime') {
                        console.log('linked');
                            var parts = { single: 'episodes', all: 'finalEpisode' };
                        if (task.link[type][parts.single] !== task.link[type][parts.all]) {
                            console.log('linked not complete', task.description);
                            task.complete = false;
                            task.updateCheck = true;
                            TaskFactory.updateTask(task);
                        } else if (task.link[type][parts.single] === task.link[type][parts.all]) {
                            console.log('linked complete - delete', task.description);
                            TaskFactory.removeTask(task, ctrl.tasks);
                        }
                    }
                }
            });
        } else {
            console.log('not monday', day);
            angular.forEach(ctrl.tasks, function (task) {
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
                            TaskFactory.updateTask(task);
                        }
                    } else if (task.completeTimes === task.repeat) {
                        console.log('complete - delete', task.description);
                        TaskFactory.removeTask(task, ctrl.tasks);
                    }
                } else if ((task.daily === false) && change) {
                    console.log('weekly update: ', task.description);
                    TaskFactory.updateTask(task);
                }
            });
        }
        find();
    }

		// Find a list of Tasks
		function find(check) {
			$timeout(function () {
		    spinnerService.loading('tasks', Tasks.query().$promise.then(function(result) {
					console.log('found! : ', result);
		        ctrl.tasks = result;
		        if (check === true) checkStatus();
		    }));
			}, 250);
		}
		find(true);

		function refreshItems() {
			find();
      NotificationFactory.warning('Refreshed!', 'Task list refreshed!');
		}

	}

})();

(function() {
	'use strict';

	angular.module('tasks').controller('UpdateAnimeTaskController', UpdateAnimeTaskController);
	UpdateAnimeTaskController.$inject = ['$scope', '$uibModalInstance', 'data', 'FunctionService'];

	function UpdateAnimeTaskController($scope, $uibModalInstance, data, FunctionService) {
    var ctrl = this;
		ctrl.cancel = cancel;
		ctrl.episodeCompleted = data.item.link.anime.episodes + 1;
    ctrl.episodeNumber = FunctionService.pad(ctrl.episodeCompleted, 3);
    ctrl.episodeRating = 0;
    ctrl.item = data.item;
    ctrl.isComplete = ctrl.episodeCompleted === ctrl.item.link.anime.finalEpisode && ctrl.item.link.anime.finalEpisode !== 0;
    ctrl.ratingLimit = 10;
    ctrl.stepConfig = {
        currentStep: 1,
        stepCount: 1
    };
		ctrl.submit = submit;

    function submit() {
      $uibModalInstance.close({ task: ctrl.item, episodeRating: ctrl.episodeRating });
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }
	}

})();

(function() {
	'use strict';

	angular.module('tasks').controller('UpdateMangaTaskController', UpdateMangaTaskController);
	UpdateMangaTaskController.$inject = ['$scope', '$uibModalInstance', 'data'];

	function UpdateMangaTaskController($scope, $uibModalInstance, data) {
    var ctrl = this;
		ctrl.cancel = cancel;
    ctrl.item = data.item;
    ctrl.stepConfig = {
        currentStep: 1,
        stepCount: 1
    };
		ctrl.submit = submit;
    console.log('update linked manga item: ', ctrl.item);

    function submit() {
      $uibModalInstance.close(ctrl.item);
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }
	}

})();

(function() {
  'use strict';
  loseInterest.$inject = ["$document", "$window"];
  angular.module('tasks')
  .directive('loseInterest', loseInterest);

   function loseInterest($document, $window) {
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
  }

})();

(function() {
  'use strict';
  angular.module('tasks')
  .directive('scheduleCalendar', scheduleCalendar);
  scheduleCalendar.$inject = ['$uibModal', 'moment', 'ListService'];

   function scheduleCalendar($uibModal, moment, ListService) {

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
       }).result.then(function(result) {
         console.log('closed - require refresh: ', result);
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
  }

})();

(function() {
  'use strict';
  angular.module('tasks')
  .directive('shadowModel', shadowModel);

   function shadowModel() {
    return {
      scope: true,
      link: function(scope, el, att) {
        console.log('shadow: ', scope);
        scope[att.shadow] = angular.copy(scope[att.shadow]);
      }
    };
  }

})();

(function() {
  'use strict';
  angular.module('tasks')
  .directive('taskItemModel', taskItemModel);

  function taskItemModel() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'modules/tasks/templates/task-item.html'
    };
  }

})();

(function() {
  'use strict';
  angular.module('tasks')
  .directive('passClick', passClick);

  function passClick() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('click', function(event) {
          var passTo = document.getElementById(attrs.passClick);
          passTo.focus();
          passTo.click();
        });
      }
    };
  }

})();

(function() {
  'use strict';
  angular.module('tasks').factory('TaskFactory', TaskFactory);
  TaskFactory.$inject = ['$q', 'Animeitems', 'Mangaitems', 'AnimeFactory', 'MangaFactory', 'NotificationFactory', 'ListService', '$uibModal'];

    function TaskFactory($q, Animeitems, Mangaitems, AnimeFactory, MangaFactory, NotificationFactory, ListService, $uibModal) {
      var obj = {
        getWeekBeginning: getWeekBeginning,
        insertChecklistItem: insertChecklistItem,
        removeTask: removeTask,
        updateAnimeitem: updateAnimeitem,
        updateMangaitem: updateMangaitem,
        updateTask: updateTask,
        tickOff: tickOff,
        tickOffChecklist: tickOffChecklist,
      };
      return obj;

          function getWeekBeginning() {
              var newDate = new Date(),
                  day = newDate.getDay(),
                  diff = newDate.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
              var wkBeg = new Date();
              return new Date(wkBeg.setDate(diff));
          }

          function updateAnimeitem(task, episodeRating) {
            return $q(function(resolve, reject) {
              var query = Animeitems.get({
  							animeitemId: task.link.anime._id
  						});
              query.$promise.then(function(data) {
                  console.log('update animeitem for ', task, data);
                  data.episodes += 1;
                  data.rating = task.link.anime.rating || data.rating;
                  data.latest = new Date();
                  AnimeFactory.update(data, undefined, true, undefined, episodeRating);
                  resolve(data);
              });
            });
          }

          function updateMangaitem(task, chapters, volumes) {
  					return $q(function(resolve, reject) {
              var query = Mangaitems.get({
  							mangaitemId: task.link.manga._id
  						});
              query.$promise.then(function(data) {
                  //console.log(data);
                  data.chapters = chapters;
                  data.volumes = volumes;
                  data.latest = new Date();
                  MangaFactory.update(data, undefined, true, undefined);
  								resolve(data);
              });
  					});
          }

  				/** Task Update,Edit,Delete and other functions below here.
  				 */

  			 // Update existing Task
  			 function updateTask(task, refresh) {
  				 return $q(function(resolve, reject) {
  					 //console.log('update');
  					 if (task.link.anime) {
  						 task.link.anime = task.link.anime._id;
  					 } else if (task.link.manga) {
  						 task.link.manga = task.link.manga._id;
  					 }

  						task.$update(function() {
  							NotificationFactory.success('Saved!', 'Task was successfully updated!');
  						  //Refresh items if the callee wasn't checkStatus.
  						  console.log('update, refresh items ? ', refresh);
  						  resolve({ refresh: refresh });
  						}, function(errorResponse) {
  							var errorMessage = errorResponse.data.message;
  							reject(errorMessage);
  						  //console.log(errorResponse);
  						  NotificationFactory.error('Error!', 'Task failed to save!');
  						});
  					});
  			 }

  			 //Remove a task.
  				function removeTask(task, tasks, userCheck) {
  					if(userCheck) {
  						//console.log('launch');
  						NotificationFactory.confirmation(function remove() {
  		          removeTaskProcess(task, tasks);
  						});
  					} else {
  						removeTaskProcess(task, tasks);
  					}
  				}

  				function removeTaskProcess(task, tasks) {
  					if ( task ) {
  							task.$remove();
  							for (var i in tasks) {
  									if (tasks[i] === task) {
  											tasks.splice(i, 1);
  									}
  							}
  							NotificationFactory.warning('Deleted!', 'Task was successfully deleted.');
  					}
  				}

  				//Linked manga need special options dialog.
  				function launchMangaUpdateDialog(task, checklistIndex) {
  					var modalInstance = $uibModal.open({
  						animation: true,
  		      	templateUrl: '/modules/tasks/views/update-manga-task.client.view.html',
  		      	controller: 'UpdateMangaTaskController as ctrl',
  		      	size: 'md',
  		      	resolve: {
  		        	data: function () {
  		          	return { item: angular.copy(task), itemOriginal: task };
  							}
  						}
  					});
  					return modalInstance;
  				}

          //Linked anime need special options dialog.
  				function launchAnimeUpdateDialog(task, checklistIndex) {
  					var modalInstance = $uibModal.open({
  						animation: true,
  		      	templateUrl: '/modules/tasks/views/update-anime-task.client.view.html',
  		      	controller: 'UpdateAnimeTaskController as ctrl',
  		      	size: 'md',
  		      	resolve: {
  		        	data: function () {
  		          	return { item: angular.copy(task), itemOriginal: task };
  							}
  						}
  					});
  					return modalInstance;
  				}

  				//Completes a task.
  				function tickOff(task) {
  					return $q(function(resolve, reject) {
  						var isLinked = task.link.linked;
  				    //Is it linked?
  				    if (!isLinked) {
  				        task.completeTimes += 1;
  				    } else if (isLinked) {
  				        /** Anime or manga?
  				         *   Update the item value AND the complete/repeat values.
  				         */
  				        if (task.link.type === 'anime') {
                    task.complete = false;
                      var animeDialog = launchAnimeUpdateDialog(task);
                      animeDialog.result.then(function(result) {
                        console.log('update anime task result: ', result);
                        task = result.task;
                        task.completeTimes = task.link.anime.episodes + 1;
                        task.complete = true;
                        task.repeat = task.link.anime.finalEpisode;
                        obj.updateAnimeitem(task, result.episodeRating).then(function(result) {
                          return obj.updateTask(task, true);
                        }).then(function(result) {
                          console.log('update anime into update task: ', result);
                          resolve(result);
                        });
                      });
  				        } else if (task.link.type === 'manga') {
  									  task.complete = false;
  				            var dialog = launchMangaUpdateDialog(task);
  										dialog.result.then(function(result) {
  											task = result;
  											task.completeTimes += 1;
  											task.complete = true;
  											obj.updateMangaitem(task, task.link.manga.chapters, task.link.manga.volumes).then(function(result) {
  												console.log('updated manga: ', result);
  												return obj.updateTask(task, true);
  											}).then(function(result) {
  												console.log('update manga into update task: ', result);
  												resolve(result);
  											});
  										});
  				        }
  				    }
  						if(!isLinked) {
  					    obj.updateTask(task, isLinked).then(function(result) {
  								console.log('update task resolve: ', result);
  								resolve(result);
  							});
  						}
  					});
  				}

  				//Completes a checklist item.
  				function tickOffChecklist(task, index) {
  					return $q(function(resolve, reject) {
  						//update the option for the task.
  						var isLinked = task.link.linked;
  						if (isLinked && task.link.type === 'manga') {
  								task.checklistItems[index].complete = false;
  								var dialog = launchMangaUpdateDialog(task, index);
  								dialog.result.then(function(result) {
  									task = result;
  									task.checklistItems[index].complete = true;
  									if(ListService.findWithAttr(task.checklistItems, 'complete', false) === -1) {
  										task.completeTimes += 1;
  			              task.complete = true;
  									}
  									obj.updateMangaitem(task, task.link.manga.chapters, task.link.manga.volumes).then(function(result) {
  										console.log('updated manga: ', result);
  										return obj.updateTask(task, true);
  									}).then(function(result) {
  										console.log('update manga into update task: ', result);
  										resolve(result);
  									});
  								});
  						} else if(!isLinked) {
  							if(ListService.findWithAttr(task.checklistItems, 'complete', false) === -1) {
  								task.completeTimes += 1;
  								task.complete = true;
  							}
  							//console.log('tickoff checklist: ', task);
  					    obj.updateTask(task, isLinked).then(function(result) {
  								console.log('update task resolve: ', result);
  								resolve(result);
  							});
  						}
  					});
  				}

  				//Add additional items to a checklist.
  				function insertChecklistItem(task, newChecklistItem) {
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
  					obj.updateTask(task);
  				}

  }

})();

(function() {
	'use strict';
	//Tasks service used to communicate Tasks REST endpoints
	angular.module('tasks').factory('Tasks', Tasks);
	Tasks.$inject = ['$resource'];

		function Tasks($resource) {
			return $resource('tasks/:taskId', { taskId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});
		}

})();

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
(function() {
	'use strict';
	angular.module('toptens').controller('CreateToptenController', CreateToptenController);
	CreateToptenController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', 'Toptens', 'ListService', 'Animeitems', 'Mangaitems', 'Characters', 'NotificationFactory', 'CharacterService', 'ItemService', '$filter'];

	function CreateToptenController($scope, $stateParams, $location, Authentication, Toptens, ListService, Animeitems, Mangaitems, Characters, NotificationFactory, CharacterService, ItemService, $filter) {
		var ctrl = this,
				toptenCopy = {
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

		ctrl.authentication = Authentication;
		ctrl.cancel = cancel;
		ctrl.create = create;
		ctrl.commonArrays = ListService.getCommonArrays();
		ctrl.imgSize = {
				height: '50px',
				width: '100px'
		};
		ctrl.isCreate = true;
		ctrl.pushCondition = pushCondition;
		ctrl.pushItem = pushItem;
		ctrl.removeCondition = removeCondition;
		ctrl.removeItem = removeItem;
    ctrl.stepConfig = {
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
		ctrl.swappingItems = swappingItems;
		ctrl.takeStep = takeStep;
    ctrl.topten = {};
    angular.copy(toptenCopy, ctrl.topten);
		ctrl.update = update;
		ctrl.years = [];
		// Create new Topten
		function create() {
            // console.log(ctrl.topten, ctrl.topten);
			// Create new Topten object
			var topten = new Toptens();
			topten = new Toptens ({
				name: ctrl.topten.name,
                description: ctrl.topten.description,
                type: ctrl.topten.type,
                isFavourite: ctrl.topten.isFavourite,
                isRanked: ctrl.topten.isRanked,
                animeList: ctrl.topten.animeList.length > 0 ? ctrl.topten.animeList : null,
                characterList: ctrl.topten.characterList.length > 0 ? ctrl.topten.characterList : null,
                mangaList: ctrl.topten.mangaList.length > 0 ? ctrl.topten.mangaList : null,
                conditions: {
                    limit: ctrl.topten.conditions.limit,
                    series: ctrl.topten.conditions.series,
                    tags: ctrl.topten.conditions.tags,
										season: ctrl.topten.conditions.season,
										year: ctrl.topten.conditions.year,
                }
			});

			// Redirect after save
			topten.$save(function(response) {
				$location.path('toptens/' + response._id);
				NotificationFactory.success('Saved!', 'New List was successfully saved!');
				// Clear form fields
				angular.copy(toptenCopy, ctrl.topten);
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
				NotificationFactory.error('Error!', 'Something went wrong!');
			});
		}

		// Update existing Topten
		function update() {
			var topten = ctrl.topten;

			topten.$update(function() {
				$location.path('toptens/' + topten._id);
                NotificationFactory.success('Updated!', 'List update was successful!');
			}, function(errorResponse) {
				ctrl.error = errorResponse.data.message;
                NotificationFactory.error('Error!', 'Something went wrong!');
			});
		}

    function typeSetItemPopulate() {
        var type = ListService.manipulateString(ctrl.topten.type, 'upper', true);
        switch(type) {
            case 'Anime':
                Animeitems.query().$promise.then(function(result) {
                    ctrl.stepConfig.listGen.items = result;
                    ctrl.stepConfig.listGen.typeDisplay = 'title';
                    ctrl.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
										ctrl.years = ItemService.endingYears(result);
                });
                break;
            case 'Manga':
                Mangaitems.query().$promise.then(function(result) {
                    ctrl.stepConfig.listGen.items = result;
                    ctrl.stepConfig.listGen.typeDisplay = 'title';
                    ctrl.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                });
                break;
            case 'Character':
                Characters.query().$promise.then(function(result) {
                    ctrl.stepConfig.listGen.items = result;
                    ctrl.stepConfig.listGen.typeDisplay = 'name';
                    ctrl.stepConfig.listGen.tags = CharacterService.buildCharacterTags(result);
                    ctrl.stepConfig.listGen.series = CharacterService.buildSeriesList(result);
										var getYears = [];
										angular.forEach(result, function (item) {
											if(item.anime) {
												getYears.push(item.anime);
											}
										});
										ctrl.years = ItemService.endingYears(getYears);
                });
                break;
        }
        // console.log('type set: ', ctrl.stepConfig.listGen);
			}

    //Processing on step submits.
    function process(number, direction, callback) {
        // console.log(number, direction);
        switch(number) {
            case 1:
                if (ctrl.topten.type !== '' && ctrl.isCreate) {
                    typeSetItemPopulate();
                    callback();
                } else if (ctrl.topten.type !== '' && !ctrl.isCreate) {
                    if (ctrl.stepConfig.listGen.displayList.length < 1) {
                        angular.forEach(ctrl.topten[ctrl.topten.type + 'List'], function(item) {
                            var index = ListService.findWithAttr(ctrl.stepConfig.listGen.items, '_id', item._id);
                            ctrl.stepConfig.listGen.displayList.push(ctrl.stepConfig.listGen.items[index]);
                        });
                        ctrl.stepConfig.limitMin = ctrl.stepConfig.listGen.displayList.length;
                    }
                    callback();
                } else if (ctrl.topten.type === '') {
                    NotificationFactory.popup('Invalid form', 'You MUST select a type to continue.', 'error');
                }
                break;

            case 2:
								if(direction) {
									var i = 0, j = 0, length;
                  angular.copy(ctrl.stepConfig.listGen.items, ctrl.stepConfig.listGen.itemsCached);
                  // console.log('pre conditions: ', ctrl.stepConfig.listGen.items.length, ctrl.stepConfig.listGen.itemsCached.length);

									if(ctrl.topten.type === 'anime') {
										if(ctrl.topten.conditions.season) {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('season')(ctrl.stepConfig.listGen.items, ctrl.topten.conditions.year, ctrl.topten.conditions.season);
											} else {
												NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
												break;
											}
										} else {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('filter')(ctrl.stepConfig.listGen.items, { season: { year: ctrl.topten.conditions.year } });
											}
										}
									} else if(ctrl.topten.type === 'character') {
										if(ctrl.topten.conditions.season) {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('seasonForCharacterAnime')(ctrl.stepConfig.listGen.items, ctrl.topten.conditions.year, ctrl.topten.conditions.season);
											} else {
												NotificationFactory.popup('Invalid form', 'A year MUST be selected when selecting a season.', 'error');
												break;
											}
										} else {
											if(ctrl.topten.conditions.year) {
												ctrl.stepConfig.listGen.items = $filter('filter')(ctrl.stepConfig.listGen.items, { anime: { season: { year: ctrl.topten.conditions.year } } });
											}
										}
									}

                  if(ctrl.topten.conditions.series.length > 0) {
                      i = ctrl.stepConfig.listGen.items.length;
                      while(i--) {
                          var remove = true,
															attr = (ctrl.stepConfig.listGen.items[i].anime !== null) ? 'anime' :
																		 (ctrl.stepConfig.listGen.items[i].anime !== null) ? 'manga' :
																		 																											 null;
													length = ctrl.topten.conditions.series.length;
												//  console.log('tag while: ', i, length, attr);
                          if(attr !== null) {
														// console.log('tag item: ', ctrl.stepConfig.listGen.items[i]);
														for(j = 0; j < length; j++) {
															var series = ctrl.topten.conditions.series[j];
															// console.log(ctrl.stepConfig.listGen.items[i][attr].title, series.name, ctrl.stepConfig.listGen.items[i][attr].title.indexOf(series.name));
                              if(ctrl.stepConfig.listGen.items[i][attr].title.indexOf(series.name) > -1) {
                                  remove = false;
                              }
														}
                            if(remove) {
															// console.log('remove as remove: ' + remove);
                                ctrl.stepConfig.listGen.items.splice(i, 1);
                            }
                          } else {
														// console.log('straight remove');
														ctrl.stepConfig.listGen.items.splice(i, 1);
                          }
                      }
                  }

                  if(ctrl.topten.conditions.tags.length > 0) {
                      i = ctrl.stepConfig.listGen.items.length;
                      while(i--) {
                          var count = 0;
													length = ctrl.topten.conditions.tags.length;
															// console.log('tag while: ', i, length);
													if(ctrl.stepConfig.listGen.items[i].tags.length > 0) {
														// console.log('tag item: ', ctrl.stepConfig.listGen.items[i].tags);
														for(j = 0; j < length; j++) {
															var tag = ctrl.topten.conditions.tags[j];
															// console.log('tag round: ' + i + '-' + j, ctrl.stepConfig.listGen.items[i].tags, tag.tag, ListService.findWithAttr(ctrl.stepConfig.listGen.items[i].tags, 'text', tag.tag));
	                                if(ListService.findWithAttr(ctrl.stepConfig.listGen.items[i].tags, 'text', tag.tag) > -1) {
	                                    count++;
	                                }
														}
                            if(count !== length) {
															// console.log('remove as count: ' + count + ' > length: ' + length);
															ctrl.stepConfig.listGen.items.splice(i, 1);
                            }
													} else {
														// console.log('straight remove');
														ctrl.stepConfig.listGen.items.splice(i, 1);
													}
                      }
                  }
									// console.log('post conditions: ', ctrl.stepConfig.listGen.items.length, ctrl.stepConfig.listGen.itemsCached.length);
								}
                callback();
                break;

            case 3:
                if(!direction) {
                    ctrl.stepConfig.listGen.items = angular.copy(ctrl.stepConfig.listGen.itemsCached);
                }
                callback();
                break;
        }
    }

    function pushItem(item) {
        if(ctrl.topten.conditions.limit === null || ctrl.topten.conditions.limit === 0 || ctrl.topten.conditions.limit > ctrl.stepConfig.listGen.displayList.length) {
            var index = ctrl.topten[ctrl.topten.type+'List'].indexOf(item._id);
            if (!ctrl.isCreate && index === -1) {
                index = ListService.findWithAttr(ctrl.topten[ctrl.topten.type+'List'], '_id', item._id);
            }
            if (index === -1) {
                ctrl.topten[ctrl.topten.type + 'List'].push(item._id);
                ctrl.stepConfig.listGen.displayList.push(item);
            } else {
                NotificationFactory.warning('Duplicate!', 'Item has already been added to list.');
            }
        } else {
            NotificationFactory.error('Full!', 'Item list has reached the defined capacity.');
        }
        ctrl.stepConfig.listGen.toptenItem = '';
    }

    function removeItem(item) {
        //For display array.
        var index = ctrl.stepConfig.listGen.displayList.indexOf(item);
        ctrl.stepConfig.listGen.displayList.splice(index, 1);

        //For topten list.
        index = ctrl.topten[ctrl.topten.type + 'List'].indexOf(item._id);
        if (!ctrl.isCreate && index === -1) {
            index = ListService.findWithAttr(ctrl.topten[ctrl.topten.type+'List'], '_id', item._id);
        }
        ctrl.topten[ctrl.topten.type + 'List'].splice(index, 1);
        NotificationFactory.warning('Removed!', 'Item has been removed from list.');
    }

    function pushCondition(type, item) {
        var index, indexTwo;
        switch(type) {
            case 'series':
                index = ListService.findWithAttr(ctrl.topten.conditions.series, 'name', item.name);
                if(index === -1) {
                    ctrl.topten.conditions.series.push(item);
                } else {
                    NotificationFactory.warning('Duplicate!', 'Series has already been added to list.');
                }
                ctrl.stepConfig.listGen.seriesLimit = '';
                break;

            case 'tag':
                index = ListService.findWithAttr(ctrl.topten.conditions.tags, 'tag', item.tag);
                if(index === -1) {
                    ctrl.topten.conditions.tags.push(item);
                } else {
                    NotificationFactory.warning('Duplicate!', 'Tag has already been added to list.');
                }
                ctrl.stepConfig.listGen.tagLimit = '';
                break;
        }
    }

    function removeCondition(type, item) {
        var index, indexTwo;
        switch(type) {
            case 'series':
                index = ListService.findWithAttr(ctrl.topten.conditions.series, 'name', item.name);
								ctrl.topten.conditions.series.splice(index, 1);
                NotificationFactory.warning('Removed!', 'Series has been removed from list.');
                break;

            case 'tag':
                index = ctrl.topten.conditions.tags.indexOf(item);
                ctrl.topten.conditions.tags.splice(index, 1);
                NotificationFactory.warning('Removed!', 'Tag has been removed from list.');
                break;
        }
    }

    //Step related functions:
    function takeStep(number, direction) {
        process(number, direction, function() {
            ctrl.stepConfig.currentStep = (direction) ? number + 1 : number - 1;
        });
        // console.log('step: ', ctrl.stepConfig, ctrl.topten);
    }
    function cancel() {
        $location.path('toptens');
    }

    function inital() {
        // console.log('state params: ', $stateParams);
        if ($stateParams.toptenId !== undefined) {
            ctrl.isCreate = false;
            Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
                ctrl.topten = result;
								// console.log('topten: ', result);
                typeSetItemPopulate();
            });
        }
    }
    inital();

		function swappingItems(index) {
			// console.log('item selected: ', index);
			if(ctrl.stepConfig.swapping.one === '') {
				ctrl.stepConfig.swapping.one = index;
			} else if(ctrl.stepConfig.swapping.one === index) {
				ctrl.stepConfig.swapping.one = '';
			} else {
				ctrl.stepConfig.swapping.two = index;
				//Re-order display list.
				var temp = ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.one];
				ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.one] = ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.two];
				ctrl.stepConfig.listGen.displayList[ctrl.stepConfig.swapping.two] = temp;
				//Re-order topten item list.
				temp = ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.one];
				ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.one] = ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.two];
				ctrl.topten[ctrl.topten.type + 'List'][ctrl.stepConfig.swapping.two] = temp;
				//Clear.
				ctrl.stepConfig.swapping.one = '';
				ctrl.stepConfig.swapping.two = '';
			}
		}

	}
})();

(function() {
  'use strict';
  angular.module('toptens').controller('StatisticsTopten', StatisticsTopten);
  StatisticsTopten.$inject = ['$scope','$uibModalInstance','list', 'CharacterService'];

   function StatisticsTopten($scope, $uibModalInstance, list, CharacterService) {
     var ctrl = this;

     ctrl.cancel = cancel;
     ctrl.list = list;
     ctrl.toptenInfo = {
       tags: [],
       series: []
     };

     function process() {
       var listType = ctrl.list.type + 'List';
       ctrl.toptenInfo.tags = CharacterService.buildCharacterTags(ctrl.list[listType]);
       if(ctrl.list.type === 'character') {
         ctrl.toptenInfo.series = CharacterService.buildSeriesList(ctrl.list[listType]);
       }
     }
     process();

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();

(function() {
	'use strict';
	angular.module('toptens').controller('ToptensController', ToptensController);
	ToptensController.$inject = ['$scope', '$stateParams', '$location', 'Authentication', '$uibModal', 'Toptens', 'NotificationFactory', 'ListService', 'spinnerService'];

	function ToptensController($scope, $stateParams, $location, Authentication, $uibModal, Toptens, NotificationFactory, ListService, spinnerService) {
		var ctrl = this;
		ctrl.authentication = Authentication;
		ctrl.filterConfig = {
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
				selectListOptions: {},
				commonArrays: ListService.getCommonArrays()
		};
		ctrl.find = find;
		ctrl.findOne = findOne;
		ctrl.openListStats = openListStats;
		ctrl.pageConfig = {
				currentPage: 0,
				pageSize: 10
		};
		ctrl.remove = remove;
		ctrl.viewConfig = {
        displayType: '',
        linkSuffix: '',
				tags: [],
				series: []
    };
    ctrl.whichController = 'topten';

		// Remove existing Topten
		function remove(topten) {
	    NotificationFactory.confirmation(function() {
	        if ( topten ) {
	            topten.$remove();
	            for (var i in ctrl.toptens) {
	                if (ctrl.toptens [i] === topten) {
	                    ctrl.toptens.splice(i, 1);
	                }
	            }
	        } else {
	            ctrl.topten.$remove(function() {
	                $location.path('toptens');
	            });
	        }
	        NotificationFactory.warning('Deleted!', 'Anime was successfully deleted.');
	    });
		}

		// Find a list of Toptens
		function find() {
			ctrl.filterConfig.selectListOptions = ListService.getSelectListOptions(ctrl.whichController);
	    spinnerService.loading('topten', Toptens.query().$promise.then(function(result) {
	        ctrl.toptens = result;
	    }));
			console.log(ctrl.toptens);
		}

		// Find existing Topten
		function findOne() {
	    Toptens.get({ toptenId: $stateParams.toptenId }).$promise.then(function(result) {
	        ctrl.topten = result;
	        ctrl.viewConfig.displayType = (ctrl.topten.type === 'character') ? 'name' : 'title';
	        ctrl.viewConfig.linkSuffix = (ctrl.topten.type === 'character') ? 's' : 'items';
	    });
		}

		function openListStats() {
			var modalInstance = $uibModal.open({
				animation: true,
      	templateUrl: '/modules/toptens/views/statistics-topten.client.view.html',
      	controller: 'StatisticsTopten as ctrl',
      	size: 'lg',
      	resolve: {
        	list: function () {
          	return ctrl.topten;
					}
				}
			});
		}

	}
})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('horizontalListItem', horizontalListItem);

   function horizontalListItem() {
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
  }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('horizontalList', horizontalList);

   function horizontalList() {
      return {
          restrict: 'A',
          transclude: true,
          require: 'horizontalList',
          scope: {},
          templateUrl: '/modules/toptens/templates/horizontal-list.html',
          bindToController: true,
          controllerAs: 'horizontalList',
          controller: ["$scope", function($scope) {
              var self = this;
              self.clicks = 0;
              self.items = [];
              self.moveItems = moveItems;
              self.register = register;
              self.shift = 0;

              function register(item) {
                  self.items.push(item);
                  if([0, 1, 2].indexOf(item.position) > -1) {
                      item.isVisible = true;
                  }
              }

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

              function moveItems(direction) {
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
              }

          }],
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
  }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('ngMax', ngMax);

  function ngMax() {
      return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, elem, attr, ctrl) {

              scope.$watch(attr.ngMax, function(){
                  if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
              });

              var isEmpty = function(value) {
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
  }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('ngMin', ngMin);

  function ngMin() {
      return {
          restrict: 'A',
          require: 'ngModel',
          link: function(scope, elem, attr, ctrl) {
              scope.$watch(attr.ngMin, function(){
                  if (ctrl.$isDirty) ctrl.$setViewValue(ctrl.$viewValue);
              });

              var isEmpty = function(value) {
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
  }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('oneStep', oneStep);

  function oneStep() {
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
  }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('stepControls', stepControls);
    function stepControls() {
       return {
           restrict: 'A',
           replace: true,
           transclude: true,
           template: '<div class="step-controls step-button-group padding-5" ng-transclude>' +
                      '</div>'
       };
    }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('steps', steps);
  function steps() {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            stepConfig: '='
        },
        template: '<div class="steps" ng-transclude>' +
                  '</div>',
        bindToController: true,
        controllerAs: 'steps',
        controller: ["$scope", function($scope) {
            var self = this;

            self.register = register;
            self.steps = [];

            function register(step) {
                self.steps.push(step);
                if(step.stepNumber === 1) {
                    step.active = true;
                }
            }
        }],
        link: function(scope, element, attrs, stepsController) {
          scope.$watch('steps.stepConfig.currentStep', function(newValue) {
              if (newValue !== undefined) {
                console.log('steps: ', newValue);
                  angular.forEach(stepsController.steps, function(step) {
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
  }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .directive('sticky', sticky);

  function sticky() {
      return {
          restrict: 'A',
          scope: {},
          link: function(scope, element, attrs) {

              window.addEventListener('scroll', function (evt) {
                  var stickyClass = 'sticky-scroll-top',
                      stickyInnerClass = 'sticky-inner-container',
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
  }

})();

(function() {
  'use strict';
  angular.module('toptens')
  .filter('toptenFilter', toptenFilter);

  function toptenFilter() {
    return function(array, displayType, value) {
        if(array !== undefined) {
            return array.filter(function(item) {
                if(item[displayType].toLowerCase().indexOf(value.toLowerCase()) > -1) {
                    return item;
                }
            });
        }
    };
  }
})();

(function() {
	'use strict';
	//Toptens service used to communicate Toptens REST endpoints
	angular.module('toptens').factory('Toptens', ToptensFactory);
	ToptensFactory.$inject = ['$resource'];

		function ToptensFactory($resource) {
			return $resource('toptens/:toptenId', { toptenId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});
		}
		
})();

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
(function() {
	'use strict';
	angular.module('users').controller('AuthenticationController', AuthenticationController);
	AuthenticationController.$inject = ['$scope', '$http', '$location', 'Authentication'];

	function AuthenticationController($scope, $http, $location, Authentication) {
		var ctrl = this;

		ctrl.authentication = Authentication;
		ctrl.signin = signin;
		ctrl.signup = signup;

		function signup() {
			$http.post('/auth/signup', ctrl.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				ctrl.authentication.user = response;

				// And redirect to the index page
				$location.path('/signin');
			}).error(function(response) {
				ctrl.error = response.message;
			});
		}

		function signin() {
			ctrl.credentials.username = 'username';
			$http.post('/auth/signin', ctrl.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				ctrl.authentication.user = response;
				ctrl.loginBody = true;

				// And redirect to the index page
				$location.path('/tasks');
			}).error(function(response) {
				ctrl.error = response.message;
			});
		}

	}
})();

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
(function() {
	'use strict';
	// Authentication service for user variables
	angular.module('users').factory('Authentication', AuthenticationFactory);

	function AuthenticationFactory() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}

})();

(function() {
	'use strict';
	// Users service used for communicating with the users REST endpoint
	angular.module('users').factory('Users', UsersFactory);
	UsersFactory.$inject = ['$resource'];

	function UsersFactory($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}

})();
