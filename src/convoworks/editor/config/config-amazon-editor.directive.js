import template from './config-amazon-editor.tmpl.html';

/* @ngInject */
export default function configAmazonEditor($log, $q, $rootScope, $window, ConvoworksApi, LoginService, AlertService) {
    return {
        restrict: 'E',
        scope: { service: '=' },
        template: template,
        controller: function ($scope) {
            'ngInject';
        },
        link: function ($scope, $element, $attributes) {
            var config_options = {};
            var user    =   null;
            var serviceLanguage    =   'en';
            $scope.service_language    =   'en';

            LoginService.getUser().then( function ( u) {
                user = u;
            });

            ConvoworksApi.getServiceMeta($scope.service.service_id).then( function (serviceMeta) {
                serviceLanguage = serviceMeta['default_language'];
                $scope.service_language = serviceLanguage;

                if (serviceLanguage === 'en') {
                    serviceLanguage = "en_US"
                } else if (serviceLanguage === 'de') {
                    serviceLanguage = "de_DE"
                } else {
                    serviceLanguage = serviceLanguage.replace("-", "_")
                }
            });

            $scope.config = {
                mode: 'manual',
                invocation: $scope.service.name,
                app_id: null,
                interaction_model_sensitivity: 'LOW',
                endpoint_ssl_certificate_type: 'Wildcard',
                self_signed_certificate: null,
                auto_display: false
            };

            var configBak   =   angular.copy( $scope.config);
            var is_new      =   true;
            var is_error    =   false;
            var preparedUpload = null;
            var previousMediaItemId = null;
            var logline     =   '';

            _load();

            $scope.gotoConfigUrl = function() {
                $window.open('https://developer.amazon.com/alexa/console/ask/publish/alexapublishing/' + $scope.config.app_id + '/development/'+serviceLanguage+'/skill-info', '_blank');
            }

            $scope.isModeValid  = function () {
                return !( $scope.config.mode === 'auto' && !user.amazon_account_linked);
            }

            $scope.isNew    = function () {
                return is_new;
            }

            $scope.onFileUpload = function (file) {
                $log.log('ConfigurationsEditor onFileUpload file', file);

                if (file) {
                    preparedUpload = {
                        file: file
                    };
                    if (!file.name.includes('.pem')) {
                        throw new Error(`Invalid file extension in ${file.name}.`)
                    }

                    previousMediaItemId = $scope.config.self_signed_certificate;
                    $scope.config.self_signed_certificate = 'tmp_upload_ready';
                }
            }

            $scope.getSelfSignedSslCertificate = function(type) {
                var mediaItemId = $scope.config[type];

                if (!mediaItemId) {
                    return '';
                }

                if (mediaItemId === 'tmp_upload_ready') {
                    mediaItemId = previousMediaItemId;
                }

//                  $log.log('ConfigurationsEditor getMedia(', type, ') mediaItemId', mediaItemId);

                return mediaItemId;
            }

            $scope.updateConfig = function (isValid) {
                if (!isValid) {
                    throw new Error(`Invalid form data.`)
                }
                $log.debug('configAmazonEditor update() $scope.config', $scope.config);
                _updateSelectedInterfaces();

                var maybeUpload = preparedUpload ?
                    ConvoworksApi.uploadMedia(
                        $scope.service.service_id,
                        'dialogflow.self_signed_certificate',
                        preparedUpload.file) :
                    null;

                $q.when(maybeUpload).then(function (res) {
                    if (res && res.mediaItemId) {
                        $scope.config.self_signed_certificate = res.mediaItemId;
                        preparedUpload = null;
                    }
                    if ( is_new) {
                        ConvoworksApi.createServicePlatformConfig( $scope.service.service_id, 'amazon', $scope.config).then(function (data) {
                            configBak = angular.copy( $scope.config);
                            is_new      =   false;
                            is_error    =   false;
                            AlertService.addSucess(`Service ${$scope.service.service_id} was linked successfully with Alexa.`);
                            $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                        }, function ( response) {
                            $log.debug('configAmazonEditor create() response', response);
                            is_error    =   true;
                            throw new Error("Can't create config for Amazon. " + response.data.message)
                        });
                    } else {
                        ConvoworksApi.updateServicePlatformConfig( $scope.service.service_id, 'amazon', $scope.config).then(function (data) {
                            configBak = angular.copy( $scope.config);
                            is_error    =   false;
                            $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                        }, function ( response) {
                            $log.debug('configAmazonEditor update() response', response);
                            is_error    =   true;
                        });
                    }
                }).then(function (data) {
                    configBak = angular.copy($scope.config);
                    is_error = false;
                    $rootScope.$broadcast('ServiceConfigUpdated', $scope.config);
                }, function (response) {
                    $log.debug(logline, response);
                    is_error = true;
                });
            }



            $scope.revertConfig = function () {
                $scope.config = angular.copy(configBak);
            }


            $scope.isConfigChanged = function () {
                return !angular.equals( configBak, $scope.config);
            }

            $scope.getAlexaInterfaces = function () {
                // update array with values from config
                if ($scope.config.interfaces && $scope.config.interfaces.length > 0) {
                    for (var i = 0; i < $scope.interfaces.length; i++) {
                        if ($scope.config.interfaces.includes($scope.interfaces[i].type)) {
                            $scope.interfaces[i].checked = true;
                        }
                    }
                }

                return $scope.interfaces;
            };

            function _updateSelectedInterfaces() {
                $scope.config.interfaces = [];
                for (var i = 0; i < $scope.interfaces.length; i++) {
                    if ($scope.interfaces[i].checked) {
                        var interfaceType = $scope.interfaces[i].type;
                        $scope.config.interfaces.push(interfaceType);
                    }
                }
            }

            function _arrayRemove(arr, value) {
                return arr.filter(function(ele) {
                    return ele !== value;
                });
            }

            $scope.registerChange = function(itfRecord) {
                var eventName = itfRecord.itf.type;
                var isInterfaceEnabled = !itfRecord.itf.checked;
                var newArr = [];

                if (isInterfaceEnabled) {
                    if ($scope.config.interfaces === undefined) {
                        newArr.push(eventName);
                        $scope.config.interfaces = newArr;
                    } else {
                        $scope.config.interfaces.push(eventName);
                    }
                } else {
                    if ($scope.config.interfaces === undefined) {
                        $scope.config.interfaces = _arrayRemove(newArr, eventName);
                    } else {
                        $scope.config.interfaces = _arrayRemove($scope.config.interfaces, eventName);
                    }
                }
                $scope.getAlexaInterfaces();
            }

            function _load()
            {
                ConvoworksApi.getConfigOptions().then(function (options) {
                    config_options = options;

                    $scope.languages = config_options['CONVO_AMAZON_LANGUAGES'];
                    $scope.sensitivities = config_options['CONVO_AMAZON_INTERACTION_MODEL_SENSITIVITIES'];
                    $scope.endpointCertificateTypes = config_options['CONVO_AMAZON_SKILL_ENDPOINT_SSL_CERTIFICATE'];
                    $scope.interfaces = config_options['CONVO_ALEXA_INTERFACES'];

                    $scope.$watch('config.auto_display', function(newVal) {
                        if (newVal !== undefined)
                        {
                            // $log.log('configAmazonEditor $watch config.auto_display new value', $scope.config);
                            $scope.config.auto_display = newVal;
                        }
                    });

                    $scope.$watch('config.interaction_model_sensitivity', function(newInteractionModelSensitivity) {
                        if (newInteractionModelSensitivity !== undefined) {
                            $scope.config.interaction_model_sensitivity = newInteractionModelSensitivity;
                        }
                    });

                    $scope.$watch('config.endpoint_ssl_certificate_type', function(newEndpointSslCertificateType) {
                        if (newEndpointSslCertificateType !== undefined) {
                            $scope.config.endpoint_ssl_certificate_type = newEndpointSslCertificateType;
                        }
                    });

                    ConvoworksApi.getServicePlatformConfig( $scope.service.service_id, 'amazon').then(function (data) {
                        $scope.config = data;
                        configBak = angular.copy( $scope.config);
                        is_new  =   false;
                        is_error    =   false;
                    }, function ( response) {
                        $log.debug('configAmazonEditor loadPlatformConfig() response', response);

                        if ( response.status === 404) {
                            is_new      =   true
                            is_error    =   false;
                            return;
                        }
                        is_error    =   true;
                    });
                })
            }


        }
    }
}