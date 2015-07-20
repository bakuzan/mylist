'use strict';

// Statistics controller
angular.module('statistics').controller('StatisticsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Animeitems', 'Mangaitems', 'Characters', 'ListService', 'ItemService',
	function($scope, $stateParams, $location, Authentication, Animeitems, Mangaitems, Characters, ListService, ItemService) {
		$scope.authentication = Authentication;
        
        // If user is not signed in then redirect back to signin.
		if (!$scope.authentication.user) $location.path('/signin');
        
        $scope.view = 'Anime';
        $scope.historicalView = 'month'; //default historical view in stats.
        $scope.maxCount = 0; //number of items.
        $scope.maxRatedCount = 0; //number of items with a rating i.e not 0.
        $scope.averageRating = 0; //average rating for items.
        $scope.maxCompleteMonth = 0; //used to find the max number of ends in 1 month.
        $scope.seasons = [
            { number: '03', text: 'Winter' },
            { number: '06', text: 'Spring' },
            { number: '09', text: 'Summer' },
            { number: '12', text: 'Fall' }
        ];
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
        $scope.showDetail = false; //show month detail.
        $scope.statTagSortType = 'count'; //stat tag sort
        $scope.statTagSortReverse = true; //stat tag sort direction.
        $scope.statTagDetailSortType = 'count'; //stat tag detail sort
        $scope.statTagDetailSortReverse = true; //stat tag detail sort direction.
        $scope.statSeriesSortType = 'count'; //stat series sort
        $scope.statSeriesSortReverse = true; //stat series sort direction.
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
        $scope.isLoading = true;
        $scope.loading = function(value) {
            $scope.isLoading = ListService.loader(value);
        };
        
        function getItems(view) {
            if (view === 'Anime') {
                $scope.items = Animeitems.query();
            } else if (view === 'Manga') {
                $scope.items = Mangaitems.query();
            } else if (view === 'Character') {
                $scope.items = Characters.query();
            }
        }
        $scope.find = function(view) {
            getItems(view);
        };
        //required for ctrl+v clicks.
        $scope.$watch('view', function(newValue) {
            if ($scope.view !== undefined) {
                getItems(newValue);
            }
        });
        
        $scope.$watchCollection('items', function() {
            if ($scope.view !== 'Character') {
                if ($scope.items!==undefined) {
                    $scope.maxCompleteMonth = ItemService.maxCompleteMonth($scope.items);
                    $scope.completeByMonth = ItemService.completeByMonth($scope.items);
                    if ($scope.view === 'Anime') {
                        $scope.completeBySeason = ItemService.completeBySeason($scope.items);
                    }
                    
                    $scope.maxCount = $scope.items.length;
                    var tempRating = 0;
                    $scope.maxRatedCount = 0;
                    angular.forEach($scope.items, function(item) {
                        if (item.rating!==0) {
                            tempRating += item.rating;
                            $scope.maxRatedCount++;
                        }
                    });
                    $scope.averageRating = tempRating / $scope.maxRatedCount;
                    var maxTagCount = ItemService.maxTagCount($scope.items);
                    $scope.statTags = ItemService.buildStatTags($scope.items, maxTagCount, $scope.averageRating);
                }
            } else if ($scope.view === 'Character') {
                if ($scope.items!==undefined) {
                    $scope.maxCount = $scope.items.length;
                    var add = true;
                    //is tag in array?
                    angular.forEach($scope.items, function(item) {
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
                    angular.forEach($scope.items, function(item) {
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
                    $scope.nosex = $scope.maxCount - $scope.male - $scope.female;
                }
            }
        });
        
        //show season detail.
        $scope.seasonDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailSeasonYear===year && $scope.detailSeason===month) {
                    $scope.showSeasonDetail = !$scope.showSeasonDetail;
                    $scope.showDetail = false;
            } else {
                $scope.detailSeasonYear = year;
                $scope.detailSeason = month;
                //get month name also, cause why not.
                angular.forEach($scope.seasons, function(mmm) {
                    if ($scope.detailSeason===mmm.number) {
                        $scope.detailSeasonName = mmm.text;
                    }
                });
                $scope.showSeasonDetail = true;
                $scope.showDetail = false;
            }
        };
        
//        //show month detail.
        $scope.monthDetail = function(year, month) {
//            console.log(year+'-'+month);
            //if the one already selected is clicked, hide the detail.
            if ($scope.detailYear===year && $scope.detailMonth===month) {
                    $scope.showDetail = !$scope.showDetail;
                    $scope.showSeasonDetail = false;
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
                $scope.showSeasonDetail = false;
            }
        };
        
        //show stat tag detail.
        $scope.tagDetail = function(name) {
            if ($scope.detailTagName===name) {
                $scope.statSearch = '';
                $scope.showTagDetail = false;
                $scope.detailTagName = '';
                $scope.isEqual = false;
            } else {
                $scope.statSearch = name;
                $scope.detailTagName = name;
                $scope.isEqual = true;
                $scope.showTagDetail = true;
                $scope.tagDetailCollection = [];
                $scope.tagDetailResult = [];
                var add = true;
                angular.forEach($scope.items, function(item){
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
        
    }
]);