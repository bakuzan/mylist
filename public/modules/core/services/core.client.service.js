'use strict';

//Service to provide common access to features.
angular.module('core')
.factory('NotificationFactory', function() {
    var self = this;
    /*global swal */
    /*global toastr */
        toastr.options = {
                'closeButton': false,
                'debug': false,
                'newestOnTop': false,
                'progressBar': false,
                'positionClass': 'toast-bottom-right',
                'preventDuplicates': false,
                'onclick': null,
                'showDuration': '300',
                'hideDuration': '1000',
                'timeOut': '5000',
                'extendedTimeOut': '1000',
                'showEasing': 'swing',
                'hideEasing': 'linear',
                'showMethod': 'fadeIn',
                'hideMethod': 'fadeOut'
            };
    return {
        success: function (title, text) {
            toastr.success(text, title, 'Success');
        },
        warning: function (title, text) {
            toastr.warning(text, title, 'Warning');
        },
        error: function (title, text) {
            toastr.error(text, title, 'Error');
        },
        popup: function (title, text, type) {
            swal({ 
                title: title,
                text: text,
                type: type
            });
        },
        confirmation: function (thenDo) {
              //are you sure option...
            swal({
                title: 'Are you sure?', 
                text: 'Are you sure that you want to delete this?', 
                type: 'warning',
                showCancelButton: true,
                closeOnConfirm: true,
                confirmButtonText: 'Yes, delete it!',
                confirmButtonColor: '#ec6c62'
            }, thenDo);
        }
    };
})
.factory('spinnerService', ['$q', function($q) {
var spinners = {},
    queue = {}, 
    loads = {};
    
    function process(func) {
        return $q(function(resolve, reject) {
            resolve(func());
        });
    }
    
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
            console.log(queue, loads);
            if(loads[data.name]) {
                console.log(loads[data.name]);
                this[queue[data.name]](data.name, loads[data.name]);
                delete loads[data.name];
                delete queue[data.name];
            } else {
                console.log('queued', queue);
                this[queue[data.name]](data.name);
                delete queue[data.name];
            }
        }
        console.log(spinners);
    },
    _unregister: function (name) {
      if (spinners.hasOwnProperty(name)) {
        delete spinners[name];
      }
    },
    loading: function (name, func) {
        if (!this.spinners[name]) {
            queue[name] = 'loading';
            loads[name] = func;
            console.log('defer', loads[name]);
            return;
        }
        var spinner = spinners[name];
        console.log(name, func, spinners);
        spinner.show();
        console.log('loading: ', func, name);
        process(func).then(function(result) {
            spinner.hide(name);
            console.log('finsihed: ', result, name);
        });
    },
    show: function (name) {
        console.log('show');
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
        console.log('hide');
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
        console.log('toggle');
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
}]);