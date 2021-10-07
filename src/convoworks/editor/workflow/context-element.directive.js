import template from './context-element.tmpl.html';

/* @ngInject */
export default function contextElement( $log, $rootScope, ConvoworksApi, $timeout, $compile)
{
    return {
        restrict: 'E',
        scope: { 'contextElement' : '=' },
        require: [ '^propertiesContext', '^contextElementsContainer'],
        template: template,
        link: function( $scope, $element, $attributes, $ctrls) {
            var $draggable;

            var propertiesContext           =   $ctrls[0];
            var contextElementsContainer    =   $ctrls[1];

            $scope.over                 =   false;
            $scope.componentTitle       =   "";

            _init();

            $scope.isSelected   =   function() {
                return propertiesContext.getSelection().component === $scope.contextElement;
            };

            $scope.$on('PackagesUpdated', function() {
                _init();
            })

            $scope.$on( '$destroy', function() {
                $log.log( 'contextElement $destroy');
                if ( $draggable) {
                    $draggable.draggable({ disabled: true }).draggable( 'destroy');
                }
            });

            $scope.getContextOptions = function()
            {
                let options = [];

                options.push(
                    {
                        text: 'Delete',
                        click: function ($itemScope, $event, modelValue, text, $li) {
                            $log.log('contextElement context delete');

                            if (propertiesContext.getSelection().component === $scope.contextElement) {
                                propertiesContext.setSelectedComponent(null);
                            }

                            contextElementsContainer.removeComponent($scope.contextElement);
                        }
                    }
                );

                return options;
            }

            function _init()
            {
                if ( !$scope.contextElement) {
                    throw new Error( 'No element provided!');
                }

                var class_name  =       $scope.contextElement['class'];

                if ( !class_name) {
                    $log.log( 'contextElement _init() $scope.contextElement', $scope.contextElement);
                    throw new Error( 'No class in component');
                }

                try {
                    var definition = propertiesContext.getComponentDefinition( class_name);
                    $log.log( 'contextElement directive getComponentDefinition() then definition', definition);
                    $scope.definition       =   definition;
                    $scope.componentTitle   =   definition.name;

                    // good old timeout
                    if ( $scope.definition) {
                        $timeout( function() {
                            _initPreview();
                            _initDraggable();
                            _initDroppable();
                            _initClick();
                        }, 10);
                    }

                } catch ( err) {
                    $log.error( err);
                    $scope.componentTitle   =   err.message;
                    $timeout( function() {
                        _initClick();
                    }, 10);
                }


            }

            function _initDraggable()
            {
                $draggable  =   $($element.find( 'div.selectable-component')[0]);

                $draggable.draggable( {
                    revert: true,
                    revertDuration : 50,
                    zIndex: 100,
                    delay : 200,
                    tolerance : 'pointer',
                    start: function( event, ui) {
                        $(this).data( 'convoDragged', {
                            type : 'component',
                            component : $scope.contextElement,
                            containerController: contextElementsContainer
                        });

                        ui.helper.bind( "click.prevent",
                            function(event) { event.preventDefault(); });
                    },
                    stop: function( event, ui) {
                        setTimeout(function(){ui.helper.unbind("click.prevent");}, 300);
                    }
                });
            }

            function _initDroppable()
            {
                var $droppable  =   $($element.find( 'div.selectable-component')[0]);

                $droppable.droppable({
                    greedy: true,
                    drop: function( event, ui ) {
                        if ( ui.draggable.data('convoDragged')) {
                            $scope.$apply( function() {

                                var data        =   ui.draggable.data('convoDragged');
                                var index       =   contextElementsContainer.indexOf( $scope.contextElement) + 1;

                                if ( data.type == 'definition') {
                                    $log.log( 'convoworksComponentsContainer new component', data.componentDefinition, 'to container', contextElementsContainer.getContainer(), 'in component', $scope.contextElement);

                                    propertiesContext.addNewComponent(
                                        contextElementsContainer,
                                        data.componentDefinition,
                                        index);

                                } else if ( data.type == 'component') {
                                    $log.log( 'convoworksComponentsContainer move component', data.component);

                                    propertiesContext.moveComponent(
                                        data.containerController,
                                        contextElementsContainer,
                                        data.component,
                                        index);

                                } else {
                                    throw new Error( 'Expected to have type [definition] or [component]');
                                }
                            });
                        } else {
                            throw new Error( 'Expected to have [convoDragged] data');
                        }
                    }
                });
            }

            function _initClick()
            {
                var $div    =   $($element.find( 'div.selectable-component')[0]);
                $div.bind( 'click', function( event) {

                    $scope.$apply( function () {
                        if ( $scope.isSelected()) {
                            propertiesContext.setSelectedComponent( null);
                        } else {
                            propertiesContext.setSelectedComponent( $scope.contextElement, {
                                deleteSelectedComponent : function() {
                                    var contexts    =   propertiesContext.getSelection().service.contexts;

                                    propertiesContext.getSelection().service.contexts   =
                                            contexts.filter( function( contextElement) {
                                                return contextElement   !== $scope.contextElement;
                                            });
                            }});
                        }
                    });

                    event.stopPropagation();
                });
            }

            function _initPreview()
            {
                var container   =   $element.find( '.preview');

                if ( $scope.definition.component_properties._preview_angular) {
                    var html        =   $scope.definition.component_properties._preview_angular.template;
                    container.html( html);
                    $compile( container.contents())( $scope);
                } else {
                    container.html( '');
                }
            }
        }
    }
};
