import template from './entity-details.tmpl.html';

/* @ngInject */
export default function entityDetails( $log, $state, $stateParams)
{
    return {
        restrict: 'E',
        scope: {
        },
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'entityDetails link');

            var selected            =   -1;
            var original            =   null; //              =   angular.copy( $scope.intent);

            $scope.onUpdate         =   function( entity) {
                $log.debug( 'entityDetails onUpdate entity', entity);
                $scope.$applyAsync( function () {
                    $scope.current_entity     =   angular.copy( entity);
                });
            }

            $scope.submitEntity = function() {
                propertiesContext.updateConvoEntity( $scope.current_entity, parseInt( $stateParams.index));
                $state.go('^.intents-entities');
            }

            $scope.isEntityChanged = function() {
                return !angular.equals( original, $scope.current_entity);
            }

            selected               =   parseInt( $stateParams.index);
            $scope.current_entity  =   propertiesContext.getSelectedService().entities[selected];

            if ( !original) {
                original     =   angular.copy( $scope.current_entity);
            }
        }
    }
}
