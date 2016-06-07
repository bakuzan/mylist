(function() {
  'use strict';
  angular.module('core')
  .directive('anywhereButHere', anywhereButHere);

  function anywhereButHere($document, $window) {
      return {
          restrict: 'A',
          link: function (scope, element, attrs) {
              element.data('thing', true);

              /** On click, check what you clicked and whether you can ignore it.
               *    Based on checks false the ng-show of the anywhere-but-here element.
               */
              angular.element($document[0].body).on('click', function (e) {
                  var inThing = angular.element(e.target).inheritedData('thing'),
                      ignore = angular.element(e.target).attr('ignore-here');
                  if (!inThing && !ignore) {
                      scope.$apply(function () {
                          scope[attrs.ngShow] = false;
                      });
                  }
              });
          }
      };
  }

})();
