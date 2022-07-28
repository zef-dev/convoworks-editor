import template from './intents-list.tmpl.html';

/* @ngInject */
export default function intentList($log, $window, $state, StringService)
{
    return {
        restrict: 'E',
        require: '^propertiesContext',
        scope: {},
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'intentList link');

            let parent_child_map = {};

            $scope.$watch(() => propertiesContext.getSelectedService().intents, (newVal, oldVal) => {
                $scope.intents = newVal.filter(i => !i.parent_intent);
                parent_child_map = newVal.reduce((map, intent) => {
                    if (intent.parent_intent) {
                        if (map[intent.parent_intent]) {
                            map[intent.parent_intent].push(intent);
                        } else {
                            map[intent.parent_intent] = [intent];
                        }
                    }
    
                    return map;
                }, {});
            }, true);

            $scope.addChildIntent = ($event, intent) => {
                $event.preventDefault();
                $event.stopPropagation();

                $state.go('convoworks-editor-service.intent-new', { parent: intent.name });
            }

            $scope.hasSlots = (intent) => {
                return intent.utterances && intent.utterances.some(utterance => utterance.model.some(part => part.slot_value));
            }

            $scope.generateSlotDelegates = ($event, intent) => {
                $event.preventDefault();
                $event.stopPropagation();

                if (!intent || !intent.utterances) {
                    return [];
                }
                
                const service = propertiesContext.getSelectedService();
                
                const slots = intent
                    .utterances
                    .map(
                        utterance => utterance.model.map(
                            model => { return { name: model.slot_value, text: model.text, type: model.type } }))
                    .flat()
                    .filter((value, index, self) => value.type && self.findIndex(v => v.name === value.name) === index)

                for (let i = 0; i < slots.length; ++i)
                {
                    const slot = slots[i];

                    const name = StringService.capitalizeFirst(`${slot.name}DelegateIntent`);

                    if (service.intents.some(intent => intent.name === name)) {
                        $log.warn(`intentsList generateSlotDelegates intent with name ${name} already exists.`);
                        continue;
                    }

                    let new_intent = {
                        parent_intent: intent.name,
                        name,
                        type: "custom",
                        utterances: [
                            {
                                "raw": slot.text,
                                "model": [
                                    {
                                        text: slot.text,
                                        type: slot.type,
                                        slot_value: slot.name
                                    }
                                ]
                            }
                        ]
                    }

                    service.intents.push(new_intent);
                }
            }

            $scope.deleteIntent = function($event, intent) {
                $event.preventDefault();
                $event.stopPropagation();

                if ($window.confirm(`Are you sure you want to delete ${intent.name}?`)) {
                    propertiesContext.removeConvoIntent(intent);
                }
            }

            $scope.getUtteranceCount = function (intent)
            {
                if (!intent.utterances || intent.utterances.length === 0) {
                    return 'No utterances';
                }

                if (intent.utterances.length === 1) {
                    return '1 utterance';
                }

                return `${intent.utterances.length} utterances`;
            }

            $scope.getChildIntents = (intent) =>
            {
                return parent_child_map[intent.name] || [];
            }
        }
    }
};
