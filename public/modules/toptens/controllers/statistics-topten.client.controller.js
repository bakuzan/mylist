angular.module('toptens').controller('statisticsTopten', ['$scope','$uibModalInstance','list', 'CharacterService',
 function ($scope, $uibModalInstance, list, CharacterService) {
   var self = this;
   self.list = list;
   self.toptenInfo = {
     listType: '',
     tags: [],
     series: []
   };

   self.process = function() {
     self.toptenInfo.listType = self.list.type + 'List';
     self.toptenInfo.tags = CharacterService.buildCharacterTags(self.list[listType]);
     self.toptenInfo.series = CharacterService.buildSeriesList(self.list[listType]);
   };

  self.ok = function () {
    $uibModalInstance.close();
  };

  self.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);
