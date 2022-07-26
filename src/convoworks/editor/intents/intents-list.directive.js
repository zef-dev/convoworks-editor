import template from './intents-list.tmpl.html';

/* @ngInject */
export default function intentList( $log, $window, $state)
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
