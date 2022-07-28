import template from './intent-delegate-editor.tmpl.html';

/* @ngInject */
export default function intentDelegateEditor($log, $state, localStorageService) {
    return {
        restrict: 'E',
        scope: {
            key: '=',
            component: '=',
            service: '=',
            definition: '=',
            container: '='
        },
        template,
        link: ($scope, $element, $attributes) => {
            $log.log('intentDelegateEditor linked with container', $scope.container);
            
            let target_intent = null;
            _setUpChildIntents($scope.container.properties.intent);

            const quick_child_intent = localStorageService.get('quick_child_intent');

            $log.log('intentDelegateEditor quick_child_intent', quick_child_intent);

            if (quick_child_intent && quick_child_intent.component_id === $scope.component.properties._component_id) {
                $scope.component.properties[$scope.key] = quick_child_intent.intent;

                localStorageService.set('quick_child_intent', null);
            }

            $scope.quickAddChildIntent = function() {
                if (!target_intent) {
                    $log.warn('intentDelegateEditor quickAddChildIntent no target intent');
                    return;
                }

                $log.log('intentDelegateEditor quickAddChildIntent()');

                let quick_child_intent = localStorageService.get('quick_child_intent');

                if (!quick_child_intent) {
                    localStorageService.set('quick_child_intent', {
                        component_id: $scope.component.properties._component_id
                    });

                    $log.log('intentDelegateEditor quick child intent set to', localStorageService.get('quick_child_intent'));
                }

                $state.go('convoworks-editor-service.intent-new', { parent: target_intent.name });
            }            

            $scope.$watch(() => $scope.container.properties.intent, (newVal, oldVal) => {
                if (newVal === oldVal) {
                    return;
                }

                _setUpChildIntents(newVal);
            }, true);

            function _setUpChildIntents(parentContainerIntent)
            {
                target_intent = $scope.service.intents.find(i => parentContainerIntent === i.name);
                $scope.childIntents = $scope.service.intents.filter(intent => intent.parent_intent && intent.parent_intent === target_intent.name).map(child => child.name);
                
                $log.log('intentDelegateEditor container intent changed to', target_intent, 'new children', $scope.childIntents);
            }
        }
    }
}