/* @ngInject */
export default function TestViewController($log, $scope, $q, $stateParams, ConvoworksApi, UserPreferencesService, StringService) {
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

    _init();

    $scope.onNlpDelegateUpdated = () => {
        $log.log('TestViewController NLP delegate changed', $scope.delegateNlp);

        UserPreferencesService.registerData(`delegateNlp_${$scope.serviceId}`, $scope.delegateNlp);

        $scope.regenerateDeviceId();
    }

    $scope.$watch('toggleDebug', function (newVal) {
        UserPreferencesService.registerData(`toggleDebug_${$scope.serviceId}`, newVal);
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

    $scope.getDeviceId = function () {
        return device_id;
    }

    function _init() {
        const all = [
            UserPreferencesService.getData(`delegateNlp_${$scope.serviceId}`),
            UserPreferencesService.getData(`toggleDebug_${$scope.serviceId}`)
        ];

        $q.all(all).then(([delegateNlp, toggleDebug]) => {
            $log.log('TestViewController _init() all', delegateNlp, toggleDebug);
            let defaultDelegateNlp = $scope.delegateNlp;

            if (delegateNlp) {
                defaultDelegateNlp = delegateNlp;
            }

            $log.log('TestViewController defaultDelegateNlp', delegateNlp);
            $scope.delegateNlp = defaultDelegateNlp;

            $scope.toggleDebug = toggleDebug || false;
        }, (reason) => {
            $log.error(reason);
        }).finally(() => {
            $log.log('TestViewController _init() finally');
        })
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

            const selectedDelegate = UserPreferencesService.get(`delegateNlp_${$scope.serviceId}`, undefined, true);

            if (selectedDelegate === undefined && $scope.delegateOptions.length === 1) {
                $scope.delegateNlp = $scope.delegateOptions[0].value;
            }

        }).catch(function (reason) {
            throw new Error(reason.data.message)
        });
    }
}