'use strict';

angular.module('characters').directive('characterBack', function(){
    return function(scope, element, attrs){
        var url = attrs.characterBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover',
            'background-repeat': 'no-repeat',
            'background-position': 'center'
        });
    };
})
.directive('disableNgAnimate', ['$animate', function($animate) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      $animate.enabled(false, element);
    }
  };
}])
.directive('slider', ['$timeout', '$sce', function($timeout, $sce) {
  return {
      restrict: 'AE',
      replace: true,
      scope: {
          slides: '=?',
          interval: '=?'
      },
      templateUrl: '/modules/characters/templates/slider.html',
      link: function(scope, elem, attrs) {
          var timer, autoSlide, length = elem[0].childElementCount - 1;
          scope.currentIndex = -1; //pre-first slide to stop 'cannot assign to undefined' error.
          scope.repeater = scope.slides === undefined ? false : true; //is there a collection to iterate through?
          scope.interval = scope.interval === undefined ? 3000 : scope.interval; //is there a custom interval?
          
          //allow retreival of local resource
          scope.trustAsResourceUrl = function(url) {
              return $sce.trustAsResourceUrl(url);
          };
          
          //if no collection, make a dummy collection to cycle throught the children.
          if (!scope.repeater) {
            scope.slides = []; //used to allow cycling.
            for(var i = 0; i < length; i++) {
                scope.slides.push({ index: i });
            }
          }
          scope.goToSlide = function(slide) {
//              console.log('go to', slide);
              if (scope.currentIndex !== slide) {
                  //reached end of slides?
                  if (slide !== scope.filteredSlides.length) {
                    scope.currentIndex = slide;
                  } else {
                    scope.currentIndex = 0;
                  }
              } else {
                  if (scope.filteredSlides[scope.currentIndex].locked) {
                    //unlock, i.e start timer.
                    scope.filteredSlides[scope.currentIndex].locked = false;
                  } else {
                    //lock, i.e. cancel timer.
                    scope.filteredSlides[scope.currentIndex].locked = true;
                    $timeout.cancel(timer);
                  }
              }
          };
          scope.next = function() {
              if (scope.currentIndex < scope.filteredSlides.length - 1) {
                  scope.currentIndex += 1;
              } else {
                  scope.currentIndex = 0;
              }
          };
          scope.prev = function() {
              if (scope.currentIndex > 0) {
                  scope.currentIndex -= 1;
              } else {
                  scope.currentIndex = scope.filteredSlides.length - 1;
              }
          };
          
          scope.$watch('currentIndex', function() {
//              console.log('index', scope.currentIndex, 'filtered slides ', scope.filteredSlides);
              if (scope.currentIndex > -1) {
                    scope.filteredSlides.forEach(function(slide) {
                        slide.visible = false; // make every slide invisible
                        slide.locked = false; // make every slide unlocked
                    });
                    scope.filteredSlides[scope.currentIndex].visible = true; // make the current slide visible
              }
          });
          
          autoSlide = function() {
              timer = $timeout(function() {
                  scope.next();
                  timer = $timeout(autoSlide, scope.interval);
              }, scope.interval);
          };
          autoSlide();
          scope.$on('$destroy', function() {
              $timeout.cancel(timer); // when the scope is destroyed, cancel the timer
          });
          
          //Stop timer on enter.
          scope.enter = function() {
//              console.log('entered');
              if (scope.filteredSlides[scope.currentIndex].locked !== true) {
                $timeout.cancel(timer);
//                  console.log('cancelled');
              }
          };
          //Restart timer on leave.
          scope.leave = function() {
//              console.log('left');
              if (scope.filteredSlides[scope.currentIndex].locked !== true) {
                timer = $timeout(autoSlide, scope.interval);
//                  console.log('restarted');
              }
          };
          
          /** FILTERS
           *    Code below here will allow the slides to be affected by the character filters.
           *    Note: the interval is removed and replaced to avoid the auto-slide fouling the
           *            change over up.
           */
          scope.$watch('$parent.filterConfig.search', function(newValue) {
              if (scope.$parent.filterConfig.search !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.search = newValue;
                  scope.interval = temp;
              }
          });
          scope.$watch('$parent.filterConfig.media', function(newValue) {
              if (scope.$parent.filterConfig.media !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.media = newValue;
                  scope.interval = temp;
              }
          });
          scope.$watch('$parent.filterConfig.seriesFilter', function(newValue) {
              if (scope.$parent.filterConfig.seriesFilter !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.seriesFilter = newValue;
                  scope.interval = temp;
              }
          });
          scope.$watch('$parent.filterConfig.searchTags', function(newValue) {
              if (scope.$parent.filterConfig.media !== undefined) {
                  var temp = scope.interval;
                  scope.interval = null;
                  scope.searchTags = newValue;
                  scope.interval = temp;
              }
          });
      }
  };
    
}])
.directive('enterTag', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.enterTag);
                    });
                    event.preventDefault();
                 }
            });
        }
    };
})
.directive('clearTagValues', function() {
    return function (scope, element, attrs) {
        element.bind('click', function(event) {
//            console.log('clear tags');
            scope.$apply(function() {
                scope.filterConfig.searchTags = '';
                scope.filterConfig.characterTags = '';
                scope.filterConfig.tagsForFilter = [];
            });
        });
    };
}) 
.directive('deleteSearchTag', function() {
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
})
.directive('dropTag', ['NotificationFactory', function(NotificationFactory) {
    return function(scope, element, attrs) {
        element.bind('click', function(event) {    
            var text = attrs.dropTag;
             //are you sure option...
            swal({
                title: 'Are you sure?', 
                text: 'Are you sure that you want to drop this tag?', 
                type: 'warning',
                showCancelButton: true,
                closeOnConfirm: true,
                confirmButtonText: 'Yes, delete it!',
                confirmButtonColor: '#ec6c62'
            }, function() {
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
}])
.directive('removeTag', ['NotificationFactory', function(NotificationFactory) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                var tag = attrs.removeTag,
                    i,
                    entry_type = scope.whichController;
                //are you sure option...
                swal({
                    title: 'Are you sure?', 
                    text: 'Are you sure that you want to delete this tag?', 
                    type: 'warning',
                    showCancelButton: true,
                    closeOnConfirm: true,
                    confirmButtonText: 'Yes, delete it!',
                    confirmButtonColor: '#ec6c62'
                }, function() {
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
}]);