(function() {
  'use strict';
  angular.module('core')
  .controller('LeftCtrl', LeftCtrl);

  function LeftCtrl($scope, $timeout, $mdSidenav, $log) {
      var ctrl = this;

      ctrl.close = close;
      ctrl.expand = expand;
      ctrl.expandedGroup = '';

      function expand(position) {
        ctrl.expandedGroup = position;
      }

      function close() {
        $mdSidenav('left').close();
      }

  }

})();
