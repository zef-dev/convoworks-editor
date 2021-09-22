import template from './block-component.tmpl.html';

/* @ngInject */
export default function blockComponent( $log, $timeout, ConvoworksApi, UserPreferencesService, LoginService)
{
    return {
        restrict: 'E',
        scope: { 'block' : '='},
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext) {
            var USER_PREFERENCES_KEY    =   '';
            // API
            $scope.over                 =   false;
            $scope.ready                =   false;
            $scope.previewing           =   false;
            $scope.componentTitle       =   "Loading ...";

            $scope.isSysBlock           =   false;

            $scope.isSysBlockOpen       =   { value: false };

            $scope.getService           =   function() {
                return propertiesContext.getSelectedService();
            }

            $scope.getComponentTitle    =   function() {
                if ( !$scope.definition) {
                    return $scope.componentTitle;
                }

                if ( $scope.block.properties.name) {
                    return $scope.block.properties.name;
                }

                if ( $scope.block.properties.block_id.indexOf( '__') === 0) {
                    return 'System - ' + $scope.block.properties.block_id + '';
                }

                return $scope.block.properties.block_id;
            };

            $scope.getComponentNamespace = function() {
                return $scope.block.namespace;
            }

            $scope.isSelected   =   function() {
                return propertiesContext.getSelection().component === $scope.block;
            };

            $scope.isError   =   function() {
                return $scope.componentTitle;
            };

            $scope.togglePreviewing =   function()
            {
                $scope.previewing   =   !$scope.previewing;
            }

            $scope.isRoleAllowed   =   function( propertyDefintion) {
                if ( !propertyDefintion.editor_properties.roles || !propertyDefintion.editor_properties.roles.length) {
                    return true;
                }
                if ( !$scope.block.properties.role) {
                    return true;
                }
                if ( $scope.block && propertyDefintion.editor_properties.roles.indexOf( $scope.block.properties.role) > -1) {
                    return true;
                }
                return false;
            };

            // INIT
            $scope.$watch( 'block.properties._component_id', function ( b) {
                _init();
            }, true);

            function _init()
            {
                $scope.ready    =   false;
                $scope.componentTitle   =   null;

                try {
                    $scope.definition       =   propertiesContext.getComponentDefinition( $scope.block.class);
                } catch ( err) {
                    $log.error( err);
                    $scope.componentTitle   =   err.message;
                    $scope.definition       =   null;
                }

                if ( $scope.block.properties.block_id.indexOf( '__') === 0) {
                    $scope.isSysBlock       =   true;
                }

                LoginService.getUser().then(function (user) {
                    $log.log('blockComponent got user', user);
                    USER_PREFERENCES_KEY    =   user.user_id + '_' + propertiesContext.getSelectedService()['service_id'] + '_' + $scope.block.properties['_component_id'];

                    $log.log('blockComponent final user preferences key', USER_PREFERENCES_KEY);

                    UserPreferencesService.getData(USER_PREFERENCES_KEY).then(function (value) {
                        if (value !== null && value !== undefined) {
                            $scope.isSysBlockOpen.value = value;
                        } else {
                            $scope.isSysBlockOpen.value = false;
                        }
                    });
                }, function (reason) {
                    $log.warn('blockComponent getUser() rejected with reason', reason);
                });

                $scope.$watch('isSysBlockOpen.value', function(value) {
                    UserPreferencesService.registerData(USER_PREFERENCES_KEY, value);
                });

                $scope.$applyAsync( function () {
                    $scope.ready            =   true;
                });
            }

            $timeout( function() {
                _initClick();
            }, 100);

            function _initClick()
            {
                var $div    =   $($element.find( 'div.selectable-component')[0]);

                var containerController =   {
                    deleteSelectedComponent: function() { propertiesContext.removeBlock( $scope.block.properties.block_id); }
                };

                $div.bind( 'click', function( event) {
                    $log.log('blockComponent getUser() _initClick $scope.isSelected()', $scope.isSelected());
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
