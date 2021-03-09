/* @ngInject */
export default function ConvoworksApi( $log, $http, $q, CONVO_ADMIN_API_BASE_URL, CONVO_PUBLIC_API_BASE_URL) {


        $log.log("ConvoworksApi init");

        var definitions     =   null;

        // INTERFACE

        // /convo-definitions
        this.getComponentDefinitions    =   getComponentDefinitions;
        this.getComponentDefinition     =   getComponentDefinition;
        this.getTemplates               =   getTemplates;

        // /service-packages
        this.getAvailablePackages       =   getAvailablePackages;
        this.addServicePackage          =   addServicePackage;
        this.removeServicePackage       =   removeServicePackage;

        // /services
        this.getAllServices             =   getAllServices;

        // /services/{serviceId}
        this.getServiceById             =   getServiceById;
        this.getServiceMeta             =   getServiceMeta;
        this.createService              =   createService;
        this.updateService              =   updateService;
        this.deleteService              =   deleteService;

        // /services/{serviceId}/meta
        this.updateServiceMeta          =   updateServiceMeta;

        // /services/{serviceId}/preview
        this.getServicePreview          =   getServicePreview;

        // /services/{serviceId}/preview/{blockId}
        this.getBlockPreview            =   getBlockPreview;

        // /service-run/{serviceId}
        this.sendMessage                =   sendMessage;

        // /service-imp-exp/import/{serviceId}
        this.uploadServiceData          =   uploadServiceData;

        // /service-platform-config/{serviceId}
        this.loadPlatformConfig         =   loadPlatformConfig;
        this.getServicePlatformConfig   =   getServicePlatformConfig;
        this.createServicePlatformConfig   =   createServicePlatformConfig;
        this.updateServicePlatformConfig   =   updateServicePlatformConfig;
        this.propagateServicePlatform   =   propagateServicePlatform;
        this.getPropagateInfo           =   getPropagateInfo;

        // publish-service/{platformId}/{serviceId}
        this.getPublishInformation      =   getPublishInformation;

        this.getServiceVersions         =   getServiceVersions;
        this.getServiceReleases         =   getServiceReleases;
        this.createRelease              =   createRelease;
        this.promoteRelease             =   promoteRelease;
        this.tagAsSimpleVersion         =   tagAsSimpleVersion;
        this.importWorkflowIntoRelease  =   importWorkflowIntoRelease;
        this.importWorkflowIntoDevelop  =   importWorkflowIntoDevelop;

        // media/{serviceId}
        this.uploadMedia                =   uploadMedia;
        this.downloadMedia              =   downloadMedia;

        // package-help/{packageId}/{filename}
        this.getPackageComponentHelp        =   getPackageComponentHelp;

        this.requestAuthUrl                 =   requestAuthUrl;

        this.getPlatformConfiguration       =   getPlatformConfiguration;
        this.updatePlatformConfiguration    =   updatePlatformConfiguration;

        // config-options
        this.getConfigOptions               =   getConfigOptions;

        // get-existing-alexa-skill/{skillId}/manifest
        this.getExistingAlexaSkill          =   getExistingAlexaSkill;
        // get-existing-alexa-skill/{skillId}/account-linking-information
        this.getExistingAlexaSkillAccountLinkingInformation          =   getExistingAlexaSkillAccountLinkingInformation;

        // supply-urls/static-url/{forWhat}
        this.getStaticUrls = getStaticUrls;
        // supply-urls/dynamic-url/{serviceId}{platformId}/{forWhat}
        this.getDynamicUrls = getDynamicUrls;
        // supply-urls/account-linking/{platformId}/{accountLinkingMode}
        this.getAccountLinkingUrls = getAccountLinkingUrls;

        function getPlatformConfiguration()
        {
            return $http({
                method: 'get',
                url: CONVO_ADMIN_API_BASE_URL + '/user-platform-config'
            }).then(function (res) {
                $log.log("ConvoworksApi getPlatformConfiguration() res", res);

                return res.data;
            });
        }

        function updatePlatformConfiguration(config)
        {
            return $http({
                method: 'put',
                url: CONVO_ADMIN_API_BASE_URL + '/user-platform-config',
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                },
                data: config
            }).then(function (res) {
                $log.log("ConvoworksApi updatePlatformConfig() res", res);

                return res.data;
            });
        }


        function requestAuthUrl(user)
        {
            return $http({
                method: 'GET',
                url: CONVO_PUBLIC_API_BASE_URL + '/admin-auth/amazon?username=' + user.email
            }).then(function (res) {
                $log.log('Got res', res);
                return res.data;
            });
        }


        // TEMPLATES
//         function getTemplates(serviceId) {
//             var d   =   $q.defer();
//
//             getComponentDefinitions(serviceId).then( function( definitions) {
//                 var templates   =   [];
//                 for ( var i=0; i<definitions.length; i++) {
//                     var pckg    =   definitions[i];
//                     for ( var j=0; j<pckg.templates.length; j++) {
//                         templates.push( pckg.templates[j]);
//                     }
//                 }
//
//                 d.resolve( templates);
//
// //              d.reject( 'Component ['+className+'] not found');
//             });
//
//             return d.promise;
//         }

        function getTemplates()
        {
            return $http({
                method: 'GET',
                url: CONVO_ADMIN_API_BASE_URL + '/templates'
            }).then(function(res) {
                return res.data;
            });
        }

        // DEFINITIONS
        function getComponentDefinitions(serviceId, refresh = false) {
            if (definitions !== null && !refresh)
            {
                var d = $q.defer();
                d.resolve(definitions);
                return d.promise;
            }

            return $http({
                method: 'GET',
                url: CONVO_ADMIN_API_BASE_URL + '/service-packages/' + serviceId
            }).then( function ( res) {
                definitions =   res.data;
                return definitions;
            });
        }

        function getComponentDefinition(serviceId, className) {
//          $log.log( 'ConvoworksApi getComponentDefinition(%s)', className);
//             $log.log('ConvoworksApi getComponentDefinition()', serviceId, className);

            var d = $q.defer();

            getComponentDefinitions(serviceId).then(function(definitions) {
                // $log.log('ConvoworksApi getComponentDefinition() definitions', definitions);

                for (var i = 0; i < definitions.length; i++)
                {
                    var pckg = definitions[i];
                    // $log.log('ConvoworksApi getComponentDefinition() currently on package', pckg['namespace']);
                    for (var j = 0; j < pckg.components.length; j++)
                    {
                        var comp = pckg.components[j];

                        // $log.log('ConvoworksApi getComponentDefinition() current component', comp['type']);
                        if (comp['type'] === className)
                        {
                            // $log.log('ConvoworksApi getComponentDefinition() found component', comp);
                            d.resolve(comp);
                            return comp;
                        }
                        if (comp['component_properties']['_class_aliases'] &&
                            comp['component_properties']['_class_aliases'].includes(className))
                        {
                            d.resolve(comp);
                            return comp;
                        }
                    }
                }
                d.reject( 'Component ['+className+'] not found');
            });

            return d.promise;
        }

        // PACKAGES
        function getAvailablePackages()
        {
            return $http({
                method: 'GET',
                url: CONVO_ADMIN_API_BASE_URL + '/user-packages'
            }).then(function(res) {
                return res.data;
            })
        }

        function addServicePackage(serviceId, packageId)
        {
            $log.log('ConvoworksApi addServicePackage()', serviceId, packageId);

            return $http({
                method: 'POST',
                url: CONVO_ADMIN_API_BASE_URL + '/service-packages/' + serviceId,
                data: { 'package_id': packageId }
            }).then(function(res) {
                $log.log('ConvoworksApi addServicePackage() then', res.data);
                return res.data;
            });
        }

        function removeServicePackage(serviceId, packageId)
        {
            $log.log('ConvoworksApi removeServicePackage()', serviceId, packageId);

            return $http({
                method: 'DELETE',
                url: CONVO_ADMIN_API_BASE_URL + '/service-packages/' + serviceId,
                data: { 'package_id': packageId }
            }).then(function(res) {
                $log.log('ConvoworksApi removeServicePackage() then', res.data);
                return res.data;
            })
        }

        function getAllServices() {
            $log.log( 'ConvoworksApi getAllServices()');

            return $http({
                method: 'GET',
                url: CONVO_ADMIN_API_BASE_URL + '/services'
            }).then( function ( res) {
                return res.data;
            })
        }

        function getServiceById( serviceId) {
            $log.log( 'ConvoworksApi getServiceById(%s)', serviceId);
            return $http({
                method: 'GET',
                url: CONVO_ADMIN_API_BASE_URL + '/services/' + serviceId
            }).then( function ( res) {
                return res.data;
            });
        }

        function getServiceMeta( serviceId) {
            $log.log( 'ConvoworksApi getServiceMeta(%s)', serviceId);
            return $http({
                method: 'GET',
                url: CONVO_ADMIN_API_BASE_URL + '/services/' + serviceId + '/meta'
            }).then( function ( res) {
                return res.data;
            });
        }

        function createService( serviceName, defaultLanguage, defaultLocale, supportedLocales, isPrivate, templateId)
        {
            return $http({
                method: 'post',
                url: CONVO_ADMIN_API_BASE_URL + '/services',
                data: { 'service_name' : serviceName, 'default_language': defaultLanguage, 'default_locale': defaultLocale, 'supported_locales': supportedLocales, 'is_private' : isPrivate, 'template_id' : templateId }
            }).then( function ( res) {
                return res.data;
            });
        }

        function updateService( serviceId, service) {
            $log.log( 'ConvoworksApi postService() serviceId', serviceId);

            return $http.put( CONVO_ADMIN_API_BASE_URL + '/services/' + serviceId, service);
        }

        function deleteService(serviceId, localOnly = false) {
            $log.log('ConvoworksApi deleteService() serviceId', serviceId, 'local only', localOnly);

            return $http({
                method: 'delete',
                url: CONVO_ADMIN_API_BASE_URL + '/services/' + serviceId + '?local_only=' + (localOnly? 'true' : 'false')
            }).then(function (res) {
                return res.data;
            })
        }

        function updateServiceMeta( serviceId, meta) {
            $log.log( 'ConvoworksApi updateServiceMeta() serviceId', serviceId, 'meta', meta);

            return $http.put( CONVO_ADMIN_API_BASE_URL + '/services/' + serviceId + '/meta', meta);
        }

        function getServicePreview(serviceId) {
            $log.log('ConvoworksApi getServicePrevies() serviceId', serviceId);

            return $http
                .get( CONVO_ADMIN_API_BASE_URL + '/services/' + serviceId + '/preview')
                .then(function (res) {
                    return res.data
                });
        }

        function getBlockPreview(serviceId, blockId) {
            $log.log('ConvoworksApi getBlockPreview() serviceId', serviceId, 'blockId', blockId);

            return $http
                .get( CONVO_ADMIN_API_BASE_URL + '/services/' + serviceId + '/preview/' + blockId)
                .then(function (res) {
                    return res.data;
                });
        }

        function sendMessage( serviceId, deviceId, text, isLaunch, variant, delegateNlp)
        {
            if ( !variant) {
                variant =   'develop';
            }

            return $http({
                method: "post",
                url: CONVO_ADMIN_API_BASE_URL + '/service-test/' + serviceId,
                data : { device_id : deviceId, text : text, launch : isLaunch, platform_id: delegateNlp }
            }).then( function ( response) {
                $log.log('ConvoworksApi sendMessage response.data', response.data);
                return response.data;
            });
        }

        function uploadServiceData( serviceId, file, keepVars, keepConfigs) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi uploadServiceData() serviceId', serviceId, 'file', file);
            var fd = new FormData();
            fd.append("service_definition", file);
            fd.append("keep_vars", keepVars);
            fd.append("keep_configs", keepConfigs);

            return $http
            .post( CONVO_ADMIN_API_BASE_URL + '/service-imp-exp/import/' + serviceId, fd, { headers: {'Content-Type': undefined }})
            .then(function (res) {
                $log.log('ConvoworksApi uploadServiceData() res', res);
                return res.data;
            });
        }

        function loadPlatformConfig( serviceId) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi loadPlatformConfig() serviceId', serviceId);

            return $http
            .get( CONVO_ADMIN_API_BASE_URL + '/service-platform-config/' + serviceId)
            .then(function (res) {
                $log.log('ConvoworksApi loadPlatformConfig() res', res);
                return res.data;
            });
        }

        function getServicePlatformConfig( serviceId, platformId) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi getServicePlatformConfig() serviceId', serviceId, 'platformId', platformId);

            return $http
            .get( CONVO_ADMIN_API_BASE_URL + '/service-platform-config/' + serviceId +'/'+platformId)
            .then(function (res) {
                $log.log('ConvoworksApi getServicePlatformConfig() res', res);
                return res.data;
            });
        }

        function createServicePlatformConfig( serviceId, platformId, data) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi createServicePlatformConfig() serviceId', serviceId, 'platformId', platformId);

            return $http
            .post( CONVO_ADMIN_API_BASE_URL + '/service-platform-config/' + serviceId +'/'+platformId, data)
            .then(function (res) {
                $log.log('ConvoworksApi createServicePlatformConfig() res', res);
                return res.data;
            });
        }

        function updateServicePlatformConfig( serviceId, platformId, data) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi updateServicePlatformConfig() serviceId', serviceId, 'platformId', platformId);

            return $http
            .put( CONVO_ADMIN_API_BASE_URL + '/service-platform-config/' + serviceId +'/'+platformId, data)
            .then(function (res) {
                $log.log('ConvoworksApi updateServicePlatformConfig() res', res);
                return res.data;
            });
        }

        function propagateServicePlatform( serviceId, platformId) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi propagateServicePlatform() serviceId', serviceId, 'platformId', platformId);

            return $http
            .post( CONVO_ADMIN_API_BASE_URL + '/service-platform-propagate/' + serviceId +'/'+platformId)
            .then(function (res) {
                $log.log('ConvoworksApi propagateServicePlatform() res', res);
                return res.data;
            });
        }

        function getPropagateInfo( serviceId, platformId) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi getPropagateInfo() serviceId', serviceId, 'platformId', platformId);

            return $http
            .get( CONVO_ADMIN_API_BASE_URL + '/service-platform-propagate/' + serviceId +'/'+platformId)
            .then(function (res) {
                $log.log('ConvoworksApi getPropagateInfo() res', res);
                return res.data;
            });
        }

        function getPublishInformation( serviceId) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi getPublishInformation() serviceId', serviceId);

            return $http
            .get( CONVO_ADMIN_API_BASE_URL + '/service-publish/' + serviceId)
            .then(function (res) {
                $log.log('ConvoworksApi getPublishInformation() res', res);
                return res.data;
            });
        }


        function getServiceVersions( serviceId) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi getServiceVersions() serviceId', serviceId);

            return $http
            .get( CONVO_ADMIN_API_BASE_URL + '/service-versions/' + serviceId)
            .then(function (res) {
                $log.log('ConvoworksApi getServiceVersions() res', res);
                return res.data;
            });
        }

        function createRelease( serviceId, platformId, type, stage) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi createRelease() serviceId', serviceId);

            var data    =   {
                    platform_id : platformId,
                    type : type,
                    stage : stage
            };

            return $http
            .post( CONVO_ADMIN_API_BASE_URL + '/service-releases/' + serviceId, data)
            .then(function (res) {
                $log.log('ConvoworksApi createRelease() res', res);
                return res.data;
            });
        }

        function promoteRelease( serviceId, releaseId, type, stage) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi promoteRelease() serviceId', serviceId);

            var data    =   {
                    release_id : releaseId,
                    type : type,
                    stage : stage
            };

            return $http
            .put( CONVO_ADMIN_API_BASE_URL + '/service-releases/' + serviceId, data)
            .then(function (res) {
                $log.log('ConvoworksApi promoteRelease() res', res);
                return res.data;
            });
        }

        function tagAsSimpleVersion( serviceId, versionId, versionTag)
        {
            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi tagAsSimpleVersion() serviceId', serviceId, 'versionId', versionId, 'tag', versionTag);

            return $http
                .post(
                    CONVO_ADMIN_API_BASE_URL + '/service-versions/' + serviceId + '/' + versionId,
                    {
                        'version_tag': versionTag
                    }
                ).then(function (res) {
                    $log.log('ConvoworksApi tagAsSimpleVersion res', res);
                    return res.data;
                });
        }

        function importWorkflowIntoRelease( serviceId, releaseId, versionId)
        {
            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi importWorkflowIntoRelease() serviceId', serviceId);

            return $http
            .post( CONVO_ADMIN_API_BASE_URL + '/service-releases/' + serviceId + '/' + releaseId + '/import-workflow/' + versionId)
            .then(function (res) {
                $log.log('ConvoworksApi importWorkflowIntoRelease() res', res);
                return res.data;
            });
        }

        function importWorkflowIntoDevelop( serviceId, versionId)
        {
            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi importWorkflowIntoDevelop() serviceId', serviceId);

            return $http
                .post( CONVO_ADMIN_API_BASE_URL + '/service-releases/' + serviceId + '/import-develop/' + versionId)
                .then(function (res) {
                    $log.log('ConvoworksApi importWorkflowIntoRelease() res', res);
                    return res.data;
                });
        }

        function getServiceReleases( serviceId) {

            if ( !serviceId) {
                throw new Error( 'Missing service id');
            }

            $log.log( 'ConvoworksApi getServiceReleases() serviceId', serviceId);

            return $http
            .get( CONVO_ADMIN_API_BASE_URL + '/service-releases/' + serviceId)
            .then(function (res) {
                $log.log('ConvoworksApi getServiceReleases() res', res);
                return res.data;
            });
        }


        function uploadMedia(serviceId, filesToUpload) {
            if (!serviceId) {
                throw new Error("Missing service ID");
            }

            var fd = new FormData();
            for (let [key, value] of filesToUpload) {
                $log.log('ConvoworksApi uploadMedia serviceId', serviceId, 'kind', key, 'file', value);
                fd.append(key, value);
            }

            return $http
            .post(
                CONVO_ADMIN_API_BASE_URL + '/media/' + serviceId,
                fd,
                {
                    headers: { 'Content-Type': undefined }
                }
            )
            .then(function(res) {
                $log.log('ConvoworksApi uploadMedia res', res);
                return res.data;
            });
        }

        function downloadMedia(serviceId, mediaItemId) {
            return CONVO_ADMIN_API_BASE_URL + '/media/' + serviceId + '/' + mediaItemId + '/download';
        }

        function getPackageComponentHelp(packageId, component) {
            return $http
                .get( CONVO_ADMIN_API_BASE_URL + '/package-help/' + packageId + '/' + component)
                .then(function (res) {
                    $log.log('ConvoworksApi getPackageComponentHelp() res', res);
                    return res.data;
                });
        }

        function getConfigOptions() {
            return $http.get( CONVO_ADMIN_API_BASE_URL + '/config-options')
                .then(function (res) {
                    $log.log('ConvoworksApi getConfigOptions() res', res);
                    return res.data;
                })
        }

    function getExistingAlexaSkill(owner, skillId)
    {
        $log.log('ConvoworksApi getExistingAlexaSkill()', owner, skillId);

        return $http({
            method: 'POST',
            url: CONVO_ADMIN_API_BASE_URL + '/get-existing-alexa-skill/' + skillId + '/manifest',
            data: { 'owner': owner }
        }).then(function(res) {
            $log.log('ConvoworksApi getExistingAlexaSkill() then', res.data);
            return res.data;
        });
    }
    function getExistingAlexaSkillAccountLinkingInformation(owner, skillId)
    {
        $log.log('ConvoworksApi getExistingAlexaSkillAccountLinkingInformation()', owner, skillId);

        return $http({
            method: 'POST',
            url: CONVO_ADMIN_API_BASE_URL + '/get-existing-alexa-skill/' + skillId + '/account-linking-information',
            data: { 'owner': owner }
        }).then(function(res) {
            $log.log('ConvoworksApi getExistingAlexaSkillAccountLinkingInformation() then', res.data);
            return res.data;
        });
    }
    function getAccountLinkingUrls(platform, account_linking_with) {
            if (platform === 'amazon') {
                switch (account_linking_with) {
                    case 'amazon':
                        return {
                            accountLinkingWith: platform,
                            webAuthorizationURI: 'https://www.amazon.com/ap/oa',
                            accessTokenURI: 'https://api.amazon.com/auth/o2/token',
                        }
                    case 'convoworks_installation':
                        const publicApiUrl = new URL(CONVO_PUBLIC_API_BASE_URL);
                        const loginViewURL = publicApiUrl.protocol + '//' + publicApiUrl.host + '/login/amazon';
                        const tokenURL = publicApiUrl.protocol + '//' + publicApiUrl.host + '/rest_public/proto/v1/token/amazon';

                        return {
                            accountLinkingWith: platform,
                            webAuthorizationURI: loginViewURL,
                            accessTokenURI: tokenURL
                        }
                    default:
                        throw new Error(account_linking_with + ' is not supported.');
                }
            } else {
                throw new Error(platform + ' is not supported.');
            }

    }
    function getStaticUrls(platform) {

    }

    function getDynamicUrls(platform) {

    }
    }
