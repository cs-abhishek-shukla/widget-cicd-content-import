/* Copyright start
    MIT License
    Copyright (c) 2025 Fortinet Inc
Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('cicdContentImport100Ctrl', cicdContentImport100Ctrl);

  cicdContentImport100Ctrl.$inject = ['$scope', 'widgetUtilityService', '$uibModal', '$http', 'API', 'toaster', '_', 'websocketService', 'FormEntityService', 'CommonUtils'];

  function cicdContentImport100Ctrl($scope, widgetUtilityService, $uibModal, $http, API, toaster, _, websocketService, FormEntityService, CommonUtils) {
    $scope.triggerPlaybook = triggerPlaybook;
    $scope.changeRepository = changeRepository;
    $scope.isPlaybookExecuted = false;
    $scope.isTemplateSelected = false;
    $scope.parent_wf_id = '';
    var subscription;

    $scope.$on('websocket:reconnect', function () {
      initWebsocket();
    });

    function initWebsocket() {
      websocketService.subscribe('runningworkflow', function (data) {
        if (data.parent_wf === 'null') {
          $scope.parent_wf_id = data.instance_ids;
        }
        //do nothing in case of notification recieved from same websocketSession. As it is handled gracefully.
        if (data.sourceWebsocketId !== websocketService.getWebsocketSessionId()) {
          if ($scope.taskId && data.task_id && data.task_id === $scope.taskId && data.parent_wf === 'null') {
            $scope.taskId = undefined;
          }
        }
        if ((data.status === 'failed' || data.status === 'finished with error' || data.status === 'finished') && $scope.pullLatestContentPlaybookTaskID === data.task_id) {
          _getPlaybookResult();
        }
      }).then(function (data) {
        subscription = data;
      });
    }

    $scope.$on('$destroy', function () {
      if (subscription) {
        websocketService.unsubscribe(subscription);
      }
    });

    function _getPlaybookResult() {
      var endpoint = API.WORKFLOW + 'api/workflows/' + $scope.parent_wf_id + '/';
      $http.get(endpoint).then(function (response) {
        if (response.data.status === 'finished') {
          if (subscription) {
            websocketService.unsubscribe(subscription);
          }
          $scope.selectedRepository = null;
          $scope.isTemplateSelected = false;
          $scope.isPlaybookExecuted = false;
          if (!CommonUtils.isUndefined(response.data.result.data) && response.data.result.data.status == "Reviewing") {
            _openWizard(response.data.result.data.uuid);
          }
          else {
            toaster.warning({
              body: "The \"Pull Latest Container\" playbook is currently in an Active/Awaiting state. Please wait for the previous operation to complete."
            });
          }
        } else if (response.data.status === 'finished with error' || response.data.status === 'failed') {
          $scope.selectedRepository = null;
          $scope.isPlaybookExecuted = false;
          $scope.isTemplateSelected = false;
          // _responsePopup(response.data.result);
          toaster.error({
            body: "The \"Pull Latest Container\" playbook has failed. Check the playbook logs for details."
          });
        }
      });
    }

    function triggerPlaybook() {
      $scope.isPlaybookExecuted = true;
      initWebsocket();
      var queryPayload = {
        "request": {
          "selectedRepository": $scope.selectedRepository,
          "record": (FormEntityService.get()).originalData
        }
      };
      var queryUrl = API.MANUAL_TRIGGER + '24963415-4057-4fd5-bbe5-bf7d6bfa059d';
      $http.post(queryUrl, queryPayload).then(function (response) {
        $scope.pullLatestContentPlaybookTaskID = response.data.task_id;
        console.log(response);
      });
    }

    function _handleTranslations() {
      widgetUtilityService.checkTranslationMode($scope.$parent.model.type).then(function () {
        $scope.viewWidgetVars = {
          // Create your translating static string variables here
          VIEW_DEFAULT_SELECT_ITEM: widgetUtilityService.translate('cicdContentImport.VIEW_DEFAULT_SELECT_ITEM'),
          VIEW_APPLY_BTN_LABEL: widgetUtilityService.translate('cicdContentImport.VIEW_APPLY_BTN_LABEL')
        };
      });
    }

    function changeRepository() {
      $scope.isTemplateSelected = true;
    }

    function _openWizard(jobUuid) {
      if (subscription) {
        websocketService.unsubscribe(subscription);
      }
      var templateUrl = 'app/editor/porter/importWizard.html';
      var controller = 'importWizardCtrl';
      var modal = $uibModal.open({
        animation: false,
        templateUrl: templateUrl,
        controller: controller,
        backdrop: 'static',
        windowClass: 'modal-ingestion',
        scope: $scope,
        resolve: {
          jobUuid: function () {
            return jobUuid;
          }
        }
      });
      modal.result.finally(function () {
        $scope.$broadcast('csGrid:refresh', 500);
      });
    }

    function init() {
      _handleTranslations();
    }

    init();
  }
})();
