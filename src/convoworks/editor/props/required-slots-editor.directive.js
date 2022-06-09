import template from './required-slots-editor.tmpl.html';

/* @ngInject */
export default function requiredSlotsEditor($log, ConvoworksApi) {
    return {
        restrict: 'E',
        require: '^propertiesContext',
        template: template,
        scope: {
            component: '=',
            propertyDefinition: '=',
            key: '=',
            service: '='
        },
        link: function ($scope, $element, $attributes, propertiesContext) {
            $log.log('requiredSlotsEditor link');

            _init();

            $scope.$watch('component', (component) => {
                $log.log('requiredSlotsEditor selected component changed', component);
                $scope.intent_slots = {};

                if (component) {
                    const intent = $scope.service.intents.filter((i) => i.name === component.properties.intent)[0];

                    if (!intent) {
                        $log.log('requiredSlotsEditor $watch undefined intent');
                        $scope.component.properties[$scope.key] = [];
                        return;
                    }

                    $log.log('requiredSlotsEditor $watch got matched intent', intent);

                    $scope.intent_slots = _setupIntentSlots(intent);
                    _syncIntentSlots();
                }
            }, true);

            $scope.$watch('intent_slots', (val) => {
                let required_slots = [];

                for (const slot in val) {
                    $log.log('requiredSlotsEditor $watch intent_slots', val[slot]);

                    if (val[slot].required) {
                        required_slots.push(slot);
                    }
                }
                required_slots.sort();
                $scope.component.properties[$scope.key] = required_slots;
            }, true);

            $scope.isSlotRequired = function (slotName) {
                return $scope.component.properties[$scope.key].includes(slotName);
            }

            $scope.areAllRequired = function () {
                if (Object.getOwnPropertyNames($scope.intent_slots).length === 0) {
                    return false;
                }

                for (const slot in $scope.intent_slots) {
                    if ($scope.intent_slots[slot].required === false) {
                        return false;
                    }
                }

                return true;
            }

            $scope.toggleAllSlotsRequired = function () {
                const all = Object.keys($scope.intent_slots);
                let all_required = true;

                for (const slot of all) {
                    if (!$scope.intent_slots[slot].required) {
                        all_required = false;
                        break;
                    }
                }

                for (const slot of all) {
                    $scope.intent_slots[slot].required = !all_required;
                }
            }

            // INIT
            function _init() {
                $scope.intent_slots = {};

                // non existent
                if (!$scope.component.properties[$scope.key]) {
                    $scope.component.properties[$scope.key] = [];
                }

                // old string separated with commas
                if (!Array.isArray($scope.component.properties[$scope.key])) {
                    if ($scope.component.properties[$scope.key].length) {
                        $scope.component.properties[$scope.key] = $scope.component.properties[$scope.key].split(',');
                    } else {
                        $scope.component.properties[$scope.key] = [];
                    }
                }
            }

            function _setupIntentSlots(intent)
            {
                if (!intent.utterances) {
                    return {};
                }

                return intent.utterances
                    .map((utterance) => utterance.model)
                    .flat()
                    .filter((model) => model.hasOwnProperty('type'))
                    .reduce((slots, model) => {
                        const value = model['slot_value'] || model.type.replace('@', '');
                        const type = model.type;

                        $log.log('requiredSlotsEditor utterances model map value', value, 'type', type);

                        if (!slots[value]) {
                            slots[value] = {
                                type,
                                required: $scope.component.properties[$scope.key].includes(value)
                            };
                        }

                        return slots;
                    }, {});
            }

            function _syncIntentSlots()
            {
                for (let i = 0; i < $scope.component.properties[$scope.key].length; ++i) {
                    const slot = $scope.component.properties[$scope.key][i];

                    if (!$scope.intent_slots.hasOwnProperty(slot)) {
                        $log.log(`requiredSlotsEditor found required slot ${slot} that doesn't exist in intent utterances.`);
                        $scope.component.properties[$scope.key].splice(i, 1);
                    }
                }
            }
        }
    }
};
