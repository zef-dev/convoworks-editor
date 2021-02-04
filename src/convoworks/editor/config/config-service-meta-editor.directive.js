import template from './config-service-meta-editor.tmpl.html';

/* @ngInject */
export default function configServiceMetaEditor($log, LoginService, ConvoworksApi, $rootScope)
{
    return {
        restrict: 'E',
        controller: 'ConvoworksMainController',
        scope: { service: '=' },
        template: template,
        link: function($scope, $element, $attributes) {
            $log.log('configServiceMetaEditor linked');

            var user = null;

            LoginService.getUser().then(function (u) {
                user = u;
            });

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
                ConvoworksApi.updateServiceMeta($scope.service.service_id, $scope.config).then(function (res) {
                    var meta = res.data;
                    $log.log('configServiceMetaEditor updateConfig() got new meta', meta);

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

                    configBak = angular.copy($scope.config);
                    $rootScope.$broadcast('ServiceMetaUpdated', meta);
                    is_error = false;
                }, function (reason) {
                    $log.warn('configServiceMetaEditor updateConfig failed for reason', reason);
                    is_error = true;
                    throw new Error(reason.data.message)
                });
            }

            function _load() {
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
                    });

                    configBak = angular.copy($scope.config);
                    is_error = false;
                }, function (reason) {
                    $log.warn('configServiceMetaEditor getServiceMeta failed for reason', reason);
                    is_error = true;
                });
            }

            $scope.onLanguageChange = function () {
                ConvoworksApi.getConfigOptions().then(function (options) {
                    if ($scope.config.default_language === 'en') {
                        $scope.config.default_locale = 'en-US';
                        $scope.supported_locales = ['en-US'];
                        $scope.config.supported_locales = $scope.supported_locales;
                    } else if ($scope.config.default_language === 'de') {
                        $scope.config.default_locale = 'de-DE';
                        $scope.supported_locales = ['de-DE'];
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
