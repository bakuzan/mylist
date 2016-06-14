(function() {
  'use strict';
  angular.module('core')
  .controller('LeftCtrl', LeftCtrl);

  function LeftCtrl($scope, $timeout, $mdSidenav, $log) {
      var ctrl = this;

      ctrl.close = close;
      ctrl.expand = expand;
      ctrl.expandedGroup = '';

      function close() {
          $mdSidenav('left').close()
          .then(function () {
              //$log.debug('close LEFT is done');
          });
      }

      function expand(position) {
        ctrl.expandedGroup = position;
      }
  }

})();
