import template from './intent-details.tmpl.html';

/* @ngInject */
export default function intentDetails( $log, $window, $state, $stateParams)
{
    return {
        restrict: 'E',
        scope: {
        },
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentDetails link');

            let submitting = false;
            var selected = $stateParams.name;
            var original = null; 

            $scope.current_intent = propertiesContext.getSelectedService().intents.find(i => i.name === selected);

            if ($scope.current_intent === undefined || $scope.current_intent === null) {
                $log.warn(`intentDetails selected intent [${selected}] does not exist.`);
                $state.go('^.intents-entities');
            }

            if ( !original) {
                original     =   angular.copy( $scope.current_intent);
            }

            $scope.entities         =   propertiesContext.getSelectedService().entities;
            $scope.intents          =   propertiesContext.getConvoIntents();
            $scope.system_entities  =   propertiesContext.getSystemEntities();

            $scope.submitting = () => submitting;

            $scope.onUpdate         =   function( intent) {
                $log.debug( 'intentDetails onUpdate intent', intent);
                $scope.$applyAsync( function () {
                    $scope.current_intent     =   angular.copy( intent);
                });
            }

            $scope.submitIntent = function() {
                submitting = true;
                propertiesContext.updateConvoIntent( $scope.current_intent, selected);
                submitting = false;
                $window.history.back();
            }

            $scope.cancel = function()
            {
                submitting = false;
                $window.history.back();
            }

            $scope.isIntentChanged = function() {
                return !angular.equals( $scope.current_intent, original);
            }

        }
    }
};
