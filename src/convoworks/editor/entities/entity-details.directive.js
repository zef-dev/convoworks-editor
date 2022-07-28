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

            var selected            =   $stateParams.name;
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

            $scope.current_entity = propertiesContext.getSelectedService().entities.find(e => e.name === selected);

            if ($scope.current_entity === undefined || $scope.current_entity === null) {
                $log.warn(`entityDetails selected entity [${selected}] does not exist.`);
                $state.go('^.intents-entities');
            }

            if ( !original) {
                original     =   angular.copy( $scope.current_entity);
            }
        }
    }
}
