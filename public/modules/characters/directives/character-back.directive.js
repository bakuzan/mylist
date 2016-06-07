(function() {
  'use strict';
  angular.module('characters')
  .directive('characterBack', characterBack);

   function characterBack(){
      return function(scope, element, attrs){
          var url = attrs.characterBack;
          element.css({
              'background-image': 'url(' + url +')',
              'background-size' : 'cover',
              'background-repeat': 'no-repeat',
              'background-position': 'center'
          });
      };
  }

})();
