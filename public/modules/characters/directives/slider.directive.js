(function() {
  'use strict';
  angular.module('characters')
  .directive('slider', slider);
  slider.$inject = ['$timeout', '$sce'];

  function slider($timeout, $sce) {
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
          var self = this,
              timer,
              autoSlide;
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

          $scope.$watch('sliderController.currentIndex', function() {
              //  console.log('index', self.currentIndex, 'filtered slides ', $scope.filteredSlides);
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

        },
        link: function(scope, elem, attrs, sliderController) {
            scope.childElementCount = elem[0].childElementCount - 1;
        }
    };

  }

})();
