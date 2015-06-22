'use strict';

angular.module('characters').filter('seriesDetailFilter', function() {
    return function(array, detailSeriesName) {
        return array.filter(function(item) {
            //filter stat series detail.
            if (item.anime!==null) {
                if (item.anime.title===detailSeriesName) {
                    return item;
                }
            } else if (item.manga!==null) {
                if (item.manga.title===detailSeriesName) {
                    return item;
                }
            }
        });
    };
})
.filter('mediaFilter', function() {
    return function(array, media) {
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
            } else {
                return true;
            }
        });
    };
});