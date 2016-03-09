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
        bindToController: 'horizontalList',
        controller: function($scope) {
            var self = this;
            self.items = [];
            
            self.register = function(item) {
                self.items.push(item);
                if([0, 1, 2].indexOf(item.position) > -1) {
                    item.isVisible = true;
                }
            };
            
            function setVisibility() {
                var values = [],
                    check = Math.abs($scope.horizontalList.offset / $scope.horizontalList.itemWidth);
                for(var i = 0; i < 3; i++) {
                    values.push(check + i);
                }
                angular.forEach(self.items, function(item) {
                    item.isVisible = (values.indexOf(item.position) > -1);
                });
            }
            
            function move(value) {
                $scope.horizontalList.style.left = value + 'px';
                $scope.horizontalList.offset = value;
                setVisibility();
            }
            
            self.moveItems = function(direction) {
                if(direction === 'left') {
                    if($scope.horizontalList.value !== 0) {
                        $scope.horizontalList.value += $scope.horizontalList.shift;
                        move(value);
                    }
                } else if (direction === 'right') {
                    $scope.horizontalList.value -= $scope.horizontalList.shift;
                    move($scope.horizontalList.value);
                }
            };
            
        },
        link: function(scope, element, attr) {
            scope.horizontalList = {
                el: element[0],
                child: element.children[0],
                cWidth: element.children[0].offsetWidth,
                style: element.children[0].style,
                value: 0
            };
            scope.horizontalList.width = scope.horizontalList.el.offsetWidth;
            scope.horizontalList.shift = scope.horizontalList.width;
            scope.horizontalList.itemWidth = scope.horizontalList.shift / 3;
            console.log(scope);
            
            window.addEventListener('resize', function(e) {
//                console.log(el.offsetWidth, width);
                if(el.offsetWidth !== scope.horizontalList.width) {
                    scope.horizontalList.width = scope.horizontalList.el.offsetWidth;
                    scope.horizontalList.shift = scope.horizontalList.width;
                    scope.horizontalList.itemWidth = scope.horizontalList.shift / 3;
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
        require: '^horizontalList',
        link: function(scope, element, attr, horizontalListCtrl) {
            scope.isVisible = false;
            scope.position = element.index();
            horizontalListCtrl.register(scope);
        }
    };
});