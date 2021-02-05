import template from './config-viber-editor.tmpl.html';

/* @ngInject */
export default function configConvoChatEditor($log, $q, $rootScope, $window, ConvoworksApi, LoginService, AlertService) {
    return {
        restrict: 'E',
        scope: { service: '=' },
        template,
        controller: function ($scope) {
            'ngInject';
        },
        link ($scope, $element, $attributes) {

            let user    =   null;

            LoginService.getUser().then( function ( u) {
                user = u;
            });

            $scope.config = {
                delegateNlp: null,
                account_id: null,
                auth_token: null,
                event_types: []
            };

            $scope.intentNlps  =   [
                {
                    label: '---',
                    value: null
                }
            ];

            let configBak   =   angular.copy( $scope.config);
            let is_new      =   true;
            let is_error    =   false;

            _load();
            _initIntentNlps();

            $scope.getIntentNlps    = function () {
                return $scope.intentNlps;
            }

            $scope.isNew    = function () {
                return is_new;
            }

            $scope.gotoConfigUrl = function() {
                $window.open('https://partners.viber.com/account/' + $scope.config.account_id + '/info', '_blank');
            }

            $scope.updateConfig = function (isValid) {
                if (!isValid) {
                    throw new Error(`Invalid form data.`)
                }
                _updateSelectedWebhookEvents();
                if ( is_new) {
                    ConvoworksApi.createServicePlatformConfig( $scope.service.service_id, 'viber', $scope.config).then(function (data) {
                        $log.debug('configConvoChatEditor create() $scope.config', $scope.config);
                        configBak = angular.copy( $scope.config);
                        is_new      =   false;
                        is_error    =   false;
                        AlertService.addSuccess(`Service ${$scope.service.service_id} was linked successfully with Viber.`);
                        $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                    }, function ( response) {
                        $log.debug('configConvoChatEditor create() response', response);
                        is_error    =   true;
                        throw new Error(`Can't create config for Convo. ${  response.data.message}`)
                    });
                } else {
                    ConvoworksApi.updateServicePlatformConfig( $scope.service.service_id, 'viber', $scope.config).then(function (data) {
                        $log.debug('configConvoChatEditor update() $scope.config', $scope.config);
                        configBak = angular.copy( $scope.config);
                        is_error    =   false;
                        AlertService.addSuccess('Viber config updated.');
                        $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                    }, function ( response) {
                        $log.debug('configConvoChatEditor update() response', response);
                        is_error    =   true;
                        throw new Error(`Can't update config for Viber. ${response.data.message}`);
                    });
                }
            }

            $scope.registerChange = function(webhookEvent) {
                var eventName = webhookEvent.event.name;
                var isEventEnabled = !webhookEvent.event.checked;
                var newArr = [];

                if (isEventEnabled) {
                    if ($scope.config.event_types === undefined) {
                        newArr.push(eventName);
                        $scope.config.event_types = newArr;
                    } else {
                        $scope.config.event_types.push(eventName);
                    }
                } else {
                    if ($scope.config.event_types === undefined) {
                        $scope.config.event_types = _arrayRemove(newArr, eventName);
                    } else {
                        $scope.config.event_types = _arrayRemove($scope.config.event_types, eventName);
                    }
                }
                $scope.getWebhookEvents();
            }

            $scope.revertConfig = function () {
                $scope.config = angular.copy(configBak);
            }

            $scope.isConfigChanged = function () {
                return !angular.equals(configBak, $scope.config);
            }

            $scope.getWebhookEvents = function () {
                // update array with values from config
                if ($scope.config.event_types && $scope.config.event_types.length > 0) {
                    for (var i = 0; i < $scope.event_types.length; i++) {
                        if ($scope.config.event_types.includes($scope.event_types[i].name)) {
                            $scope.event_types[i].checked = true;
                        }
                    }
                }
                return $scope.event_types;
            };

            function _updateSelectedWebhookEvents() {
                $scope.config.event_types = [];
                for (var i = 0; i < $scope.event_types.length; i++) {
                    if ($scope.event_types[i].checked) {
                        var webhookEventName = $scope.event_types[i].name;
                        $scope.config.event_types.push(webhookEventName);
                    }
                }
            }

            function _arrayRemove(arr, value) {
                 return arr.filter(function(ele) {
                     return ele !== value;
                 });
            }

            function _load()
            {
                ConvoworksApi.getConfigOptions().then(function (options) {
                    $scope.event_types = options['CONVO_VIBER_WEBHOOK_EVENT_TYPES'];

                    ConvoworksApi.getServicePlatformConfig( $scope.service.service_id, 'viber').then(function (data) {
                        $scope.config = data;
                        configBak = angular.copy( $scope.config);
                        is_new  =   false;
                        is_error    =   false;
                    }, function ( response) {
                        $log.debug('configConvoChatEditor loadPlatformConfig() response', response);

                        if ( response.status === 404) {
                            is_new      =   true
                            is_error    =   false;
                            return;
                        }
                        is_error    =   true;
                    });
                });
            }

            function _initIntentNlps() {
                $scope.intentNlps  =   [
                    {
                        label: '---',
                        value: null
                    }
                ];

                ConvoworksApi.loadPlatformConfig($scope.service.service_id).then(function (config) {
                    if (config.dialogflow && config.dialogflow.mode === "auto") {
                        $scope.intentNlps.push({
                            label: 'Dialogflow',
                            value: 'dialogflow'
                        })
                    }
                }).catch(function (reason) {
                    throw new Error(reason.data.message)
                });
            }
        }
    }
}
