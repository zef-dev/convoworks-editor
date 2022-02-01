import template from './properties-editor.tmpl.html';

/* @ngInject */
export default function propertiesEditor($log, $document, $transitions, $rootScope, $parse, $window, ConvoworksApi, AlertService) {
    return  {
        restrict: 'E',
        require: '^propertiesContext',
        template: template,
        scope: {
            component: '=',
            definition: '=',
            service: '=',
            help: '=?'
        },
        link: function ( $scope, $element, $attributes, propertiesContext) {
            $scope.help = null;
            $scope.tabIndex = { active: "b" };

            _setupBlockIds();

            // REMOVE ON TRANSITION
            var $noTransition   =   $transitions.onSuccess({}, function( $transition){
                propertiesContext.setSelectedComponent( null);
//                $scope.$applyAsync( function () {
//                });
            });


            // CLICK ON OUTSIDE
            let last_mouse_x = 0;
            let last_mouse_y = 0;
            let last_outside = false;

            function _mdown (event) {
                last_mouse_x = event.offsetX;
                last_mouse_y = event.offsetY;
                last_outside = !$(event.target).closest(".properties-editor-wrapper").length;
            }

            $document.bind('mousedown', _mdown);

            function _click( event)
            {
                if ($(event.target).is("button[type=submit].btn.btn-primary")) {
                    $log.log('propertiesEditor _click() save button clicked.');
                    return;
                }

                const dx = event.offsetX - last_mouse_x;
                const dy = event.offsetY - last_mouse_y;

                const dist_sq = (dx * dx) + (dy * dy);
                const is_drag = dist_sq > 3;
                const is_drag_exception = is_drag && !last_outside;

                if (last_outside && !is_drag_exception) {
                    $scope.$apply(() => { propertiesContext.setSelectedComponent(null); });    
                }
            }

            $document.bind( 'click', _click);

            $scope.$on( '$destroy', function () {
                $document.unbind('click', _click);
                $document.unbind('mousedown', _mdown);
                $noTransition();
            });

            $rootScope.$on('EnterKeyPressed', () => {
                if ($element.find("input[type=text]:focus").length) {
                    $scope.$applyAsync(() => { propertiesContext.setSelectedComponent(null); });
                }
            });

            $rootScope.$on('DeleteKeyPressed', () => {
                // $scope.$applyAsync(() => {
                //     if (!$scope.component) {
                //         $log.log('propertiesEditor no component');
                //         return;
                //     }
    
                //     if ($element.find("input:focus, textarea:focus").length) {
                //         $log.log('propertiesEditor delete key pressed but text input focused. Will not delete component.');
                //         return;
                //     }

                //     $log.log('propertiesEditor going to delete component [', $scope.component.properties._component_id,']');;

                //     propertiesContext.removeComponent();
                //     propertiesContext.setSelectedComponent(null, null);
                //     $scope.$destroy();
                // });
            });

            $scope.getBlockId   =   function() {
                var block_id    =   null;
                if ( $scope.component.properties.block_id) {
                    block_id    =   $scope.component.properties.block_id;
                }
                if ( $scope.component.properties.fragment_id) {
                    block_id    =   $scope.component.properties.fragment_id;
                }

                return block_id;
            };

            $scope.getBlockRole = function() {
                return $scope.component.properties.role || null;
            }

            $scope.getComponentName =   function() {

//                if ( $scope.component.properties.name) {
//                    return $scope.component.properties.name + ' ('+$scope.definition.name+')';
//                }
//
//                if ( $scope.component.properties.block_id) {
//                    return $scope.component.properties.block_id + ' ('+$scope.definition.name+')';
//                }
//
//                if ( $scope.component.properties.fragment_id) {
//                    return $scope.component.properties.fragment_id + ' ('+$scope.definition.name+')';
//                }

                return $scope.definition.name;
            };

            $scope.getComponentDescription  =   function() {
                const role = $scope.getBlockRole();

                // $log.log('propertiesEditor got block role', role);

                if (role) {
                    switch (role) {
                        case 'service_processors':
                            return 'System block which contains only processors. This processors will be considered on any active step process phase.';
                        case 'session_start':
                            return 'System block that executes only when the new session has started. If you leave it empty, the first regular step will be used.';
                        case 'session_end':
                            return 'This step is called when session ends. You can not output anything here, but you might do cleanup or statistics here.';
                        case 'media_controls':
                            return 'Serves for handling media playing requests (they are sessionless)';
                        case 'default_fallback':
                            return 'If a block gets no applicable processor results, and has no fallback defined, this will run instead.'
                        case 'error_handler':
                            return 'Catch and handle any errors raised during execution.';
                        default:
                            return $scope.definition.description;
                    }
                }

                return $scope.definition.description;
            };

            $scope.getComponentNamespace = function () {
                return $scope.component.namespace;
            }

            $scope.checkComponentHelp = function() {
                return $scope.help !== null;
            };

            $scope.displayEditor    =   function() {
                return !!$scope.component && Object.keys( $scope.component).length > 0;
            };

            $scope.closeEditor      =   function() {
                propertiesContext.setSelectedComponent( null );
            };

            $scope.removeComponent  =   function()
            {
                propertiesContext.removeComponent();
                propertiesContext.setSelectedComponent( null, null);
            };

            $scope.shouldRender = function(key, definition, component)
            {
                if (!definition.component_properties[key].editor_properties || !definition.component_properties[key].editor_properties.dependency) {
                    return true;
                }

                const all_dependencies = getAllDependencyProperties(definition.component_properties[key].editor_properties.dependency);

                if (all_dependencies.map(d => $scope.isToggled(d)).includes(true)) {
                    return true; // at least one dependency is toggled to raw
                }

                if (all_dependencies.map(d => component.properties[d]).filter(p => p.startsWith('${')).length > 0) {
                    return true; // at least one dependency is a variable
                }

                const result = $parse(definition.component_properties[key].editor_properties.dependency)({ component });

                return !!result;
            }

            $scope.isObject         =   function( val) {
                return ( val !== null) && ( !Array.isArray( val)) && ( val instanceof Object);
            };

            $scope.removeUtterance  =   function( i)
            {
                $scope.component.properties.utterances.splice( i, 1);
            };

            $scope.addUtterance     =   function()
            {
                if ( !$scope.component.properties.utterances) {
                    $scope.component.properties.utterances  =   [];
                }
                $scope.component.properties.utterances.push( "New utterance");
            };

            $scope.addOkSpecificUtterance   =   function( name)
            {
                if ( !$scope.component.properties.ok_specific[name].properties.utterances) {
                    $scope.component.properties.ok_specific[name].properties.utterances =   [];
                }

                $scope.component.properties.ok_specific[name].properties.utterances.push( "New utterance");
            };

            $scope.removeOkSpecificUtterance    =   function( name, i)
            {
                $scope.component.properties.ok_specific[name].properties.utterances.splice( i, 1);
            };

            $scope.maybeInt = value => isNaN(value) ? `${value}` : parseInt(value, 10);

            $scope.canToggleToRaw = function (editorType)
            {
                // @TODO: should this function even exist? 
                // Maybe we just allow toggling anything
                return [
                    'select',
                    'read_fragment',
                    'process_fragment',
                    'context_id',
                    'select_block',
                    'boolean',
                    'text',
                    'number',
                    'params'
                ].includes(editorType);
            }

            $scope.toggle = function (key) {
                const system_key = `_use_var_${key}`;

                switch ($scope.component.properties[system_key]) {
                    case null:
                    case undefined:
                    case false:
                        $scope.component.properties[system_key] = true;
                        break;
                    case true:
                        const default_val = $scope.definition.component_properties[key].defaultValue;

                        $scope.component.properties[system_key] = false;
                        $scope.component.properties[key] = default_val;

                        break;
                    default:
                        throw new Error(`Unexpected value for system key [${system_key}]: [${$scope.component.properties[system_key]}]`);
                }
            }

            $scope.isToggled = function(key)
            {
                const system_key = `_use_var_${key}`;

                return !($scope.component.properties[system_key] === undefined || $scope.component.properties[system_key] === null || $scope.component.properties[system_key] === false);
            }

            $scope.$watch( 'service.blocks', _setupBlockIds, true);
            $scope.$watch( 'service.fragments', _setupBlockIds, true);

            $scope.$watch( 'component.properties._component_id', function () {
                $scope.help = null;
                $scope.tabIndex = { active: "b" };
                _getComponentHelp($scope.component.class);
            }, true);

            $scope.$watch( 'component', function (newVal) {
                if ( !newVal) {
                    return;
                }

                if (!$scope.component.properties) {
                    $log.warn( 'propertiesEditor block quickfix');
                    return;
                }

                // TODO: this should be handled in property editors themself
                angular.forEach( $scope.definition.component_properties, function( definition, key) {
                    // $log.log( 'propertiesEditor $watch.component each %o definition %o', key, definition);

                    if ( definition.editor_type == 'service_components') {
                        return;
                    }

                    if ( key.indexOf( '_') === 0) {
                        return;
                    }

                    if ( !$scope.component.properties[key]) {
                        return;
                    }

                    if ( key === 'ok_specific' || key === 'nok_specific') {
                        return;
                    }

                    if ($scope.isToggled(key)) {
                        $log.log('Will not parse toggled raw key', key);
                        // $scope.component.properties[key] = "" + $scope.component.properties[key];
                        return;
                    }

                    switch ( definition.valueType)
                    {
                        case 'string':
                            if ( !!definition.editor_properties.multiple) {
                                $scope.component.properties[key]    =   _asArray( $scope.component.properties[key], 'string');
                            } else {
                                $scope.component.properties[key]    =   "" + $scope.component.properties[key];
                            }

                            break;
                        case 'boolean':
                            $scope.component.properties[key]    =   _castToBool( $scope.component.properties[key]);
                            break;
                        case 'array':
                            $scope.component.properties[key]    =   _asArray( $scope.component.properties[key], 'other');
                            break;
                        case 'int':
                            if ( !!definition.editor_properties.multiple) {
                                $scope.component.properties[key]    =   _asArray( $scope.component.properties[key], 'number');
                            } else {
                                $scope.component.properties[key]    =   parseInt( $scope.component.properties[key], 10);
                            }
                            break;
                        case 'object':
                            break;
//                        default:
//                            throw new Error( 'Unknown value type [' +
//                                    $scope.definition.component_properties[key].valueType + '] for ['+key+'] and value ['+ $scope.component.properties[key] +']');
                    }
                });
            }, true);

            $scope.copyToClipboard = function (value)
            {
                const el = document.createElement('textarea');
                el.value = value;
                el.setAttribute('readonly', '');
                el.style = {position: 'absolute', left: '-9999px'};
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);

                AlertService.addSuccess(`Copied [${value}] to clipboard.`);
            }

            function _setupBlockIds()
            {
                $scope.processSubroutines   =   $scope.service.fragments.filter( function( fragment) {
                    return fragment.class === '\\Convo\\Pckg\\Core\\Processors\\ProcessorFragment';
                }).map( function( fragment) {
                    return { id : fragment.properties.fragment_id, name : _fixName( fragment.properties.fragment_id, fragment.properties.name)};
                });

                $scope.readSubroutines  =   $scope.service.fragments.filter( function( fragment) {
                    return fragment.class === '\\Convo\\Pckg\\Core\\Elements\\ElementsFragment';
                }).map( function( fragment) {
                    return { id : fragment.properties.fragment_id, name : _fixName( fragment.properties.fragment_id, fragment.properties.name)};
                });

                $scope.userBlocks   =   $scope.service.blocks.filter( function( block) {
                    return block.properties.block_id.indexOf('__') !== 0 && block.properties.role === 'conversation_block';
                }).map( function( block) {
                    return { id : block.properties.block_id, name : _fixName( block.properties.block_id, block.properties.name)};
                });

                $scope.contexts = $scope.service.contexts.filter(context => {
                    return context.properties.id !== null && context.properties.id !== '';
                }).map(context => {
                    const definition = propertiesContext.getComponentDefinition(context.class);
                    const name = `${definition.name} [${context.properties.id}]`;
                    
                    return {
                        id: context.properties.id,
                        name: _fixName(context.properties._component_id, name)
                    }
                });
            }

            function _fixName( id, name) {
                if ( name) {
                    return name;
                }
                return 'ID: ' + id;
            }

            // UTIL
            function _castToBool( value) {
                if ( value === 'false')
                    return false;

                if ( value === 'true')
                    return true;

                return !!value;
            }

            function _asArray( value, prevType) {
                $log.log( 'propertiesEditor _asArray value', value, 'prevType', prevType);

                if ( !prevType) {
                    throw new Error( 'Expected a type to work with, got ' + prevType);
                }

                if ( !value) {
                    return [];
                }

                if ( Array.isArray( value)) { // Already an array, cast values just to be sure
                    switch ( prevType)
                    {
                        case 'other':
                        case 'string':
                            return value
                                .map( function( val) { return val.split( ',').map( function( piece) { return ("" + piece).trim(); }); })
                                .reduce( function( a, b) { return a.concat( b); }, []);
                        default:
                            throw new TypeError( 'Unsupported type [' + prevType + ']');
                    }
                }

                switch ( prevType)
                {
                    case 'string':
                        $log.log( 'propertiesEditor _asArray prevType is string');
                        var splitArray  =   value.split( ',').map( function( s) { return ("" + s).trim(); });

                        $log.log( 'propertiesEditor _asArray returning', splitArray);

                        return splitArray;
                    case 'number':
                        var numbers     =   value.split( /\s,/g).map( function( n) { return parseInt( n, 10) });

                        $log.log( 'propertiesEditor _asArray returning', numbers);

                        return numbers;
                    case 'other': // TODO: temporary
                        return value;
                    default:
                        throw new Error( 'Unsupported type [' + prevType + ']');
                }

                // return value;
            }

            function _getComponentHelp(componentClass)
            {
                ConvoworksApi.getComponentDefinition($scope.service['service_id'], componentClass).then(function (definition) {
                    if ($scope.help === null && definition.component_properties._help)
                    {
                        if (definition.component_properties._help.type === 'file')
                        {
                            var name = $scope.component.class
                                .split('\\') // split class on namespace separator
                                .slice(-1)[0] // take last element (class name)
                                .split(/(?=[A-Z](?![A-Z]{1,}))|(?<=[a-z](?=[A-Z]))/) // split on capitals or preceeding acronyms so that e.g. 'OpenTDBTrivia' doesn't end up as 'open-t-d-b-trivia'
                                .join('-').toLowerCase(); // join with - and lowercase -> LoopElement = loop-element

                            ConvoworksApi.getPackageComponentHelp( $scope.component.namespace, name).then(function (data) {
                                $scope.help = data.html_content;
                            }, function (reason) {
                                $log.debug('propertiesEditor getComponentHelp() reason', reason);
                            });
                        }
                        else if (definition.component_properties._help.type === 'html')
                        {
                            $scope.help = definition.component_properties._help.template;
                        }
                    }
                }, function(reason) {
                    $log.error('propertiesEditor _getComponentHelp() getComponentDefinition() rejected, got reason', reason)
                });
            }


            // PARAMS UTIL
            // function _keyToIdentifier( key)
            // {
            //     return '$$_'+key+'_pbuffer';
            // }

            // function _identifierToKey( id)
            // {
            //     var regex   =   /\$\$_(\w+)_pbuffer/g;

            //     var matches =   regex.exec( id);

            //     return matches[1];
            // }

            function getAllDependencyProperties(dependency) {
                return Object.keys( // Unique values only
                    dependency.split(" ") // split on spaces
                    .filter(d => d.includes('.properties')) // only consider items that access properties
                    .map(d => d.split('.').pop()) // split on periods and assume last item is property
                    .reduce(((prev, curr) => { prev[curr] = true; return prev }), {}) // create map with unique keys
                )
            }
        }
    }
};
