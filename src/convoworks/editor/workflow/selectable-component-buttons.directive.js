import template from './selectable-component-buttons.tmpl.html';

/* @ngInject */
export default function selectableComponentButtons($log, $rootScope, UserPreferencesService)
{
    return {
        restrict: 'E',
        scope: { toggleFn: '&' },
        template: template,
        link: function( $scope, $element, $attributes) {

            $log.log( 'collapseExpandButtons link');

            $scope.previewing   =   false;

            $scope.expandAll    =   function() {
                $log.log( 'collapseExpandButtons expandAll');
                $rootScope.$broadcast( 'ExpandAllRequested');
            }

            $scope.collapseAll    =   function() {
                $log.log( 'collapseExpandButtons collapseAll');
                $rootScope.$broadcast( 'CollapseAllRequested');
            }

            $scope.toggleTitles    =   function() {
                $log.log( 'collapseExpandButtons toggleTitles');
                if ( $scope.areTitlesOn()) {
                    UserPreferencesService.registerData( 'show_default_titles', false);
                } else {
                    UserPreferencesService.registerData( 'show_default_titles', true);
                }
            }

            $scope.togglePreview    =   function() {
                $scope.toggleFn();
                $scope.previewing = !$scope.previewing;
            }

            $scope.getTitlesDescription    =   function() {
                if ( $scope.areTitlesOn()) {
                    return 'Click to hide default component titles (only custom names will be displayed)';
                }
                return 'Click to display default component titles';
            }

            $scope.areTitlesOn    =   function() {
                return UserPreferencesService.get( 'show_default_titles', true);
            }

            $scope.getPreviewDescription    =   function() {
                return $scope.previewing ? 'Toggle back to the workflow editor' : 'Show a preview of this block\'s conversation flow';
            }
        }
    }
};
