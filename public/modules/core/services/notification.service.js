(function() {
  'use strict';
  angular.module('core')
  .factory('NotificationFactory', NotificationFactory);

   function NotificationFactory() {
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
}

})();
