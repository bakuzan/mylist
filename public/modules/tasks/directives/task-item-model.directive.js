(function() {
  'use strict';
  angular.module('tasks')
  .directive('taskItemModel', taskItemModel);

  function taskItemModel() {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'modules/tasks/templates/task-item.html'
    };
  }

})();
