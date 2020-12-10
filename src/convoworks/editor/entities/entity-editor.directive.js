//import ReactDOM from 'react-dom';
//import React from 'react';
//import EntityDetails from "../../../ext/components/EntityComponent/entity_details.jsx";

/* @ngInject */
export default function entityEditor( $log)
{
    return {
        restrict: 'E',
        scope: {
            entity : '=',
            onUpdate : '=',
        },
        template: '<div></div>',
        link: function( $scope, $element, $attributes) {
            $log.debug( 'entityEditor link');

            $scope.$on( "$destroy", function () {
                $log.debug( 'entityEditor destroy');
                unmountReactElement();
            });

            function unmountReactElement() {
                $log.debug( 'entityEditor unmountReactElement');
//                ReactDOM.unmountComponentAtNode( $element[0] );
            }

            function _render( entity)
            {
                $log.debug( 'entityEditor _render()', entity);
//                ReactDOM.render( <EntityDetails entity={entity} onUpdate={$scope.onUpdate}/>, $element[0]);
            }

            $scope.$watch( 'entity', function ( entity) {
                _render( entity);
            })

        }
    }
};
