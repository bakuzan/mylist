(function() {
  'use strict';
  angular.module('core')
  .directive('malSearchItem', malSearchItem);
  malSearchItem.$inject = ['$timeout'];

  function malSearchItem($timeout) {
      return {
          restrict: 'A',
          require: '^malSearch',
          scope: {
            item: '@malSearchItem'
          },
          link: function (scope, element, attrs, malSearchCtrl) {

          }
      };
  }

})();
