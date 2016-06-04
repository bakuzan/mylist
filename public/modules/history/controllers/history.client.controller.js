'use strict';

// History controller
angular.module('history').controller('HistoryController', ['$scope', '$stateParams', '$location', 'Authentication', 'AnimeHistory', 'MangaHistory', 'HistoryService', 'ListService', 'spinnerService',
	function($scope, $stateParams, $location, Authentication, AnimeHistory, MangaHistory, HistoryService, ListService, spinnerService) {
		var ctrl = this,
		    latestDate = new Date().setDate(new Date().getDate() - 29);
		ctrl.authentication = Authentication;

    ctrl.view = 'Anime';
    ctrl.filterConfig = {
			historyFilter: 'Today'
    };
    ctrl.historyGroups = [
      { name: 'Today' },
      { name: 'Yesterday' },
      { name: 'This week' },
      { name: 'Last week' },
      { name: 'Two weeks ago' },
      { name: 'Three weeks ago' },
      { name: 'Four weeks ago' },
    ];

    ctrl.buildHistory = function() {
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
    };

    //Needed to catch 'Character' setting and skip it.
    $scope.$watch('view', function(newValue) {
      if (ctrl.view !== undefined) {
          if (newValue !== 'Anime' && newValue !== 'Manga') {
              ctrl.view = 'Anime';
          }
      }
    });

    ctrl.happenedWhen = function(when) {
        return HistoryService.happenedWhen(when);
    };
	}
]);
