import template from './intent-new.tmpl.html';

const defaultNewIntent  =   {
    name : 'NewIntent',
    type : 'custom',
    utterances : []
};

/* @ngInject */
export default function intentNew( $log, $window, $stateParams, localStorageService)
{
    return {
        restrict: 'E',
        scope: {},
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentNew link $stateParams.name', $stateParams.name);

            let submitting = false;
            var original = angular.copy( defaultNewIntent);
            var current = angular.copy( original);

            function _render()
            {
                var service             =   propertiesContext.getSelectedService();
                $scope.intent           =   current;
                $scope.entities         =   service.entities;
                $scope.intents          =   propertiesContext.getConvoIntents();
                $scope.system_entities  =   propertiesContext.getSystemEntities();
            }

            $scope.submitting = () => submitting;

            $scope.onUpdate         =   function( intent) {
                $log.debug( 'intentNew onUpdate intent', intent);
                $scope.$applyAsync( function () {
                    current     =   angular.copy( intent);
                    _render();
                });
            }

            $scope.submitIntent = function() {
                submitting = true;
                var index   =   propertiesContext.addConvoIntent( current);

                let quick_intent = localStorageService.get('quick_intent');

                if (quick_intent && quick_intent.component_id) {
                    quick_intent.intent = current.name;
                    quick_intent.intent_index = index;
    
                    localStorageService.set('quick_intent', quick_intent);
                }
                
                submitting = false;

                $window.history.back();
            }

            $scope.cancel = function()
            {
                localStorageService.set('quick_intent', null);
                submitting = false;
                $window.history.back();
            }

            $scope.isIntentChanged = function() {
                return !angular.equals( original, current);
            }

            _render();
        }
    }
};
