/* @ngInject */
export default function TestViewController($log, $scope, $stateParams, ConvoworksApi, UserPreferencesService) {
    $log.log('TestViewController initialized');

    let random_slug = Math.floor(Math.random() * 100000);
    let device_id = 'admin-chat-' + random_slug;

    $scope.serviceId = $stateParams.service_id;

    $scope.delegateNlp = null;
    $scope.delegateOptions = [
        {
            label: '---',
            value: null
        }
    ];

    $scope.getDelegateOptions = function () {
        return $scope.delegateOptions
    }

    $scope.initDelegateOptions = function () {
        _initDelegationNlp();
    }

    $scope.getDeviceId = function() {
        return device_id;
    }

    function _initDelegationNlp() {
        $scope.delegateOptions = [
            {
                label: '---',
                value: null
            }
        ];

        ConvoworksApi.loadPlatformConfig($scope.serviceId).then(function (config) {
            $log.log('TestViewController got config', config);

            if (config.amazon && config.amazon.mode === "auto") {
                $scope.delegateOptions.push({
                    label: 'Amazon',
                    value: 'amazon'
                })
            }

            if (config.dialogflow && config.dialogflow.mode === "auto") {
                $scope.delegateOptions.push({
                    label: 'Dialogflow',
                    value: 'dialogflow'
                })
            }

            const selectedDelegate = UserPreferencesService.get('delegateNlp-' + $scope.serviceId, undefined, true);

            if (selectedDelegate === undefined && $scope.delegateOptions.length === 1) {
                $scope.delegateNlp = $scope.delegateOptions[0].value;
            }

        }).catch(function (reason) {
            throw new Error(reason.data.message)
        });
    }
}