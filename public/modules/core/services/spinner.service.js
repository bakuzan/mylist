(function() {
  'use strict';
  angular.module('core')
  .factory('spinnerService', SpinnerService);
  SpinnerService.$inject = ['$q'];
   function SpinnerService($q) {
    var spinners = {},
        queue = {},
        loads = {};

      return {
          spinners: spinners,
        // private method for spinner registration.
        _register: function (data) {
            if (!data.hasOwnProperty('name')) {
                throw new Error('Spinner must specify a name when registering with the spinner service.');
            }
            if (spinners.hasOwnProperty(data.name)) {
                throw new Error('A spinner with the name \'' + data.name + '\' has already been registered.');
            }
            spinners[data.name] = data;
            // Increase the spinner count.
            this.count++;

            // Check if spinnerId was in the queue, if so then fire the
            // queued function.
            if (queue[data.name]) {
    //            console.log(queue, loads);
                if(loads[data.name]) {
    //                console.log(loads[data.name]);
                    this[queue[data.name]](data.name, loads[data.name]);
                    delete loads[data.name];
                    delete queue[data.name];
                } else {
    //                console.log('queued', queue);
                    this[queue[data.name]](data.name);
                    delete queue[data.name];
                }
            }
    //        console.log(spinners);
        },
        _unregister: function (name) {
          if (spinners.hasOwnProperty(name)) {
            delete spinners[name];
          }
        },
        loading: function (name, optionsOrPromise) {
            if (!this.spinners[name]) {
                queue[name] = 'loading';
                loads[name] = optionsOrPromise;
    //            console.log('defer', loads[name]);
                return;
            }
            var spinner = spinners[name];
            spinner.show(name);
            optionsOrPromise = optionsOrPromise || {};

            //Check if it's promise
            if (optionsOrPromise.always || optionsOrPromise['finally']) {
                optionsOrPromise = {
                    promise: optionsOrPromise
                };
            }

            var options = angular.extend({}, optionsOrPromise);

            if (options.promise) {
                if (options.promise.always) {
                    options.promise.always(function () {
                        spinner.hide(name);
                    });
                } else if (options.promise['finally']) {
                    options.promise['finally'](function () {
                        spinner.hide(name);
                    });
                }
            }
        },
        show: function (name) {
    //        console.log('show');
            if (!this.spinners[name]) {
                queue[name] = 'show';
                return;
            }
          var spinner = spinners[name];
          if (!spinner) {
            throw new Error('No spinner named \'' + name + '\' is registered.');
          }
          spinner.show();
        },
        hide: function (name) {
    //        console.log('hide');
            if (!this.spinners[name]) {
                queue[name] = 'hide';
                return;
            }
          var spinner = spinners[name];
          if (!spinner) {
            throw new Error('No spinner named \'' + name + '\' is registered.');
          }
          spinner.hide();
        },
        toggle: function (name) {
    //        console.log('toggle');
            if (!this.spinners[name]) {
                queue[name] = 'toggle';
                return;
            }
          var spinner = spinners[name];
          if (!spinner) {
            throw new Error('No spinner named \'' + name + '\' is registered.');
          }
          spinner.toggle();
        },
        count: 0
      };

  }

})();
