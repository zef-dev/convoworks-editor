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
            $scope.intents      =   propertiesContext.getConvoIntents().filter(intent => !intent.parent_intent);

            $log.debug( 'convoIntentEditor $scope.intents', $scope.intents, $scope.service);

            // const intent_input = $element.find("#main-intent-input");
            // const typeahead = $element.find(".convo-form-input:not([id])");
            
            // $log.log('convoIntentEditor found intent input', typeahead);
            
            // intent_input.on('focus', () => {
            //     const currentval = $scope.component[$scope.key];

            //     $log.log('convoIntentEditor focused intent input, current model value', currentval);
                
            //     if (currentval === null || currentval === undefined || currentval === "")
            //     {
            //         intent_input.trigger(jQuery.Event('keypress', { keycode: 67 }));
            //         typeahead.trigger('focus').trigger(jQuery.Event('keypress', { keycode: 67 }));
            //     }
            // });

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
        }
    }
};
