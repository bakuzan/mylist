(function() {
  'use strict';
  angular.module('tasks')
  .directive('animeItemModel', animeItemModel);

  function animeItemModel() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'modules/animeitems/templates/anime-item.html'
    };
  }

})();
