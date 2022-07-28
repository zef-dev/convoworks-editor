import template from './delegate-slot-editor.tmpl.html';

/* @ngInject */
export default function delegateSlotEditor($log) {
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
            $log.log('delegateSlotEditor linked');

            let target_intent = null;
             _setUpIntentSlots($scope.container.properties.intent);

            $log.log('delegateSlotEditor intentSlots set to', $scope.intentSlots);

            $scope.$watch(() => $scope.container.properties.intent, (newVal, oldVal) => {
                if (newVal === oldVal) {
                    return;
                }

                _setUpIntentSlots(newVal);
            }, true);

            function _setUpIntentSlots(parentContainerIntent) {
                target_intent = $scope.service.intents.find(i => parentContainerIntent === i.name);
                $scope.intentSlots = _getSlotsOutOfUtterances(target_intent);

                $log.log('delegateSlotEditor container intent changed to', target_intent, 'new slots', $scope.intentSlots);
            }

            function _getSlotsOutOfUtterances(intent) {
                if (!intent || !intent.utterances) {
                    return [];
                }

                $log.log('delegateSlotEditor getting slots out of intent', intent);
                
                return intent
                .utterances
                .map(
                    utterance => utterance.model.map(
                        model => model.slot_value))
                .flat()
                .filter((value, index, self) => value && self.indexOf(value) === index)
            }
        }
    }
}