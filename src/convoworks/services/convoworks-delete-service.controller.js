/* @ngInject */
export default function ConvoworksDeleteServiceController($scope, $log, $uibModalInstance, AlertService, ConvoworksApi, serviceId)
{
    $scope.localOnly = {
        selected: true
    }

    $scope.delete = function()
    {
        ConvoworksApi.deleteService(serviceId, $scope.localOnly.selected).then(function(report) {
            $uibModalInstance.close(report);
            AlertService.addSuccess('Service successfully deleted.');
        }, function (reason) {
            $log.error(reason);
            AlertService.addDanger('Failed to delete service.');
        });
    };

    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    }
}
