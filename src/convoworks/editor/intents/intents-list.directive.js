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

            $scope.intents = propertiesContext.getSelectedService().intents.filter(i => !i.parent_intent);

            const parent_child_map = propertiesContext.getSelectedService().intents.reduce((map, intent) => {
                if (intent.parent_intent) {
                    if (map[intent.parent_intent]) {
                        map[intent.parent_intent].push(intent);
                    } else {
                        map[intent.parent_intent] = [intent];
                    }
                }

                return map;
            }, {});

            $scope.deleteIntent = function($event, index) {
                $event.preventDefault();
                $event.stopPropagation();

                var intentName = $scope.intents[index].name;
                if ( $window.confirm( "Are you sure you want to delete " + intentName + "?")) {
                    propertiesContext.removeConvoIntent( index);
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
