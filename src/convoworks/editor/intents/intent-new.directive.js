import template from './intent-new.tmpl.html';

const defaultNewIntent  =   {
    name : 'NewIntent',
    type : 'custom',
    utterances : []
};

/* @ngInject */
export default function intentNew( $log, $window, $stateParams, $transitions, localStorageService)
{
    return {
        restrict: 'E',
        scope: {},
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentNew link $stateParams.name', $stateParams.name, '$stateParams.parent', $stateParams.parent);

            let submitting = false;
            var original = angular.copy( defaultNewIntent);
            
            if ($stateParams.parent) {
                original.parent_intent = $stateParams.parent;
            }

            var current = angular.copy( original);

            const $onTransitionClear = $transitions.onSuccess({}, () => {
                const qi = localStorageService.get('quick_intent');
                if (!qi || !qi.intent) {
                    $log.log('intentNew onTransitionClear() removing quick intent')
                    localStorageService.set('quick_intent', null);
                }

                const qci = localStorageService.get('quick_child_intent');
                if (!qci || !qci.intent) {
                    $log.log('intentNew onTransitionClear() removing quick child intent')
                    localStorageService.set('quick_child_intent', null);
                }
            });

            $scope.$on('$destroy', () => { $onTransitionClear(); });

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
                propertiesContext.addConvoIntent(current);

                let quick_intent = localStorageService.get('quick_intent');
                if (quick_intent && quick_intent.component_id) {
                    quick_intent.intent = current.name;
    
                    localStorageService.set('quick_intent', quick_intent);
                }

                let quick_child_intent = localStorageService.get('quick_child_intent');
                if (quick_child_intent && quick_child_intent.component_id) {
                    quick_child_intent.intent = current.name;

                    localStorageService.set('quick_child_intent', quick_child_intent);
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
