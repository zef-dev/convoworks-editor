import template from './config-service-meta-editor.tmpl.html';

/* @ngInject */
export default function configServiceMetaEditor($log, $rootScope, LoginService, ConvoworksApi, AlertService)
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

            ConvoworksApi.getConfigOptions().then(function (options) {
                $scope.languages = options['CONVO_SERVICE_LANGUAGES'];
            });

            $scope.config = {
                name: '',
                description: '',
                default_language: 'en',
                owner: '',
                is_private: false,
                admins: ['']
            };

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
                ConvoworksApi.updateServiceMeta($scope.service.service_id, $scope.config).then(function (res) {
                    var meta = res.data;
                    $log.log('configServiceMetaEditor updateConfig() got new meta', meta);

                    $scope.config = {
                        name: meta['name'],
                        description: meta['description'] || '',
                        default_language: meta['default_language'] || '',
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
                });
            }

            function _load() {
                ConvoworksApi.getServiceMeta($scope.service.service_id).then(function (meta) {
                    $log.log('configServiceMetaEditor got service meta', meta);
                    $scope.config = {
                        name: meta['name'] || '',
                        description: meta['description'] || '',
                        default_language: meta['default_language'] || '',
                        owner: meta['owner'] || '',
                        admins: meta['admins'] || [''],
                        is_private: meta['is_private'] !== undefined ? meta['is_private'] : false
                    }

                    $scope.originalOwner = meta['owner'];

                    configBak = angular.copy($scope.config);
                    is_error = false;
                }, function (reason) {
                    $log.warn('configServiceMetaEditor getServiceMeta failed for reason', reason);
                    is_error = true;
                    throw new Error('Could not load service meta configuration.');
                });
            }
        }
    }
}
