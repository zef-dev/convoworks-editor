import template from './intents-list.tmpl.html';

/* @ngInject */
export default function intentList( $log, $window, $state)
{
    return {
        restrict: 'E',
        require: '^propertiesContext',
        scope: {},
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentList link');

            $scope.intents   =   propertiesContext.getSelectedService().intents;

            $scope.deleteIntent = function($event, index) {
                $event.preventDefault();
                $event.stopPropagation();

                var intentName = $scope.intents[index].name;
                if ( $window.confirm( "Are you sure you want to delete " + intentName + "?")) {
                    propertiesContext.removeConvoIntent( index);
                }
            }
        }
    }
};
