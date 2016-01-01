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
    return {
        getWeekBeginning: function() {
            var newDate = new Date(),
                day = newDate.getDay(),
                diff = newDate.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
            var wkBeg = new Date();
            return new Date(wkBeg.setDate(diff));
        },
        updateAnimeitem: function(task) {
            var anime = Animeitems.get({ 
				animeitemId: task.link.anime._id
			});
            
        },
        updateMangaitem: function(task) {
            var manga = Mangaitems.get({ 
				mangaitemId: task.link.manga._id
			});
            
        }
    };
}]);