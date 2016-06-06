(function() {
  'use strict';
  angular.module('toptens').controller('statisticsTopten', statisticsTopten);
  statisticsTopten.$inject = ['$scope','$uibModalInstance','list', 'CharacterService'];

   function statisticsTopten($scope, $uibModalInstance, list, CharacterService) {
     var ctrl = this;

     ctrl.cancel = cancel;
     ctrl.list = list;
     ctrl.toptenInfo = {
       tags: [],
       series: []
     };

     function process() {
       var listType = ctrl.list.type + 'List';
       ctrl.toptenInfo.tags = CharacterService.buildCharacterTags(ctrl.list[listType]);
       if(ctrl.list.type === 'character') {
         ctrl.toptenInfo.series = CharacterService.buildSeriesList(ctrl.list[listType]);
       }
     }
     process();

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }
  }

})();
