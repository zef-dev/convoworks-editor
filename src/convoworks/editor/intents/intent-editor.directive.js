import ReactDOM from 'react-dom';
import React from 'react';
//
import {
  IntentEditor
} from '@zef-dev/convoworks-intent-model-editor'

/* @ngInject */
export default function intentEditor( $log)
{
    return {
        restrict: 'E',
        scope: {
            intent : '=',
            intents: '=',
            entities : '=',
            systemEntities : '=',
            onUpdate : '=',
        },
        template: '<div></div>',
        link: function( $scope, $element, $attributes) {
            $log.debug( 'intentEditor link');

            $scope.$on( "$destroy", function () {
                $log.debug( 'intentEditor destroy');
                unmountReactElement();
            });

            function unmountReactElement() {
                $log.debug( 'intentEditor unmountReactElement');
                ReactDOM.unmountComponentAtNode( $element[0] );
            }

            function _render( intent)
            {
                $log.debug( 'intentEditor _render()', intent);
                ReactDOM.render( <IntentEditor intent={intent} intents={$scope.intents} entities={$scope.entities} systemEntities={$scope.systemEntities} onUpdate={$scope.onUpdate}/>, $element[0]);
            }

            $scope.$watch( 'intent', function ( intent) {
                _render( intent);
            })

        }
    }
};
