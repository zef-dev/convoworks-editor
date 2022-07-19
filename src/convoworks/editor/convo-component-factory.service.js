/* @ngInject */
export default function ConvoComponentFactoryService( $log, $q, ConvoworksApi, StringService) {

    this.generateUniqueId           =   generateUniqueId;
    this.createComponent            =   createComponent;
    this.copyComponent              =   copyComponent;

    this.createBlock                =   createBlock;
    this.createReadSubroutine       =   createReadSubroutine;
    this.createProcessSubroutine    =   createProcessSubroutine;


    function generateUniqueId() {
        return StringService.generateUUIDV4();
    }

    function copyComponent( service, componentToCopy)
    {
        $log.log( 'ConvoComponentFactoryService copyComponent componentToCopy', componentToCopy);

        var component   =   angular.copy( componentToCopy);
        _regenerateComponentIds( component);
        return component;
    }

    function _regenerateComponentIds( component)
    {
        component.properties._component_id  =   generateUniqueId();

        for ( var key in component.properties) {
            if ( angular.isArray( component.properties[key])) {
                for ( var i=0; i<component.properties[key].length; i++) {
                    if ( component.properties[key][i]['class']) {
                        _regenerateComponentIds( component.properties[key][i]);
                    }
                }
            } else {
                if ( component.properties[key] && component.properties[key]['class']) {
                    _regenerateComponentIds( component.properties[key]);
                }
            }
        }
    }

    function createComponent( service, definition, name)
    {
        $log.log( 'ConvoComponentFactoryService createComponent() creating definition.type', definition.type, 'name', name);
        var component       =   {
                class : definition.type,
                namespace : definition.namespace,
                properties : {
                }
        };

        for ( var key in definition.component_properties)
        {
            $log.log( 'ConvoComponentFactoryService createComponent() checking property', key);

            if ( definition.component_properties[key].editor_type === 'block_id' ||
                definition.component_properties[key].editor_type === 'process_fragment' ||
                definition.component_properties[key].editor_type === 'read_fragment') {
                // block_id - predefined behaviour
                component.properties[key] = _generateBlockId( service, name);
            } else if ( definition.component_properties[key].editor_type === 'service_components') {

                $log.log( 'ConvoComponentFactoryService createComponent() service_components editor');

                if ( typeof definition.component_properties[key].defaultValue === 'undefined') {
                    $log.log( 'ConvoComponentFactoryService createComponent() no default value');
                    continue;
                }

                if ( !definition.component_properties[key].defaultValue) {
                    $log.log( 'ConvoComponentFactoryService createComponent() empty default value', definition.component_properties[key].defaultValue);
                    component.properties[key]       =   definition.component_properties[key].defaultValue;
                    continue;
                }

                if ( definition.component_properties[key].editor_properties.multiple) {
                    $log.log( 'ConvoComponentFactoryService createComponent() multiple components');
                    component.properties[key]   =   [];
                    for ( var i=0; i<definition.component_properties[key].defaultValue.length; i++) {
                        var child                       =   angular.copy( definition.component_properties[key].defaultValue[i]);
                        child.properties._component_id  =   generateUniqueId();
                        component.properties[key][component.properties[key].length]       =   child;
                    }
                } else {
                    $log.log( 'ConvoComponentFactoryService createComponent() single component');
                    var child                       =   angular.copy( definition.component_properties[key].defaultValue);
                    child.properties._component_id  =   generateUniqueId();
                    component.properties[key]       =   child;
                }
            } else if ( key.indexOf( '_') === 0) {
                // system props - just copy the component id - predefined behaviour
                if (key === '_component_id') {
                    component.properties[key] = definition.component_properties[key];
                } else {
                    delete component.properties[key];
                }
            } else if ( typeof definition.component_properties[key].defaultValue !== 'undefined') {
                // use default value
                $log.log( 'ConvoComponentFactoryService createComponent() default value', definition.component_properties[key].defaultValue);
                component.properties[key] = definition.component_properties[key].defaultValue;
            }
        }

        if ( name) {
            component.properties.name   =   name;
        }

        component.properties['_component_id'] = generateUniqueId();

        $log.log( 'ConvoComponentFactoryService createComponent() created component', component);

        return component;
    }

    function createBlock( service, name, className, role)
    {
        if ( !className) {
            className   =   '\\Convo\\Pckg\\Core\\Elements\\ConversationBlock';
        }

        var deferred    =   $q.defer();

        ConvoworksApi.getComponentDefinition( service['service_id'], className).then( function( definition) {
            $log.log( 'ConvoComponentFactoryService got definition', definition, 'name', name);
            var component = createComponent( service, definition, name);
            if ( !role) {
                role    =   definition.component_properties.role.defaultValue;
            }
            component.properties.role   =   role;
            deferred.resolve( component);
        }, function( reason) {
            deferred.reject( reason);
        })

        return deferred.promise;
    }

    function createReadSubroutine( service, name)
    {
        var deferred    =   $q.defer();

        ConvoworksApi.getComponentDefinition( service['service_id'], '\\Convo\\Pckg\\Core\\Elements\\ElementsFragment').then( function( definition) {
            $log.log( 'ConvoComponentFactoryService got definition', definition, 'name', name);
            deferred.resolve( createComponent( service, definition, name));
        }, function( reason) {
            deferred.reject( reason);
        })

        return deferred.promise;
    }

    function createProcessSubroutine( service, name)
    {
        var deferred    =   $q.defer();

        ConvoworksApi.getComponentDefinition( service['service_id'], '\\Convo\\Pckg\\Core\\Processors\\ProcessorFragment').then( function( definition) {
            $log.log( 'ConvoComponentFactoryService got definition', definition, 'name', name);
            deferred.resolve( createComponent( service, definition, name));
        }, function( reason) {
            deferred.reject( reason);
        })

        return deferred.promise;
    }



    // PRIVATE UTIL

    function _findBlock( service, blockId) {
        for ( var i=0; i<service.blocks.length; i++) {
            var block   =   service.blocks[i];
            if ( block.properties.block_id === blockId) {
                return block;
            }
        }
        for ( var i=0; i<service.fragments.length; i++) {
            var block   =   service.fragments[i];
            if ( block.properties.fragment_id === blockId) {
                return block;
            }
        }

        return null;
    }

    function _generateBlockId( service, name) {

        if ( !name) {
            return null;
        }

        var block_id    =   name.replace(/[^A-Z0-9]+/ig, "_");
        var block       =   _findBlock( service, block_id);

        if ( block) {
            var parse_info  =   _parseNumericSuffix( block_id);

            if ( parse_info.num) {
                block_id    =   parse_info.base + '_' + (parse_info.num + 1);
            } else {
                block_id    +=  '_1';
            }

            return _generateBlockId( service, block_id);
        }

        return block_id;
    }

    function _parseNumericSuffix( str) {
        var index   =   str.lastIndexOf( '_');
        $log.log( 'ConvoComponentFactoryService _parseNumericSuffix str', str, 'index', index);
        if ( index <= 0) {
            return {
                num : 0,
                base : str
            };
        }
        $log.log( 'ConvoComponentFactoryService _parseNumericSuffix str.substr( 0, index)', str.substr( 0, index),
                'parseInt( str.substr( index + 1))', parseInt( str.substr( index + 1)), 'str.substr( index + 1)', str.substr( index + 1));
        return {
            num : parseInt( str.substr( index + 1)) || 0,
            base : str.substr( 0, index)
        };
    }
};
