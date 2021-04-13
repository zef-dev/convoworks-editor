import template from './config-messenger-editor.tmpl.html';

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
                page_id: null,
                page_access_token: null,
                app_id: null,
                app_secret: null,
                webhook_verify_token: null,
                webhook_events: [],
                time_created: 0,
                time_updated: 0
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
                $window.open('https://developers.facebook.com/apps/' + $scope.config.app_id + '/messenger/settings/', '_blank');
            }

            $scope.updateConfig = function (isValid) {
                if (!isValid) {
                    throw new Error(`Invalid form data.`)
                }
                _updateSelectedWebhookEvents();
                if ( is_new) {
                    ConvoworksApi.createServicePlatformConfig( $scope.service.service_id, 'facebook_messenger', $scope.config).then(function (data) {
                        $log.debug('configConvoChatEditor create() $scope.config', $scope.config);
                        configBak = angular.copy( $scope.config);
                        is_new      =   false;
                        is_error    =   false;
                        $scope.config.time_created = data.time_created;
                        $scope.config.time_updated = data.time_created;
                        AlertService.addSuccess(`Service ${$scope.service.service_id} was linked successfully with Facebook Messenger.`);
                        $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                    }, function ( response) {
                        $log.debug('configConvoChatEditor create() response', response);
                        is_error    =   true;
                        throw new Error(`Can't create config for Messenger. ${response.data.message}`)
                    });
                } else {
                    ConvoworksApi.updateServicePlatformConfig( $scope.service.service_id, 'facebook_messenger', $scope.config).then(function (data) {
                        $log.debug('configConvoChatEditor update() $scope.config', $scope.config);
                        configBak = angular.copy( $scope.config);
                        is_error    =   false;
                        $scope.config.time_created = data.time_created;
                        $scope.config.time_updated = data.time_updated;
                        AlertService.addSuccess(`Facebook Messenger config updated.`)
                        $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                    }, function ( response) {
                        $log.debug('configConvoChatEditor update() response', response);
                        is_error    =   true;
                        throw new Error(`Can't save config for Facebook Messenger. ${response.data.message}`);
                    });
                }
            }

            $scope.registerChange = function(webhookEvent) {
                var eventName = webhookEvent.event.name;
                var isEventEnabled = !webhookEvent.event.checked;
                var newArr = [];

                if (isEventEnabled) {
                    if ($scope.config.webhook_events === undefined) {
                        newArr.push(eventName);
                        $scope.config.webhook_events = newArr;
                    } else {
                        $scope.config.webhook_events.push(eventName);
                    }
                } else {
                    if ($scope.config.webhook_events === undefined) {
                        $scope.config.webhook_events = _arrayRemove(newArr, eventName);
                    } else {
                        $scope.config.webhook_events = _arrayRemove($scope.config.webhook_events, eventName);
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
                if ($scope.config.webhook_events && $scope.config.webhook_events.length > 0) {
                    for (var i = 0; i < $scope.webhook_events.length; i++) {
                        if ($scope.config.webhook_events.includes($scope.webhook_events[i].name)) {
                            $scope.webhook_events[i].checked = true;
                        }
                    }
                }
                return $scope.webhook_events;
            };

            function _updateSelectedWebhookEvents() {
                $scope.config.webhook_events = [];
                for (var i = 0; i < $scope.webhook_events.length; i++) {
                    if ($scope.webhook_events[i].checked) {
                        var webhookEventName = $scope.webhook_events[i].name;
                        $scope.config.webhook_events.push(webhookEventName);
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
                    $scope.webhook_events = options['CONVO_FACEBOOK_MESSENGER_WEBHOOK_EVENTS'];

                    ConvoworksApi.getServicePlatformConfig( $scope.service.service_id, 'facebook_messenger').then(function (data) {
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
