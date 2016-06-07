(function() {
  'use strict';
  angular.module('animeitems')
  .directive('pageControls', pageControls);

  function pageControls() {
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

  }

})();
