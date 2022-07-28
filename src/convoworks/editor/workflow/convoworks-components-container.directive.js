import template from './convoworks-components-container.tmpl.html';

/* @ngInject */
export default function convoworksComponentsContainer($log, $rootScope, $timeout, UserPreferencesService, AlertService)
    {
        var AUTO_OPEN_TIMEOUT   =   1500;

        return {
            restrict: 'E',
            scope: {
                'component' : '=',
                'propertyName' : '=',
                'propertyDefinition' : '=',
                'root' : '=?',
            },
            require: [ '^convoworksComponentsContainer', '^propertiesContext'],
            template: template,
            controller : function ( $scope, $element) {
                'ngInject';
                var propertiesContext   =   $element.controller('propertiesContext');

                this.getPropertyDefinition      =   getPropertyDefinition;
                this.getContainer               =   getContainer;
                this.getComponentContainer      =   getComponentContainer;
                this.isMultiple                 =   isMultiple;
                this.indexOf                    =   indexOf;
                this.addComponent               =   addComponent;
                this.removeComponent            =   removeComponent;
                this.acceptsComponent           =   acceptsComponent;
                this.acceptsDefinition          =   acceptsDefinition;

                function acceptsDefinition(definition) {
                    if (!$scope.propertyDefinition.editor_properties.allow_interfaces) {
                        return true;
                    }

                    $log.log('convoworksComponentsContainer acceptsDefinition', definition);

                    if (!isMultiple() && $scope.component.properties[$scope.propertyName] !== null) {
                        $log.warn('convoworksComponentsContainer acceptsDefinition will not accept additional child for single container');
                        return false;
                    }

                    let own = definition.type;

                    if (own.indexOf('\\') === 0) {
                        own = own.substring(1);
                    }

                    for (let iface of $scope.propertyDefinition.editor_properties.allow_interfaces) {
                        $log.log('convoworksComponentsContainer iterating over allowed interfaces with', iface);
                        
                        if (iface.indexOf('\\') === 0) {
                            iface = iface.substring(1);
                        }

                        if (own === iface) {
                            return true;
                        }

                        for (let implemented of definition._interfaces) {
                            if (implemented.indexOf('\\') === 0) {
                                implemented = implemented.substring(1);
                            }

                            $log.log('ConvoworksComponentContainer for', iface, implemented);

                            if (iface === implemented) {
                                return true;
                            }
                        }
                    }

                    return false;
                }

                function acceptsComponent( component)
                {
//                    $log.debug( 'convoworksComponentsContainer acceptsComponent', component);
                    return acceptsDefinition( propertiesContext.getComponentDefinition( component['class']));
                }

                function getPropertyDefinition()
                {
                    return $scope.propertyDefinition;
                }

                function getComponentContainer()
                {
                    return $scope.component;
                }

                function getContainer()
                {
                    if ( $scope.propertyName.indexOf( '.') > -1) {
                        var o       =   $scope.component.properties;
                        var parts   =   $scope.propertyName.split( '.');

                        for ( var i = 0; i < parts.length; i++) {
                            o   =   o[parts[i]];
                        }

                        return o;
                    }

                    // if ( $scope.component && $scope.component.properties)
                    //     return $scope.component.properties[$scope.propertyName];

                    if ($scope.component)
                    {
                        if (!$scope.component.properties[$scope.propertyName] && !!$scope.propertyDefinition.defaultValue) {
                            $scope.component.properties[$scope.propertyName] = $scope.propertyDefinition.defaultValue;
                        }
                        
                        return $scope.component.properties[$scope.propertyName];
                    }

                    $log.warn( 'convoworksComponentsContainer controller getContainer() no property ['+$scope.propertyName+'] in $scope.component', $scope.component);
                }

                function isMultiple()
                {
                    return $scope.propertyDefinition.editor_properties.multiple;
                }

                function indexOf( component)
                {
                    if ( isMultiple()) {
                        return getContainer().indexOf( component);
                    }
                    return 0;
                }

                function addComponent( component, index)
                {
                    if ( !index) {
                        index   =   0;
                    }

                    if ( isMultiple()) {
                        $log.log( 'convoworksComponentsContainer controller addComponent() adding component', component, 'at index', index);
                        getContainer().splice( index, 0, component);
                        return;
                    }

                    $log.log( 'convoworksComponentsContainer controller addComponent() setting component', component);
                    $scope.component.properties[$scope.propertyName]    =   component;
                }

                function removeComponent( component)
                {
                    if ( isMultiple()) {
                        var index   =   getContainer().indexOf( component);
                        $log.log( 'convoworksComponentsContainer controller removeComponent() removing component', component, 'from index', index);
                        getContainer().splice( index, 1);
                        return;
                    }

                    $log.log( 'convoworksComponentsContainer controller removeComponent() setting container at null');
                    $scope.component.properties[$scope.propertyName]    =   null;
                }
            },
            link: function( $scope, $element, $attributes, $ctrls) {

                var convoworksComponentsContainer   =   $ctrls[0];
                var propertiesContext               =   $ctrls[1];
//              $log.log( 'convoworksComponentsContainer link() $scope.component.properties[$scope.propertyName]', $scope.component.properties[$scope.propertyName], 'convoworksComponentsContainer', convoworksComponentsContainer);

                var open_timer  =   null;

//              _initDroppableBackground();

                _initDroppable();

                // API
                $scope.toggleOpen       =   function() {
                    if ( $scope.isOpen()) {
                        UserPreferencesService.registerData( _getContainerKey( 'open'), false);
                    } else {
                        UserPreferencesService.registerData( _getContainerKey( 'open'), true);
                    }
                };

                $scope.isOpen       =   function() {
                    return UserPreferencesService.get( _getContainerKey( 'open'), _getDefaultOpen());
                };

                $scope.isRoot       =   function() {
                    return $scope.root ? true : false;
                };

                $scope.getPropTitle = () => {
                    return `${$scope.propertyDefinition.name}${convoworksComponentsContainer.isMultiple() ? ' (' + convoworksComponentsContainer.getContainer().length + ')' : ''}`;
                }

                $rootScope.$on( 'CollapseAllRequested', function () {
                    if ( $scope.isOpen()) {
                        if ( _getDefaultOpen()) {
                            UserPreferencesService.registerData( _getContainerKey( 'open'), false);
                        } else {
                            UserPreferencesService.registerData( _getContainerKey( 'open'), null);
                        }
                    }
                })

                $rootScope.$on( 'ExpandAllRequested', function () {
                    if ( !$scope.isOpen()) {
                        if ( _getDefaultOpen()) {
                            UserPreferencesService.registerData( _getContainerKey( 'open'), null);
                        } else {
                            UserPreferencesService.registerData( _getContainerKey( 'open'), true);
                        }
                    }
                })

                function _getDefaultOpen()
                {
                    if ( $scope.root) {
                        return true;
                    }

                    if ( typeof $scope.propertyDefinition['defaultOpen'] === 'undefined' || $scope.propertyDefinition['defaultOpen'] === null) {
                        return false;
                    }
                    return $scope.propertyDefinition['defaultOpen'];
                }

                function _getContainerKey( key)
                {
                    return propertiesContext.getSelectedService().service_id + '-' + $scope.component.properties._component_id + '-' + $scope.propertyName + '-' + key;
                }



                $scope.shouldHide   =   function() {
                    if ( !convoworksComponentsContainer.getContainer()) {
                        return true;
                    }

                    if (UserPreferencesService.get('show_hidden_containers', true)) {
                        return false;
                    }

                    return $scope.propertyDefinition.editor_properties.hideWhenEmpty && convoworksComponentsContainer.getContainer().length == 0;
                }

                $scope.getContainer = convoworksComponentsContainer.getContainer;

                $scope.getContextOptions = function () {

                    var options = [];

                    if (propertiesContext.hasClipboard())
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
                        else if (convoworksComponentsContainer.acceptsComponent(propertiesContext.getClipboard().component))
                        {
                            options.push(
                                {
                                    text: 'Paste',
                                    click: function ($itemScope, $event, modelValue, text, $li) {
                                        $log.log('convoworksComponentsContainer context paste');
                                        propertiesContext.paste(convoworksComponentsContainer, convoworksComponentsContainer.getContainer().length);
                                    }
                                }
                            );
                        }
                    }

                    return options;
                }

                $scope.$on(
                        "$destroy",
                        function( event ) {
                              if ( open_timer) {
                                  $timeout.cancel( open_timer );
                                  open_timer    =   null;
                              }
                        }
                    );


                // PRIVATE
                function _initDroppable()
                {
                    var $droppable  =   $($element.find( '.prop-container')[0]);
                    $droppable.droppable({
                        greedy: true,
                        drop: function( event, ui ) {

                            var data    =   ui.draggable.data('convoDragged');
                            $log.log( 'convoworksComponentsContainer drop event', event, 'ui', ui, 'data', data);

                            if ( data) {

                                  if ( data.handled) {
                                      $log.log( 'convoworksComponentsContainer already handled');
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
                                          AlertService.addInfo( 'Can\'t move component to "' +
                                          convoworksComponentsContainer.getPropertyDefinition().name + '"');
                                          return false;
                                    }

                                  $scope.$apply( function() {

                                      if ( data.type == 'definition') {
                                          $log.log( 'convoworksComponentsContainer new component', data.componentDefinition, 'to container', $scope.component.properties[$scope.propertyName], 'in component', $scope.component);

                                          propertiesContext.addNewComponent(
                                                  convoworksComponentsContainer,
                                                  data.componentDefinition);
                                      } else if ( data.type == 'component') {
                                          $log.log( 'convoworksComponentsContainer move component', data.component);

                                          propertiesContext.moveComponent(
                                                  data.containerController,
                                                  convoworksComponentsContainer,
                                                  data.component);
//                                        }
                                      } else {
                                          throw new Error( 'Expected to have type [definition] or [component]');
                                      }
                                      data.handled  =   true;
                                      UserPreferencesService.registerData( _getContainerKey( 'open'), true);
                                });
                              } else {
                                  $log.error( 'convoworksComponentsContainer Expected to have [convoDragged] data ['+event.target.className+']');
                              }
                            return false;
                          },
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

                            if ( !$scope.isOpen()) {
                                open_timer    =   $timeout( function() {
                                    UserPreferencesService.registerData( _getContainerKey( 'open'), true);
                                }, AUTO_OPEN_TIMEOUT);
                            }
                          },
                        out: function( event, ui) {
                            $(this).removeClass('drop-blocked drop-allowed ui-droppable-hover');

                            if ( open_timer) {
                                $timeout.cancel( open_timer );
                                open_timer    =   null;
                            }
                        },
                        deactivate: function (event, ui) { // dropped somewhere
                            $(this).removeClass('drop-blocked drop-allowed ui-droppable-hover ui-droppable-active');
                        }
                    });
                }
                function _initDroppableBackground()
                {
                    var $droppable  =   $($element.find( '.real-container')[0]);
//                  $log.log( 'convoworksComponentsContainer _initDroppableBackground() $droppable', $droppable);
//                  $droppable.on( 'dragover', function( event) {
//                      $log.log( 'convoworksComponentsContainer _initDroppableBackground()');
//                      event.stopImmediatePropagation();
//                  })
                    $droppable.droppable({
                        greedy: true,
//                      accept : '#pattern',
                        over: function( event, ui ) {
                    //      event.stopImmediatePropagation();
                        },
                        activate: function( event, ui ) {
                        //  event.stopImmediatePropagation();
                        },
//                      out: function( event, ui ) {
//                          event.stopImmediatePropagation();
//                      },
                    });
                }
            }
        }
    }
