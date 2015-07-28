'use strict';

angular.module('core').directive('myProgress', function() {
  return function(scope, element, attrs) {
  scope.$watch(attrs.myProgress, function(val) {
      
      var type = 'checklist-progress';
      
       element.html('<div class="' + type + '" style="width: ' + val + '%;height: 100%"></div>');
  });
  };
});