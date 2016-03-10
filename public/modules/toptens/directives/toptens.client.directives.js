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
            self.shift = 0;
            self.clicks = 0;
            self.register = function(item) {
                self.items.push(item);
                if([0, 1, 2].indexOf(item.position) > -1) {
                    item.isVisible = true;
                }
            };
            
            function setVisibility() {
                var values = [],
                    check = self.clicks * 3;
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
                    if((self.clicks - 1) < 0) {
                        self.clicks = 0;
                    } else {
                        self.clicks -= 1;
                    }
                    setVisibility();
                } else if (direction === 'right') {
                    if ((self.clicks + 1) < Math.ceil(self.items.length / 3)) {
                        self.clicks += 1;
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
                ctrl.shift = -el.offsetWidth;
                ctrl.itemWidth = el.offsetWidth / 3;
                angular.forEach(ctrl.items, function(item) {
                    item.itemWidth = ctrl.itemWidth;
                });
            }
            listSettings();
            
            window.addEventListener('resize', function(e) {
                if(el.offsetWidth !== Math.abs(ctrl.shift)) {
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
            scope.itemWidth = horizontalListCtrl.itemWidth;
            scope.position = element.index();
            horizontalListCtrl.register(scope);
        }
    };
});