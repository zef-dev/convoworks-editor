import template from './convoworks-add-block.tmpl.html';

/* @ngInject */
export default function ConvoworksAddBlockService( $log, $uibModal) {

    this.showModal              =   showModal;
    this.showSubroutineModal    =   showSubroutineModal;

    function showModal( service, type, propertiesContext, className, role, defaultName)
    {
        return $uibModal.open({
            template: template,
            controller: ModalInstanceCtrl,
            size : 'md',
            resolve: {
                service: function () {
                    return service;
                },
                type: function () {
                    return type;
                },
                subroutineType: function () {
                    return null;
                },
                propertiesContext: function () {
                    return propertiesContext;
                },
                className: function () {
                    return className;
                },
                role: function () {
                    return role;
                },
                defaultName: function () {
                    return defaultName;
                },
            }
        }).result;
    }


    function showSubroutineModal( service, propertiesContext, subroutineType)
    {
        return $uibModal.open({
            template: template,
            controller: ModalInstanceCtrl,
            size : 'md',
            resolve: {
                service: function () {
                    return service;
                },
                type: function () {
                    return 'reader';
                },
                subroutineType: function () {
                    return subroutineType;
                },
                propertiesContext: function () {
                    return propertiesContext;
                },
                className: function () {
                    return null;
                },
                role: function () {
                    return null;
                },
                defaultName: function () {
                    return null;
                },
            }
        }).result;
    }


    /* @ngInject */
    var ModalInstanceCtrl = function ( $scope, $timeout, $uibModalInstance, service, type, subroutineType, propertiesContext, className, role, defaultName) {

        $scope.service          =   service;

        $scope.block            =   {
                name : '',
        };

        if ( type == 'user')
        {
            $scope.title            =   'Add new step' + ( role ? ' ['+role+']' : '');
            $scope.description      =   'Create a new step in the conversation workflow.';
            $scope.block.name       =   defaultName ? defaultName : 'My new conversation step';

            $scope.createBlock          =   function () {
                $log.log( 'ConvoworksAddBlockService ModalInstanceCtrl createBlock() $scope.block', $scope.block);
                propertiesContext.addBlock( $scope.block.name, className, role).then( function ( block) {
                    $uibModalInstance.close( block);
                }, function ( reason) {
                    $log.error( reason);
                });
            };
        }
        else if ( type == 'reader')
        {
            if ( subroutineType == 'read')
            {
                $scope.title            =   'Add new read fragment';
                $scope.description      =   'Create new fragment which can be invoked from conversation elemets';
                $scope.block.name       =   'My new read fragment';

                $scope.createBlock          =   function () {
                    $log.warn( 'ConvoworksAddBlockService ModalInstanceCtrl createBlock() $scope.block', $scope.block);
                    propertiesContext.addReadSubroutine( $scope.block.name).then( function ( block) {
                        $uibModalInstance.close( block);
                    }, function ( reason) {
                        $uibModalInstance.dissmis( reason);
                    });
                };
            }
            else if ( subroutineType == 'process')
            {
                $scope.title            =   'Add new process fragment';
                $scope.description      =   'Create new fragment which can be invoked from conversation processors';
                $scope.block.name       =   'My new process fragment';

                $scope.createBlock          =   function () {
                    $log.warn( 'ConvoworksAddBlockService ModalInstanceCtrl createBlock() $scope.block', $scope.block);
                    propertiesContext.addProcessSubroutine( $scope.block.name).then( function ( block) {
                        $uibModalInstance.close( block);
                    }, function ( reason) {
                        $uibModalInstance.dissmis( reason);
                    });
                };
            }
            else
            {
                throw new Error( 'Unexpected subroutineType ['+subroutineType+']');
            }
        }
        else
        {
            throw new Error( 'Unexpected type ['+type+']');
        }


        $scope.cancel           =   function () {
            $uibModalInstance.dismiss('cancel');
        };

    };
};
