
/* @ngInject */
export default function propertiesContext( $log, $rootScope, $q, ConvoworksApi, ConvoworksAddBlockService, ConvoComponentFactoryService, AlertService, localStorageService) {
    return {
        restrict: 'A',
        require: '^propertiesContext',
        scope: true,
        controller: function( $scope) {
            'ngInject';
            $log.log( 'propertiesContext controller init');

            // PUBLIC API
            this.getComponentDefinitions    =   getComponentDefinitions;
            this.getComponentDefinition     =   getComponentDefinition;
            this.isLoaded                   =   isLoaded;
            this.getConvoIntents            =   getConvoIntents;
            this.addConvoIntent             =   addConvoIntent;
            this.updateConvoIntent          =   updateConvoIntent;
            this.removeConvoIntent          =   removeConvoIntent;
            this.addConvoEntity             =   addConvoEntity;
            this.removeConvoEntity          =   removeConvoEntity;
            this.updateConvoEntity          =   updateConvoEntity;

            this.setSelectedComponent       =   setSelectedComponent;
            this.setSelectedBlock           =   setSelectedBlock;
            this.setSelectedFragment        =   setSelectedFragment;
            this.getSelection               =   getSelection;
            this.getSelectedService         =   getSelectedService;

            this.isServiceChanged           =   isServiceChanged;
            this.revertChanges              =   revertChanges;
            this.saveChanges                =   saveChanges;

            this.getAvailablePackages       =   getAvailablePackages;
            this.getSystemEntities          =   getSystemEntities;

            this.findBlock                  =   findBlock;
            this.findSubroutine             =   findSubroutine;

            this.addBlock                   =   addBlock;
            this.addProcessSubroutine       =   addProcessSubroutine;
            this.addReadSubroutine          =   addReadSubroutine;
            this.removeBlock                =   removeBlock;
            this.removeSubroutine           =   removeSubroutine;

            this.removeComponent            =   removeComponent;

            this.addNewComponent            =   addNewComponent;
            this.moveComponent              =   moveComponent;

            this.reloadService              =   reloadService;


            // DEFINITION
            if ( !$scope.serviceId) {
                throw new Error( 'No serviceId in scope');
            }

            var service_id          =   $scope.serviceId;
            var ready               =   false;
            var definitions         =   [];
            var original_service    =   null;
            var available_packages  =   [];
            var selection           =   {
                component : null,
                definition : null,
                service : null,
                meta: null,
                containerController : null
            };

            $scope.$on('ServiceReleaseDevelopImport', function() {
                reloadService();
            })

            $scope.$on('PackagesUpdated', function () {
                _init();
            })

            _init();

            function _init()
            {
                ConvoworksApi.getAvailablePackages().then(function(available) {
                    available_packages = available;

                    ConvoworksApi.getComponentDefinitions(service_id, true).then( function( defs) {
                        $log.log( 'propertiesContext controller definitions pre-loaded. Now will start. defs', defs);
                        definitions     =   defs;
                        $rootScope.$broadcast('PackageDefinitionsUpdated'); // todo quickfix

                        ConvoworksApi.getServiceById( service_id).then( function( service) {
                            $log.log( 'propertiesContext controller got service', service);
                            selection.service   =   service;
                            original_service    =   angular.copy( selection.service);

                            ConvoworksApi.getServiceMeta(service_id).then(function (meta) {
                                $log.log('propertiesContext got service meta', meta);
                                selection.meta = meta;

                                ready = true;
                            });
                        }, function( reason) {
                            $log.error( 'propertiesContext controller service got reason', reason);
                            throw new Error(reason.data.message);
                        });
                    }, function( reason) {
                        $log.error( 'propertiesContext controller definitions got reason', reason);
                    });
                });

                // localStorageService.set('clipboard', null);
            }

            this.hasClipboard = hasClipboard;
            this.getClipboard = getClipboard;
            this.cut = cut;
            this.copy = copy;
            this.paste = paste;

            this.getPasteData = getPasteData;

            function getClipboard()
            {
                return localStorageService.get('clipboard');
            }

            function hasClipboard()
            {
                return !!localStorageService.get('clipboard');
            }

            function cut(container, component)
            {
                localStorageService.set('clipboard', {
                    component: component
                });

                container.removeComponent(component);
                $scope.$broadcast('ComponentRemoved', component);
            }

            function copy(component)
            {
                localStorageService.set('clipboard', {
                    component: component
                })
            }

            function paste(containerController, index)
            {
                const clipboard = getClipboard();
                
                if (!clipboard) {
                    return;
                }

                if (!selection.service.packages.includes(clipboard.component.namespace)) {
                    AlertService.addWarning(`You do not have the [${clipboard.component.namespace}] package enabled. Cannot paste.`);
                    return;
                }

                containerController.addComponent(
                    ConvoComponentFactoryService.copyComponent(getSelectedService(), clipboard.component),
                    index
                );
            }

            function getPasteData()
            {
                const data = {
                    allowed: true,
                    missing: []
                };

                const r = /"namespace":"(.*?)"/g;
                const cmpstr = JSON.stringify(getClipboard().component);
                const matches = [...cmpstr.matchAll(r)];
                
                for (const match of matches)
                {
                    const nmspc = match[1];
                    
                    if (!getSelectedService().packages.includes(nmspc)) {
                        $log.warn(`selectableComponent can't paste, missing package [${nmspc}]`);
                        data.allowed = false;
                        if (!data.missing.includes(nmspc)) {
                            data.missing.push(nmspc);
                        }
                    }
                }

                return data;
            }

            function addConvoEntity( entity) {
                var index   =   selection.service.entities.length;
                selection.service.entities.push( entity);
                return index;
            }

            function removeConvoEntity( index) {
                selection.service.entities.splice( index, 1);
            }

            function updateConvoEntity( entity, index) {
                selection.service.entities[index] = entity;
            }

            function addConvoIntent( intent) {
                var index   =   selection.service.intents.length;
                selection.service.intents.push( intent);
                return index;
            }

            function updateConvoIntent( intent, index) {
                selection.service.intents[index] = intent;
            }
            
            function removeConvoIntent( index) {
                selection.service.intents.splice( index, 1);
            }            

            function getConvoIntents()
            {
                var intents =   [];

                // SERVICE
                for ( var i=0; i < selection.service.intents.length; i++) {
                    intents.push( selection.service.intents[i]);
                }

                // SYSTEM
                for ( var i=0; i<definitions.length; i++) {
                    var pckg    =   definitions[i];
                    if ( !pckg.intents) {
                        continue;
                    }
                    for ( var j=0; j<pckg.intents.length; j++) {
                        intents.push( pckg.intents[j]);
                    }
                }

                return intents;
            }

            function getAvailablePackages()
            {
                return available_packages;
            }

            function getSystemEntities()
            {
                var all =   [];
                for ( var i=0; i<definitions.length; i++) {
                    $log.log( 'propertiesContext getSystemEntities definitions[i]', definitions[i]);
                    all =   [...all, ...definitions[i].entities];
                }
                $log.log( 'propertiesContext getSystemEntities all', all);
                return all;
            }

            function getComponentDefinitions()
            {
                return definitions;
            }

            function getComponentDefinition( className)
            {
                for (var i = 0; i < definitions.length; i++)
                {
                    var pckg = definitions[i];

                    for (var j = 0; j < pckg.components.length; j++)
                    {
                        var comp = pckg.components[j];

                        if (comp['type'] === className)
                        {
                            return comp;
                        }
                    }
                }
                throw new Error( 'Definition ['+className+'] not found');
            }

            function isLoaded() {
                return ready;
            }

            // SELECTION
            function setSelectedComponent( component, containerController) {
                $log.log( 'propertiesContext setSelectedComponent component', component);
                if ( !component) {
                    selection.component     =   null;
                    selection.definition    =   null;
                    return;
                }

                if ( !containerController) {
                    selection.containerController   =   null;
                }

                selection.containerController   =   containerController;
                try {
                    selection.definition        =   getComponentDefinition( component['class']);
                } catch ( err) {
                    $log.error( err);
                    selection.definition    =   {
                        name : err.message,
                        component_properties : {}
                    };
                }
                selection.component             =   component;
            }

            function setSelectedBlock( block)
            {
                var containerController =   {
                    deleteSelectedComponent: function() { removeBlock( block.properties.block_id); }
                };

                setSelectedComponent( block, containerController);
            }

            function setSelectedFragment( block)
            {
                var containerController =   {
                    deleteSelectedComponent: function() { removeSubroutine( block.properties.fragment_id); }
                };

                setSelectedComponent( block, containerController);
            }

            function getSelection() {
                return selection;
            }

            $scope.$on( 'EscKeyPressed', function () {
                if ( selection.component) {
                    setSelectedComponent( null);
                }
            });

            // SERVICE
            function getSelectedService() {
                if ( !selection.service) {
                    throw new Error( 'No selected service');
                }
                return selection.service;
            }

            function isServiceChanged() {
                return !angular.equals( original_service, selection.service);
            }

            function revertChanges() {
                angular.copy( original_service, selection.service);
                selection.component =   null;
            }

            function saveChanges() {
                $log.log( 'propertiesContext controller saveChanges()');
                var d = $q.defer();

                ConvoworksApi.updateService( service_id, selection.service).then( function( res) {
                    $log.log( 'propertiesContext controller saveChanges() done');

                    angular.merge( selection.service, res.data);
                    original_service    =   angular.copy( selection.service);
                    $rootScope.$broadcast('ServiceWorkflowUpdated', selection.service);
                    d.resolve(selection.service);
                    AlertService.addSuccess( 'Service workflow saved');
                }, function( reason) {
                    $log.log( 'propertiesContext controller saveChanges() reason', reason);
                    d.reject(reason);
                    throw new Error(reason.data.message);
                })

                return d.promise;
            }

            $rootScope.$on('CtrlSPressed', () => {
                if (isServiceChanged()) {
                    saveChanges();
                }
            })

            // BLOCKS
            function addBlock( name, className, role) {
                var d = $q.defer();
                ConvoComponentFactoryService.createBlock( getSelectedService(), name, className, role).then( function ( block) {
                    $log.log( 'propertiesContext controller addBlock() block', block);
                    getSelectedService().blocks.push( block);
                    d.resolve( block);
                }, function ( reason) {
                    $log.log( 'propertiesContext controller addBlock() reason', reason);
                    d.reject( reason);
                });

                return d.promise;
            }

            function addReadSubroutine( name)
            {
                var d = $q.defer();
                ConvoComponentFactoryService.createReadSubroutine( getSelectedService(), name).then( function ( block) {
                    getSelectedService().fragments.push( block);
                    d.resolve( block);
                }, function ( reason) {
                    d.reject( reason);
                });
                return d.promise;
            }

            function addProcessSubroutine( name) {
                var d = $q.defer();
                ConvoComponentFactoryService.createProcessSubroutine( getSelectedService(), name).then( function ( block) {
                    getSelectedService().fragments.push( block);
                    d.resolve( block);
                }, function ( reason) {
                    d.reject( reason);
                });
                return d.promise;
            }

            function removeBlock( blockId) {

                for ( var i=0; i<selection.service.blocks.length; i++) {
                    var block   =   selection.service.blocks[i];
                    if ( block.properties.block_id == blockId) {
                        selection.service.blocks.splice( i, 1);
                        $scope.$broadcast( 'ComponentRemoved', block);
                        return ;
                    }
                }

                throw new Error( 'Could not find block ['+blockId+']');
            }

            function removeSubroutine( fragmentId) {

                for ( var i=0; i<selection.service.fragments.length; i++) {
                    var fragment    =   selection.service.fragments[i];
                    if ( fragment.properties.fragment_id == fragmentId) {
                        selection.service.fragments.splice( i, 1);
                        $scope.$broadcast( 'ComponentRemoved', fragment);
                        return ;
                    }
                }

                throw new Error( 'Could not find fragment ['+fragmentId+']');
            }

            function removeComponent()
            {
                if ( !selection.containerController) {
                    $log.warn( 'propertiesContext directive removeComponent() no containerController');
                    return ;
                }

                selection.containerController.deleteSelectedComponent( selection.component);
                $scope.$broadcast( 'ComponentRemoved', selection.component);
            }

            function findBlock( blockId) {
                for ( var i=0; i<selection.service.blocks.length; i++) {
                    var block   =   selection.service.blocks[i];
                    if ( block.properties.block_id == blockId) {
                        return block;
                    }
                }
                throw new Error( 'Block ['+blockId+'] not found');
            }

            function findSubroutine( fragmentId) {
                for ( var i=0; i<selection.service.fragments.length; i++) {
                    var fragment    =   selection.service.fragments[i];
                    if ( fragment.properties.fragment_id == fragmentId) {
                        return fragment;
                    }
                }
                throw new Error( 'Fragment ['+fragmentId+'] not found');
            }

            // OTHER COMPONENTS
            function addNewComponent( containerController, componentDefinition, index)
            {
                if ( !index) {
                    index   =   0;
                }

                var component   =   ConvoComponentFactoryService.createComponent( getSelectedService(), componentDefinition);
                containerController.addComponent( component, index);
            };

            function moveComponent( oldContainerController, containerController, component, index) {

                if ( !index) {
                    index   =   0;
                }

                oldContainerController.removeComponent( component);
                containerController.addComponent( component, index);
            };

            function reloadService() {
                ConvoworksApi.getServiceById( service_id).then( function( service) {
                    $log.log( 'propertiesContext controller got service', service);
                    selection.service   =   service;
                    original_service    =   angular.copy( selection.service);
                    ready               =   true;
                }, function( reason) {
                    $log.error( 'propertiesContext controller service got reason', reason);
                    throw new Error(reason.data.message);
                });
            };

            },
            link : function( $scope, $element, $attributes, propertiesContext) {
                $log.log( 'propertiesContext link');

                function _init()
                {
                    $log.log( 'propertiesContext _init() service', propertiesContext.getSelectedService());
                    _initAvailableBlockTypes();
                }

                function _destroy()
                {
                }

                $scope.$on('PackageDefinitionsUpdated', function () {
                    _initAvailableBlockTypes();
                    _initAvailableContexts();
                })

                $scope.availableBlockTypes  =   [];
                $scope.availableContexts    =   [];

                $scope.isServiceChanged     =   propertiesContext.isServiceChanged;
                $scope.saveChanges          =   propertiesContext.saveChanges;
                $scope.setSelectedBlock     =   propertiesContext.setSelectedBlock;
                $scope.setSelectedFragment  =   propertiesContext.setSelectedFragment;
                $scope.getSelection         =   propertiesContext.getSelection;
                $scope.getSelectedService   =   propertiesContext.getSelectedService;
                $scope.addNewComponent      =   propertiesContext.addNewComponent;

                $scope.revertClicked        =   function()
                {
                    $log.log( 'propertiesContext revertClicked()');
                    propertiesContext.revertChanges();
                    _destroy();
                    _init();
                };

                $scope.getBlockWorkflow  =   function ( block)
                {
                    try {
                        var definition = propertiesContext.getComponentDefinition( block.class);
                        return definition.component_properties._workflow;
                    } catch ( err) {
                        $log.error( err);
                        return null;
                    }
                };


                $scope.addNewBlock      =   function( className, role, defaultName)
                {
                    $log.log( 'propertiesContext addNewBlock() className', className, 'role', role);
                    return ConvoworksAddBlockService.showModal( propertiesContext.getSelectedService(), 'user', propertiesContext, className, role, defaultName);
                };

                $scope.showNewReadSubroutine        =   function()
                {
                    $log.log( 'propertiesContext showNewReadSubroutine()');
                    return ConvoworksAddBlockService.showSubroutineModal( propertiesContext.getSelectedService(), propertiesContext, 'read')
                };

                $scope.showNewProcessSubroutine     =   function()
                {
                    $log.log( 'propertiesContext showNewProcessSubroutine()');
                    return ConvoworksAddBlockService.showSubroutineModal( propertiesContext.getSelectedService(), propertiesContext, 'process')
                };

                $scope.addNewContext    =   function( context)
                {
                    $log.log( 'propertiesContext addNewContext() context', context);

                    $rootScope.$broadcast('AddContext', context);
                }

                // $scope.removeBlock       =   function( blockId)
                // {
                //  $log.log( 'propertiesContext removeBlock() blockId', blockId);
                // };

                $scope.isReady          =   propertiesContext.isLoaded;
//              $scope.isReady          =   function() {
//                  $log.log( 'propertiesContext isReady()');
//                  return true
//              };

                //
                $scope.getSubroutines = function() {
                    return propertiesContext.getSelectedService().fragments;
                };

                $scope.getBlocks = function() {
                    return propertiesContext.getSelectedService().blocks;
                };

                $scope.removeBlock = function (blockId) {
                    return propertiesContext.removeBlock(blockId);
                };

                $scope.removeSubroutine = function (subroutineId) {
                    return propertiesContext.removeSubroutine(subroutineId);
                };

                function _initAvailableBlockTypes() {
                    var definitions = propertiesContext.getComponentDefinitions();

                    $log.log('propertiesContext got component definitions', definitions);

                    $scope.availableBlockTypes = definitions
                        // get component definitions from packages
                        .map(function (pckg) {
                            return pckg.components;
                        })
                        // flatten array of arrays
                        .flat()
                        // get runnable blocks
                        .filter(function (definition) {
                            return definition['_interfaces'].indexOf( 'Convo\\Core\\Workflow\\IRunnableBlock') > -1;
                        })
                        // format options
                        .map(function (block) {
                           return {
                               class: block['type'],
                               name: block['name'],
                               defaultName: block['component_properties']['name'] ? block['component_properties']['name']['defaultValue'] : block['name'],
                               role: block['component_properties']['role']['defaultValue'],
                               namespace: block['namespace'],
                               description: block['description'],
                           }
                        });
                }

                function _initAvailableContexts() {
                    var definitions = propertiesContext.getComponentDefinitions();

                    $log.log('propertiesContext got component definitions', definitions);

                    $scope.availableContexts = definitions
                        // get component definitions from packages
                        .map(function (pckg) {
                            return pckg.components;
                        })
                        // flatten array of arrays
                        .flat()
                        // get datasource components
                        .filter(function (definition) {
                            if (definition['name'].includes('x!')) {
                                return false;
                            }

                            return definition['component_properties']['_workflow'] === 'datasource';
                        });
                }

                $scope.getDefinitions       =   propertiesContext.getComponentDefinitions;
                $scope.getAvailablePackages =   propertiesContext.getAvailablePackages;
                $scope.getAvailableContexts =   propertiesContext.getAvailableContexts;

                $scope.$watch( propertiesContext.isLoaded, function( val) {
                    if ( val) {
                        _init();
                    } else {
                        _destroy();
                    }
                });
        }
    }
}

function _isSystem( blockId) {
    if ( blockId) {
        return blockId.indexOf( '__') >= 0;
    }
    return false;
}
