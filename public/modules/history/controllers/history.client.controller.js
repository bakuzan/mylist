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
