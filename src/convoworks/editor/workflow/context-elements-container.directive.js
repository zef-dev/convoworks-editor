import template from './context-elements-container.tmpl.html';
import propertiesContext from "../properties-context.directive";

/* @ngInject */
export default function contextElementsContainer( $log, $rootScope)
{
    var AUTO_OPEN_TIMEOUT   =   1500;

    return {
        restrict: 'E',
        template: template,
        require: [ '^contextElementsContainer', '^propertiesContext'],
        scope: { 'service': '=' },
        controller: function( $scope) {
            'ngInject';
            this.getContainer       =   getContainer;
            this.indexOf            =   indexOf;
            this.isMultiple         =   isMultiple;
            this.addComponent       =   addComponent;
            this.removeComponent    =   removeComponent;

            function getContainer()
            {
                return $scope.service.contexts;
            }

            function indexOf( component)
            {
                return getContainer().findIndex( function( context) {
                    return context.properties._component_id === component.properties._component_id ;
                });
            }

            function isMultiple()
            {
                return true;
            }

            function addComponent( component, index)
            {
                if ( !index) {
                    index   =   0;
                }

                getContainer().splice( index, 0, component);
            }

            function removeComponent( component)
            {
                $scope.service.contexts =   getContainer().filter( function( context) {
                    return context.properties.id    !==     component.properties.id;
                });
            }
        },
        link: function( $scope, $element, $attributes, $ctrls)
        {
            var contextElementsContainer    =   $ctrls[0];
            var propertiesContext           =   $ctrls[1];

            var open        =   true;
            var open_timer  =   null;

            _initDroppable();

            $scope.isOpen           =   function()
            {
                return open;
            };

            $scope.toggleOpen       =   function()
            {
                open    =   !open;
            };

            $scope.$on(
                "$destroy",
                function( event ) {
                    if ( open_timer) {
                        $timeout.cancel( open_timer );
                        open_timer  =   null;
                    }
                }
            );

            $rootScope.$on('AddContext', function(evt, data) {
                propertiesContext.addNewComponent( contextElementsContainer, data);
            })

            function _initDroppable()
            {
                var $droppable  =   $($element.find( '.context-container')[0]);
                $droppable.droppable({
                    greedy: true,
                    drop: function( event, ui ) {
                        if ( ui.draggable.data( 'convoDragged')) {
                            $scope.$apply( function() {
                                var data    =   ui.draggable.data( 'convoDragged');

                                $log.log( 'contextElementsContainer droppable data', data);

                                if ( data.type == 'definition') {
                                    propertiesContext.addNewComponent(
                                        contextElementsContainer,
                                        data.componentDefinition);
                                } else if ( data.type == 'component') {
                                    propertiesContext.moveComponent(
                                        data.containerController,
                                        contextElementsContainer,
                                        data.component);
                                } else {
                                    throw new Error( 'Expected to have type [definition] or [component]');
                                }
                            });
                        } else {
                            throw new Error( 'Expected to have [convoDragged] data');
                        }
                    },
                    over: function( event, ui) {
                        if ( !open) {
                            open_timer  =   $timeout( function() {
                                open = true;
                            }, AUTO_OPEN_TIMEOUT);
                        }
                    },
                    out: function( event, ui) {
                        if ( open_timer) {
                            $timeout.cancel( open_timer );
                            open_timer  =   null;
                        }
                    },
                });
            }
        }
    }
};
