(function() {
	'use strict';
	angular.module('mangaitems')
	.factory('MangaFactory', MangaFactory);
	MangaFactory.$inject = ['Mangaitems', 'ListService', 'ItemService', 'NotificationFactory', '$location'];

	function MangaFactory(Mangaitems, ListService, ItemService, NotificationFactory, $location) {
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
	}

})();
