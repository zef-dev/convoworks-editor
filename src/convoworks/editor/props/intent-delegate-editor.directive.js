import template from './intent-delegate-editor.tmpl.html';

/* @ngInject */
export default function intentDelegateEditor($log) {
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

            $scope.$watch(() => $scope.container.properties.intent, (newVal, oldVal) => {
                if (newVal === oldVal) {
                    return;
                }

                _setUpChildIntents(newVal);
            }, true)

            function _setUpChildIntents(parentContainerIntent)
            {
                target_intent = $scope.service.intents.find(i => parentContainerIntent === i.name);
                $scope.childIntents = $scope.service.intents.filter(intent => intent.parent_intent && intent.parent_intent === target_intent.name).map(child => child.name);
                
                $log.log('intentDelegateEditor container intent changed to', target_intent, 'new children', $scope.childIntents);
            }
        }
    }
}