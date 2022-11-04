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

    function _initializeOptions() {
        let initial_delegate = null;

        if (UserPreferencesService.isSet(`delegateNlp_${$scope.serviceId}`))
        {
            initial_delegate = UserPreferencesService.get(`delegateNlp_${$scope.serviceId}`, null);
        }
        else
        {
            $log.log('TestViewController no previously set NLP delegate, checking options', $scope.delegateOptions);
            if ($scope.delegateOptions.length > 1)
            {
                initial_delegate = $scope.delegateOptions.find(d => d.value !== null).value;
                $log.log('TestViewController delegateNlp set to', initial_delegate);
            }
        }

        $scope.delegateNlp = initial_delegate;

        $scope.toggleDebug = UserPreferencesService.get(`toggleDebug_${$scope.serviceId}`, false);
        $log.log('TestViewController _init() finished');
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

            if (config.dialogflow_es && config.dialogflow_es.mode === "auto") {
                $scope.delegateOptions.push({
                    label: 'Dialogflow ES',
                    value: 'dialogflow_es'
                })
            }

            if (config.dialogflow && config.dialogflow.mode === "auto") {
                $scope.delegateOptions.push({
                    label: 'Dialogflow',
                    value: 'dialogflow'
                })
            }
        }, (reason) => {
            AlertService.addDanger(reason.data.message);
        }).finally(() => {
            _initializeOptions();
        });
    }
}
