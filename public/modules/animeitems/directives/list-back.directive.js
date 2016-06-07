(function() {
  'use strict';
  angular.module('animeitems')
  .directive('listBack', listBack);
   function listBack() {
      return function(scope, element, attrs){
          var url = attrs.listBack;
          element.css({
              'background-image': 'url(' + url +')',
              'background-size' : '50%',
              'background-repeat': 'no-repeat',
              'background-position': 'right'
          });
      };
  }

})();
