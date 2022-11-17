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
            let is_valid = true;
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
            $scope.valid = () => is_valid;

            $scope.hasChildren = () => propertiesContext.getSelectedService().intents.some(intent => intent.parent_intent && intent.parent_intent === $scope.current_intent.name)
            
            $scope.getChildIntentNames = () => propertiesContext.getSelectedService().intents
                .filter(intent => intent.parent_intent && intent.parent_intent === $scope.current_intent.name)
                .map(intent => intent.name);

            $scope.onUpdate = function(intent, valid) {
                $log.debug( 'intentDetails onUpdate intent', intent, valid);
                $scope.$applyAsync( function () {
                    $scope.current_intent     =   angular.copy( intent);
                    is_valid = valid;
                });
            }

            $scope.validator = function( str) {
                $log.debug( 'intentDetails validator str', str);
                return true;
            }

            $scope.submitIntent = function() {
                submitting = true;
                propertiesContext.updateConvoIntent(original, $scope.current_intent);
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
