(function() {
  'use strict';
  angular.module('toptens')
  .directive('horizontalListItem', horizontalListItem);

   function horizontalListItem() {
      return {
          restrict: 'A',
          replace: true,
          transclude: true,
          scope: {},
          templateUrl: '/modules/toptens/templates/horizontal-list-item.html',
          require: '^horizontalList',
          link: function(scope, element, attr, horizontalListCtrl) {
              scope.isVisible = false;
              scope.itemWidth = horizontalListCtrl.itemWidth;
              scope.position = element.index();
              horizontalListCtrl.register(scope);
          }
      };
  }

})();
