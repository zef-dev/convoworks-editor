import template from './selectable-component-buttons.tmpl.html';

/* @ngInject */
export default function selectableComponentButtons($log, $rootScope, UserPreferencesService)
{
    return {
        restrict: 'E',
        scope: { toggleFn: '&' },
        template: template,
        link: function( $scope, $element, $attributes) {

            $log.log( 'selectableComponentButtons link');

            $scope.previewing   =   false;

            $scope.expandAll    =   function() {
                $log.log( 'selectableComponentButtons expandAll');
                $rootScope.$broadcast( 'ExpandAllRequested');
            }

            $scope.collapseAll    =   function() {
                $log.log( 'selectableComponentButtons collapseAll');
                $rootScope.$broadcast( 'CollapseAllRequested');
            }

            $scope.toggleTitles    =   function() {
                $log.log( 'selectableComponentButtons toggleTitles');
                if ( $scope.areTitlesOn()) {
                    UserPreferencesService.registerData( 'show_default_titles', false);
                } else {
                    UserPreferencesService.registerData( 'show_default_titles', true);
                }
            }

            $scope.toggleContainers = function() {
                $log.log('selectableComponentButtons toggleContainers');

                if ($scope.areContainersShown()) {
                    UserPreferencesService.registerData('show_hidden_containers', false);
                } else {
                    UserPreferencesService.registerData('show_hidden_containers', true);
                }
            }

            $scope.togglePreview    =   function() {
                $scope.toggleFn();
                $scope.previewing = !$scope.previewing;
            }

            $scope.getTitlesDescription = function() {
                if ($scope.areTitlesOn()) {
                    return 'Click to hide default component titles (only custom names will be displayed)';
                }

                return 'Click to display default component titles';
            }

            $scope.getContainersDescription = function() {
                if ($scope.areContainersShown()) {
                    return 'Click to hide some containers that aren\'t immediately important.';
                }

                return 'Click to show all containers at all times.';
            }

            $scope.areContainersShown = function() {
                return UserPreferencesService.get('show_hidden_containers', true);
            }

            $scope.areTitlesOn = function() {
                return UserPreferencesService.get('show_default_titles', true);
            }

            $scope.getPreviewDescription    =   function() {
                return $scope.previewing ? 'Toggle back to the workflow editor' : 'Show a preview of this block\'s conversation flow';
            }
        }
    }
};
