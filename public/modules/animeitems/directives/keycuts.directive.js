(function() {
  'use strict';
  angular.module('animeitems')
  .directive('keycuts', keycuts);

  function keycuts() {
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
  }

})();
