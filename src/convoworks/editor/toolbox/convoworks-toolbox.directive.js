import template from './convoworks-toolbox.tmpl.html';

/* @ngInject */
export default function convoworksToolbox( $log, $rootScope, ConvoworksApi, UserPreferencesService)
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

            var core            =   ['convo-core', 'amazon', 'google-nlp'];
            $scope.open         =   {};

            $scope.configuring  =   false;

            $scope.groupedDefinitions   =   {};
            $scope.filtered             =   {};
            $scope.searchTerm           =   '';

            if ( !$scope.service.packages) {
                $scope.service.packages =   [];
            }

            $scope.$on('EscKeyPressed', function() {
                if ($scope.configuring) {
                    $scope.configuring = false;
                }
            })

            _initGroupedDefinitions();

            UserPreferencesService.getData( 'openToolboxes').then( function( openToolboxes) {
                if ( openToolboxes) {
                    $scope.open    =   openToolboxes;
                }
            });

            $scope.$watch( 'open', function( value) {
                UserPreferencesService.registerData( 'openToolboxes', value);
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

            $scope.isOpen       =   function( namespace)
            {
                if ( namespace in $scope.open) {
                    return $scope.open[namespace];
                }
                return (core.indexOf(namespace) > -1);
            };

            $scope.toggleOpen   =   function( namespace)
            {
                $scope.open[namespace]  =   !$scope.isOpen( namespace);
            }

            $scope.isEnabled    =   function( namespace)
            {
                return $scope.service.packages.includes(namespace);
            }

            $scope.toggleEnabled = function(namespace)
            {
                if ( $scope.isEnabled(namespace)) {
                    ConvoworksApi.removeServicePackage( $scope.service.service_id, namespace).then(function(packages) {
                        $log.log('ConvoworksToolbox toggled package', namespace, 'new definitions', packages);
                        $rootScope.$broadcast('PackagesUpdated');
                    }, function (reason) {
                        $log.error('ConvoworksToolbox package toggle failed with reason', reason);
                    })
                } else {
                    ConvoworksApi.addServicePackage( $scope.service.service_id, namespace).then(function(packages) {
                        $log.log('ConvoworksToolbox toggled package', namespace, 'new definitions', packages);
                        $rootScope.$broadcast('PackagesUpdated');
                    }, function (reason) {
                        $log.error('ConvoworksToolbox package toggle failed with reason', reason);
                    })
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
