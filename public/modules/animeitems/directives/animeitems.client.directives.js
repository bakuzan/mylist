'use strict';

angular.module('animeitems').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}])
.directive('listBack', function(){
    return function(scope, element, attrs){
        var url = attrs.listBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '50%',
            'background-repeat': 'no-repeat',
            'background-position': 'right'
        });
    };
})
.directive('keycuts', function() {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            //keydown catch - alt+v for view
            scope.$on('my:keydown', function(event, e) {
//                console.log(event, e);
                if (e.altKey && e.keyCode===86) {
                    if (scope.isList==='list') {
                        scope.isList = 'slider';
                    } else if (scope.isList==='slider') {
                        scope.isList = 'list';
                    } else if (scope.view === 'Anime') {
                        scope.view = 'Manga';
                    } else if (scope.view === 'Manga') {
                        scope.view = 'Character';
                    } else if (scope.view === 'Character') {
                        scope.view = 'Anime';
                    }
                }
            });
        }
    };
})
.directive('pageControls', function() {
  return {
      restrict: 'EA',
      replace: true,
      scope: {
          pageConfig: '=',
          showingCount: '='
      },
      templateUrl: '/modules/animeitems/templates/page-controls.html',
      link: function(scope, elem, attrs) {
          /** Calculate page count.
           *    If showingCount isn't caluclated in time...
           *    If the pageSize is altered...
           */
              scope.$watch('showingCount', function() {
                  scope.pageCount = Math.ceil(scope.showingCount / scope.pageConfig.pageSize);
                  if (scope.pageConfig.currentPage > scope.pageCount - 1) {
                      scope.last(); //in the event changing page size would put you above the last page.
                  } else if (scope.pageConfig.currentPage < 0) {
                      scope.first();
                  }
              });
          
          /** Button Functions
           *    go to next/prev pages. skip to first/last page.
           */
          scope.first = function() {
//              console.log('first');
              scope.pageConfig.currentPage = 0;
          };
          scope.last = function() {
//              console.log('last');
              scope.pageConfig.currentPage = scope.pageCount - 1;
          };
          scope.next = function() {
//              console.log('next');
              scope.pageConfig.currentPage += 1;
          };
          scope.prev = function() {
//              console.log('prev');
              scope.pageConfig.currentPage -= 1;
          };
          
          //Catches ctrl+left/right keypresses to change pages.
          scope.$on('my:keydown', function(event, e) {
//              console.log(event, e);
            if (e.ctrlKey && e.keyCode===39 && scope.pageConfig.currentPage < scope.pageCount - 1) {
                scope.next();
            } else if (e.ctrlKey && e.keyCode===37 && scope.pageConfig.currentPage > 0) {
                scope.prev();
            }
          });
          
      }
  };
    
})
.directive('listFilters', function() {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            filterConfig: '=',
            items: '=',
            page: '='
        },
        templateUrl: '/modules/animeitems/templates/list-filters.html',
        link: function(scope, elem, attrs) {
            scope.filterConfig.searchTags = '';
            scope.passTag = function(tag) {
                if (scope.filterConfig.searchTags.indexOf(tag) === -1) {
                    scope.filterConfig.searchTags += tag + ',';
                    scope.filterConfig.tagsForFilter = scope.filterConfig.searchTags.substring(0, scope.filterConfig.searchTags.length - 1).split(',');
                }
            };
            //rating 'tooltip' function
            scope.hoveringOver = function(value) {
                scope.filterConfig.ratingActions.overStar = value;
                scope.filterConfig.ratingActions.percent = 100 * (value / scope.filterConfig.ratingActions.maxRating);
            };
            
            scope.itemsAvailable = function() {
              scope.$parent.itemsAvailable();  
            };
          
        }
        
    };
});