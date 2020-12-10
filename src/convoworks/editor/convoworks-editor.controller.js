/* @ngInject */
export default function ConvoworksEditorController( $log, $scope, $rootScope, $stateParams, $state, ConvoworksApi, AlertService, UserPreferencesService) {

        var random_slug                =   Math.floor( Math.random() * 100000);
        var device_id                  =   'admin-chat-' + random_slug;

        var platform_info              =   {}
        var platform_config_info       =   {}

        $scope.tabsExpanded     =   UserPreferencesService.get( 'navi_expanded', true);
        $scope.serviceId        =   $stateParams.service_id;

        $scope.delegateNlp      =   null;
        $scope.delegateOptions  =   [
            {
                label: '---',
                value: null
            }
        ];

        $scope.getDelegateOptions = function  () {
            return $scope.delegateOptions
        }

        $scope.initDelegateOptions = function () {
            _initDelegationNlp();
        }

        $scope.isServiceTabActive = function( tabName) {
            return $state.includes( '*.'+tabName);
        }

        $log.log( 'ConvoworksEditorController $state.current', $state.current);

        _load();

        $scope.getDeviceId      =   function() {
            return device_id;
        }

        $scope.toggleExpanded       =   function() {
            $scope.tabsExpanded = !$scope.tabsExpanded;
            UserPreferencesService.registerData( 'navi_expanded', $scope.tabsExpanded)
        }

        $scope.$on( 'ServiceConfigUpdated', function ( evt, data) {
            _load();
            _initDelegationNlp();
            _resetSelectedNlp(data);
        });

        $scope.$on( 'ServiceWorkflowUpdated', function ( evt, data) {
            _load();
        });

        $scope.$on( 'ServiceReleasesUpdated', function ( evt, data) {
            _load();
        });


        $scope.isPlatformPropagateAllowed       =   function( platformId) {
            if ( !platform_info[platformId]) {
                return false;
            }
            return platform_info[platformId]['allowed'];
        }

        $scope.$on( 'ServiceMetaUpdated', function ( evt, data) {
            _load();
        });

        $scope.isPlatformPropagateAvailable       =   function( platformId) {
            if ( !platform_info[platformId]) {
                return false;
            }
            return platform_info[platformId]['available'];
        }

        $scope.propagatePlatformChanges     =   function( platformId) {
            $log.log( 'ConvoworksEditorController propagatePlatformChanges() platformId', platformId);

            if (platformId === 'all') {
                const availablePlatforms = Object.keys(platform_info);
                availablePlatforms.forEach(function(availablePlatformId) {
                    if (platform_info[availablePlatformId].allowed && platform_info[availablePlatformId].available) {
                        ConvoworksApi.propagateServicePlatform( $scope.serviceId, availablePlatformId).then(function (data) {
                            $log.log( 'ConvoworksEditorController propagatePlatformChanges() propagating to ', data);
                            platform_info[availablePlatformId] = data;
                            AlertService.addSucess( 'Service propagation to '+availablePlatformId+' was successful.');
                        }, function( reason) {
                            $log.log( 'ConvoworksEditorController propagatePlatformChanges() reason', reason);
                            throw new Error(platformId + " propagation error: " + reason.data.message + " Error details: " + reason.data.details);
                        });
                    }
                })
            } else {
                ConvoworksApi.propagateServicePlatform( $scope.serviceId, platformId).then(function (data) {
                    platform_info[platformId] = data;
                    AlertService.addSucess( 'Service propagation to '+platformId+' done');
                }, function( reason) {
                    $log.log( 'ConvoworksEditorController propagatePlatformChanges() reason', reason);
                    throw new Error(platformId + " propagation error: " + reason.data.message + " Error details: " + reason.data.details);
                });
            }

        }


        function _load()
        {
            ConvoworksApi.getPropagateInfo( $scope.serviceId, 'amazon').then(function (data) {
                platform_info['amazon'] = data;
            }).catch(function (reason) {
                throw new Error(reason.data.message +  " In order to be able to propagate changes for amazon")
            });
            ConvoworksApi.getPropagateInfo( $scope.serviceId, 'dialogflow').then(function (data) {
                platform_info['dialogflow'] = data;
            }).catch(function (reason) {
                throw new Error(reason.data.message +  " In order to be able to propagate changes for dialogflow")
            });
            ConvoworksApi.getPropagateInfo( $scope.serviceId, 'facebook_messenger').then(function (data) {
                platform_info['facebook_messenger'] = data;
            }).catch(function (reason) {
                throw new Error(reason.data.message +  " In order to be able to propagate changes for Facebook Messenger")
            });
            ConvoworksApi.getPropagateInfo( $scope.serviceId, 'viber').then(function (data) {
                platform_info['viber'] = data;
            }).catch(function (reason) {
                throw new Error(reason.data.message +  " In order to be able to propagate changes for Viber")
            });

            ConvoworksApi.loadPlatformConfig($scope.serviceId).then(function (config) {
                $log.log('testViewNlp got config', config);
                platform_config_info = config;
            }).catch(function (reason) {
                throw new Error(reason.data.message)
            });
        }

        function _initDelegationNlp() {
            $scope.delegateOptions  =   [
                {
                    label: '---',
                    value: null
                }
            ];

            ConvoworksApi.loadPlatformConfig($scope.serviceId).then(function (config) {
                $log.log('testViewNlp got config', config);
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
            }).catch(function (reason) {
                throw new Error(reason.data.message)
            });
        }

        function _resetSelectedNlp(data) {
            // if update data contains serivceAccount which refers to Dialogflow
            if (data.serviceAccount) {
                $log.log('testViewNlp _resetSelectedNlp going to update dialogflow with', data);

                if (data.mode === "manual") {
                    $log.log('testViewNlp _resetSelectedNlp going to reset delegate nlp on text based', data.mode);

                    platform_config_info.facebook_messenger.delegateNlp = null;
                    platform_config_info.viber.delegateNlp = null;
                    platform_config_info.convo_chat.delegateNlp = null;

                    ConvoworksApi.updateServicePlatformConfig( $scope.serviceId, 'facebook_messenger', platform_config_info.facebook_messenger).then(function (data) {
                        $log.debug('testViewNlp update() facebook_messenger data', data);
                        AlertService.addWarning("Resetting selected Intent NLP back to initial state for Facebook Messenger")
                    }, function ( response) {
                        $log.debug('testViewNlp update() response', response);
                    });
                    ConvoworksApi.updateServicePlatformConfig( $scope.serviceId, 'viber', platform_config_info.viber).then(function (data) {
                        $log.debug('testViewNlp update() viber data', data);
                        AlertService.addWarning("Resetting selected Intent NLP back to initial state for Viber")
                    }, function ( response) {
                        $log.debug('testViewNlp update() response', response);
                    });
                    ConvoworksApi.updateServicePlatformConfig( $scope.serviceId, 'convo_chat', platform_config_info.convo_chat).then(function (data) {
                        $log.debug('testViewNlp update() convo_chat data', data);
                        AlertService.addWarning("Resetting selected Intent NLP back to initial state for Convo Chat")
                    }, function ( response) {
                        $log.debug('testViewNlp update() response', response);
                    });
                }
            }
        }

    }