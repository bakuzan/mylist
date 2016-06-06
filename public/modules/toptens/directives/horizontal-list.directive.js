(function() {
  'use strict';
  angular.module('toptens')
  .directive('horizontalList', horizontalList);

   function horizontalList() {
      return {
          restrict: 'A',
          transclude: true,
          require: 'horizontalList',
          scope: {},
          templateUrl: '/modules/toptens/templates/horizontal-list.html',
          bindToController: true,
          controllerAs: 'horizontalList',
          controller: function($scope) {
              var self = this;
              self.clicks = 0;
              self.items = [];
              self.moveItems = moveItems;
              self.register = register;
              self.shift = 0;

              function register(item) {
                  self.items.push(item);
                  if([0, 1, 2].indexOf(item.position) > -1) {
                      item.isVisible = true;
                  }
              }

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

              function moveItems(direction) {
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
              }

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
  }

})();
