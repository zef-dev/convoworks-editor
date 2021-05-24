import template from './misc-panel.tmpl.html';

/* @ngInject */
export default function miscPanel( $log, $window, ConvoworksApi, CONVO_ADMIN_API_BASE_URL)
{
    return {
        restrict: 'E',
        scope: { service: '=' },
        require: '^propertiesContext',
        template: template,
        controller: function( $scope) {
            'ngInject';
        },
        link: function( $scope, $element, $attributes, propertiesContext) {

            $scope.uploadOptions    =   {
                keep_vars : true,
                keep_configs : true,
            };

            $scope.downloadOptions    =   {
                include_configurations : false
            };

            $scope.serviceReleases = [];

            ConvoworksApi.getServiceReleases($scope.service.service_id).then(function (data) {
                $log.debug( 'miscPanel getServiceReleases() OK', data);
                $scope.serviceReleases = data;
            }, function ( reason) {
                $log.debug( 'miscPanel getServiceReleases() reason', reason);
            });

            $scope.uploadSubmitted  =   function( file)
            {
                $log.debug( 'miscPanel uploadSubmitted() file', file, '$scope.uploadOptions', $scope.uploadOptions);
                ConvoworksApi.uploadServiceData(
                                $scope.service.service_id,
                                file,
                                $scope.uploadOptions.keep_vars,
                                $scope.uploadOptions.keep_configs).then( function () {
                    $log.debug( 'miscPanel uploadSubmitted() OK');
                    $window.location.reload();
                }, function ( reason) {
                    $log.debug( 'miscPanel uploadSubmitted() reason', reason);
                });
            }

            $scope.download  =   function()
            {
                $log.debug( 'miscPanel download()');
                var url =   CONVO_ADMIN_API_BASE_URL + '/service-imp-exp/export/' + $scope.service.service_id + '?include_configurations=' + $scope.downloadOptions.include_configurations;
                $log.debug( 'miscPanel redirecting to ['+url+']');
                document.location.href  =   url;
            }

            $scope.downloadPlatform  =   function( platformId)
            {
                if (!$scope.hasPlatformRelease(platformId)) {
                    window.alert("Can't download export for " + platformId + " at the moment. Please create an configuration for the " + platformId + ".");
                    return;
                }

                $log.debug( 'miscPanel downloadPlatform()', platformId);
                var url =   CONVO_ADMIN_API_BASE_URL + '/service-imp-exp/export/' + $scope.service.service_id + '/' + platformId;
                $log.debug( 'miscPanel redirecting to ['+url+']');
                document.location.href  =   url;
            }

            $scope.hasPlatformRelease = function (platformId) {
                return $scope.serviceReleases.filter(
                    platformRelease => platformRelease.platform_id !== undefined
                        && platformRelease.platform_id === platformId
                ).length > 0;
            }
        }
    }
};
