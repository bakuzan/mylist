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
            //keydown catch - alt+v for view, ctrl+left/right for list page.
            scope.$on('my:keydown', function(event, e) {
//                console.log(event, e);
                if (e.ctrlKey && e.keyCode===39 && scope.currentPage < scope.pageCount) {
                    scope.currentPage = scope.currentPage + 1;
                    if (scope.currentPage > scope.pageCount - 1) {
                        scope.currentPage = scope.currentPage -1;
                    }
                } else if (e.ctrlKey && e.keyCode===37 && scope.currentPage > 0) {
                    scope.currentPage = scope.currentPage - 1;
                } else if (e.altKey && e.keyCode===86) {
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
.directive('pageControls', ['$timeout', function($timeout) {
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
          $timeout(function() {
              scope.$watch('[showingCount, pageConfig.pageSize]', function() {
                  scope.pageCount = Math.ceil(scope.showingCount / scope.pageConfig.pageSize);
                  if (scope.pageConfig.currentPage > scope.pageCount - 1) {
                      scope.last(); //in the event changing page size would put you above the last page.
                  } else if (scope.pageConfig.currentPage < 0) {
                      scope.first();
                  }
              });
          });
          
          /** Button Functions
           *    go to next/prev pages. skip to first/last page.
           */
          scope.first = function() {
              scope.pageConfig.currentPage = 0;
          };
          scope.last = function() {
              scope.pageConfig.currentPage = scope.pageCount - 1;
          };
          scope.next = function() {
              scope.pageConfig.currentPage += 1;
          };
          scope.prev = function() {
              scope.pageConfig.currentPage -= 1;
          };
          
      }
  };
    
}]);