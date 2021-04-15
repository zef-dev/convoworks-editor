import template from './selectable-component.tmpl.html';

/* @ngInject */
export default function selectableComponent( $log, UserPreferencesService, $timeout, $compile, $state, AlertService)
    {
        return {
            restrict: 'E',
            scope: { 'component' : '=' },
            require: [ '^propertiesContext' , '^convoworksComponentsContainer'],
            template: template,
            link: function( $scope, $element, $attributes, $ctrls) {

                var propertiesContext               =   $ctrls[0];
                var convoworksComponentsContainer   =   $ctrls[1];
                var $draggable;
                var service                 =   propertiesContext.getSelectedService();
//              $log.log( 'selectableComponent link() $scope.component', $scope.component);
                var defaultTitle            =   'Unknown'
                $scope.over                 =   false;
                $scope.ready                =   false;

                $scope.isElement            =   false;
                $scope.isProcessor          =   false;
                $scope.isFilter             =   false;

                _init();

                $scope.isSelected   =   function() {
                    return propertiesContext.getSelection().component === $scope.component;
                };

                $scope.getBlockName =   function( blockId) {
                    try {
                        var block   =   propertiesContext.findBlock( blockId);
                    } catch ( err) {
                        return 'ID: ' + blockId;
                    }
                    if ( block.properties.name) {
                        return block.properties.name;
                    }
                    return 'ID: ' + blockId;
                }

                $scope.isBlockLinkable  =   function( blockId)
                {
                    try {
                        propertiesContext.findBlock( blockId);
                        return true;
                    } catch ( err) {
                    }
                    return false;
                }

                $scope.selectBlock  =   function( blockId)
                {
                    $state.go( 'convoworks-editor-service.editor', { sb:blockId, sv:'steps'},
                    { inherit:true, reload:false, notify:true, location:true});
                }


                $scope.getSubroutineName    =   function( fragmentId) {
                    try {
                        var fragment    =   propertiesContext.findSubroutine( fragmentId);
                    } catch ( err) {
                        return 'ID: ' + fragmentId;
                    }
                    if ( fragment.properties.name) {
                        return fragment.properties.name;
                    }
                    return 'ID: ' + fragmentId;
                }

                $scope.isSubroutineLinkable  =   function( fragmentId)
                {
                    try {
                        propertiesContext.findSubroutine( fragmentId);
                        return true;
                    } catch ( err) {
                    }
                    return false;
                }

                $scope.selectSubroutine  =   function( fragmentId)
                {
                    $state.go( 'convoworks-editor-service.editor', { sb:fragmentId, sv:'fragments'},
                    { inherit:true, reload:false, notify:true, location:true});
                }

                $scope.isSystemIntent = function(intentName)
                {
                    return intentName.includes('.');
                }

                $scope.getIntentIndex = function(intentName)
                {
                    return propertiesContext.getSelectedService().intents.findIndex((intent) => intent.name === intentName);
                }

                $scope.gotoIntent = function(intentName)
                {
                    const i = propertiesContext.getSelectedService().intents.findIndex((intent) => intent.name === intentName);

                    if (i > -1) {
                        $state.go('convoworks-editor-service.intent-details', { index: i }, {
                            inherit: true,
                            reload: false,
                            notify: true,
                            location: true
                        });
                    }
                }

                $scope.getContextOptions    =   function() {

                    var options =   [];

                    options.push(
                        {
                            text: 'Cut',
                            click: function ($itemScope, $event, modelValue, text, $li) {
                                $log.log( 'selectableComponent context cut');
                                propertiesContext.cut( convoworksComponentsContainer, $scope.component);
                            }
                        }
                    );

                    options.push(
                        {
                            text: 'Copy',
                            click: function ($itemScope, $event, modelValue, text, $li) {
                                $log.log( 'selectableComponent context copy');
                                propertiesContext.copy( $scope.component);
                            }
                        }
                    );

                    if ( propertiesContext.hasClipboard())
                    {
                        const paste_data = propertiesContext.getPasteData();

                        if (!paste_data.allowed)
                        {
                            options.push(
                                {
                                    text: 'Paste',
                                    click: function () {
                                        AlertService.addWarning(`Cannot paste, the following packages are not enabled: [${paste_data.missing.join(', ')}].`);
                                    }
                                }
                            );
                        }
                        else if (convoworksComponentsContainer.acceptsComponent( propertiesContext.getClipboard().component))
                        {
                            options.push(
                                {
                                    text: 'Paste',
                                    click: function ($itemScope, $event, modelValue, text, $li) {
                                        $log.log( 'selectableComponent context paste');
                                        var index       =   convoworksComponentsContainer.indexOf( $scope.component) + 1;
                                        propertiesContext.paste( convoworksComponentsContainer, index);
                                    }
                                }
                            );
                        }
                    }

                    options.push( null);
                    options.push(
                        {
                            text: 'Delete',
                            click: function ($itemScope, $event, modelValue, text, $li) {
                                $log.log( 'selectableComponent context delete');
                                if ( propertiesContext.getSelection().component === $scope.component) {
                                    propertiesContext.setSelectedComponent( null);
                                }
                                convoworksComponentsContainer.removeComponent( $scope.component);
                            }
                        }
                    );
                    return options;
                }

                $scope.getComponentTitle =   function() {
                    if ( $scope.definition && $scope.component) {
                        if ( $scope.component.properties.name) {
                            if ( UserPreferencesService.get( 'show_default_titles', true)) {
                                return $scope.definition.name + ' - ' + $scope.component.properties.name;
                            }
                            return $scope.component.properties.name;
                        }
                        return $scope.definition.name;
                    }
                    return defaultTitle;
                }

                $scope.showComponentTitle =   function() {
                    if ( $scope.definition && $scope.component) {
                        if ( $scope.component.properties.name
                            || UserPreferencesService.get( 'show_default_titles', true)
                            || !$scope.definition.component_properties._preview_angular) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                }

                $scope.$on( '$destroy', function() {
                    $log.log( 'selectableComponent $destroy');
                    if ($draggable) {
                        $draggable.draggable({disabled: true}).draggable( 'destroy');
                    }
                });

                function _init()
                {
//                  $log.log( 'selectableComponent _init() $scope.component', $scope.component);

                    if ( !$scope.component) {
                        throw new Error( 'No component defined');
                    }
//                  $log.log( 'selectableComponent _init() got class ['+$scope.component['class']+']', '$scope.component', $scope.component);

                    var class_name  =       $scope.component['class'];
                    if ( !class_name) {
                        $log.log( 'selectableComponent _init() $scope.component', $scope.component);
                        throw new Error( 'No class in component');
                    }

                    try {
                        $scope.definition       =   propertiesContext.getComponentDefinition( class_name);
                        $scope.isElement        =   false;
                        if ( $scope.definition.component_properties._interface) {
                            if ( $scope.definition.component_properties._interface === '\\Convo\\Core\\Workflow\\IConversationProcessor') {
                                $scope.isProcessor      =   true;
                            } else if ( $scope.definition.component_properties._interface === '\\Convo\\Core\\Workflow\\IRequestFilter') {
                                $scope.isFilter         =   true;
                            } else if ( $scope.definition.component_properties._interface === '\\Convo\\Core\\Workflow\\IConversationElement') {
                                $scope.isElement        =   true;
                            }
                        }
                        $timeout( function() {
                            _initPreview();
                            _initDraggable();
                            _initDroppable();
                            _initClick();
                        }, 10)
                    } catch ( err) {
                        $log.error( err);
                        $scope.definition       =   null;
                        defaultTitle            =   err.message;
                        // good old timeout
                        $timeout( function() {
                            _initClick();
                        }, 10)
                    }

                    $scope.$applyAsync( function() {
                        $scope.ready            =   true;
                    });
                }

                function _initDraggable()
                {
                    $draggable  =   $($element.find( 'div.selectable-component')[0]);
//                  $log.log( 'selectableComponent link() $draggable', $draggable);
                    $draggable.draggable( {
                        revert: true,
                        revertDuration : 50,
                        zIndex: 100,
                        delay : 200,
                        tolerance : 'pointer',
                        appendTo: '.convoworks',
                        helper: 'clone',
                        refreshPositions: true,
                        start: function( event, ui) {
//                          $(this).data( 'component', $scope.component);
                            $(this).data( 'convoDragged', {
                                type : 'component',
                                component : $scope.component,
                                containerController : convoworksComponentsContainer
                            });

                            ui.helper.bind( "click.prevent",
                                    function(event) { event.preventDefault(); });
                        },
                        stop: function( event, ui) {
                            setTimeout(function(){ui.helper.unbind("click.prevent");}, 300);
                        },
                    });
                }

                function _initDroppable()
                {
                    var $droppable  =   $($element.find( 'div.selectable-component')[0]);

                    $droppable.droppable({
                        greedy: true,
                        over: function( event, ui) {
                            var data    =   ui.draggable.data('convoDragged');
//                            var target  =   ui.draggable;
                            var target  =   this;
                            if ( data.type == 'definition')
                            {
                                if ( !convoworksComponentsContainer.acceptsDefinition( data.componentDefinition))
                                {
                                      $(target).addClass('drop-blocked');
                                }
                                else
                                {
                                    $(target).addClass('drop-allowed');
                                }
                            }
                            else if ( data.type == 'component')
                            {
                                if ( !convoworksComponentsContainer.acceptsComponent( data.component))
                                {
                                      $(target).addClass('drop-blocked');
                                }
                                 else
                                {
                                    $(target).addClass('drop-allowed');
                                }
                            }
                          },
                          out: function( event, ui) {
                            $(this).removeClass('drop-blocked drop-allowed ui-droppable-hover');
                        },
                        deactivate: function (event, ui) { // dropped somewhere
                            $(this).removeClass('drop-blocked drop-allowed ui-droppable-hover ui-droppable-active');
                        },
                        drop: function( event, ui ) {

                            var data        =   ui.draggable.data('convoDragged');
                            $log.log( 'selectableComponent drop event', event, 'ui', ui, 'data', data);
                              if ( data) {

                                  if ( data.handled) {
                                      $log.log( 'selectableComponent already handled');
                                      return;
                                  }

                                    if ( data.type == 'definition' && !convoworksComponentsContainer.acceptsDefinition( data.componentDefinition))
                                    {
                                          AlertService.addInfo( 'Can not add componet "' + data.componentDefinition.name + '" to "' +
                                          convoworksComponentsContainer.getPropertyDefinition().name) + '"';
                                          return false;
                                    }

                                    if ( data.type == 'component' && !convoworksComponentsContainer.acceptsComponent( data.component))
                                    {
                                          AlertService.addInfo( 'Can not move componet to "' +
                                          convoworksComponentsContainer.getPropertyDefinition().name) + '"';
                                          return false;
                                    }

                                  $scope.$apply( function() {

                                      var index     =   convoworksComponentsContainer.indexOf( $scope.component) + 1;
                                      if ( data.type == 'definition') {
                                          $log.log( 'selectableComponent new component', data.componentDefinition, 'to container', $scope.container, 'in component', $scope.component);

                                          propertiesContext.addNewComponent(
                                                  convoworksComponentsContainer,
                                                  data.componentDefinition,
                                                  index);

                                      } else if ( data.type == 'component') {
                                          $log.log( 'selectableComponent move component', data.component);

                                          propertiesContext.moveComponent(
                                                  data.containerController,
                                                  convoworksComponentsContainer,
                                                  data.component,
                                                  index);

                                      } else {
                                          throw new Error( 'Expected to have type [definition] or [component]');
                                      }
                                      data.handled  =   true;
                                });
                              } else {
                                  $log.error( 'selectableComponent Expected to have [convoDragged] data  ['+event.target.className+']');
                              }
                              $(event.target).removeClass('ui-droppable-hover');
                              return false;
                          }
                        });
                }

                function _initClick()
                {
                    var $div    =   $element.find( 'div.selectable-component')[0];
                    $($div).bind( 'click', function( event) {
                        $log.log( 'selectableComponent click $scope.isSelected()', $scope.isSelected());

                        $scope.$apply( function () {
                            if ( $scope.isSelected()) {
                                propertiesContext.setSelectedComponent( null);
                            } else {
                                propertiesContext.setSelectedComponent( $scope.component, { deleteSelectedComponent: convoworksComponentsContainer.removeComponent });
                            }
                        });

                        event.stopPropagation();
                    });
                }

                function _initPreview() {
                    var container   =   $element.find( '.preview');
                    if ( $scope.definition.component_properties._preview_angular) {
//                      $log.log( 'selectableComponent _initPreview() $scope.definition.component_properties._preview_angular', $scope.definition.component_properties._preview_angular);
                        var html        =   $scope.definition.component_properties._preview_angular.template;
                        container.html( html);
                        $compile( container.contents())( $scope);
                    } else {
                        container.html( '');
                    }
                };
            }
        }
    };
