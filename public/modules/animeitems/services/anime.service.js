(function() {
	'use strict';
	angular.module('animeitems')
	.factory('AnimeFactory', AnimeFactory);
	AnimeFactory.$inject = ['Animeitems', 'ListService', 'ItemService', 'NotificationFactory', '$location'];

	function AnimeFactory(Animeitems, ListService, ItemService, NotificationFactory, $location) {
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
	}

})();
