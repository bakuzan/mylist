(function() {
  'use strict';
  angular.module('characters')
  .directive('deleteSearchTag', deleteSearchTag);

  function deleteSearchTag() {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
              element.bind('click', function(event) {
                  scope.$apply(function() {
                      var tag = attrs.deleteSearchTag;
                      var index = scope.filterConfig.tagsForFilter.indexOf(tag);
  //                    console.log(tag, index);
                      scope.filterConfig.searchTags = scope.filterConfig.searchTags.replace(tag + ',', '');
                      scope.filterConfig.tagsForFilter.splice(index, 1);
  //                    console.log(scope.searchTags, scope.tagsForFilter);
                  });
              });
          }
      };
  }

})();
