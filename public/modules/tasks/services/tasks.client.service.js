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
