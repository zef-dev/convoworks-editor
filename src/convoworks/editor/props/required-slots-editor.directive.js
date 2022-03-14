import template from './required-slots-editor.tmpl.html';

/* @ngInject */
export default function requiredSlotsEditor($log, ConvoworksApi) {
    return  {
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

            // {
            //     slot_name: {
            //         type: string,
            //         required: boolean
            //     }
            // }
            $scope.intent_slots = {};

            $scope.$watch(function() {
                return $scope.component.properties.intent;
            }, function (val) {
                $log.log('requiredSlotsEditor selected intent changed', val);
                $scope.intent_slots = {};

                if (val)
                {
                    const intent = $scope.service.intents.filter((i) => i.name === val)[0];

                    if (!intent) {
                        $log.log('requiredSlotsEditor $watch undefined intent');
                        $scope.component.properties.required_slots = {};
                        return;
                    }

                    $log.log('requiredSlotsEditor $watch got matched intent', intent);

                    if (intent.utterances)
                    {
                        intent.utterances
                            .map((utterance) => utterance.model)
                            .flat()
                            .filter((model) => model.hasOwnProperty('type'))
                            .map((model) => {
                                const value = model['slot_value'] || model.type.replace('@', '');
                                const type = model.type;

                                $log.log('requiredSlotsEditor utterances model map value', value, 'type', type);

                                if (!$scope.intent_slots[value]) {
                                    $scope.intent_slots[value] = {
                                        type,
                                        required: $scope.component.properties[$scope.key].includes(value)
                                    };
                                }

                                $log.log('requiredSlotsEditor final intent_slots', $scope.intent_slots);
                            });
                    }
                }
            });

            $scope.$watch('intent_slots', (val) => {
                for (const slot in val)
                {
                    $log.log('requiredSlotsEditor $watch intent_slots', val[slot]);

                    if (val[slot].required)
                    {
                        if (!$scope.component.properties[$scope.key].includes(slot)) {
                            $scope.component.properties[$scope.key].push(slot);
                        }
                    }
                    else
                    {
                        if ($scope.component.properties[$scope.key].includes(slot)) {
                            $scope.component.properties[$scope.key].splice(
                                $scope.component.properties[$scope.key].indexOf(slot), 1
                            )
                        }
                    }
                }
            }, true)

            $scope.isSlotRequired = function (slotName)
            {
                return $scope.intent_slots[slotName].required;
            }

            $scope.areAllRequired = function ()
            {
                for (const slot of Object.keys($scope.intent_slots))
                {
                    if (!$scope.intent_slots[slot].required)
                    {
                        return false;
                    }
                }

                return true;
            }

            $scope.toggleAllSlotsRequired = function ()
            {
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
        }
    }
};
