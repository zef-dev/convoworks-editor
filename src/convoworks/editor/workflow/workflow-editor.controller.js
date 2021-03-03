/* @ngInject */
export default function WorkflowEditorController( $log, $scope, $state, $stateParams, $location, $anchorScroll, $transitions) {

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
