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

            let is_valid = true;
            let selected = $stateParams.name;
            let original = null;

            $scope.onUpdate = (entity, valid) => {
                $log.debug('entityDetails onUpdate entity', entity, valid);
                $scope.$applyAsync(function () {
                    is_valid = valid;
                    $scope.current_entity = angular.copy(entity);
                });
            }

            $scope.submitEntity = function() {
                propertiesContext.updateConvoEntity(original, $scope.current_entity);
                $state.go('^.intents-entities');
            }

            $scope.isEntityChanged = function() {
                return !angular.equals( original, $scope.current_entity);
            }

            $scope.valid = () => is_valid;

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
