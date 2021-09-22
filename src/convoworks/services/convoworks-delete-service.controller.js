/* @ngInject */
export default function ConvoworksDeleteServiceController($scope, $log, $uibModalInstance, AlertService, ConvoworksApi, serviceId, serviceReleases)
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

    $scope.hasReleases = () => serviceReleases.length > 0;

    $scope.$on('modal.closing', (event, reason, closed) => {
        if (reason === 'escape key press' && $scope.report !== null) {
            $log.log('ConvoworksDeleteServiceController escape key pressed after delete, closing as OK');
            event.preventDefault();
            $scope.ok();
        }
    })

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
