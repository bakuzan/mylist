(function() {
  'use strict';
  angular.module('tasks')
  .directive('mangaItemModel', mangaItemModel);

  function mangaItemModel() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'modules/mangaitems/templates/manga-item.html'
    };
  }

})();
