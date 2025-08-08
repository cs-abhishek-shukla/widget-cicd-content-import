/* Copyright start
    MIT License
    Copyright (c) 2025 Fortinet Inc
Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('editCicdContentImport100Ctrl', editCicdContentImport100Ctrl);

  editCicdContentImport100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'widgetUtilityService', '$timeout', '$http', 'API'];

  function editCicdContentImport100Ctrl($scope, $uibModalInstance, config, widgetUtilityService, $timeout, $http, API) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.config = config;
    $scope.templateNames = [
      'Production Content',
      'Development Settings',
      'Production Settings'
    ];

    function _handleTranslations() {
      let widgetNameVersion = widgetUtilityService.getWidgetNameVersion($scope.$resolve.widget, $scope.$resolve.widgetBasePath);

      if (widgetNameVersion) {
        widgetUtilityService.checkTranslationMode(widgetNameVersion).then(function () {
          $scope.viewWidgetVars = {
            // Create your translating static string variables here
            EDIT_VIEW_SELECT_DESCRIPTION: widgetUtilityService.translate('cicdContentImport.EDIT_VIEW_SELECT_DESCRIPTION'),
            EDIT_VIEW_DEFAULT_SELECT_ITEM: widgetUtilityService.translate('cicdContentImport.EDIT_VIEW_DEFAULT_SELECT_ITEM'),
            EDIT_VIEW_SAVE_BTN_LABEL: widgetUtilityService.translate('cicdContentImport.EDIT_VIEW_SAVE_BTN_LABEL'),
            EDIT_VIEW_CLOSE_BTN_LABEL: widgetUtilityService.translate('cicdContentImport.EDIT_VIEW_CLOSE_BTN_LABEL')
          };
        });
      } else {
        $timeout(function () {
          $scope.cancel();
        });
      }
    }

    function init() {
      _handleTranslations();
    }

    init();

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      $uibModalInstance.close($scope.config);
    }

  }
})();
