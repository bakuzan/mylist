'use strict';

angular.module('toptens')
.directive('steps', function() {
    return {
        restrict: 'A',
        replace: true,
        transclude: true,
        scope: {
            stepConfig: '='
        },
        template: '<div class="steps" ng-transclude>' +
                  '</div>',
        bindToController: 'steps',
        controller: function($scope) {
            console.log($scope);
            var self = this;
            self.steps = [];
            
            self.register = function(step) {
                self.steps.push(step);
                if(step.stepNumber === 1) {
                    step.active = true;
                }
            };
            
            $scope.$watch('stepConfig.currentStep', function(newValue) {
                if (newValue !== undefined) {
                    angular.forEach(self.steps, function(step) {
                        if(step.stepNumber !== newValue) {
                            step.active = false;
                        } else {
                            step.active = true;
                        }
                    });
                }
            });
            
        }
    };
})
.directive('step', function() {
  return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope: {},
      require: '^steps',
      templateUrl: '/modules/toptens/templates/step.html',
      link: function(scope, elm, attrs, stepsController) {
          scope.active = false;
          scope.stepNumber = elm.index() + 1;
          stepsController.register(scope);
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
                itemWidth: '',
                offset: 0
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
                scope.horizontalList.offset = value;
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
            var position = element.index();
            
            function setVisibility() {
                var values = [],
                    check = Math.abs(scope.$parent.horizontalList.offset / scope.$parent.horizontalList.itemWidth);
                for(var i = 0; i < 3; i++) {
                    values.push(check + i);
                }
                scope.isVisible = (values.indexOf(position) > -1);
            }
            
            scope.$watch('horizontalList.offset', function(newValue) {
                if(newValue !== undefined) {
                    setVisibility();
                }
            });
            
            scope.$watch('horizontalList.itemWidth', function(newValue) {
                if(newValue !== undefined) {
                    setVisibility();
                }
            });
            
        }
    };
});