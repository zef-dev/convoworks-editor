import template from './entity-list.tmpl.html';

/* @ngInject */
export default function entityList($log, $window, $state)
{
    return {
        restrict: 'E',
        require: '^propertiesContext',
        scope: {},
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'entityList link');

            $scope.entities =   propertiesContext.getSelectedService().entities;

            $scope.deleteEntity = function($event, index) {
                $event.preventDefault();
                $event.stopPropagation();

                var entityName = $scope.entities[index].name;

                if ( $window.confirm("Are you sure you want to delete " + entityName + "?")) {
                    propertiesContext.removeConvoEntity( index);
                }
            }
        }
    }
}
