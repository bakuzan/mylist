(function() {
  'use strict';
  angular.module('characters')
  .directive('removeTag', removeTag);
  removeTag.$inject = ['NotificationFactory'];

   function removeTag(NotificationFactory) {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
              element.bind('click', function(event) {
                  var tag = attrs.removeTag,
                      i,
                      entry_type = scope.whichController;
                  //are you sure option...
                NotificationFactory.confirmation(function() {
                      scope.$apply(function () {
                          var index;
                          if (entry_type === 'character') {
                              for(i=0; i < scope.character.tags.length; i++) {
                                  if (scope.character.tags[i].text === tag) {
                                      index = i;
                                  }
  //                                console.log(index);
                              }
                              scope.$parent.character.tags.splice(index, 1);
                          } else if (entry_type === 'animeitem') {
                              for(i=0; i < scope.animeitem.tags.length; i++) {
                                  if (scope.animeitem.tags[i].text === tag) {
                                      index = i;
                                  }
  //                                console.log(index);
                              }
                              scope.$parent.animeitem.tags.splice(index, 1);
                          } else if (entry_type === 'mangaitem') {
                              for(i=0; i < scope.mangaitem.tags.length; i++) {
                                  if (scope.mangaitem.tags[i].text === tag) {
                                      index = i;
                                  }
  //                                console.log(index);
                              }
                              scope.$parent.mangaitem.tags.splice(index, 1);
                          }
  //                        console.log(index, tag);
                      });
                      NotificationFactory.warning('Deleted!', 'Tag was successfully deleted');
                  });
              });
          }
      };
  }

})();
