import template from './convo-intent-editor.tmpl.html';

/* @ngInject */
export default function convoIntentEditor($log, $state, localStorageService) {
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
        link: function ( $scope, $element, $attributes, propertiesContext) {
            $log.debug( 'convoIntentEditor link');
            $scope.error        =   false;
            $scope.intents      =   propertiesContext.getConvoIntents();
            $scope.slotPreviews =   {};

            $log.debug( 'convoIntentEditor $scope.intents', $scope.intents, $scope.service);

            const quick_intent = localStorageService.get('quick_intent');

            $log.log('convoIntentEditor quick_intent', quick_intent);

            if (quick_intent && quick_intent.component_id === $scope.component.properties._component_id) {
                $scope.component.properties[$scope.key] = quick_intent.intent;

                localStorageService.set('quick_intent', null);
            }

            $scope.quickAddIntent = function() {
                $log.log('convoIntentEditor quickAddIntent()');

                let quick_intent = localStorageService.get('quick_intent');

                if (!quick_intent) {
                    localStorageService.set('quick_intent', {
                        component_id: $scope.component.properties._component_id
                    });

                    $log.log('convoIntentEditor quick intent set to', localStorageService.get('quick_intent'));
                }

                $state.go('convoworks-editor-service.intent-new');
            }

            $scope.$watch(function() {
                return $scope.component.properties[$scope.key];
            }, function (val) {
                $log.log('convoIntentEditor selected intent changed', val);
                $scope.slotPreviews = {};

                if (val)
                {
                    var intent = $scope.intents.filter(function(i) {
                        return i.name === val;
                    })[0];

                    $log.log('convoIntentEditor $watch got matched intent', intent);

                    if (intent.utterances)
                    {
                        intent.utterances
                            .map(function (utterance) {
                                // $log.log('convoIntentEditor mapping utterance models', utterance.model);
                                return utterance.model;
                            })
                            .flat()
                            .filter(function(model) {
                                // $log.log('convoIntentEditor filtering models with types', model);
                                return model.hasOwnProperty('type');
                            })
                            .map(function(model) {
                                // $log.log('convoIntentEditor mapping model types and values', model);
                                var slotValue = model['slot_value'] || model.type.replace('@', '');
                                var slotType = model.type;

                                if (!$scope.slotPreviews[slotValue]) {
                                    $scope.slotPreviews[slotValue] = slotType;
                                }
                            });
                    }
                }
            });
        }
    }
};
