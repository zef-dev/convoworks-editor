/* @ngInject */
export default function ConvoworksDeleteServiceController($scope, $log, $uibModalInstance, ConvoworksApi, serviceId)
{
    $scope.localOnly = {
        selected: true
    }

    $scope.delete = function()
    {
        ConvoworksApi.deleteService(serviceId, $scope.localOnly.selected).then(function(report) {
            $uibModalInstance.close(report);
        });
    };

    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    }
}
