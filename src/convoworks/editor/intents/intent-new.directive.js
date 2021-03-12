import template from './intent-new.tmpl.html';

const defaultNewIntent  =   {
    name : 'NewIntent',
    type : 'custom',
    utterances : []
};

/* @ngInject */
export default function intentNew( $log, $rootScope, $state, $stateParams)
{
    return {
        restrict: 'E',
        scope: {},
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentNew link $stateParams.name', $stateParams.name);

            var original    =   angular.copy( defaultNewIntent);
            var current     =   angular.copy( original);

            function _render()
            {
                var service             =   propertiesContext.getSelectedService();
                $scope.intent           =   current;
                $scope.entities         =   service.entities;
                $scope.system_entities  =   propertiesContext.getSystemEntities();
            }

            $scope.onUpdate         =   function( intent) {
                $log.debug( 'intentNew onUpdate intent', intent);
                $scope.$applyAsync( function () {
                    current     =   angular.copy( intent);
                    _render();
                });
            }

            $scope.submitIntent = function() {
                var index   =   propertiesContext.addConvoIntent( current);
//                $state.go('^.intents-entities-details', {index:index});
                $state.go('^.intents-entities');
            }

            $scope.isIntentChanged = function() {
                return !angular.equals( original, current);
            }

            _render();
        }
    }
};
