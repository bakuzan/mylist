'use strict';

angular.module('characters').filter('seriesDetailFilter', function() {
    return function(array, detailSeriesName) {
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
    };
})
.filter('seriesFilter', function() {
    return function(array, series) {
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
            } else if (media==='none') {
                if (item.anime===null && item.manga===null) {
                    return true;
                }
            } else {
                return true;
            }
        });
    };
})
.filter('tagFilter', function() {
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
});