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
.factory('TaskFactory', ['Animeitems', 'Mangaitems', 'AnimeFactory', 'MangaFactory', function(Animeitems, Mangaitems, AnimeFactory, MangaFactory) {
    var obj = {},
        itemUpdate = new Date().toISOString().substring(0,10);
    
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
                data.latest = itemUpdate;
                AnimeFactory.update(data, undefined, true, undefined);
            });
        };
    
        obj.updateMangaitem = function(task) {
            var query = Mangaitems.get({ 
				mangaitemId: task.link.manga._id
			});
            query.$promise.then(function(data) {
                console.log(data);
                data.chapters += 1;
                data.latest = itemUpdate;
                MangaFactory.update(data, undefined, true, undefined);
            });
        };
    
    return obj;
}]);