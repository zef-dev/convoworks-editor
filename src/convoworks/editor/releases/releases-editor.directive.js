import template from './releases-editor.tmpl.html';

/* @ngInject */
export default function releasesEditor( $log, $q, $rootScope, $window, ConvoworksApi, AlertService, CONVO_PUBLIC_API_BASE_URL)
{
    return {
        restrict: 'E',
        scope: { service: '=' },
        require: '^propertiesContext',
        template: template,
        controller: function( $scope) {
            'ngInject';
        },
        link: function( $scope, $element, $attributes, propertiesContext) {
            $log.log( 'releasesEditor link');

            $scope.releases = [];

            let open = {
                production: true,
                test: true,
                development: true
            };

            var PROMOTE_OPTIONS =   {};
            var IMPORT_WORKFLOW_OPTIONS =   {};
            var SUBMIT_OPTIONS  =   {};

            $scope.copyReleaseUrl = function (release) {
                _copyToClipboard(CONVO_PUBLIC_API_BASE_URL + '/service-run/' + release['platform_id'] + '/'
                    + release['alias'] + '/' + release['service_id']);

                AlertService.addInfo('Copied release URL to clipboard.');
            }

            $scope.getPromoteOptions    =   function ( release) {
                return PROMOTE_OPTIONS[ _getReleaseKey( release)];
            };

            $scope.toggleSection = function(section) {
                open[section] = !open[section];
            }

            $scope.isOpen = function(section) {
                return open[section];
            }

            $scope.promoteRelease   =   function ( row, type, stage) {
                $log.log( 'releasesEditor promoteRelease type', type, 'row', row);
                ConvoworksApi.promoteRelease(
                        $scope.service.service_id,
                        row['release_id'],
                        type,
                        stage).then( function () {
                            _load();
                            $rootScope.$broadcast('ServiceReleasesUpdated');
                }, function ( reason) {
                    $log.log( 'releasesEditor promoteRelease reason', reason);
                });
            };

            $scope.tagAsSimpleVersion = function ( row)
            {
                $log.log('releasesEditor tagAsSimpleVersion', row);
                var tag = $window.prompt('Enter a simple tag for this version.');

                ConvoworksApi.tagAsSimpleVersion(
                    $scope.service.service_id,
                    row['version_id'],
                    tag
                ).then(function() {
                    _load();
                    $rootScope.$broadcast('ServiceReleasesUpdated');
                }, function (reason) {
                    $log.log('releasesEditor tagAsSimpleVersion rejected, reason', reason);
                });
            }

            $scope.getSubmitOptions =   function ( release) {
                return SUBMIT_OPTIONS[ _getReleaseKey( release)];
            };

            $scope.submitRelease    =   function ( row, type, stage) {
                $log.log( 'releasesEditor submitRelease type', type, 'row', row);
                ConvoworksApi.createRelease(
                        $scope.service.service_id,
                        row['platform_id'],
                        type,
                        stage).then( function () {
                            _load();
                            $rootScope.$broadcast('ServiceReleasesUpdated');
                }, function ( reason) {
                    $log.log( 'releasesEditor submitRelease reason', reason);
                });
            };


            $scope.getImportWorkflow    =   function ( release) {
                return IMPORT_WORKFLOW_OPTIONS[ _getReleaseKey( release)];
            };

            $scope.importWorkflowRelease    =   function ( row, releaseId) {
                $log.log( 'releasesEditor importWorkflowRelease releaseId', releaseId);
                ConvoworksApi.importWorkflowIntoRelease(
                        $scope.service.service_id,
                        releaseId,
                        row['version_id']).then( function () {
                            _load();
                            $rootScope.$broadcast('ServiceReleasesUpdated');
                }, function ( reason) {
                    $log.log( 'releasesEditor importWorkflowRelease', reason);
                });
            };

            $scope.importToDevelop = function( row)
            {
                ConvoworksApi.importWorkflowIntoDevelop(
                    $scope.service.service_id,
                    row['version_id']
                ).then(function () {
                    _load();
                    $rootScope.$broadcast('ServiceReleaseDevelopImport');
                }, function (reason) {
                    $log.log('releaseEditor importToDevelop rejected', reason);
                })
            }

            function get_release( platformId, type, stage)
            {
                for ( var i=0; i<$scope.releases.length; i++) {
                    var release =   $scope.releases[i];
                    if ( release['type'] === type && release['stage'] === stage && release['platform_id'] === platformId) {
                        $log.log( 'releasesEditor get_release found platformId', platformId, 'type', type, 'stage', stage, release['release_id']);
                        return release['release_id'];
                    }
                }

                $log.log( 'releasesEditor get_release not found platformId', platformId, 'type', type, 'stage', stage);
                return null;
            }

            $scope.$on( 'ServiceConfigUpdated', function ( evt, data) {
                _load();
            });

            _load();

            function _load() {
                ConvoworksApi.getServiceReleases( $scope.service.service_id).then( function ( releases) {
                    $log.log( 'releasesEditor releases loaded');
                    $scope.releases =   releases;
                    _initOptions();
                }, function ( reason) {
                    $log.log( 'releasesEditor getServiceReleases reason', reason);
                })
            }

            function _initOptions()
            {
                $log.log( 'releasesEditor _initOptions');

                PROMOTE_OPTIONS =   {};
                IMPORT_WORKFLOW_OPTIONS =   {};
                SUBMIT_OPTIONS  =   {};

                var releases    =   $scope.getDevelopment();
                for ( var i=0; i<releases.length; i++) {
                    var release =   releases[i];
                    var key     =   _getReleaseKey( release);

                    var options =   _getSubmitOptions( release);
                    SUBMIT_OPTIONS[key] =   options;

                    var options =   _getWorkflowOptions( release);
                    IMPORT_WORKFLOW_OPTIONS[key]    =   options;
                }

                var releases    =   $scope.getTest();
                for ( var i=0; i<releases.length; i++) {
                    var release =   releases[i];
                    var key     =   _getReleaseKey( release);

                    var options =   _getPromoteOptions( release);
                    PROMOTE_OPTIONS[key]    =   options;

                    var options =   _getWorkflowOptions( release);
                    IMPORT_WORKFLOW_OPTIONS[key]    =   options;
                }

                var releases    =   $scope.getProduction();
                for ( var i=0; i<releases.length; i++) {
                    var release =   releases[i];
                    var key     =   _getReleaseKey( release);

                    var options =   _getPromoteOptions( release);
                    PROMOTE_OPTIONS[key]    =   options;
                }
            }

            function _getReleaseKey( release) {
                return release['release_id'] ? release['release_id'] : release['platform_id'] + '_' + release['type'];
            }

            function _getSubmitOptions( release) {
                var options =   [];

                if ( release['platform_id'] === 'amazon') {
                    options.push( {
                        title : 'Submit to review',
                        type : 'production',
                        stage : 'review',
                    });
                } else if ( release['platform_id'] === 'dialogflow') {
                    options.push( {
                        title : 'Submit to review',
                        type : 'production',
                        stage : 'review',
                    });
                    options.push( {
                        title : 'Submit to alpha test',
                        type : 'test',
                        stage : 'alpha',
                    });
                } else if ( release['platform_id'] === 'convo_chat') {
                    var release_id  =   get_release( 'convo_chat', 'production', 'release');
                    if ( !release_id) {
                        options.push( {
                            title : 'Submit as release',
                            type : 'production',
                            stage : 'release',
                        });
                    }
                } else if (release['platform_id'] === 'facebook_messenger') {
                    options.push( {
                        title : 'Submit to review',
                        type : 'production',
                        stage : 'review',
                    });
                    options.push( {
                        title : 'Submit to alpha test',
                        type : 'test',
                        stage : 'alpha',
                    });
                } else if (release['platform_id'] === 'viber') {
                    options.push( {
                        title : 'Submit to review',
                        type : 'production',
                        stage : 'review',
                    });
                    options.push( {
                        title : 'Submit to alpha test',
                        type : 'test',
                        stage : 'alpha',
                    });
                }

                return options;
            }

            function _getPromoteOptions( release) {
                var options =   [];
                if ( release['platform_id'] === 'amazon') {
                    if ( release['stage'] === 'review') {
                        options.push( {
                            title : 'Promote to release',
                            type : 'production',
                            stage : 'release'
                        });
                    }
                } else if ( release['platform_id'] === 'dialogflow') {
                    if ( release['type'] === 'production' && release['stage'] === 'review') {
                        options.push( {
                            title : 'Promote to release',
                            type : 'production',
                            stage : 'release'
                        });
                    } else if ( release['type'] === 'test') {
                        options.push( {
                            title : 'Promote to review',
                            type : 'production',
                            stage : 'review'
                        });
                    }
                } else if ( release['platform_id'] === 'viber') {
                    if ( release['type'] === 'production' && release['stage'] === 'review') {
                        options.push( {
                            title : 'Promote to release',
                            type : 'production',
                            stage : 'release'
                        });
                    } else if ( release['type'] === 'test') {
                        options.push( {
                            title : 'Promote to review',
                            type : 'production',
                            stage : 'review'
                        });
                    }
                } else if ( release['platform_id'] === 'facebook_messenger') {
                    if ( release['type'] === 'production' && release['stage'] === 'review') {
                        options.push( {
                            title : 'Promote to release',
                            type : 'production',
                            stage : 'release'
                        });
                    } else if ( release['type'] === 'test') {
                        options.push( {
                            title : 'Promote to review',
                            type : 'production',
                            stage : 'review'
                        });
                    }
                }
                return options;
            }

            function _getWorkflowOptions( release) {
                var options =   [];

                if ( release['platform_id'] === 'amazon') {
                    var release_id  =   get_release( 'amazon', 'production', 'release');
                    if ( release_id) {
                        options.push( {
                            title : 'Import to release',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }

                    var release_id  =   get_release( 'amazon', 'production', 'review');
                    if ( release_id) {
                        options.push( {
                            title : 'Import to review',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }
                } else if ( release['platform_id'] === 'dialogflow') {
                    var release_id  =   get_release( 'dialogflow', 'production', 'release');
                    if ( release_id) {
                        options.push( {
                            title : 'Import to release',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }

                    var release_id  =   get_release( 'dialogflow', 'production', 'review');
                    if ( release_id) {
                        options.push( {
                            title : 'Import to review',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }
                    var release_id  =   get_release( 'dialogflow', 'test', 'alpha');
                    if ( release_id && release['type'] !== 'test') {
                        options.push( {
                            title : 'Import to alpha',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }
                } else if ( release['platform_id'] === 'convo_chat') {
                    var release_id  =   get_release( 'convo_chat', 'production', 'release');
                    if ( release_id) {
                        options.push( {
                            title : 'Import to release',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }
                } else if ( release['platform_id'] === 'facebook_messenger') {
                    var release_id  =   get_release( 'facebook_messenger', 'production', 'release');
                    if ( release_id) {
                        options.push( {
                            title : 'Import to release',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }
                } else if ( release['platform_id'] === 'viber') {
                    var release_id  =   get_release( 'viber', 'production', 'release');
                    if ( release_id) {
                        options.push( {
                            title : 'Import to release',
                            version_id : release['version_id'],
                            release_id : release_id
                        });
                    }
                }
                return options;
            };

            function _copyToClipboard(text) {
                // Create new element
                var el = document.createElement('textarea');
                // Set value (string to be copied)
                el.value = text;
                // Set non-editable to avoid focus and move outside of view
                el.setAttribute('readonly', '');
                el.style = {position: 'absolute', left: '-9999px'};
                document.body.appendChild(el);
                // Select text inside element
                el.select();
                // Copy text to clipboard
                document.execCommand('copy');
                // Remove temporary element
                document.body.removeChild(el);
            }

            // GRID DATA
            $scope.getProduction    =   function () {
                var releases = $scope.releases.filter( function( release) {
                    return release.type === 'production';
                });
                return releases;
            };

            $scope.getTest          =   function () {
                var releases = $scope.releases.filter( function( release) {
                  return release.type   === 'test';
                });
                return releases;
            };

            $scope.getDevelopment   =   function () {
                var releases = $scope.releases.filter( function( release) {
                  return release.type   === 'develop';
                });
                return releases;
            };
        }
    }
};
