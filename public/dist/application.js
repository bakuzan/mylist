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
angular.module('animeitems').controller('AnimeitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window', 'moment',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, fileUpload, $sce, $window, moment) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.itemUpdate = new Date().toISOString().substring(0,10); //today's date as 'yyyy-MM-dd'
        $scope.view = 'list'; //dynamic page title.
        $scope.isList = true; //list view as default.
        $scope.maxAnimeCount = 0; //number of anime.
        $scope.maxAnimeRatedCount = 0; //number of anime with a rating i.e not 0.
        $scope.averageAnimeRating = 0; //average rating for anime.
        $scope.maxCompleteMonth = 0; //used to find the max number of ends in 1 month.
        $scope.showDetail = false; //show month detail.
        $scope.statTagSortType = 'tag'; //stat tag sort
        $scope.statTagSortReverse = false; //stat tag sort direction.
        $scope.sortType = 'latest'; //default sort type
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.ratingLevel = undefined; //default rating filter
        $scope.maxRating = 10; //maximum rating
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        $scope.statTags = []; //for stat table.
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.
        
        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        $scope.searchTags = '';
        $scope.passTag = function(tag) {
            if ($scope.searchTags.indexOf(tag) === -1) {
                $scope.searchTags += tag + ',';
            }
        };
        $scope.clearTagValues = function() {
            $scope.searchTags = '';
            $scope.tagsForFilter = [];
        };
        $scope.deleteSearchTag = function(tag) {
            $scope.searchTags = $scope.searchTags.replace(tag + ',', '');
            
            var index = $scope.tagsForFilter.indexOf(tag);
            $scope.tagsForFilter.splice(index, 1);
        };
        
        //for adding/removing tags.
        $scope.addTag = function () {
                $scope.tagArray.push({ text: $scope.newTag });
                $scope.newTag = '';
        };
        $scope.deleteTag = function(text) {
        
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var deletingItem = $scope.tagArray;
                $scope.tagArray = [];

                //update the complete task.
                angular.forEach(deletingItem, function(tag) {
                    if (tag.text !== text) {
                        $scope.tagArray.push(tag);
                    }
                });
            }
        };
        //remove existing tag.
        $scope.removeTag = function(tag) {
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var index = $scope.animeitem.tags.indexOf(tag);
                $scope.animeitem.tags.splice(index, 1);
            }
        };
        
        //special tag filter
        $scope.tagFilter = function(item) {
            var found = false;
            var i = 0;
            var tagsToSearch = [];
            
            //if tagless is checked return tagless and nothing else.
            if ($scope.taglessItem===true) {
                if (item.tags.length===0) {
                    return item;
                }
            } else {
                if ($scope.searchTags===undefined || $scope.searchTags==='') {
                    return true;
                } else {
                    //get tags that are being looked for
                    //                var tagsForFilter = $scope.characterTags.split(',');
                    $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
                    //                console.log($scope.tagsForFilter);
                
                    //get tags of items to filter
                    angular.forEach(item.tags, function(tag) {
                        tagsToSearch.push(tag.text);
                    });
                
                    //filter: check in 'query' is in tags.
                    for(i = 0; i < $scope.tagsForFilter.length; i++) {
                        if (tagsToSearch.indexOf($scope.tagsForFilter[i]) !== -1) {
                            found = true;
                        } else {
                            return false;
                        }
                    }
                    return found;
                }
            }
        };
        
        $scope.months = [
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
        ];
        
        //ended stat month filter
        $scope.endedMonth = function(year, month){
            return function(item) {
                if (item.end!==undefined) {
                    if (item.end.substring(0,4)===year) {
                        if (item.end.substr(5,2)===month) {
                            return item;
                        }
                    }
                }
            };
        };
        
        //show month detail.
        $scope.monthDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailYear===year && $scope.detailMonth===month) {
                    $scope.showDetail = !$scope.showDetail;
            } else {
                $scope.detailYear = year;
                $scope.detailMonth = month;
                //get month name also, cause why not.
                angular.forEach($scope.months, function(mmm) {
                    if ($scope.detailMonth===mmm.number) {
                        $scope.detailMonthName = mmm.text;
                    }
                });
                $scope.showDetail = true;
            }
        };
        
        $scope.$watchCollection('animeitems', function() {
            if ($scope.animeitems!==undefined) {
//                console.log($scope.animeitems);
                $scope.maxAnimeCount = $scope.animeitems.length;
                var tempRating = 0;
                angular.forEach($scope.animeitems, function(anime) {
                    if (anime.rating!==0) {
                        tempRating += anime.rating;
                        $scope.maxAnimeRatedCount++;
                    }
                });
                $scope.averageAnimeRating = tempRating / $scope.maxAnimeRatedCount;
                var modeMap = {};
                var maxCount = 0;
                for(var i = 0; i < $scope.animeitems.length; i++) {
    	           if ($scope.animeitems[i].end!==undefined) {
                        var end = $scope.animeitems[i].end.substring(0,7);

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
//                console.log(modeMap);
//                console.log(maxCount);
                $scope.maxCompleteMonth = maxCount;
                
                var add = true;
                //is tag in array?
                angular.forEach($scope.animeitems, function(anime) { 
                    if (anime.tags.length===0) {
                        $scope.areTagless = true;
                    }
                    angular.forEach(anime.tags, function(tag) {
                        for(var i=0; i < $scope.statTags.length; i++) {
                            if ($scope.statTags[i].tag===tag.text) {
                                add = false;
                                    $scope.statTags[i].count += 1; 
                                    $scope.statTags[i].ratingAdded += anime.rating;
                                    $scope.statTags[i].ratingAvg = $scope.statTags[i].ratingAdded / $scope.statTags[i].count;
                            }
                        }
                        // add if not in
                        if (add===true) {
                            $scope.statTags.push({ tag: tag.text, count: 1, ratingAdded: anime.rating, ratingAvg: anime.rating });
                        }
                        add = true; //reset add status.
                    });
//                    console.log($scope.statTags);
                });
            }
        });
        
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        //filter for rating stars
        $scope.ratingFilter = function(item) {
            if (item.rating===$scope.ratingLevel) {
                return item;
            } else if ($scope.ratingLevel===undefined) {
                return item;
            }
        };

		// Create new Animeitem
		$scope.create = function() {
			// Create new Animeitem object
            var animeitem = new Animeitems();
            if (this.manga!==undefined && this.manga!==null) {
                animeitem = new Animeitems ({
				    title: this.title,
                    episodes: this.episodes,
                    start: this.start,
                    latest: this.latest,
                    finalEpisode: this.finalEpisode,
                    disc: this.disc,
                    manga: this.manga._id,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            } else {
                animeitem = new Animeitems ({
				    title: this.title,
                    episodes: this.episodes,
                    start: this.start,
                    latest: this.latest,
                    finalEpisode: this.finalEpisode,
                    disc: this.disc,
                    manga: this.manga,
                    tags: $scope.tagArray,
                    user: this.user
			    });
            }


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
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Animeitem
		$scope.remove = function(animeitem) {
            //are you sure option...
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
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
            }
		};

		// Update existing Animeitem
		$scope.update = function() {
			var animeitem = $scope.animeitem;

            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.animeitem.manga!==null && $scope.animeitem.manga!==undefined) {
                animeitem.manga = $scope.animeitem.manga._id;
            }
            
            if ($scope.tagArray!==undefined) {
                var temp = animeitem.tags ;
                animeitem.tags = temp.concat($scope.tagArray);
            }
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                animeitem.image = $scope.imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(animeitem.image);
            
            //handle end date
            if (animeitem.episodes===animeitem.finalEpisode) {
                if (animeitem.end===undefined) {
                    animeitem.end = animeitem.latest.substring(0,10);
//                    console.log(animeitem.end);
                }
            }
            
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
            //console.log($scope.animeitems);
		};

		// Find existing Animeitem
		$scope.findOne = function() {
			$scope.animeitem = Animeitems.get({ 
				animeitemId: $stateParams.animeitemId
			});
//            console.log($scope.animeitem);
		};
        
        // Find list of mangaitems for dropdown.
        $scope.findManga = function() {
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
        
        //latest date display format.
        $scope.latestDate = function(latest) {
//          console.log(latest);
            var today = moment(new Date());
            var latestDate = moment(latest);
            var diff = today.diff(latestDate, 'days');
            
            //for 0 and 1 day(s) ago use the special term.
            if (diff===0) {
                return 'Today';
            } else if (diff===1) {
                return 'Yesterday';
            } else {
                return diff + ' days ago.';
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
angular.module('characters').controller('CharactersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Characters', 'Animeitems', 'Mangaitems', 'fileUpload', '$sce', '$window',
	function($scope, $stateParams, $location, Authentication, Characters, Animeitems, Mangaitems, fileUpload, $sce, $window) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.isList = 'list'; //show list? or carousel.
        $scope.maxItemCount = 0; //number of characters.
        $scope.statTagSortType = 'count'; //stat tag sort
        $scope.statTagSortReverse = true; //stat tag sort direction.
        $scope.statTagDetailSortType = 'count'; //stat tag detail sort
        $scope.statTagDetailSortReverse = true; //stat tag detail sort direction.
        $scope.statSeriesSortType = 'count'; //stat series sort
        $scope.statSeriesSortReverse = true; //stat series sort direction.
        $scope.myInterval = 2500; //carousel timer.
        $scope.sortType = 'name'; //default sort type
	    $scope.sortReverse = false; // default sort order
        $scope.imgPath = ''; //image path
        //$scope.newTag = ''; //for adding tags.
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        $scope.voiceActors = []; //for typeahead array.
        $scope.statTags = []; //for tag statistics;
        $scope.showTagDetail = false; //visibility of detail for tags.
        $scope.statSearch = ''; //filter value for tag detail.
        $scope.statSeries = []; //for series statistics;
        $scope.showSeriesDetail = false; //visibility of series drilldown.
        $scope.seriesSearch = ''; //for filtering series values.
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.
        $scope.male = 0; //gender count for pb.
        $scope.female = 0; //gender count for pb.
        $scope.nosex = 0; //no gender count for pb.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        $scope.$watchCollection('characters', function() {
            if ($scope.characters!==undefined) {
//                console.log($scope.characters);
                $scope.maxItemCount = $scope.characters.length;
                var add = true;
                //is tag in array?
                angular.forEach($scope.characters, function(item) {
                    if (item.tags.length===0) {
                        $scope.areTagless = true;
                    }
                    angular.forEach(item.tags, function(tag) {
                        for(var i=0; i < $scope.statTags.length; i++) {
                            if ($scope.statTags[i].tag===tag.text) {
                                add = false;
                                $scope.statTags[i].count += 1; 
                            }
                        }
                        // add if not in
                        if (add===true) {
                            $scope.statTags.push({ tag: tag.text, count: 1 });
                        }
                        add = true; //reset add status.
                    });
//                    console.log($scope.statTags);
                });
                //get series counts.
                angular.forEach($scope.characters, function(item) {
                    for(var i=0; i < $scope.statSeries.length; i++) {
                        if (item.anime!==null) {
                            if ($scope.statSeries[i].name===item.anime.title) {
                                add = false;
                                $scope.statSeries[i].count += 1; 
                            }
                        } else if (item.manga!==null) {
                            if ($scope.statSeries[i].name===item.manga.title) {
                                add = false;
                                $scope.statSeries[i].count += 1; 
                            }
                        }
                    }
                    // add if not in
                    if (add===true) {
                        if (item.anime!==null) {
                            $scope.statSeries.push({ name: item.anime.title, count: 1 });
                        } else if (item.manga!==null) {
                            $scope.statSeries.push({ name: item.manga.title, count: 1 });
                        }
                    }
                    add = true; //reset add status.
                });
//                    console.log($scope.statSeries);
                //get gender counts.
                angular.forEach($scope.statTags, function(stat) {
                    if (stat.tag==='male') {
                        $scope.male = stat.count;
                    } else if (stat.tag==='female') {
                        $scope.female = stat.count;
                    }
                });
                $scope.nosex = $scope.maxItemCount - $scope.male - $scope.female;
                //is voice actor in array?
                angular.forEach($scope.characters, function(item) { 
                        for(var i=0; i < $scope.voiceActors.length; i++) {
                            if ($scope.voiceActors[i]===item.voice) {
                                add = false; 
                            }
                        }
                        // add if not in
                        if (add===true) {
                            $scope.voiceActors.push(item.voice);
                        }
                        add = true; //reset add status.
                });
            }
        });
        
        
        $scope.searchTags = '';
        $scope.passTag = function(tag) {
            if ($scope.searchTags.indexOf(tag) === -1) {
                $scope.searchTags += tag + ',';
            }
        };
        $scope.clearTagValues = function() {
            $scope.searchTags = '';
            $scope.tagsForFilter = [];
        };
        $scope.deleteSearchTag = function(tag) {
            $scope.searchTags = $scope.searchTags.replace(tag + ',', '');
            
            var index = $scope.tagsForFilter.indexOf(tag);
            $scope.tagsForFilter.splice(index, 1);
        };
        
        //for adding/removing tags.
        $scope.addTag = function () {
                $scope.tagArray.push({ text: $scope.newTag });
                $scope.newTag = '';
        };
        $scope.deleteTag = function(text) {
        
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var deletingItem = $scope.tagArray;
                $scope.tagArray = [];

                //update the complete task.
                angular.forEach(deletingItem, function(tag) {
                    if (tag.text !== text) {
                        $scope.tagArray.push(tag);
                    }
                });
            }
        };
        //remove existing tag.
        $scope.removeTag = function(tag) {
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var index = $scope.character.tags.indexOf(tag);
                $scope.character.tags.splice(index, 1);
            }
        };
        
        //show stat tag detail.
        $scope.tagDetail = function(name) {
            if ($scope.detailTagName===name) {
                $scope.statSearch = '';
                $scope.showTagDetail = false;
                $scope.detailTagName = '';
            } else {
                $scope.statSearch = name;
                $scope.detailTagName = name;
                $scope.showTagDetail = true;
                $scope.tagDetailCollection = [];
                $scope.tagDetailResult = [];
                var add = true;
                angular.forEach($scope.characters, function(item){
                    for(var i=0; i < item.tags.length; i++) {
                        if (item.tags[i].text===name) {
                            $scope.tagDetailCollection.push(item.tags);
                        }
                    }
                });
//                console.log($scope.tagDetailCollection);
                angular.forEach($scope.tagDetailCollection, function(item) {
                    angular.forEach(item, function(tem) {
//                        console.log(tem);
                        for(var i=0; i < $scope.tagDetailResult.length; i++) {
                            //if exists and not the search value - increment the count.
                            if ($scope.tagDetailResult[i].name===tem.text && tem.text!==name) {
                                add = false;
                                $scope.tagDetailResult[i].count += 1; 
                            }
                        }
                        //add in if true and not the tag we searched on.
                        if (add===true && tem.text!==name) {
                            $scope.tagDetailResult.push({ name: tem.text, count: 1 });
                        }
                        add = true;
                    });
//                    console.log($scope.tagDetailResult);
                });
            }
        };
        
        //filter stat series detail.
        $scope.seriesDetailFilter = function(item) {
            if (item.anime!==null) {
                if (item.anime.title===$scope.detailSeriesName) {
                    return item;
                }
            } else if (item.manga!==null) {
                if (item.manga.title===$scope.detailSeriesName) {
                    return item;
                }
            }
        };
        
        //show stat series detail.
        $scope.seriesDetail = function(name) {
            if ($scope.detailSeriesName===name) {
                $scope.seriesSearch = '';
                $scope.showSeriesDetail = false;
                $scope.detailSeriesName = '';
            } else {
                $scope.seriesSearch = name;
                $scope.detailSeriesName = name;
                $scope.showSeriesDetail = true;
            }
        };
        
        //special tag filter
        $scope.tagFilter = function(item) {
            var found = false;
            var i = 0;
            var tagsToSearch = [];
            
            //if tagless is checked return tagless and nothing else.
            if ($scope.taglessItem===true) {
                if (item.tags.length===0) {
                    return item;
                }
            } else {
                if ($scope.searchTags===undefined || $scope.searchTags==='') {
                    return true;
                } else {
                    //get tags that are being looked for
                    //                var tagsForFilter = $scope.characterTags.split(',');
                    $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
                    //                console.log($scope.tagsForFilter);
                
                    //get tags of items to filter
                    angular.forEach(item.tags, function(tag) {
                        tagsToSearch.push(tag.text);
                    });
                
                    //filter: check in 'query' is in tags.
                    for(i = 0; i < $scope.tagsForFilter.length; i++) {
                        if (tagsToSearch.indexOf($scope.tagsForFilter[i]) !== -1) {
                            found = true;
                        } else {
                            return false;
                        }
                    }
                    return found;
                }
            }
        };
        
        //special media filter
        $scope.mediaFilter = function(item) {
            if ($scope.media==='anime') {
                if (item.anime!==null && item.manga===null) {
                    return true;
                }
                return false;
            } else if ($scope.media==='manga') {
                if (item.manga!==null && item.anime===null) {
                    return true;
                }
                return false;
            } else if ($scope.media==='both') {
                if (item.anime!==null && item.manga!==null) {
                    return true;
                }
                return false;
            } else {
                return true;
            }
        };
        
		// Create new Character
		$scope.create = function() {
            //console.log($scope.tagArray);
            var character = new Characters();
            //Handle situation if objects not selected.
			if (this.anime!==undefined && this.manga!==undefined && this.anime!==null && this.manga!==null) {
             // Create new Character object
			 character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime._id,
                manga: this.manga._id,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            } else if (this.anime!==undefined && this.anime!==null) {
             character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime._id,
                manga: this.manga,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            } else if (this.manga!==undefined && this.manga!==null) {
             character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime,
                manga: this.manga._id,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            } else {
             character = new Characters ({
				name: this.name,
                image: $scope.imgPath,
                anime: this.anime,
                manga: this.manga,
                voice: this.voice,
                tags: $scope.tagArray,
                user: this.user
			 });
            }
            
			// Redirect after save
			character.$save(function(response) {
				$location.path('characters/' + response._id);

				// Clear form fields
				$scope.name = '';
                $scope.image = '';
                $scope.voice = '';
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Character
		$scope.remove = function(character) {
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
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
            }
		};

		// Update existing Character
		$scope.update = function() {
			var character = $scope.character;
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.character.manga!==null && $scope.character.manga!==undefined) {
                character.manga = $scope.character.manga._id;
            }
            console.log($scope.character.anime);
            if ($scope.character.anime!==null && $scope.character.anime!==undefined) {
                character.anime = $scope.character.anime._id;
            }
            
            if ($scope.tagArray!==undefined) {
                var temp = character.tags ;
                character.tags = temp.concat($scope.tagArray);
            }
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                character.image = $scope.imgPath;
            }
            
			character.$update(function() {
				$location.path('characters/' + character._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Characters
		$scope.find = function() {
			$scope.characters = Characters.query();
            //console.log($scope.characters);
		};

		// Find existing Character
		$scope.findOne = function() {
			$scope.character = Characters.get({ 
				characterId: $stateParams.characterId
			});
            console.log($scope.character);
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
        
        
        // Image upload
        $scope.uploadFile = function(){
            var file = $scope.myFile;
            $scope.imgPath = '/modules/characters/img/' + file.name;
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = '/fileUploadCharacter';
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
	}
]);
'use strict';

angular.module('characters').directive('fileModel', ['$parse', function ($parse) {
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
.directive('characterBack', function(){
    return function(scope, element, attrs){
        var url = attrs.characterBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '100%',
            'background-repeat': 'no-repeat',
            'background-position': 'right'
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
.directive('enterTag', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.enterTag);
                });

                event.preventDefault();
            }
        });
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
		$stateProvider
        .state('home', {
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


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$window', '$location', 'Animeitems', 'Mangaitems',
	function($scope, Authentication, $window, $location, Animeitems, Mangaitems) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
    
    $scope.isCollapseFilter = false;
    $scope.isCollapseAction = true;
        
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
    
    //special day filter
    $scope.dayFilter = function(item) {
        var ds = $scope.daySelected;
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
        } else if (item.day==='Any') {
                return item;
        }
    };
        
    //date filter
    $scope.dateFilter = function(item) {
        if (item.date===null || item.date===undefined) {
            if ($scope.datesSelected==='current') {
                return item;
            }
            return false;
        }
            //console.log(item.date);
            var day = $scope.today.getDay(),
            diff = $scope.today.getDate() - day + (day === 0 ? 0:7);
            var temp = new Date();
            var wkEnd = new Date(temp.setDate(diff));
            var currentWkEnd = wkEnd.toISOString().substring(0,10);
//            console.log('day: ' + day);
//            console.log('date: ' + $scope.today.getDate());
//            console.log('diff: ' + diff);
              console.log('wk-end: ' + currentWkEnd); // 0123-56-89

        if ($scope.datesSelected==='current') {
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
        } else if ($scope.datesSelected==='future') {
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
    };
    
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
            console.log('updated set to false');
            localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
        }
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
        
        //if created on a monday set updated=true - without this task could be deleted/un-completed by the check status method.
        var day = $scope.today.getDay(); //new Date('2015-05-04').getDay();
        if (day===1) {
            $scope.taskItem.push({
                description: $scope.newTask,
                day: $scope.newTaskDay.name,
                date: $scope.newTaskDate,
                repeat: $scope.newTaskRepeat,
                completeTimes: 0,
                updated: true,
                complete: false,
                category: $scope.newTaskCategory.name,
                daily: $scope.newTaskDaily,
                dailyRefresh: $scope.today.getDate()
            });
        } else {
            $scope.taskItem.push({
                description: $scope.newTask,
                day: $scope.newTaskDay.name,
                date: $scope.newTaskDate,
                repeat: $scope.newTaskRepeat,
                completeTimes: 0,
                updated: false,
                complete: false,
                category: $scope.newTaskCategory.name,
                daily: $scope.newTaskDaily,
                dailyRefresh: $scope.today.getDate()
            });
        }
        $scope.newTask = '';
        $scope.newTaskDay = $scope.days;
        $scope.newTaskDate = '';
        $scope.newTaskCategory = $scope.categories;
        $scope.newTaskRepeat = '';
        $scope.newTaskDaily = false;
        localStorage.setItem('taskItems', JSON.stringify($scope.taskItem));
    };
    $scope.deleteTask = function  (description) {
        //are you sure option...
        var removal = $window.confirm('Are you sure you want to delete this task?');
        var deletingItem = $scope.taskItem;
        $scope.taskItem = [];
        if (removal) {
            //update the complete task.
            angular.forEach(deletingItem, function (taskItem) {
                if (taskItem.description !== description) {
                    $scope.taskItem.push(taskItem);
                }
            });
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
            if ($scope.dateFilter(taskItem)) {
                count += taskItem.complete ? 0 : 1;
            }
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


angular.module('favourites').controller('FavouritesController', ['$scope', 'Authentication', '$window', '$sce', 'Animeitems', 'Mangaitems', '$location',
	function($scope, Authentication, $window, $sce, Animeitems, Mangaitems, $location) {
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
        
        /**
         *  UPDATE ANIME FAVOURITES
         */
        $scope.updateAnimeFavouriteOne = function() {
            if ($scope.favouriteOne) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '1') {
                        favouriteAnimeitem.anime = $scope.favouriteOne;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                $scope.favouriteOne = '';
            } 
        };
        $scope.updateAnimeFavouriteTwo = function() {
            if ($scope.favouriteTwo) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '2') {
                        favouriteAnimeitem.anime = $scope.favouriteTwo;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                $scope.favouriteTwo = '';
            } 
        };
        $scope.updateAnimeFavouriteThree = function() {
            if ($scope.favouriteThree) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '3') {
                        favouriteAnimeitem.anime = $scope.favouriteThree;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                $scope.favouriteThree = '';
            } 
        };
        $scope.updateAnimeFavouriteFour = function() {
            if ($scope.favouriteFour) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '4') {
                        favouriteAnimeitem.anime = $scope.favouriteFour;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                $scope.favouriteFour = '';
            } 
        };
        $scope.updateAnimeFavouriteFive = function() {
            if ($scope.favouriteFive) {
                angular.forEach($scope.favouriteAnimeitem, function (favouriteAnimeitem) {
                    if (favouriteAnimeitem.rank === '5') {
                        favouriteAnimeitem.anime = $scope.favouriteFive;
                        favouriteAnimeitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                $scope.favouriteFive = '';
            } 
        };
        
        /**
         *  UPDATE MANGA FAVOURITES
         */
        $scope.updateMangaFavouriteOne = function() {
            if ($scope.favouriteMangaOne) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '1') {
                        favouriteMangaitem.manga = $scope.favouriteMangaOne;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaOne = '';
            } 
        };
        $scope.updateMangaFavouriteTwo = function() {
            if ($scope.favouriteMangaTwo) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '2') {
                        favouriteMangaitem.manga = $scope.favouriteMangaTwo;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaTwo = '';
            } 
        };
        $scope.updateMangaFavouriteThree = function() {
            if ($scope.favouriteMangaThree) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '3') {
                        favouriteMangaitem.manga = $scope.favouriteMangaThree;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaThree = '';
            } 
        };
        $scope.updateMangaFavouriteFour = function() {
            if ($scope.favouriteMangaFour) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '4') {
                        favouriteMangaitem.manga = $scope.favouriteMangaFour;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaFour = '';
            } 
        };
        $scope.updateMangaFavouriteFive = function() {
            if ($scope.favouriteMangaFive) {
                angular.forEach($scope.favouriteMangaitem, function (favouriteMangaitem) {
                    if (favouriteMangaitem.rank === '5') {
                        favouriteMangaitem.manga = $scope.favouriteMangaFive;
                        favouriteMangaitem.date = $scope.today;
                    }
                });
                localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
                $scope.favouriteMangaFive = '';
            } 
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
                    var temprank1 = $scope.selectedFavourite.rank;
                    var temprank2 = $scope.selectedFavouriteTwo.rank;
                    
                    if ($scope.selectedFavourite.anime!==undefined) {
//                        console.log('change places');
                        angular.forEach($scope.favouriteAnimeitem, function(favouriteAnimeitem) {
                            if (favouriteAnimeitem.anime.title===$scope.selectedFavourite.anime.title) {
                                favouriteAnimeitem.rank = temprank2;
                            } else if (favouriteAnimeitem.anime.title===$scope.selectedFavouriteTwo.anime.title) {
                                favouriteAnimeitem.rank = temprank1;
                            }
//                            console.log('final=' + favouriteAnimeitem.anime.title + ' - ' + favouriteAnimeitem.rank);
                        });
//                        console.log($scope.favouriteAnimeitem);
                        localStorage.setItem('favouriteAnimeitems', JSON.stringify($scope.favouriteAnimeitem));
                        $scope.selectedFavourite = undefined;
                        $scope.selectedFavouriteTwo = undefined;
                    } else if ($scope.selectedFavourite.manga!==undefined) {
//                        console.log('change places');
                        angular.forEach($scope.favouriteMangaitem, function(favouriteMangaitem) {
                            if (favouriteMangaitem.manga.title===$scope.selectedFavourite.manga.title) {
                                favouriteMangaitem.rank = temprank2;
                            } else if (favouriteMangaitem.manga.title===$scope.selectedFavouriteTwo.manga.title) {
                                favouriteMangaitem.rank = temprank1;
                            }
//                            console.log('final=' + favouriteMangaitem.manga.title + ' - ' + favouriteMangaitem.rank);
                        });
//                        console.log($scope.favouriteMangaitem);
                        localStorage.setItem('favouriteMangaitems', JSON.stringify($scope.favouriteMangaitem));
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
angular.module('mangaitems').controller('MangaitemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Mangaitems', 'Animeitems', 'fileUpload', '$sce', '$window', 'moment',
	function($scope, $stateParams, $location, Authentication, Mangaitems, Animeitems, fileUpload, $sce, $window, moment) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.itemUpdate = new Date().toISOString().substring(0,10); //today's date as 'yyyy-MM-dd'
        $scope.view = 'list'; //dynamic page title.
        $scope.isList = true; //list view as default.
        $scope.maxMangaCount = 0; //number of anime.
        $scope.maxMangaRatedCount = 0; //number of anime with a rating i.e not 0.
        $scope.averageMangaRating = 0; //average rating for anime.
        $scope.maxCompleteMonth = 0; //used to find the max number of ends in 1 month.
        $scope.showDetail = false; //show month detail.
        $scope.statTagSortType = 'tag'; //stat tag sort
        $scope.statTagSortReverse = false; //stat tag sort direction.
        $scope.sortType = 'latest'; //default sort type
	    $scope.sortReverse = true; // default sort order
        $scope.finalNumbers = false; //default show status of final number fields in edit view.
        $scope.ratingLevel = undefined; //default rating selection
        $scope.maxRating = 10; //maximum rating
        $scope.imgExtension = ''; //image path extension.
        $scope.imgPath = ''; //image path
        $scope.tagArray = []; // holding tags pre-submit
        $scope.tagArrayRemove = [];
        $scope.usedTags = []; //for typeahead array.
        $scope.statTags = []; //for stat table.
        $scope.areTagless = false; //are any items tagless
        $scope.taglessItem = false; //filter variable for showing tagless items.

        //allow retreival of local resource
        $scope.trustAsResourceUrl = function(url) {
            return $sce.trustAsResourceUrl(url);
        };
        
        $scope.searchTags = '';
        $scope.passTag = function(tag) {
            if ($scope.searchTags.indexOf(tag) === -1) {
                $scope.searchTags += tag + ',';
            }
        };
        $scope.clearTagValues = function() {
            $scope.searchTags = '';
            $scope.tagsForFilter = [];
        };
        $scope.deleteSearchTag = function(tag) {
            $scope.searchTags = $scope.searchTags.replace(tag + ',', '');
            
            var index = $scope.tagsForFilter.indexOf(tag);
            $scope.tagsForFilter.splice(index, 1);
        };
        
        //for adding/removing tags.
        $scope.addTag = function () {
                $scope.tagArray.push({ text: $scope.newTag });
                $scope.newTag = '';
        };
        $scope.deleteTag = function(text) {
        
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var deletingItem = $scope.tagArray;
                $scope.tagArray = [];

                //update the complete task.
                angular.forEach(deletingItem, function(tag) {
                    if (tag.text !== text) {
                        $scope.tagArray.push(tag);
                    }
                });
            }
        };
        //remove existing tag.
        $scope.removeTag = function(tag) {
            var removal = $window.confirm('Are you sure you want to delete this tag?');
            if (removal) {
                var index = $scope.mangaitem.tags.indexOf(tag);
                $scope.mangaitem.tags.splice(index, 1);
            }
        };
        
        //special tag filter
        $scope.tagFilter = function(item) {
            var found = false;
            var i = 0;
            var tagsToSearch = [];
            
            //if tagless is checked return tagless and nothing else.
            if ($scope.taglessItem===true) {
                if (item.tags.length===0) {
                    return item;
                }
            } else {
                if ($scope.searchTags===undefined || $scope.searchTags==='') {
                    return true;
                } else {
                    //get tags that are being looked for
                    //                var tagsForFilter = $scope.characterTags.split(',');
                    $scope.tagsForFilter = $scope.searchTags.substring(0, $scope.searchTags.length - 1).split(',');
                    //                console.log($scope.tagsForFilter);
                
                    //get tags of items to filter
                    angular.forEach(item.tags, function(tag) {
                        tagsToSearch.push(tag.text);
                    });
                
                    //filter: check in 'query' is in tags.
                    for(i = 0; i < $scope.tagsForFilter.length; i++) {
                        if (tagsToSearch.indexOf($scope.tagsForFilter[i]) !== -1) {
                            found = true;
                        } else {
                            return false;
                        }
                    }
                    return found;
                }
            }
        };
        
        $scope.months = [
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
        ];
        
        //ended stat month filter
        $scope.endedMonth = function(year, month){
            return function(item) {
                if (item.end!==undefined) {
                    if (item.end.substring(0,4)===year) {
                        if (item.end.substr(5,2)===month) {
                            return item;
                        }
                    }
                }
            };
        };
        
        //show month detail.
        $scope.monthDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailYear===year && $scope.detailMonth===month) {
                    $scope.showDetail = !$scope.showDetail;
            } else {
                $scope.detailYear = year;
                $scope.detailMonth = month;
                //get month name also, cause why not.
                angular.forEach($scope.months, function(mmm) {
                    if ($scope.detailMonth===mmm.number) {
                        $scope.detailMonthName = mmm.text;
                    }
                });
                $scope.showDetail = true;
            }
        };
        
        $scope.$watchCollection('mangaitems', function() {
            if ($scope.mangaitems!==undefined) {
//                console.log($scope.mangaitems);
                $scope.maxMangaCount = $scope.mangaitems.length;
                var tempRating = 0;
                angular.forEach($scope.mangaitems, function(manga) {
                    if (manga.rating!==0) {
                        tempRating += manga.rating;
                        $scope.maxMangaRatedCount++;
                    }
                });
                $scope.averageMangaRating = tempRating / $scope.maxMangaRatedCount;
                var modeMap = {};
                var maxCount = 0;
                for(var i = 0; i < $scope.mangaitems.length; i++) {
    	           if ($scope.mangaitems[i].end!==undefined) {
                        var end = $scope.mangaitems[i].end.substring(0,7);

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
//                console.log(modeMap);
//                console.log(maxCount);
                $scope.maxCompleteMonth = maxCount;
                
                var add = true;
                //is tag in array?
                angular.forEach($scope.mangaitems, function(manga) { 
                    if (manga.tags.length===0) {
                        $scope.areTagless = true;
                    }
                    angular.forEach(manga.tags, function(tag) {
                        for(var i=0; i < $scope.statTags.length; i++) {
                            if ($scope.statTags[i].tag===tag.text) {
                                add = false;
                                    $scope.statTags[i].count += 1; 
                                    $scope.statTags[i].ratingAdded += manga.rating;
                                    $scope.statTags[i].ratingAvg = $scope.statTags[i].ratingAdded / $scope.statTags[i].count;
                            }
                        }
                        // add if not in
                        if (add===true) {
                            $scope.statTags.push({ tag: tag.text, count: 1, ratingAdded: manga.rating, ratingAvg: manga.rating });
                        }
                        add = true; //reset add status.
                    });
//                    console.log($scope.statTags);
                });
            }
        });
        
        //rating 'tooltip' function
        $scope.hoveringOver = function(value) {
            $scope.overStar = value;
            $scope.percent = 100 * (value / $scope.maxRating);
        };
        
        //filter for rating stars
        $scope.ratingFilter = function(item) {
            if (item.rating===$scope.ratingLevel) {
                return item;
            } else if ($scope.ratingLevel===undefined) {
                return item;
            }
        };
        
        // Create new Mangaitem
		$scope.create = function() {
            
            var mangaitem = new Mangaitems();
            //Handle situation if objects not selected.
			if (this.anime!==undefined && this.anime!==null) {
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
                    anime: this.anime._id,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            } else {
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
                    anime: this.anime,
                    tags: $scope.tagArray,
                    user: this.user
			     });
            }

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
                $scope.tags = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Mangaitem
		$scope.remove = function(mangaitem) {
            //are you sure option...
            var removal = $window.confirm('Are you sure you want to delete this item?');
            if (removal) {
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
            }
		};

		// Update existing Mangaitem
		$scope.update = function() {
			var mangaitem = $scope.mangaitem;
            //dropdown passes whole object, if-statements for lazy fix - setting them to _id.
            if ($scope.mangaitem.anime!==null && $scope.mangaitem.anime!==undefined) {
                mangaitem.anime = $scope.mangaitem.anime._id;
            }
            
            if ($scope.tagArray!==undefined) {
                var temp = mangaitem.tags ;
                mangaitem.tags = temp.concat($scope.tagArray);
            }
            
            if ($scope.imgPath!==undefined && $scope.imgPath!==null && $scope.imgPath!=='') {
                mangaitem.image = $scope.imgPath;
            }
            //console.log($scope.imgPath);
            //console.log(mangaitem.image);
            
            //handle end date
            if (mangaitem.chapters===mangaitem.finalChapter && mangaitem.volumes===mangaitem.finalVolume) {
                if (mangaitem.end===undefined) {
                    mangaitem.end = mangaitem.latest.substring(0,10);
                    //console.log(animeitem.end);
                }
            }
            
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
            //console.log($scope.mangaitems);
		};

		// Find existing Mangaitem
		$scope.findOne = function() {
			$scope.mangaitem = Mangaitems.get({ 
				mangaitemId: $stateParams.mangaitemId
			});
//            console.log($scope.mangaitem);
		};
        
        // Find a list of Animeitems for dropdowns.
		$scope.findAnime = function() {
			$scope.animeitems = Animeitems.query();
		};
        
        //image upload
        $scope.uploadFile = function(){
            var file = $scope.myFile;
            $scope.imgPath = '/modules/mangaitems/img/' + file.name;
            console.log('file is ' + JSON.stringify(file));
            var uploadUrl = '/fileUpload';
            fileUpload.uploadFileToUrl(file, uploadUrl);
        };
        
        //latest date display format.
        $scope.latestDate = function(latest) {
//          console.log(latest);
            var today = moment(new Date());
            var latestDate = moment(latest);
            var diff = today.diff(latestDate, 'days');
            
            //for 0 and 1 day(s) ago use the special term.
            if (diff===0) {
                return 'Today';
            } else if (diff===1) {
                return 'Yesterday';
            } else {
                return diff + ' days ago.';
            }
        };
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
		if ($scope.authentication.user) $location.path('/');

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