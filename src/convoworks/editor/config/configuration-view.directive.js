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
            
            $scope.getPlatformConfigUrl    =   function( platform) {
                // platform.config_url
                var url = platform.config_url;
                url = url.replace( '{serviceId}', $scope.service.service_id);
                return url;
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

//                $scope.platforms = [
//                    {
//                        name: 'Twilio',
//                        'description' :  'Twilio voice platform',
//                        'icon_url' :  'https://tole.ngrok.io/wordpress/wp-content/plugins/convoworks-twilio/assets/twilio-logo.png',
//                        'config_url' :  'https://tole.ngrok.io/wordpress/wp-admin/admin.php?page=convoworks-twilio-settings&service_id={serviceId}',
//                    }
//                ];
                
                $log.log('configurationView got external platforms', $scope.platforms);
            }
        }
    }
}
