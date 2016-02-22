'use strict';

angular.module('toptens')
.directive('steps', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        template: '<div class="steps" ng-transclude>' +
                  '</div>'
    };
})
.directive('step', function() {
  return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {
          stepConfig: '='
      },
      templateUrl: '/modules/toptens/templates/step.html',
      link: function(scope, elm, attrs) {
          scope.stepNumber = elm.index() + 1;
          var element = elm[0],
              classList = element.classList;
          
          function classRemove(array) {
              angular.forEach(array, function(item) {
                  classList.remove(item);
              });
          }
          function classAdd(array) {
              angular.forEach(array, function(item) {
                  classList.add(item);
              });
          }
          function setZIndex(number) {
              element.style.zIndex = number;
          }
          
          scope.$watch('stepConfig.currentStep', function(newValue) {
              if (newValue !== undefined) {
                  if (scope.stepNumber === scope.stepConfig.currentStep) {
                      classRemove(['step-transition', 'step-out']);
                      setZIndex(2);
                      classAdd(['step-transition', 'step-in']);
                  } else {
                      classRemove(['step-transition', 'step-in']);
                      setZIndex(1);
                      classAdd(['step-transition', 'step-out']);
                  }
              }
          });
      }
  };  
})
.directive('stepControls', function() {
   return {
       restrict: 'A',
       replace: true,
       transclude: true,
       template: '<div class="step-controls step-button-group padding-5" ng-transclude>' +
                  '</div>'
   };
})
.directive('sticky', function() {
    return {
        restrict: 'A',
        scope: {},
        link: function(scope, element, attrs) {
            
            window.addEventListener('scroll', function (evt) {
                var stickyClass = 'sticky-scroll-top', stickyInnerClass = 'sticky-inner-container',
                    scrollTop = document.body.scrollTop,
                    elm = element[0],
                    inner = elm.children[0],
                    viewportOffset = elm.getBoundingClientRect(),
                    distance_from_top = viewportOffset.top; // This value is your scroll distance from the top

                // The element has scrolled to the top of the page. Set appropriate style.
                if (distance_from_top < 56) {
//                    console.log('top hit : ', distance_from_top);
                    elm.classList.add(stickyClass);
                    inner.classList.add(stickyInnerClass);
                }

                // The element has not reached the top.
                if(distance_from_top > 55 || scrollTop < 10) {
//                    console.log('we are at: ', distance_from_top);
                    elm.classList.remove(stickyClass);
                    inner.classList.remove(stickyInnerClass);
                }
          });
            
        }
    };
})
.directive('horizontalList', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: '/modules/toptens/templates/horizontal-list.html',
        link: function(scope, element, attr) {
            scope.horizontalList = {
                itemWidth: ''
            };
            var el = element[0],
                width = el.offsetWidth,
                shift = width,
                child = el.children[0],
                cWidth = child.offsetWidth,
                style = child.style,
                value = 0;
            scope.horizontalList.itemWidth = shift / 3;
            
            function move(value) {
                style.left = value + 'px';
                console.log('move: ', style.left);
            }
            
            scope.moveItems = function(direction) {
                if(direction === 'left') {
                    if(value !== 0) {
                        value += shift;
                        move(value);
                    }
                } else if (direction === 'right') {
                    value -= shift;
                    move(value);
                }
            };
            
            window.addEventListener('resize', function(e) {
                console.log(el.offsetWidth, width);
                if(el.offsetWidth !== width) {
                    width = el.offsetWidth;
                    shift = width;
                    scope.horizontalList.itemWidth = shift / 3;
                    scope.$apply();
                    console.log('not equal: ', width, shift);
                }
            });
            
        }
    };
})
.directive('horizontalListItem', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        templateUrl: '/modules/toptens/templates/horizontal-list-item.html',
        link: function(scope, element, attr) {
            var el = element[0];
            
        }
    };
});