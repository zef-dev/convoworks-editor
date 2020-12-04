import template from './properties-editor.tmpl.html';

/* @ngInject */
export default function propertiesEditor( $log, $document, $transitions, ConvoworksApi) {
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
            function _click( event)
            {
                if (!$(event.target).closest(".properties-editor-wrapper").length) {
                    $scope.$apply( function () {
                        propertiesContext.setSelectedComponent( null );
                    });
                }
            }

            $document.bind( 'click', _click);

            $scope.$on( '$destroy', function () {
                $document.unbind( 'click', _click);
                $noTransition();
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

                var block_id    =   $scope.getBlockId();

                if ( block_id === '__serviceProcessors') {
                    return 'System block which contains only processors. This processors will be considered on any active step process phase.';
                }

                if ( block_id === '__sessionStart') {
                    return 'System block that executes only when the new session has started. If you leave it empty, the first regular step will be used.';
                }

                if ( block_id === '__sessionEnd') {
                    return 'This step is called when session ends. You can not output anything here, but you might do cleanup or statistics here.';
                }

                if ( block_id === '__mediaControls') {
                    return 'Serves for handling media playing requests (they are sessionless)';
                }

                return $scope.definition.description;
            };

            $scope.checkComponentHelp = function() {
                if ( $scope.help !== null) {
                    return true;
                }
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

            $scope.maybeInt                     =   function( value)
            {
                var ret =   value * 1;

                if ( isNaN( ret))
                    return value;

                return ret;
            };

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
                    return block.properties.block_id.indexOf('__') !== 0;
                }).map( function( block) {
                    return { id : block.properties.block_id, name : _fixName( block.properties.block_id, block.properties.name)};
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
                                .split(/(?=[A-Z])/) // split on capital letters
                                .join('-').toLowerCase(); // join with - and lowercase -> LoopElement = loop-element

                            ConvoworksApi.getPackageComponentHelp( $scope.component.namespace, name).then(function (data) {
                                $scope.help = data;
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
            function _keyToIdentifier( key)
            {
                return '$$_'+key+'_pbuffer';
            }

            function _identifierToKey( id)
            {
                var regex   =   /\$\$_(\w+)_pbuffer/g;

                var matches =   regex.exec( id);

                return matches[1];
            }
        }
    }
};
