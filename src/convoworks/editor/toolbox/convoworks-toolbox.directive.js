import angular from 'angular';
import template from './convoworks-toolbox.tmpl.html';
import unsavedChangesTemplate from './unsaved-changes.tmpl.html';

/* @ngInject */
export default function convoworksToolbox($log, $rootScope, $uibModal, $document, $timeout, ConvoworksApi, UserPreferencesService)
{
    return {
        restrict: 'E',
        scope: {
            'definitions' : '=',
            'availablePackages': '=',
            'service' : '='
        },
        require: '^propertiesContext',
        template: template,
        link: function( $scope, $element, $attributes, propertiesContext)
        {
            $log.log( 'convoworksToolbox _init() $scope.definitions', $scope.definitions, $scope.availablePackages);
            
            const TOGGLE_TIMEOUT = 450;

            var core = ['convo-core', 'amazon', 'google-nlp'];
            $scope.open = {};
            $scope.showTypes = {};

            $scope.configuring  =   false;

            $scope.groupedDefinitions   =   {};
            $scope.filtered             =   {};
            $scope.searchTerm           =   '';
            $scope.toggling             =   null;

            if ( !$scope.service.packages) {
                $scope.service.packages =   [];
            }

            $scope.availablePackages.sort((p1, p2) => {
                if (p1.stability === 'experimental' && p2.stability !== 'experimental') {
                    return 1;
                }

                if (p2.stability === 'experimental' && p1.stability !== 'experimental') {
                    return -1;
                }

                return 0;
            })

            $scope.$on('EscKeyPressed', function() {
                if ($scope.configuring) {
                    $scope.configuring = false;
                }
            })

            _initGroupedDefinitions();
            _initShowTypes();

            UserPreferencesService.getData( 'openToolboxes').then( function( openToolboxes) {
                if ( openToolboxes) {
                    $scope.open    =   openToolboxes;
                }
            });

            $scope.$watch( 'open', function( value) {
                UserPreferencesService.registerData( 'openToolboxes', value);
            }, true);

            $scope.$watch('showTypes', function (value) {
                UserPreferencesService.registerData('showTypes', value);
            }, true);

            $scope.$watch('definitions', function (value) {
                _initGroupedDefinitions();
            }, true);

            // METHODS

            $scope.$watch('searchTerm', function () {
                $scope.$applyAsync(_filterDefinitions());
            });

            $scope.startConfiguring = function()
            {
                $scope.configuring = true;
            }

            $scope.endConfiguring = function()
            {
                $scope.configuring = false;
            }

            $scope.showComponentType = function(namespace, type) {
                if (Object.keys($scope.groupedDefinitions[namespace]).length === 1) {
                    // only one type of subsection
                    return true;
                }

                return $scope.showTypes && $scope.showTypes[namespace] && $scope.showTypes[namespace][type];
            }

            $scope.toggleComponentType = function (namespace, type) {
                if (!$scope.showTypes[namespace]) {
                    $scope.showTypes[namespace] = { type: true };
                }

                $scope.showTypes[namespace][type] = !$scope.showTypes[namespace][type];
            }

            $scope.isOpen       =   function(namespace)
            {
                if ( namespace in $scope.open) {
                    return $scope.open[namespace];
                }
                return (core.indexOf(namespace) > -1);
            };

            $scope.toggleOpen   =   function(namespace)
            {
                $scope.open[namespace]  =   !$scope.isOpen( namespace);
            }

            $scope.isEnabled    =   function(namespace)
            {
                return $scope.service.packages.includes(namespace);
            }

            $scope.toggleEnabled = function(namespace)
            {
                if (propertiesContext.isServiceChanged())
                {
                    const modal = $uibModal.open({
                        template: unsavedChangesTemplate,
                        controller: ModalInstanceCtrl,
                        appendTo: $document.find('.convoworks').eq(0),
                        size: 'md'
                    });

                    modal.result.then((result) => {
                        switch (result) {
                            case 0: // save service and toggle
                                propertiesContext.saveChanges().then(() => {
                                    _toggleEnabled(namespace);
                                });
                                break;
                            case 1: // toggle without saving
                                _toggleEnabled(namespace);
                                break;
                            case 2: // cancel
                                // $rootScope.$broadcast('PackagesUpdated');
                                $scope.$evalAsync();
                                break;
                            default:
                                $log.error('Unexpected package toggle state: ' + result);
                                throw new Error('Something went wrong. Please try again later.');
                        }
                    });
                }
                else
                {
                    _toggleEnabled(namespace);
                }
            }

            function _toggleEnabled(namespace)
            {
                $scope.toggling = namespace;
                let toggle_timeout = null;
                // const removed = $scope.isEnabled(namespace);
                const promise = $scope.isEnabled(namespace) ?
                    ConvoworksApi.removeServicePackage($scope.service.service_id, namespace) :
                    ConvoworksApi.addServicePackage($scope.service.service_id, namespace);

                promise.then(() => {
                    // removed ? $scope.service.packages = $scope.service.packages.filter(n => n !== namespace) : $scope.service.packages.push(namespace);
                    $rootScope.$broadcast('PackagesUpdated');

                    if (toggle_timeout) {
                        $timeout.cancel(toggle_timeout);
                    }

                    toggle_timeout = $timeout(() => {
                        $scope.toggling = null;
                    }, TOGGLE_TIMEOUT);
                }, (reason) => {
                    $log.error('ConvoworksToolbox package toggle failed with reason', reason);
                    $scope.toggling = null;
                });
            }

            /* @ngInject */
            var ModalInstanceCtrl = function ($scope, $uibModalInstance)
            {
                $scope.resolve = function (state)
                {
                    $uibModalInstance.close(state);
                }
            }

            $scope.isEmpty = function(namespace)
            {
                if (!$scope.filtered[namespace]) {
                    return true;
                }

                for (var workflow in $scope.filtered[namespace])
                {
                    if (!$scope.filtered[namespace].hasOwnProperty(workflow)) {
                        continue;
                    }

                    if ($scope.filtered[namespace][workflow].length > 0) {
                        return false;
                    }
                }

                return true;
            }

            function _initGroupedDefinitions()
            {
                $scope.groupedDefinitions = {};

                for (var i in $scope.definitions) {
                    $log.log($scope.definitions[i]);
                    var namespace = $scope.definitions[i].namespace;

                    if (!$scope.groupedDefinitions[namespace]) {
                        $scope.groupedDefinitions[namespace] = {};
                    }

                    for (var j in $scope.definitions[i].components) {
                        var cmpt = $scope.definitions[i].components[j];
                        var grp = _uppercaseWord(cmpt['component_properties']['_workflow']);

                        if (grp === 'Datasource') continue;

                        if (!$scope.groupedDefinitions[namespace][grp]) {
                            $scope.groupedDefinitions[namespace][grp] = [];
                        }

                        if (!cmpt.name.toLowerCase().includes('x!')) {
                            $scope.groupedDefinitions[namespace][grp].push(cmpt);
                        }
                    }
                }

                _filterDefinitions();
            }

            function _initShowTypes() {
                const default_visibility = { 'read': true, 'process': true, 'filter': true };

                const user_preferences = UserPreferencesService.get('showTypes', {});

                // go over currently activated definitions
                for (const definition of $scope.definitions) {
                    $scope.showTypes[definition.namespace] = user_preferences[definition.namespace] || default_visibility;
                }

                // merge preferences for definitions that might not be active currently but can be toggled on
                angular.merge($scope.showTypes, user_preferences);
            }

            function _uppercaseWord(word) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }

            function _filterDefinitions()
            {
                if (!$scope.searchTerm || $scope.searchTerm === '')
                {
                    $scope.filtered = angular.copy($scope.groupedDefinitions);
                    return;
                }

                $scope.filtered = $scope.filtered || angular.copy($scope.groupedDefinitions);

                for (var namespace in $scope.filtered)
                {
                    if (!$scope.filtered.hasOwnProperty(namespace)) {
                        continue;
                    }

                    $scope.open[namespace] = true;

                    for (var workflow in $scope.filtered[namespace])
                    {
                        if (!$scope.filtered[namespace].hasOwnProperty(workflow)) {
                            continue;
                        }

                        $scope.filtered[namespace][workflow] = $scope.groupedDefinitions[namespace][workflow]
                            .filter(function (el) {
                                return el.name.toLowerCase().includes($scope.searchTerm.toLowerCase());
                            });
                    }
                }
            }
        }
    }
}
