(function() {
  'use strict';
  angular.module('core')
  .directive('formatDate', formatDate);
   function formatDate(){
    return {
     require: 'ngModel',
      link: function(scope, elem, attr, modelCtrl) {
        modelCtrl.$formatters.push(function(modelValue){
          return (modelValue === null) ? null : new Date(modelValue);
        });
      }
    };
  }

})();
