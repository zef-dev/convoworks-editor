import template from './entity-new.tmpl.html';

const defaultNewEntity  =   {
    "name": "NewEntity",
    "values": [
    ]
};

/* @ngInject */
export default function entityNew( $log, $state)
{
    return {
        restrict: 'E',
        scope: {},
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {

            $log.debug( 'entityNew link');

            var original    =   angular.copy( defaultNewEntity);
            var current     =   angular.copy( original);

            function _render()
            {
                $scope.entity           =   current;
            }

            $scope.onUpdate         =   function( entity) {
                $log.debug( 'entityNew onUpdate entity', entity);
                $scope.$applyAsync( function () {
                    current     =   angular.copy( entity);
                    _render();
                });
            }

            $scope.submitEntity = function() {
                var index   =   propertiesContext.addConvoEntity( current);
//                $state.go('^.intent-model-details', {index:index});
                $state.go('^.intent-model');
            }

            $scope.isEntityChanged = function() {
                return !angular.equals( original, current);
            }

            _render();
        }
    }
}
