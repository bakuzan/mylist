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
          interval: '=?',
          filterConfig: '=?'
      },
      bindToController: true,
      controllerAs: 'sliderController',
      templateUrl: '/modules/characters/templates/slider.html',
      controller: function($scope) {
        var self = this, timer, autoSlide;
        console.log('slider ctrl: ', $scope);
        self.currentIndex = -1; //pre-first slide to stop 'cannot assign to undefined' error.
        self.enter = enter;
        self.goToSlide = goToSlide;
        self.interval = self.interval === undefined ? 3000 : self.interval; //is there a custom interval?
        self.isFullscreen = false;
        self.leave = leave;
        self.next = next;
        self.prev = prev;
        self.repeater = self.slides === undefined ? false : true; //is there a collection to iterate through?
        self.toggleFullscreen = toggleFullscreen;
        self.trustAsResourceUrl = trustAsResourceUrl;

        //allow retreival of local resource
        function trustAsResourceUrl(url) {
            return $sce.trustAsResourceUrl(url);
        }

        //if no collection, make a dummy collection to cycle throught the children.
        if (!self.repeater) {
          self.slides = []; //used to allow cycling.
          for(var i = 0; i < length; i++) {
              self.slides.push({ index: i });
          }
        }
        function goToSlide(slide) {
//              console.log('go to', slide);
            if (self.currentIndex !== slide) {
                //reached end of slides?
                if (slide !== $scope.filteredSlides.length) {
                  self.currentIndex = slide;
                } else {
                  self.currentIndex = 0;
                }
            } else {
                if ($scope.filteredSlides[self.currentIndex].locked) {
                  //unlock, i.e start timer.
                  $scope.filteredSlides[self.currentIndex].locked = false;
                    autoSlide();
                } else {
                  //lock, i.e. cancel timer.
                  $scope.filteredSlides[self.currentIndex].locked = true;
                  $timeout.cancel(timer);
                }
            }
        }

        function next() {
            if (self.currentIndex < $scope.filteredSlides.length - 1) {
                self.currentIndex += 1;
            } else {
                self.currentIndex = 0;
            }
        }

        function prev() {
            if (self.currentIndex > 0) {
                self.currentIndex -= 1;
            } else {
                self.currentIndex = $scope.filteredSlides.length - 1;
            }
        }

        $scope.$watch('currentIndex', function() {
//              console.log('index', self.currentIndex, 'filtered slides ', self.filteredSlides);
            if (self.currentIndex > -1 && $scope.filteredSlides.length > 0) {
                  $scope.filteredSlides.forEach(function(slide) {
                      slide.visible = false; // make every slide invisible
                      slide.locked = false; // make every slide unlocked
                  });
                  $scope.filteredSlides[self.currentIndex].visible = true; // make the current slide visible
            }
        });

        autoSlide = function() {
            timer = $timeout(function() {
                self.next();
                timer = $timeout(autoSlide, self.interval);
            }, self.interval);
        };
        autoSlide();
        $scope.$on('$destroy', function() {
            $timeout.cancel(timer); // when the scope is destroyed, cancel the timer
        });

        //Stop timer on enter.
        function enter() {
//              console.log('entered');
            if ($scope.filteredSlides[self.currentIndex].locked !== true) {
              $timeout.cancel(timer);
//                  console.log('cancelled');
            }
        }
        //Restart timer on leave.
        function leave() {
//              console.log('left');
            if ($scope.filteredSlides[self.currentIndex].locked !== true) {
              timer = $timeout(autoSlide, self.interval);
//                  console.log('restarted');
            }
        }

        //Fullscreen capability
        function toggleFullscreen() {
            self.isFullscreen = !self.isFullscreen;
        }

        /** FILTERS
         *    Code below here will allow the slides to be affected by the character filters.
         *    Note: the interval is removed and replaced to avoid the auto-slide fouling the
         *            change over up.
         */
        $scope.$watch('self.filterConfig.search', function(newValue) {
            if (self.filterConfig.search !== undefined) {
                var temp = self.interval;
                self.interval = null;
                self.search = newValue;
                self.interval = temp;
            }
        });
        $scope.$watch('self.filterConfig.media', function(newValue) {
            if (self.filterConfig.media !== undefined) {
                var temp = self.interval;
                self.interval = null;
                self.media = newValue;
                self.interval = temp;
            }
        });
        $scope.$watch('self.filterConfig.seriesFilter', function(newValue) {
            if (self.filterConfig.seriesFilter !== undefined) {
                var temp = self.interval;
                self.interval = null;
                self.seriesFilter = newValue;
                self.interval = temp;
            }
        });
        $scope.$watch('self.filterConfig.searchTags', function(newValue) {
            if (self.filterConfig.media !== undefined) {
                var temp = self.interval;
                self.interval = null;
                self.searchTags = newValue;
                self.interval = temp;
            }
        });

      },
      link: function(scope, elem, attrs, sliderController) {
          scope.childElementCount = elem[0].childElementCount - 1;
          console.log('slider link: ', scope, sliderController);
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
}]);
