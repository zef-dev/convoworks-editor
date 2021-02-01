import template from './configuration-view.tmpl.html';

/* @ngInject */
export default function configurationView($log, ConvoworksApi)
{
    return {
        restrict: 'E',
        template,
        scope: { service: '=' },
        link: function ($scope, $element, $attributes) {
            $scope.config = {};

            _init();

            $scope.configEnabled    =   function(config) {
                return Object.keys($scope.config).includes(config);
            }

            function _init()
            {
                ConvoworksApi.loadPlatformConfig($scope.service.service_id).then(function (config) {
                    $log.log('configurationView got config', config);
                    $scope.config = config || {};
                });
            }
        }
    }
}
