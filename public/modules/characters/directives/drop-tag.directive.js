(function() {
  'use strict';
  angular.module('characters')
  .directive('dropTag', dropTag);
  dropTag.$inject = ['NotificationFactory'];

   function dropTag(NotificationFactory) {
      return function(scope, element, attrs) {
          element.bind('click', function(event) {
              var text = attrs.dropTag;
               //are you sure option...
              NotificationFactory.confirmation(function() {
                  scope.$apply(function() {
                      var deletingItem = scope.tagArray;
                      scope.$parent.tagArray = [];
  //                    console.log('dropping tag - ', text);
                      //update the complete task.
                      angular.forEach(deletingItem, function(tag) {
                          if (tag.text !== text) {
                              scope.$parent.tagArray.push(tag);
                          }
                      });
                  });
                  NotificationFactory.warning('Dropped!', 'Tag was successfully dropped');
              });
          });
      };
  }

})();
