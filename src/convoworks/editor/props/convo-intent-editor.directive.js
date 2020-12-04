import template from './convo-intent-editor.tmpl.html';

/* @ngInject */
export default function convoIntentEditor( $log) {
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
