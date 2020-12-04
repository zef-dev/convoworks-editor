import template from './convoworks-toolbox-component.tmpl.html';

/* @ngInject */
export default function convoworksToolboxComponent( $log, $compile)
{
    return {
        restrict: 'E',
        scope: {
            'componentDefinition' : '='
        },
        require : '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {

            _initDraggable();

            $scope.isDeprecated =   function() {
                if ( $scope.componentDefinition.name.indexOf('X!') === 0 || $scope.componentDefinition.name.indexOf('x!') === 0) {
                    return true;
                }
                return false;
            }

            function _initDraggable()
            {
                var $draggable  =   $element.find( '.toolbox-component');
                $draggable.draggable( {
                    revert: false,
                    zIndex: 100,
                    opacity: 1,
                    helper: 'clone',
                    tolerance : 'pointer',
                    refreshPositions: true,
                    start: function(e) {
                        $(this).data( 'convoDragged', {
                            type : 'definition',
                            componentDefinition : $scope.componentDefinition
                        });
                    },
                });
            }
        }
    }
}
