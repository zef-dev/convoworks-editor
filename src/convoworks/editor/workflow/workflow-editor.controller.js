/* @ngInject */
export default function WorkflowEditorController($log, $scope, $rootScope, $state, $stateParams, $anchorScroll, $transitions, localStorageService, AlertService, StringService) {

    $log.log( 'WorkflowEditorController init');

    var selection = {
        block : {
            blockId : null,
            componentId : null,
        },
        fragment : {
            fragmentId : null,
            componentId : null,
        },
    };

    var $noTransition   =   $transitions.onSuccess({}, function( $transition){
        $log.log( 'WorkflowEditorController $transition $transition.params()', $transition.params());
        $scope.$applyAsync( function () {
            _resolveParams( $transition.params());
        });
        $anchorScroll();
    });

    $scope.$on( "$destroy", function () {
        $noTransition();
    });

    $scope.$on( "ComponentRemoved", function ( e, component) {
        $log.log( 'WorkflowEditorController ComponentRemoved component', component);

        if ( component.properties.block_id && component.properties.block_id === selection['block']['blockId']) {
            var blocks = $scope.getBlocks();
            if ( blocks.length) {
                $state.go( 'convoworks-editor-service.editor', { sb: blocks[0].properties.block_id},
                    { inherit:true, reload:false, notify:true, location:'replace'});
            }

        } else if ( component.properties.fragment_id && component.properties.fragment_id === selection['fragment']['fragmentId']) {
            var fragments = $scope.getSubroutines();
            if ( fragments.length) {
                $state.go( 'convoworks-editor-service.editor', { sb: fragments[0].properties.fragment_id},
                    { inherit:true, reload:false, notify:true, location:'replace'});
            }
        }
    });

    $scope.getContainerContextOptions = function(service)
    {
        const options = [];

        options.push({
            text: 'Paste',
            enabled: _hasClipboard,
            click: function ($itemScope, $event, modelValue, text, $li) {
                _paste(service);
            }
        });

        return options;
    }

    $scope.getStepContextOptions = function (step, removeStepFn)
    {
        const options = [];

        options.push({
            text: 'Cut',
            click: function($itemScope, $event, modelValue, text, $li) {
                _cut(step, removeStepFn);
            }
        })

        options.push({
            text: 'Copy',
            click: function ($itemScope, $event, modelValue, text, $li) {
                _copy(step);
            }
        })

        options.push({
            text: 'Delete',
            click: function ($itemScope, $event, modelValue, text, $li) {
                removeStepFn(step.properties.block_id || step.properties.fragment_id);
            }
        })

        return options;
    }

    function _hasClipboard()
    {
        return !!localStorageService.get('step_clipboard');
    }

    function _getClipboard()
    {
        return localStorageService.get('step_clipboard');
    }

    function _cut(item, removeFn)
    {
        _copy(item);

        const id_to_remove = item.properties.block_id || item.properties.fragment_id;

        removeFn(id_to_remove);
    }

    function _copy(step)
    {
        const mode = $scope.getComponentMode();
        
        let data = _getClipboard() || {};
        data[mode] = { step };

        localStorageService.set('step_clipboard', data);
    }

    function _paste(service)
    {
        const clipboard = _getClipboard();

        if (!clipboard) {
            return;
        }

        if (!_canPaste(service, clipboard.step)) {
            $log.log('WorkflowEditorController cannot paste');
            return;
        }

        const mode = $scope.getComponentMode();
        
        if (!clipboard[mode]) {
            $log.log(`WorkflowEditorController nothing to paste for mode [${mode}]`);
            return;
        }

        const step = clipboard[mode].step;
        const container = step.properties.block_id ? 'blocks' : 'fragments';

        if (!_isUnique(service[container], step)) {
            step.properties.name = `${step.properties.name} (Copy)`;
            step.properties._component_id = StringService.generateUUIDV4();

            if (container === 'blocks') {
                step.properties.block_id = StringService.generateUUIDV4();
            } else {
                step.properties.fragment_id = StringService.generateUUIDV4();
            }
        }

        service[container].push(step);
    }

    function _canPaste(service, step)
    {
        const r = /"namespace":"(.*?)"/g;
        const cmpstr = JSON.stringify(step);
        const matches = [...cmpstr.matchAll(r)].map(i => i[1] || null).filter(i => i !== null).reduce((previous, current) => {
            if (!previous.includes(current)) previous.push(current);
            return previous;
        }, []);
        
        $log.log('WorkflowEditorController wants to paste step, matched namespaces', matches, 'service has', service.packages);

        let missing = [];

        for (const p of matches) {
            if (!service.packages.includes(p)) {
                missing.push(p);
            }
        }

        if (missing.length > 0) {
            $log.log('WorkflowEditorController cannot paste, missing packages in service', missing);
            AlertService.addDanger('Cannot paste, the following packages are missing: ' + missing.concat(', '));
            return false;
        }

        if (step.properties.role && step.properties.role !== 'conversation_block') {
            for (const block of service.blocks) {
                if (block.properties.role === step.properties.role) {
                    $log.log('WorkflowEditorController cannot paste block, unique role [' + step.properties.role + '] already exists');
                    AlertService.addDanger('Cannot paste block, a block with the role [' + step.properties.role + '] already exists.');
                    return false;
                }
            }
        }

        return true;
    }

    function _isUnique(container, item)
    {
        if (item.properties.block_id)
        {
            return container.filter(b => b.properties.block_id === item.properties.block_id).length === 0;
        }
        else if (item.properties.fragment_id)
        {
            return container.filter(f => f.properties.fragment_id === item.properties.fragment_id).length === 0;
        }

        throw new Error('Item is neither a block nor a fragment.');
    }

    _initBlockDefaults();
    _initFragmentDefaults();
    _resolveParams( $stateParams);

    function _initBlockDefaults()
    {
        var blocks = $scope.getBlocks();
        if ( blocks.length) {
            selection['block']['blockId'] = blocks[0].properties.block_id;
        }
    }

    function _initFragmentDefaults()
    {
        var fragments = $scope.getSubroutines();
        if ( fragments.length) {
            selection['fragment']['fragmentId'] = fragments[0].properties.fragment_id;
        }
    }

    $scope.sortableOptions  =   {
        helper: 'clone',
        containment: "parent"
    };

    function _resolveParams( params)
    {
        if ( params.sv) {
            $scope.componentMode   =   params.sv;
        } else {
            $scope.componentMode   =   'steps';
        }

        if ( params.sb) {
            $log.log( 'WorkflowEditorController _resolveParams params.sb', params.sb);
            if ( $scope.componentMode === 'steps') {
                selection['block']['blockId'] = params.sb;
            } else if ( $scope.componentMode === 'fragments') {
                selection['fragment']['fragmentId'] = params.sb;
            }
        } else {
            $log.log( 'WorkflowEditorController _resolveParams replace in $scope.componentMode', $scope.componentMode);
            if ( $scope.componentMode === 'steps') {
                $state.go( 'convoworks-editor-service.editor', { sb:selection['block']['blockId']},
                    { inherit:true, reload:false, notify:true, location:'replace'});
            } else if ( $scope.componentMode === 'fragments') {
                $state.go( 'convoworks-editor-service.editor', { sb:selection['fragment']['fragmentId']},
                    { inherit:true, reload:false, notify:true, location:'replace'});
            }
        }
    }

    $scope.isRoleAvailable      =   function( role) {
        if ( role === 'conversation_block') {
            return true;
        }
        var blocks  =   $scope.getBlocks();
        for ( var i=0; i<blocks.length; i++) {
            if ( role === blocks[i].properties.role) {
                return false;
            }
        }
        return true;
    }

    $scope.openAddNewBlock      =   function( className, role, defaultName)
    {
        $log.log( 'WorkflowEditorController openAddNewBlock() className', className);

        $scope.addNewBlock( className, role, defaultName).then( function ( block) {
            $log.log( 'WorkflowEditorController openAddNewBlock success block', block);
            $scope.selectBlock( block.properties.block_id);
        }, function ( reason) {
            $log.warn( 'WorkflowEditorController openAddNewBlock reason', reason);
        });
    };
    $scope.selectBlock       =   function( blockId) {
        $log.log( 'WorkflowEditorController selectBlock blockId', blockId);

        if ( $scope.isBlockSelected( blockId)) {
            var block   =   $scope.getSelectedBlock();
            $scope.setSelectedBlock( block);
            return;
        }

        selection['block']  =   {
            blockId : blockId,
            componentId : null,
        };
        $state.go( 'convoworks-editor-service.editor', { sb:blockId}, { inherit:true, reload:false, notify:true, location:true});
    }
    $scope.isBlockSelected       =   function( blockId) {
        return selection['block']['blockId'] === blockId;
    }
    $scope.hasBlocks       =   function() {
        return $scope.getBlocks().length > 0;
    }
    $scope.getSelectedBlock       =   function() {
        var blocks = $scope.getBlocks();
        for ( var i=0; i<blocks.length; i++) {
            if ( blocks[i].properties.block_id === selection['block']['blockId']) {
                return blocks[i];
            }
        }
        if ( blocks.length) {
            return blocks[0];
        }
        throw new Error( 'No selected block');
    }

    $scope.openNewProcessSubroutine      =   function()
    {
        $log.log( 'WorkflowEditorController openNewProcessSubroutine()');
        $scope.showNewProcessSubroutine().then( function ( block) {
            $log.log( 'WorkflowEditorController openNewProcessSubroutine success block', block);
            $scope.selectFragment( block.properties.fragment_id);
        }, function ( reason) {
            $log.warn( 'WorkflowEditorController openNewProcessSubroutine reason', reason);
        });
    };

    $scope.openNewReadSubroutine      =   function()
    {
        $log.log( 'WorkflowEditorController openNewReadSubroutine()');
        $scope.showNewReadSubroutine().then( function ( block) {
            $log.log( 'WorkflowEditorController openNewReadSubroutine success block', block);
            $scope.selectFragment( block.properties.fragment_id);
        }, function ( reason) {
            $log.warn( 'WorkflowEditorController openNewReadSubroutine reason', reason);
        });
    };

    $scope.selectFragment       =   function( fragmentId) {
        $log.log( 'WorkflowEditorController selectFragment fragmentId', fragmentId);
        if ( $scope.isFragmentSelected( fragmentId)) {
            var block   =   $scope.getSelectedFragment();
            $scope.setSelectedFragment( block);
            return;
        }
        selection['fragment']  =   {
            fragmentId : fragmentId,
            componentId : null,
        };
        $state.go( 'convoworks-editor-service.editor', { sb:fragmentId}, { inherit:true, reload:false, notify:true, location:true});
    }
    $scope.isFragmentSelected       =   function( fragmentId) {
        return selection['fragment']['fragmentId'] === fragmentId;
    }
    $scope.getSelectedFragment       =   function() {
        var blocks = $scope.getSubroutines();
        for ( var i=0; i<blocks.length; i++) {
            if ( blocks[i].properties.fragment_id === selection['fragment']['fragmentId']) {
                return blocks[i];
            }
        }
        if ( blocks.length) {
            return blocks[0];
        }
        throw new Error( 'No selected fragment');
    }
    $scope.hasFragments       =   function() {
        return $scope.getSubroutines().length > 0;
    }

    $scope.setComponentMode       =   function( mode, $event) {
        $log.log( 'WorkflowEditorController setComponentMode mode', mode, $event);

        if ( !$event) {
            $log.log( 'WorkflowEditorController just notified. Exiting ...');
            return;
        }

        $scope.componentMode   =   mode;
//        $location.search({ sv : mode, sc:null})
        $state.go( 'convoworks-editor-service.editor', { sv : $scope.componentMode, sb:null}, { inherit:true, reload:false, notify:true, location:true});
    }
    $scope.getComponentMode       =   function() {
        return $scope.componentMode;
    }
}
