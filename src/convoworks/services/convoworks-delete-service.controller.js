/* @ngInject */
export default function ConvoworksDeleteServiceController($scope, $log, $uibModalInstance, AlertService, ConvoworksApi, serviceId)
{
    $scope.localOnly = {
        selected: true
    }

    $scope.report = null;

    $scope.delete = function()
    {
        ConvoworksApi.deleteService(serviceId, $scope.localOnly.selected).then(function(report) {
            // $uibModalInstance.close(report);

            $scope.report = report;

            // AlertService.addSuccess('Service successfully deleted.');
        }, function (reason) {
            $log.error(reason);
            AlertService.addDanger('Failed to delete service.');
        });
    };

    $scope.shouldShow = function(section)
    {
        return section && !Array.isArray(section);
    }

    $scope.fixName = function(name)
    {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    $scope.cancel = function()
    {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.ok = function()
    {
        $uibModalInstance.close($scope.report);
    }
}
