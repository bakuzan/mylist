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
        require: 'horizontalList',
        scope: {},
        templateUrl: '/modules/toptens/templates/horizontal-list.html',
        bindToController: true,
        controllerAs: 'horizontalList',
        controller: function($scope) {
            var self = this;
            self.items = [];
            self.offset = 0;
            self.register = function(item) {
                self.items.push(item);
                if([0, 1, 2].indexOf(item.position) > -1) {
                    item.isVisible = true;
                }
            };
            
            function setVisibility() {
                var values = [],
                    check = Math.abs(self.offset / $scope.settings.itemWidth);
                for(var i = 0; i < 3; i++) {
                    values.push(check + i);
                }
                angular.forEach(self.items, function(item) {
                    item.isVisible = (values.indexOf(item.position) > -1);
                });
            }
            
            self.moveItems = function(direction) {
                console.log($scope.settings, direction);
                if(direction === 'left') {
                    if(self.offset + $scope.settings.shift > 0) {
                        self.offset = 0;
                    } else {
                        self.offset += $scope.settings.shift;
                    }
                    setVisibility();
                } else if (direction === 'right') {
                    if (Math.abs((self.offset - $scope.settings.shift) / $scope.settings.itemWidth) > self.items.length) {
                        
                    } else {
                        self.offset -= $scope.settings.shift;
                    }
                    setVisibility();
                }
            };
            
        },
        link: function(scope, element, attr, ctrl) {
            var el = element[0],
                child = el.children[0];
            scope.settings = {
                child: child,
                style: child.style,
                value: 0
            };
            
            function listSettings() {
                scope.settings.width = el.offsetWidth;
                scope.settings.shift = scope.settings.width;
                scope.settings.itemWidth = scope.settings.shift / 3;
                angular.forEach(ctrl.items, function(item) {
                    item.itemWidth = scope.settings.itemWidth;
                });
            }
            listSettings();
            
            window.addEventListener('resize', function(e) {
//                console.log(el.offsetWidth, width);
                if(el.offsetWidth !== scope.settings.width) {
                    listSettings();
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
        scope: {},
        templateUrl: '/modules/toptens/templates/horizontal-list-item.html',
        require: '^horizontalList',
        link: function(scope, element, attr, horizontalListCtrl) {
            scope.isVisible = false;
            scope.itemWidth = '33%';
            scope.position = element.index();
            horizontalListCtrl.register(scope);
        }
    };
});