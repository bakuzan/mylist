'use strict';

angular.module('ratings').directive('focusOnShow', function($timeout) {
    return function(scope, element, attrs) {
       scope.$watch(attrs.focusOnShow, function (newValue) { 
//            console.log('preview changed!')
            $timeout(function() {
                newValue && element[0].focus();
            });
         },true);
      };    
});