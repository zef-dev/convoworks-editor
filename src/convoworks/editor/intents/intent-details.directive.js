import template from './intent-details.tmpl.html';

/* @ngInject */
export default function intentDetails( $log, $window, $stateParams)
{
    return {
        restrict: 'E',
        scope: {
        },
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentDetails link');

            var selected            =   -1;
            var original            =   null; //              =   angular.copy( $scope.intent);
//            $scope.current_intent     =   angular.copy( original);

            selected               =   parseInt( $stateParams.index);
            $scope.current_intent  =   propertiesContext.getSelectedService().intents[selected];

            if ( !original) {
                original     =   angular.copy( $scope.current_intent);
            }

            $scope.entities         =   propertiesContext.getSelectedService().entities;
            $scope.intents          =   propertiesContext.getConvoIntents();
            $scope.system_entities  =   propertiesContext.getSystemEntities();

            $scope.onUpdate         =   function( intent) {
                $log.debug( 'intentDetails onUpdate intent', intent);
                $scope.$applyAsync( function () {
                    $scope.current_intent     =   angular.copy( intent);
                });
            }

            $scope.submitIntent = function() {
                propertiesContext.updateConvoIntent( $scope.current_intent, selected);
                $window.history.back();
            }

            $scope.cancel = function()
            {
                $window.history.back();
            }

            $scope.isIntentChanged = function() {
                return !angular.equals( $scope.current_intent, original);
            }

        }
    }
};
