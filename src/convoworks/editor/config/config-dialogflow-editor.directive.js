import template from './config-dialogflow-editor.tmpl.html';

/* @ngInject */
export default function configDialogflowEditor($log, $q, $rootScope, $window, ConvoworksApi, LoginService, AlertService) {
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
                    mode: 'manual',
                    projectId: null,
                    serviceAccount: null,
                    name: _generateDialogflowAgentName($scope.service.name),
                    description: null,
                    avatar: null,
                    default_timezone: 'Europe/Madrid',
                    time_created: 0,
                    time_updated: 0
                };

                $scope.showServiceAccount = false

                var configBak   =   angular.copy( $scope.config);
                var is_new      =   true;
                var is_error    =   false;
                var logline     =   '';
                var previousServiceAccountJSON = null;

                _load();


                $scope.$watch('config.default_timezone', function(newDefaultTImeZone) {
                    if (newDefaultTImeZone !== undefined) {
                        $log.log('configDialogflowEditor $watch config.default_timezone new value', $scope.config);
                        $scope.config.default_timezone = newDefaultTImeZone;
                    }
                });

                $scope.isNew    = function () {
                    return is_new;
                }

                $scope.gotoConfigUrl = function() {
                    var projectID = '';
                    if ($scope.config.mode === 'manual') {
                        projectID = $scope.config.projectId;
                    } else if ($scope.config.mode === 'auto') {
                        if ($scope.config.serviceAccount && $scope.config.serviceAccount !== '') {
                            try {
                                var retrievedServiceAccount = JSON.parse($scope.config.serviceAccount);
                                $log.log("Retrieved service account: ", retrievedServiceAccount.project_id);
                                projectID = retrievedServiceAccount.project_id;
                            } catch (e) {
                                projectID = '';
                            }
                        }
                    }
                    $window.open('https://console.actions.google.com/project/' + projectID + '/directoryinformation/', '_blank');
                }

                $scope.updateConfig = function (isValid) {
                    $log.debug('configDialogflowEditor update() $scope.config', $scope.config);
                    if (!isValid) {
                        throw new Error(`Invalid form data.`)
                    }
                    _updateSelectedInterfaces();

                    if (is_new) {
                        return ConvoworksApi.createServicePlatformConfig(
                            $scope.service.service_id,
                            'dialogflow',
                            $scope.config
                        ).then(function (data) {
                            configBak = angular.copy( $scope.config);
                            logline = 'configDialogflowEditor create() response';
                            is_new = false;
                            $scope.config.time_created = data.time_created;
                            $scope.config.time_updated = data.time_created;
                            if (!_isJsonInvalid(data.serviceAccount)) {
                                $scope.config.serviceAccount = data.serviceAccount;
                                previousServiceAccountJSON = $scope.config.serviceAccount;
                            }
                            AlertService.addSuccess(`Service ${$scope.service.service_id} was linked successfully with Dialogflow.`);
                            $rootScope.$broadcast('ServiceConfigUpdated', {platform_id: 'dialogflow', platform_config: $scope.config});
                        }, function (response) {
                            $log.debug('configDialogflowEditor create() response', response);
                            is_error    =   true;
                            throw new Error(`Can't create config for Dialogflow. ${response.data.message}`)
                        });
                    } else {
                        return ConvoworksApi.updateServicePlatformConfig(
                            $scope.service.service_id,
                            'dialogflow',
                            $scope.config
                        ).then(function (data) {
                            configBak = angular.copy( $scope.config);
                            logline = 'configDialogflowEditor update() response';
                            is_new = false;
                            $scope.config.time_created = data.time_created;
                            $scope.config.time_updated = data.time_updated;
                            if (!_isJsonInvalid(data.serviceAccount)) {
                                $scope.config.serviceAccount = data.serviceAccount;
                                previousServiceAccountJSON = $scope.config.serviceAccount;
                            }
                            AlertService.addSuccess(`Dialogflow config updated.`);
                            $rootScope.$broadcast('ServiceConfigUpdated', {platform_id: 'dialogflow', platform_config: $scope.config});
                        }, function (response) {
                            $log.debug('configDialogflowEditor create() response', response);
                            is_error    =   true;
                            throw new Error(`Can't create config for Dialogflow. ${response.data.message}`)
                        });
                    }
                }

                $scope.revertConfig = function () {
                    $scope.config = angular.copy(configBak);
                }

                $scope.onFileUpload = function (file) {
                    $log.log('ConfigurationsEditor onFileUpload file', file);
                    $scope.config.avatar = 'tmp_upload_ready';
                }

                $scope.isConfigChanged = function () {
                    return !angular.equals( configBak, $scope.config);
                }

                $scope.getDialogflowInterfaces = function () {
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
                    $scope.getDialogflowInterfaces();
                }

                $scope.validateAgentName = function() {
                    $scope.dialogflowPlatformConfigForm.name.$invalid = $scope.config.name ? $scope.config.name.match(/\s/g) : true;
                }

                $scope.toggleShowServiceAccount = function () {
                    if ($scope.showServiceAccount === false) {
                        $scope.showServiceAccount = true;
                    } else if ($scope.showServiceAccount === true) {
                        $scope.showServiceAccount = false;
                    }
                }

                $scope.onFileUpload = function (file) {
                    $log.log('ConfigurationsEditor onFileUpload file', file);
                    if (file) {
                        if (!file.name.includes('.json')) {
                            AlertService.addDanger(`Invalid file extension in ${file.name}. It must be .pem!`);
                            return;
                        }

                        const jsonReader = new FileReader();
                        jsonReader.readAsText(file, "UTF-8");

                        jsonReader.onload = function (evt) {
                            $scope.showServiceAccount = false;
                            if (!_isJsonInvalid(evt.target.result)) {
                                $scope.config.serviceAccount = evt.target.result;
                            } else {
                                $scope.config.serviceAccount = previousServiceAccountJSON;
                                AlertService.addDanger('Malformed Service Account JSON was provided.');
                            }
                            $scope.$apply();
                        }

                        jsonReader.onerror = function (evt) {
                            $scope.showServiceAccount = false;
                            $scope.config.serviceAccount = previousServiceAccountJSON;
                            AlertService.addDanger('Something went wrong.');
                            $scope.$apply();
                        }
                    } else {
                        $scope.config.serviceAccount = previousServiceAccountJSON;
                    }
                }

                function _load()
                {
                    ConvoworksApi.getConfigOptions().then(function (options) {
                        $scope.timezones = options['CONVO_DIALOGFLOW_TIMEZONES'];
                        $scope.interfaces = options['CONVO_DIALOGFLOW_INTERFACES'];
                        $scope.serviceAccountFields = options['CONVO_DIALOGFLOW_SERVICE_ACCOUNT_FIELDS'];

                        ConvoworksApi.getServicePlatformConfig( $scope.service.service_id, 'dialogflow').then(function (data) {
                            $scope.config = data;
                            configBak = angular.copy( $scope.config);
                            is_new  =   false;
                            is_error    =   false;
                            previousServiceAccountJSON = data.serviceAccount;
                        }, function ( response) {
                            $log.debug('configDialogflowEditor loadPlatformConfig() response', response);

                            if ( response.status === 404) {
                                is_new      =   true
                                is_error    =   false;
                                return;
                            }
                            is_error    =   true;
                        });
                    });
                }

                function _generateDialogflowAgentName(agentName) {
                    return agentName.replace(/\s/g,'');
                }

                function _isJsonInvalid(serviceAccountJson) {
                    $scope.dialogflowPlatformConfigForm.serviceAccount.$invalid = true;
                    let isInvalid = true;

                    try {
                        let serviceAccountJSON = JSON.parse(serviceAccountJson);
                        let keys = Object.keys(serviceAccountJSON);

                        if (keys.length > 0) {
                            const filteredKeys = keys.filter(function(val) {
                                return $scope.serviceAccountFields.includes(val);
                            });

                            if (filteredKeys.length === $scope.serviceAccountFields.length) {
                                $scope.dialogflowPlatformConfigForm.serviceAccount.$invalid = false;
                                isInvalid = false;
                            }
                        }
                    } catch (e) {
                        $scope.dialogflowPlatformConfigForm.serviceAccount.$invalid = true;
                        isInvalid = true;
                    }

                    return isInvalid;
                }
            }
        }
    }
