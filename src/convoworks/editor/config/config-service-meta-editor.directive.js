import { $q } from '@uirouter/angularjs';
import template from './config-service-meta-editor.tmpl.html';

/* @ngInject */
export default function configServiceMetaEditor($log, $rootScope, $window, ConvoworksApi, AlertService)
{
    return {
        restrict: 'E',
        controller: 'ConvoworksMainController',
        scope: { service: '=' },
        template: template,
        link: function($scope, $element, $attributes) {
            $log.log('configServiceMetaEditor linked');

            $scope.loading = false;

            $scope.config = {
                name: '',
                description: '',
                default_language: 'en',
                default_locale: 'en-US',
                supported_locales: ['en-US'],
                owner: '',
                is_private: false,
                admins: ['']
            };

            ConvoworksApi.getConfigOptions().then(function (options) {
                $scope.languages = options['CONVO_SERVICE_LANGUAGES'];
                $scope.locales = options['CONVO_SERVICE_LOCALES'].filter(function (locale) {
                    return locale.code.includes($scope.config.default_language);
                });
            });

            $scope.originalOwner = '';

            _load();

            var configBak = angular.copy($scope.config);
            var is_error =  false;

            $scope.revertConfig = function () {
                $scope.config = angular.copy(configBak);
            }

            $scope.isConfigChanged = function () {
                return !angular.equals(configBak, $scope.config);
            }

            $scope.updateConfig = function() {
                if ($scope.originalOwner !== $scope.config.owner) {
                    if ($window.confirm(`You are about to transfer service ownership to ${$scope.config.owner}. Are you sure you wish to proceed? If you do, you may have reduced permissions for configuring this service until ownership is transferred back to you.`)) {
                        _update();
                    }

                    return;
                }

                _update();
            }

            $scope.isError = () => is_error;

            function _update() {
                $scope.loading = true;

                ConvoworksApi.updateServiceMeta($scope.service.service_id, $scope.config).then(function (res) {
                    var meta = res.data;
                    $log.log('configServiceMetaEditor updateConfig() got new meta', meta);

                    $scope.config = {
                        name: meta['name'],
                        description: meta['description'] || '',
                        default_language: meta['default_language'] || '',
                        default_locale: meta['default_locale'] || '',
                        supported_locales: meta['supported_locales'] || '',
                        owner: meta['owner'],
                        admins: meta['admins'] || [''],
                        is_private: meta['is_private'] !== undefined ? meta['is_private'] : false
                    }

                    configBak = angular.copy($scope.config);

                    $scope.originalOwner = meta['owner'];
                    $rootScope.$broadcast('ServiceMetaUpdated', meta);

                    is_error = false;

                    AlertService.addSuccess('Service meta configuration updated.');
                }, function (reason) {
                    $log.warn('configServiceMetaEditor updateConfig failed for reason', reason);

                    is_error = true;
                    throw new Error(`Could not update service meta config. ${reason.data.message}`);
                }).finally(() => {
                    $log.log('configServiceMetaEditor _update() finally setting loading to false');
                    $scope.loading = false;
                });
            }

            function _load() {
                $scope.loading = true;

                const all = [
                    ConvoworksApi.getServiceMeta($scope.service.service_id).then(function (meta) {
                        $log.log('configServiceMetaEditor got service meta', meta);
                        $scope.config = {
                            name: meta['name'] || '',
                            description: meta['description'] || '',
                            default_language: meta['default_language'] || '',
                            default_locale: meta['default_locale'] || '',
                            supported_locales: meta['supported_locales'] || '',
                            owner: meta['owner'] || '',
                            admins: meta['admins'] || [''],
                            is_private: meta['is_private'] !== undefined ? meta['is_private'] : false
                        }
    
                        $scope.originalOwner = meta['owner'];
                    }),
                    ConvoworksApi.getConfigOptions().then(function (options) {
                        $scope.locales = options['CONVO_SERVICE_LOCALES'].filter(function (locale) {
                            return locale.code.includes($scope.config.default_language);
                        });

                        for (var i = 0; i < $scope.locales.length; i++) {
                            if ($scope.config.supported_locales.includes($scope.locales[i].code)) {
                                $scope.locales[i].checked = true;
                            } else {
                                $scope.locales[i].checked = false;
                            }
                        }
                    })
                ]

                $q.all(all).then((results) => {
                    $log.log('configServiceMetaEditor all loaded');

                    configBak = angular.copy($scope.config);
                    is_error = false;
                }, function (reason) {
                    $log.warn('configServiceMetaEditor getServiceMeta failed for reason', reason);
                    is_error = true;
                    throw new Error('Could not load service meta configuration.');
                }).finally(() => {
                    $log.log('configServiceMetaEditor _load() finally setting loading to false');
                    $scope.loading = false;
                });
            }

            $scope.onLanguageChange = function () {
                ConvoworksApi.getConfigOptions().then(function (options) {
                    if ($scope.config.default_language === 'en') {
                        $scope.config.default_locale = 'en-US';
                        $scope.supported_locales = ['en-US'];
                        $scope.config.supported_locales = $scope.supported_locales;
                    }

                    $scope.locales = options['CONVO_SERVICE_LOCALES'].filter(function (locale) {
                        return locale.code.includes($scope.config.default_language);
                    });
                });
            }

            $scope.onDefaultLocaleChange = function () {
                $scope.config.supported_locales = [];
                $scope.config.supported_locales.push($scope.config.default_locale);

                for (var i = 0; i < $scope.locales.length; i++) {
                    if ($scope.config.supported_locales.includes($scope.locales[i].code)) {
                        $scope.locales[i].checked = true;
                    } else {
                        $scope.locales[i].checked = false;
                    }
                }
            }

            $scope.registerChange = function(data) {
                var localeCode = data.locale.code;
                var isLocaleEnabled = !data.locale.checked;

                if (isLocaleEnabled) {
                    $scope.config.supported_locales.push(localeCode);
                } else {
                    $scope.config.supported_locales = _arrayRemove($scope.config.supported_locales, localeCode);
                }
            }

            function _arrayRemove(array, value) {
                return array.filter(function(elementOfArray) {
                    return elementOfArray !== value;
                });
            }
        }
    }
}
