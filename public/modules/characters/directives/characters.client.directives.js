'use strict';

angular.module('characters').directive('characterBack', function(){
    return function(scope, element, attrs){
        var url = attrs.characterBack;
        element.css({
            'background-image': 'url(' + url +')',
            'background-size' : '100%',
            'background-repeat': 'no-repeat',
            'background-position': 'center'
        });
    };
})
//.directive('disableNgAnimate', ['$animate', function($animate) {
//  return {
//    restrict: 'A',
//    link: function(scope, element) {
//      $animate.enabled(false, element);
//    }
//  };
//}])
.directive('slider', ['$timeout', '$sce', function($timeout, $sce) {
  return {
      restrict: 'AE',
      replace: true,
      scope: {
          slides: '=?'
      },
      templateUrl: '/modules/characters/templates/slider.html',
      link: function(scope, elem, attrs) {
          var timer, autoSlide, length = elem[0].childElementCount - 1;
          scope.repeater = scope.slides === undefined ? false : true; //is there a collection to iterate through?
          scope.currentIndex = 0; //inital slide.
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
              if (scope.currentIndex !== slide) {
                  //reached end of slides?
                  if (slide !== scope.slides.length) {
                    scope.currentIndex = slide;
                  } else {
                    scope.currentIndex = 0;
                  }
              } else {
                  if (scope.slides[scope.currentIndex].locked) {
                    //unlock, i.e start timer.
                    scope.slides[scope.currentIndex].locked = false;
                  } else {
                    //lock, i.e. cancel timer.
                    scope.slides[scope.currentIndex].locked = true;
                    $timeout.cancel(timer);
                  }
              }
          };
          
          scope.$watch('currentIndex', function() {
            scope.slides.forEach(function(slide) {
                slide.visible = false; // make every slide invisible
                slide.locked = false; // make every slide unlocked
            });
            scope.slides[scope.currentIndex].visible = true; // make the current slide visible
          });
          
          autoSlide = function() {
              timer = $timeout(function() {
                  var next = scope.currentIndex + 1;
                  scope.goToSlide(next);
                  timer = $timeout(autoSlide, 3000);
              }, 3000);
          };
          autoSlide();
          scope.$on('$destroy', function() {
              $timeout.cancel(timer); // when the scope is destroyed, cancel the timer
          });
          
          //Stop timer on enter.
          elem.bind('mouseenter', function() {
              if (scope.slides[scope.currentIndex].locked === false) {
                $timeout.cancel(timer);
              }
          });
          //Restart timer on leave.
          elem.bind('mouseleave', function() {
              if (scope.slides[scope.currentIndex].locked === false) {
                timer = $timeout(autoSlide, 3000);
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
                scope.searchTags = '';
                scope.characterTags = '';
                scope.tagsForFilter = [];
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
                    var index = scope.tagsForFilter.indexOf(tag);
//                    console.log(tag, index);
                    scope.$parent.searchTags = scope.searchTags.replace(tag + ',', '');
                    scope.$parent.tagsForFilter.splice(index, 1);
//                    console.log(scope.searchTags, scope.tagsForFilter);
                });
            });
        }
    };
})
.directive('dropTag', ['$window', function($window) {
    return function(scope, element, attrs) {
        element.bind('click', function(event) {    
            var text = attrs.dropTag;
            var removal = $window.confirm('Are you sure you don\'t want to add this tag?');
            if (removal) {
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
            }
        });
    };
}])
.directive('removeTag', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('click', function(event) {
                var tag = attrs.removeTag;
                var i;
                var entry_type = scope.whichController;
                var removal = $window.confirm('Are you sure you want to remove this tag from the entry?');
                if (removal) {
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
                }
            });
        }
    };
}]);