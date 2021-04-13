import template from './config-convo-chat-editor.tmpl.html';

/* @ngInject */
export default function configConvoChatEditor($log, $q, $rootScope, ConvoworksApi, LoginService, AlertService) {
    return {
        restrict: 'E',
        scope: { service: '=' },
        template: template,
        controller: function ($scope) {
            'ngInject';
        },
        link: function ($scope, $element, $attributes) {

            var user    =   null;

            LoginService.getUser().then( function ( u) {
                user = u;
            });

            $scope.config = {
                delegateNlp: null,
                time_created: 0,
                time_updated: 0
            };

            $scope.intentNlps  =   [
                {
                    label: '---',
                    value: null
                }
            ];

            var configBak   =   angular.copy( $scope.config);
            var is_new      =   true;
            var is_error    =   false;

            _load();
            _initIntentNlps();

            $scope.getIntentNlps    = function () {
                return $scope.intentNlps;
            }

            $scope.isNew    = function () {
                return is_new;
            }

            $scope.updateConfig = function () {

                if ( is_new) {
                    ConvoworksApi.createServicePlatformConfig( $scope.service.service_id, 'convo_chat', $scope.config).then(function (data) {
                        $log.debug('configConvoChatEditor create() $scope.config', $scope.config);
                        configBak = angular.copy( $scope.config);
                        is_new      =   false;
                        is_error    =   false;
                        $scope.config.time_created = data.time_created;
                        $scope.config.time_updated = data.time_created;
                        AlertService.addSuccess(`Convo Chat configuration for ${$scope.service.service_id} created successfully.`);
                        $rootScope.$broadcast('ServiceConfigUpdated', {platform_id: 'convo_chat', platform_config: $scope.config});
                    }, function ( response) {
                        $log.debug('configConvoChatEditor create() response', response);
                        is_error    =   true;
                        throw new Error(`Can't create config for Convo Chat. ${response.data.message}`)
                    });
                } else {
                    ConvoworksApi.updateServicePlatformConfig( $scope.service.service_id, 'convo_chat', $scope.config).then(function (data) {
                        $log.debug('configConvoChatEditor update() $scope.config', $scope.config);
                        configBak = angular.copy( $scope.config);
                        is_error    =   false;
                        $scope.config.time_created = data.time_created;
                        $scope.config.time_updated = data.time_updated;
                        AlertService.addSuccess('Convo Chat config updated');
                        $rootScope.$broadcast('ServiceConfigUpdated', {platform_id: 'convo_chat', platform_config: $scope.config});
                    }, function ( response) {
                        $log.debug('configConvoChatEditor update() response', response);
                        is_error    =   true;
                        throw new Error(`Can't update config for Convo Chat. ${response.data.message}`);
                    });
                }
            }



            $scope.revertConfig = function () {
                $scope.config = angular.copy(configBak);
            }


            $scope.isConfigChanged = function () {
                return !angular.equals( configBak, $scope.config);
            }

            function _load()
            {
                ConvoworksApi.getServicePlatformConfig( $scope.service.service_id, 'convo_chat').then(function (data) {
                    $scope.config = data;
                    configBak = angular.copy( $scope.config);
                    is_new  =   false;
                    is_error    =   false;
                }, function ( response) {
                    $log.debug('configConvoChatEditor loadPlatformConfig() response', response);

                    if ( response.status === 404) {
                        is_new      =   true
                        is_error    =   false;
                        return;;
                    }
                    is_error    =   true;
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
