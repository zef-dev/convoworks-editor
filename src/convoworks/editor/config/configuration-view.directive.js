import template from './configuration-view.tmpl.html';

/* @ngInject */
export default function configurationView($log, ConvoworksApi)
{
    return {
        restrict: 'E',
        template,
        scope: { service: '=' },
        require: '^propertiesContext',
        link: function ($scope, $element, $attributes, propertiesContext) {
            $scope.config = {};
            $scope.platforms = [];

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
                
                var definitions = propertiesContext.getComponentDefinitions();
                $log.log('configurationView got definitions', definitions);
                
                for ( var i=0; i<definitions.length; i++) 
                {
                    var definition = definitions[i];
                    if ( 'platforms' in definition) {
                        for (var platform_id in definition['platforms']) {
                            var platform = definition['platforms'][platform_id];
                            platform['platform_id'] = platform_id;
                            $scope.platforms.push( platform);
                        }
                    }
                }
                $log.log('configurationView got platforms', $scope.platforms);
            }
        }
    }
}
