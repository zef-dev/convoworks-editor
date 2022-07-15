/* @ngInject */
export default function TestViewController($log, $scope, $stateParams, ConvoworksApi, UserPreferencesService, StringService) {
    $log.log('TestViewController initialized');

    let device_id = `admin-chat-${StringService.generateUUIDV4()}`;

    $scope.serviceId = $stateParams.service_id;

    $scope.delegateNlp = null;
    $scope.delegateOptions = [
        {
            label: '---',
            value: null
        }
    ];

    $scope.$watch('delegateNlp', (newVal, oldVal) => {
        $log.log('TestViewController delegateNlp changed to', newVal, 'from', oldVal);

        if (newVal && newVal !== oldVal) {
            $scope.regenerateDeviceId();
        }
    });

    $scope.getDelegateOptions = function () {
        return $scope.delegateOptions;
    }

    $scope.initDelegateOptions = function () {
        _initDelegationNlp();
    }

    $scope.regenerateDeviceId = () => {
        $log.log('TestViewController regenerating device ID');
        device_id = `admin-chat-${StringService.generateUUIDV4()}`;
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