import template from './subroutine-component.tmpl.html';

/* @ngInject */
export default function subroutineComponent( $log, $timeout, ConvoworksApi)
    {
        return {
            restrict: 'E',
            scope: { 'block' : '='},
            require: '^propertiesContext',
            template: template,
            link: function( $scope, $element, $attributes, propertiesContext) {

                // API
                $scope.over                 =   false;
                $scope.ready                =   false;
                $scope.previewing           =   false;
                $scope.componentTitle       =   "";
                $scope.componentName        =   "";

                $scope.getComponentTitle    =   function() {
                    if ( !$scope.definition) {
                        return 'Generating title ...';
                    }

                    if ( $scope.block.properties.name) {
                        return $scope.block.properties.name;
                    }

                    return 'Fragment - ' + $scope.block.properties.fragment_id + '';
                };

                $scope.isSelected   =   function() {
                    return propertiesContext.getSelection().component === $scope.block;
                };

                $scope.toggleOpen   =   function( type) {
                    open[type]  =   !open[type];
                };

                $scope.isOpen   =   function( type) {
                    return open[type];
                };

                $scope.getService       =   function()
                {
                    return propertiesContext.getSelectedService();
                }

                $scope.togglePreviewing =   function()
                {
                    $scope.previewing   =   !$scope.previewing;
                }

                $scope.$on( '$destroy', function() {
                    $log.log( 'subroutineComponent $destroy');
                });

                $scope.moveUp = function()
                {
                    $scope.$emit('moveFragment', {
                        fragmentId: $scope.block.properties.fragment_id + '',
                        dir: -1
                    });
                }

                $scope.moveDown = function()
                {
                    $scope.$emit('moveFragment', {
                        fragmentId: $scope.block.properties.fragment_id + '',
                        dir: 1
                    });
                }

                // INIT
                var open;

                $scope.$watch( 'block.properties._component_id', function ( b) {
                    _init();
                });

                function _init()
                {
                    $scope.ready                =   false;
                    open    =   {
                        elements : false,
                        processors : false,
                    };
//                  $log.log( 'subroutineComponent _init() got ', '$scope.block.properties.subroutine_id ['+$scope.block.properties.subroutine_id+']', '$scope.block', $scope.block);

                    var serviceId = propertiesContext.getSelectedService()['service_id'];
                    $log.log('subroutineComponent going to get definition', serviceId);

                    try {
                        $scope.definition       =   propertiesContext.getComponentDefinition( $scope.block.class);
                    } catch ( err) {
                        $log.error( err);
                        $scope.componentTitle   =   err.message;
                        $scope.definition       =   null;
                    }

                    $scope.componentName        =   $scope.block.properties.name;
                    $scope.componentTitle       =   'Fragment - ' + $scope.block.properties.fragment_id + '';

                    if ( $scope.block.class == '\\Convo\\Pckg\\Core\\Elements\\ElementsFragment') {
                        $scope.propertyName         =   'elements';
                    } else if ( $scope.block.class == '\\Convo\\Pckg\\Core\\Processors\\ProcessorFragment') {
                        $scope.propertyName         =   'processors';
                    } else {
                        throw new Error( 'Unexpected subroutine type ['+$scope.block.properties._workflow+']');
                    }

                    $scope.propertyDefinition   =   $scope.definition.component_properties[$scope.propertyName];

                    $scope.$applyAsync( function() {
                        $scope.ready            =   true;
                    });
                }

                $timeout( function() {
                    _initClick();
                }, 100);

                function _initClick()
                {
                    var $div    =   $element.find( 'div.selectable-component')[0];

                    var containerController =   {
                        deleteSelectedComponent: function() { propertiesContext.removeSubroutine( $scope.block.properties.fragment_id); }
                    };


                    $($div).bind( 'click', function( event) {
                        $scope.$apply( function () {
                            if ( $scope.isSelected()) {
                                propertiesContext.setSelectedComponent( null);
                            } else {
                                propertiesContext.setSelectedComponent( $scope.block, containerController);
                            }
                            event.stopPropagation();
                        });
                    });
                }
            }
        }
    };
